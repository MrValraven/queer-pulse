import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { CardVerifyPage } from "./CardVerifyPage";
import * as hook from "./api/useCardVerification";
import type { CardVerificationDTO } from "./api/cards.api";
import { TestProviders } from "../../test/TestProviders";

function renderAt() {
  return render(
    <TestProviders initialEntries={["/cards/verify/tok-1"]}>
      <Routes>
        <Route path="/cards/verify/:token" element={<CardVerifyPage />} />
      </Routes>
    </TestProviders>,
  );
}

/**
 * Scoped to `<main>` because ToastProvider also renders a `role="status"`
 * live region as a sibling of the page content; an unscoped query would
 * match both and throw "found multiple elements". Waits for `pattern` to
 * actually appear (via `findByText`, not `getByRole`) before returning,
 * because the `cards` i18n namespace loads lazily: the status element
 * exists on first paint, but its translated text arrives a tick later.
 */
async function findStatus(pattern: RegExp) {
  const main = await screen.findByRole("main");
  await within(main).findByText(pattern);
  return within(main).getByRole("status");
}

const valid: CardVerificationDTO = {
  status: "active",
  issuerName: "Lisboa Queer Collective",
  holderName: "Rita Valente",
  role: "member",
  serial: "LQC-7K4M2",
  memberSince: "2026-02-14T10:00:00Z",
  hasPhoto: true,
  holderPronouns: null,
  holderPhotoUrl: null,
  photoStyle: "color",
};

/** The hook's full return shape, so a spy only states what a case is about. */
function resolvedTo(verification: CardVerificationDTO | null) {
  return {
    verification,
    isLoading: false,
    isInvalid: verification === null,
    failure: verification === null ? ("unverified" as const) : null,
    retry: vi.fn(),
    isRetrying: false,
  };
}

describe("CardVerifyPage", () => {
  it("shows the holder and issuer for a valid card", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(resolvedTo(valid));
    renderAt();
    expect(await screen.findByText("Rita Valente")).toBeInTheDocument();
    expect(
      await screen.findByText("Lisboa Queer Collective"),
    ).toBeInTheDocument();
  });

  // The name owns its line; the pronouns get the next one. A verifier reading
  // aloud should not have to pick them out of a bracket after a long surname.
  it("prints the holder's pronouns on their own line under the name", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(
      resolvedTo({ ...valid, holderPronouns: "she/her" }),
    );
    renderAt();
    const name = await screen.findByText("Rita Valente");
    const pronouns = await screen.findByText("she/her");
    expect(name).not.toContainElement(pronouns);
    expect(name.textContent).toBe("Rita Valente");
  });

  // A card that does not print pronouns tells a verifier nothing about them.
  it("says nothing about pronouns when the card carries none", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(resolvedTo(valid));
    renderAt();
    // The holder line is exactly the name: no empty brackets, no stand-in.
    expect((await screen.findByText("Rita Valente")).textContent).toBe(
      "Rita Valente",
    );
  });

  it("shows a single unverified result for any definitive failure", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(resolvedTo(null));
    renderAt();
    expect(await findStatus(/could not/i)).toHaveTextContent(/could not/i);
  });

  // The reasons are possibilities. The page must never claim which one applies,
  // because the backend deliberately does not know how to tell it.
  it("explains what can cause a failed check without naming which one did", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(resolvedTo(null));
    renderAt();
    expect(await screen.findByText(/why this happens/i)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(4);
    expect(
      screen.getByText(/answers all of these the same way on purpose/i),
    ).toBeInTheDocument();
  });

  // A failed check is a fact about a code, and a door reading it as a fact
  // about a person is the expensive mistake this page can cause.
  it("says a failed check is not a judgement about the person", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(resolvedTo(null));
    renderAt();
    expect(
      await screen.findByText(/says nothing about the person in front of you/i),
    ).toBeInTheDocument();
  });

  // The distinction that keeps a door from refusing someone over its own lost
  // signal: nothing was checked, so nothing was decided.
  it("separates a check that never happened from a card that failed one", async () => {
    const retry = vi.fn();
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      verification: null,
      isLoading: false,
      isInvalid: true,
      failure: "unreachable",
      retry,
      isRetrying: false,
    });
    renderAt();
    expect(await findStatus(/could not reach/i)).toHaveTextContent(
      /could not reach/i,
    );
    expect(
      screen.getByText(/nothing was checked and nothing was decided/i),
    ).toBeInTheDocument();
    // And it never states the verdict the other failure states.
    expect(
      screen.queryByText(/does not match a card that stands/i),
    ).not.toBeInTheDocument();
    (await screen.findByRole("button", { name: /try again/i })).click();
    expect(retry).toHaveBeenCalled();
  });

  it("distinguishes an expired card from a valid one", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(
      resolvedTo({ ...valid, status: "expired" }),
    );
    renderAt();
    expect(await findStatus(/expired/i)).toHaveTextContent(/expired/i);
  });

  it("never renders a revocation reason", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(
      resolvedTo({
        // The DTO has no `revokedReason` field at all — this sentinel value is
        // cast on because a real bug (the reason leaking verbatim, no matter
        // what word it's phrased with) would only be caught by asserting the
        // VALUE is absent, not by asserting the word "reason" is absent, which
        // could never fail since that word appears nowhere in the catalogue.
        ...valid,
        status: "revoked",
        revokedReason: "Left under a safety report",
      } as unknown as CardVerificationDTO),
    );
    const { container } = renderAt();
    await findStatus(/no longer valid/i);
    expect(container.textContent ?? "").not.toContain("safety report");
  });

  // The face is the whole point of the check, and it comes from the issuer's
  // own records rather than from the object being shown at the door.
  it("shows the face the card prints when the card is good", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(
      resolvedTo({
        ...valid,
        holderPhotoUrl: "https://cdn.example.com/rita.jpg",
      }),
    );
    const { container } = renderAt();
    await screen.findByText("Rita Valente");
    const photo = container.querySelector("figure img");
    expect(photo).toHaveAttribute("src", "https://cdn.example.com/rita.jpg");
    expect(
      await screen.findByText(
        /compare it with the person showing you the card/i,
      ),
    ).toBeInTheDocument();
  });

  it("tells the door to check the photo when the face cannot be shown here", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(
      resolvedTo({ ...valid, hasPhoto: true, holderPhotoUrl: null }),
    );
    renderAt();
    expect(
      await screen.findByText(/check the photo on the card/i),
    ).toBeInTheDocument();
  });

  it("says there is no face to check when the card carries none", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(
      resolvedTo({ ...valid, hasPhoto: false }),
    );
    renderAt();
    expect(await screen.findByText(/carries no photo/i)).toBeInTheDocument();
  });

  // A door cannot act on an instruction about a card that is already refused,
  // and the backend withholds the face on one for the same reason.
  it("gives no check instruction or face for a card that is not active", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue(
      resolvedTo({
        ...valid,
        status: "revoked",
        hasPhoto: true,
        holderPhotoUrl: "https://cdn.example.com/rita.jpg",
      }),
    );
    const { container } = renderAt();
    // Waits for the page's translated content to land BEFORE asserting the
    // absence. A bare synchronous query would pass while the lazy catalog was
    // still loading, so it would hold even if the instruction were coming.
    await findStatus(/no longer valid/i);
    expect(screen.queryByText(/check the photo/i)).not.toBeInTheDocument();
    expect(container.querySelector("figure img")).toBeNull();
  });
});
