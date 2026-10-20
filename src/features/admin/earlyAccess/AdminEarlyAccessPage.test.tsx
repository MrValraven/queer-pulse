import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import { AdminEarlyAccessPage } from "./AdminEarlyAccessPage";

/**
 * Demo-mode contract for `/admin/early-access` (TestProviders forces demo
 * mode on). The demo roster for `quizshow` (Pulse Live) is Devon, Théo and
 * Kai, newest first, all turned on by Inês Martins; revoking rewrites the
 * query cache only, so every test starts from the same three.
 */

// AdminShell pulls in the full admin chrome (theme toggle, live nav-badge
// queries, the auth-backed role switcher) that this page has no reason to
// exercise. See AdminForumReviewPage.test.tsx for the same mock.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const DEMO_TESTERS = ["Devon Okoro", "Théo Mendes", "Kai Sousa"];

async function renderPage() {
  render(
    <TestProviders initialEntries={[routes.adminEarlyAccess]}>
      <AdminEarlyAccessPage />
    </TestProviders>,
  );
  // The `admin` catalog loads lazily; the feature name only matches once the
  // copy is in.
  await screen.findByRole("heading", { level: 2, name: "Pulse Live" });
  await screen.findByRole("article", { name: "Devon Okoro" });
  return userEvent.setup();
}

/** The rows still in the list. A revoked row stays mounted, `inert`, while
 *  it folds away, so it is left out here as soon as it starts leaving. */
function presentRowNames(): string[] {
  return [
    ...document.querySelectorAll<HTMLElement>("li:not([inert]) article"),
  ].map((article) => article.getAttribute("aria-label") ?? "");
}

async function openRevokeFor(
  user: ReturnType<typeof userEvent.setup>,
  memberName: string,
) {
  const row = screen.getByRole("article", { name: memberName });
  await user.click(
    within(row).getByRole("button", { name: `Revoke access ${memberName}` }),
  );
  return screen.findByRole("dialog");
}

describe("AdminEarlyAccessPage", () => {
  it("lists who holds Pulse Live, newest first, with who turned it on", async () => {
    await renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Early access",
    );
    expect(presentRowNames()).toEqual(DEMO_TESTERS);
    expect(screen.getAllByText(/^Turned on by Inês Martins on /)).toHaveLength(
      3,
    );
    expect(screen.getByRole("link", { name: "Devon Okoro" })).toHaveAttribute(
      "href",
      `${routes.members}/devon`,
    );
    expect(screen.queryByText(/most recent of/)).toBeNull();
  });

  it("keeps the row when the revoke is cancelled", async () => {
    const user = await renderPage();

    const dialog = await openRevokeFor(user, "Théo Mendes");
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(presentRowNames()).toEqual(DEMO_TESTERS);
  });

  it("revokes after the confirm and moves focus to the section heading", async () => {
    const user = await renderPage();

    const dialog = await openRevokeFor(user, "Devon Okoro");
    expect(dialog).toHaveTextContent("Revoke early access?");
    expect(dialog).toHaveTextContent(
      "Devon Okoro loses Pulse Live the next time they open the app.",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Revoke access" }),
    );

    await waitFor(() =>
      expect(presentRowNames()).toEqual(["Théo Mendes", "Kai Sousa"]),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: "Pulse Live" }),
      ).toHaveFocus(),
    );
  });
});
