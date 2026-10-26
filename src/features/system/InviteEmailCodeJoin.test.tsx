import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import {
  InviteEmailCodeJoin,
  type InviteEmailCodeJoinProps,
} from "./InviteEmailCodeJoin";

// Demo mode answers every call by default; a test that needs a specific
// backend answer or a look at the body switches the verify over to its mock.
const mockVerify = vi.hoisted(() => ({ isActive: false, verify: vi.fn() }));

vi.mock("../auth/api/useEmailCode", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../auth/api/useEmailCode")>();
  return {
    ...actual,
    useVerifyEmailCode: () => {
      const real = actual.useVerifyEmailCode();
      return mockVerify.isActive
        ? { ...real, mutateAsync: mockVerify.verify }
        : real;
    },
  };
});

const INVITE_CODE = "QP-TEST-CODE";
const ADDRESS = "sam@example.com";
// The required field's label also holds its aria-hidden "*".
const FIRST_NAME = /^First name/;
const NAME_REQUIRED = "Add your first name so we can set up your account.";

/** The missing-name error sits on the first-name field alone, with focus. */
function expectNameErrorOnFirstNameOnly() {
  const firstName = screen.getByLabelText(FIRST_NAME);
  expect(firstName).toHaveAttribute("aria-invalid", "true");
  expect(firstName).toHaveAccessibleDescription(
    expect.stringContaining(NAME_REQUIRED),
  );
  expect(firstName).toHaveFocus();
  expect(screen.getAllByText(NAME_REQUIRED)).toHaveLength(1);
}

function renderJoin(overrides: Partial<InviteEmailCodeJoinProps> = {}) {
  const props: InviteEmailCodeJoinProps = {
    inviteCode: INVITE_CODE,
    is18: true,
    onEmailJoined: vi.fn(),
    ...overrides,
  };
  const rendered = render(
    <TestProviders initialEntries={[`/invite/${INVITE_CODE}`]}>
      <InviteEmailCodeJoin {...props} />
    </TestProviders>,
  );
  const rerenderWith = (next: Partial<InviteEmailCodeJoinProps>) =>
    rendered.rerender(
      <TestProviders initialEntries={[`/invite/${INVITE_CODE}`]}>
        <InviteEmailCodeJoin {...props} {...next} />
      </TestProviders>,
    );
  return { ...rendered, props, rerenderWith };
}

/** `system` and `auth` are lazy namespaces, so the first query is a findBy. */
async function choose() {
  fireEvent.click(
    await screen.findByRole("button", { name: "Register with an email code" }),
  );
}

async function fillNames(firstName: string, lastName = "") {
  fireEvent.change(await screen.findByLabelText(FIRST_NAME), {
    target: { value: firstName },
  });
  fireEvent.change(screen.getByLabelText("Last name (optional)"), {
    target: { value: lastName },
  });
}

async function sendCode() {
  fireEvent.change(await screen.findByLabelText("Email"), {
    target: { value: ADDRESS },
  });
  fireEvent.click(screen.getByRole("button", { name: "Email me a code" }));
}

/** A full code typed into the first box fills all six and verifies. */
async function typeCode(code: string) {
  fireEvent.change(await screen.findByLabelText("Digit 1 of 6"), {
    target: { value: code },
  });
}

describe("InviteEmailCodeJoin", () => {
  beforeEach(() => {
    mockVerify.isActive = false;
    mockVerify.verify.mockReset();
  });

  it("keeps Register with an email code disabled until the 18+ box is ticked", async () => {
    const { rerenderWith } = renderJoin({ is18: false });
    expect(
      await screen.findByRole("button", {
        name: "Register with an email code",
      }),
    ).toBeDisabled();

    rerenderWith({ is18: true });
    expect(
      screen.getByRole("button", { name: "Register with an email code" }),
    ).toBeEnabled();
  });

  it("Use a different email moves focus to the email field", async () => {
    renderJoin();
    await choose();
    await fillNames("Sam");
    await sendCode();
    fireEvent.click(
      await screen.findByRole("button", { name: "Use a different email" }),
    );
    expect(await screen.findByDisplayValue(ADDRESS)).toHaveFocus();
  });

  it("reveals the name and email fields when chosen", async () => {
    renderJoin();
    await choose();
    expect(await screen.findByLabelText(FIRST_NAME)).toBeInTheDocument();
    expect(screen.getByLabelText("Last name (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register with an email code" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText(FIRST_NAME)).toBeRequired();
  });

  it("folds the fields away when the 18+ box is unticked", async () => {
    const { rerenderWith } = renderJoin();
    await choose();
    await screen.findByLabelText(FIRST_NAME);

    rerenderWith({ is18: false });
    await waitFor(() =>
      expect(screen.queryByLabelText(FIRST_NAME)).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Register with an email code" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("asks for a first name before sending a code", async () => {
    renderJoin();
    await choose();
    await sendCode();
    expect(
      await screen.findByText(
        "Add your first name so we can set up your account.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Digit 1 of 6")).not.toBeInTheDocument();
  });

  it("sends invite, age, terms and names with the code", async () => {
    mockVerify.isActive = true;
    mockVerify.verify.mockResolvedValue({ redirectTo: "/onboarding" });
    renderJoin();
    await choose();
    await fillNames(" Sam ");
    await sendCode();
    await typeCode("123456");

    await waitFor(() => expect(mockVerify.verify).toHaveBeenCalledTimes(1));
    const { challengeId, ...input } = mockVerify.verify.mock.calls[0]?.[0] as {
      challengeId: unknown;
    };
    expect(typeof challengeId).toBe("string");
    expect(input).toEqual({
      invite: INVITE_CODE,
      ageAttested: true,
      termsVersion: "2.4",
      firstName: "Sam",
      lastName: "",
      redirect: "/onboarding",
      code: "123456",
    });
  });

  it("a good demo code joins through onEmailJoined", async () => {
    const { props } = renderJoin();
    await choose();
    await fillNames("Sam");
    await sendCode();
    await typeCode("123456");

    await waitFor(() => expect(props.onEmailJoined).toHaveBeenCalledTimes(1));
  });

  it("after name_required the name stays editable and the same code verifies again", async () => {
    mockVerify.isActive = true;
    mockVerify.verify
      .mockRejectedValueOnce(
        new ApiError(400, "A first name is required.", {
          reason: "name_required",
        }),
      )
      .mockResolvedValue({ redirectTo: "/onboarding" });
    renderJoin();
    await choose();
    await fillNames("Al");
    await sendCode();
    await typeCode("123456");

    expect(
      await screen.findByText(
        "Add your first name so we can set up your account.",
      ),
    ).toBeInTheDocument();
    const firstName = screen.getByLabelText(FIRST_NAME);
    expect(firstName).toBeEnabled();
    expect(screen.getByLabelText("Digit 1 of 6")).toHaveValue("1");

    fireEvent.change(firstName, { target: { value: "Sam" } });
    fireEvent.click(screen.getByRole("button", { name: "Check this code" }));

    await waitFor(() => expect(mockVerify.verify).toHaveBeenCalledTimes(2));
    expect(mockVerify.verify.mock.calls[1]?.[0]).toMatchObject({
      firstName: "Sam",
      code: "123456",
    });
  });

  it("words a missing first name on the first-name field before sending", async () => {
    renderJoin();
    await choose();
    await sendCode();

    await screen.findByText(NAME_REQUIRED);
    expectNameErrorOnFirstNameOnly();
    expect(screen.getByLabelText("Email")).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );

    fireEvent.change(screen.getByLabelText(FIRST_NAME), {
      target: { value: "S" },
    });
    expect(screen.queryByText(NAME_REQUIRED)).not.toBeInTheDocument();
    expect(screen.getByLabelText(FIRST_NAME)).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("words a server name_required on the first-name field", async () => {
    mockVerify.isActive = true;
    mockVerify.verify.mockRejectedValueOnce(
      new ApiError(400, "A first name is required.", {
        reason: "name_required",
      }),
    );
    renderJoin();
    await choose();
    await fillNames("Al");
    await sendCode();
    await typeCode("123456");

    await screen.findByText(NAME_REQUIRED);
    await waitFor(() =>
      expect(screen.getByLabelText(FIRST_NAME)).toHaveFocus(),
    );
    expectNameErrorOnFirstNameOnly();
    expect(screen.getByLabelText("Digit 1 of 6")).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );

    fireEvent.change(screen.getByLabelText(FIRST_NAME), {
      target: { value: "Sam" },
    });
    expect(screen.queryByText(NAME_REQUIRED)).not.toBeInTheDocument();
  });
});
