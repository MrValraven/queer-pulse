import { fireEvent, render, screen, within } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SignInPage } from "./SignInPage";

// Same boundary mock as SignInPage.closed.test.tsx: `data: undefined` is the
// fail-open path, so the page renders exactly as it does for everyone.
vi.mock("../../shared/api/usePlatformStatus", () => ({
  usePlatformStatus: () => ({ data: undefined }),
}));

const SENT_TO = "sam@example.com";

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="pathname">{location.pathname}</output>;
}

/**
 * Demo mode answers every call: any six digits sign in and `000000` answers
 * `code_incorrect`. `auth` is a lazy i18n namespace, so every first query is
 * a findBy.
 */
function renderSignIn() {
  return render(
    <TestProviders initialEntries={["/auth/sign-in?next=%2Fevents"]}>
      <SignInPage />
      <LocationProbe />
    </TestProviders>,
  );
}

async function requestCodeFor(address: string) {
  const emailField = await screen.findByRole("textbox", { name: "Email" });
  fireEvent.change(emailField, { target: { value: address } });
  fireEvent.click(screen.getByRole("button", { name: "Email me a code" }));
}

async function reachCodeStep() {
  renderSignIn();
  await requestCodeFor(SENT_TO);
  await screen.findByText(
    (_, element) =>
      element?.tagName === "P" &&
      element.textContent ===
        `We sent a code to ${SENT_TO}. It works for 10 minutes.`,
  );
}

/** The element at `index`, or a throw naming the missing index. */
function elementAt<T extends HTMLElement>(elements: T[], index: number): T {
  const element = elements[index];
  if (element === undefined) {
    throw new Error(`Expected an element at index ${index}, found none`);
  }
  return element;
}

/** An OS autofill of the whole code into the first box fills all six. */
async function enterCode(code: string) {
  const group = await screen.findByRole("group", { name: "Your 6-digit code" });
  const firstBox = elementAt(within(group).getAllByRole("textbox"), 0);
  fireEvent.change(firstBox, { target: { value: code } });
}

describe("EmailCodeSignIn", () => {
  it("shows the email option under the Google button", async () => {
    renderSignIn();
    const google = await screen.findByRole("button", {
      name: /Continue with Google/,
    });
    const divider = await screen.findByText("or");
    const emailField = screen.getByRole("textbox", { name: "Email" });
    const requestButton = screen.getByRole("button", {
      name: "Email me a code",
    });
    const follows = Node.DOCUMENT_POSITION_FOLLOWING;
    expect(google.compareDocumentPosition(divider) & follows).toBeTruthy();
    expect(divider.compareDocumentPosition(emailField) & follows).toBeTruthy();
    expect(requestButton).toBeEnabled();
  });

  it("rejects a malformed address with the reason", async () => {
    renderSignIn();
    await requestCodeFor("nope");
    expect(
      await screen.findByText(
        "That email address does not look right. Check it and try again.",
      ),
    ).toBeInTheDocument();
  });

  it("swaps to the code step after Email me a code", async () => {
    await reachCodeStep();
    expect(
      screen.getByRole("group", { name: "Your 6-digit code" }),
    ).toBeInTheDocument();
  });

  it("000000 shows the incorrect-code reason", async () => {
    await reachCodeStep();
    await enterCode("000000");
    expect(
      await screen.findByText(
        "That code is incorrect. You have 4 tries left.",
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
  });

  it("a good code signs in and lands on next", async () => {
    await reachCodeStep();
    await enterCode("123456");
    expect(
      await screen.findByText("/events", {}, { timeout: 3000 }),
    ).toHaveAttribute("data-testid", "pathname");
  });

  it("Use a different email returns to the address field with the address kept", async () => {
    await reachCodeStep();
    fireEvent.click(
      screen.getByRole("button", { name: "Use a different email" }),
    );
    expect(
      await screen.findByDisplayValue(SENT_TO, { exact: true }),
    ).toHaveAttribute("type", "email");
    expect(
      screen.getByRole("button", { name: "Email me a code" }),
    ).toBeInTheDocument();
  });

  it("Use a different email moves focus to the email field", async () => {
    await reachCodeStep();
    fireEvent.click(
      screen.getByRole("button", { name: "Use a different email" }),
    );
    expect(await screen.findByDisplayValue(SENT_TO)).toHaveFocus();
  });

  it("leaves the email field unfocused on first load", async () => {
    renderSignIn();
    expect(
      await screen.findByRole("textbox", { name: "Email" }),
    ).not.toHaveFocus();
  });
});
