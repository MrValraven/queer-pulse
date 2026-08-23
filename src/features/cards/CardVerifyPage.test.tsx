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

const valid = {
  status: "active" as const,
  issuerName: "Lisboa Queer Collective",
  holderName: "Rita Valente",
  role: "member",
  serial: "LQC-7K4M2",
  memberSince: "2026-02-14T10:00:00Z",
  hasPhoto: true,
  holderPronouns: null,
};

describe("CardVerifyPage", () => {
  it("shows the holder and issuer for a valid card", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      verification: valid,
      isLoading: false,
      isInvalid: false,
    });
    renderAt();
    expect(await screen.findByText("Rita Valente")).toBeInTheDocument();
    expect(
      await screen.findByText("Lisboa Queer Collective"),
    ).toBeInTheDocument();
  });

  it("prints the holder's pronouns beside their name when the card carries them", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      verification: { ...valid, holderPronouns: "she/her" },
      isLoading: false,
      isInvalid: false,
    });
    const { container } = renderAt();
    await screen.findByText(/Rita Valente/);
    expect(container.textContent ?? "").toContain("Rita Valente (she/her)");
  });

  // A card that does not print pronouns tells a verifier nothing about them.
  it("says nothing about pronouns when the card carries none", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      verification: valid,
      isLoading: false,
      isInvalid: false,
    });
    renderAt();
    // The holder line is exactly the name: no empty brackets, no stand-in.
    expect((await screen.findByText("Rita Valente")).textContent).toBe(
      "Rita Valente",
    );
  });

  it("shows a single unverified result for any failure", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      verification: null,
      isLoading: false,
      isInvalid: true,
    });
    renderAt();
    expect(await findStatus(/could not/i)).toHaveTextContent(/could not/i);
  });

  it("distinguishes an expired card from a valid one", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      verification: { ...valid, status: "expired" },
      isLoading: false,
      isInvalid: false,
    });
    renderAt();
    expect(await findStatus(/expired/i)).toHaveTextContent(/expired/i);
  });

  it("never renders a revocation reason", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      // The DTO has no `revokedReason` field at all — this sentinel value is
      // cast on because a real bug (the reason leaking verbatim, no matter
      // what word it's phrased with) would only be caught by asserting the
      // VALUE is absent, not by asserting the word "reason" is absent, which
      // could never fail since that word appears nowhere in the catalogue.
      verification: {
        ...valid,
        status: "revoked",
        revokedReason: "Left under a safety report",
      } as unknown as CardVerificationDTO,
      isLoading: false,
      isInvalid: false,
    });
    const { container } = renderAt();
    await findStatus(/no longer valid/i);
    expect(container.textContent ?? "").not.toContain("safety report");
  });

  it("tells the door to check the photo when the card carries one", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      verification: { ...valid, hasPhoto: true },
      isLoading: false,
      isInvalid: false,
    });
    renderAt();
    expect(
      await screen.findByText(/check the photo on the card/i),
    ).toBeInTheDocument();
  });

  it("says there is no face to check when the card carries none", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      verification: { ...valid, hasPhoto: false },
      isLoading: false,
      isInvalid: false,
    });
    renderAt();
    expect(await screen.findByText(/carries no photo/i)).toBeInTheDocument();
  });

  // A door cannot act on an instruction about a card that is already refused.
  it("gives no check instruction for a card that is not active", async () => {
    vi.spyOn(hook, "useCardVerification").mockReturnValue({
      verification: { ...valid, status: "revoked", hasPhoto: true },
      isLoading: false,
      isInvalid: false,
    });
    renderAt();
    // Waits for the page's translated content to land BEFORE asserting the
    // absence. A bare synchronous query would pass while the lazy catalog was
    // still loading, so it would hold even if the instruction were coming.
    await findStatus(/no longer valid/i);
    expect(screen.queryByText(/check the photo/i)).not.toBeInTheDocument();
  });
});
