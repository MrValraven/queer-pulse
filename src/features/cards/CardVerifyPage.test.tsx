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
});
