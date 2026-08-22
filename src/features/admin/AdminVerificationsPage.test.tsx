import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminVerificationsPage } from "./AdminVerificationsPage";
import { ADMIN_VERIFICATIONS_DEMO } from "./adminVerifications.data";
import { DEMO_VERIFICATION_REQUESTS } from "./verificationRequests.data";

/**
 * Demo-mode page contract for the two-segment console (Task 9): **Review
 * queue** is the default segment (the member-request pipeline), **Direct
 * override** is the Phase 1 level console, moved here unchanged behind a
 * `SegmentedControl`. Split into three top-level `describe`s (segment
 * switching, the Direct-override segment, the Review-queue segment +
 * drawer) rather than one nested block, to stay under the repo's
 * per-function line budget. Copy is the lazy `admin` catalog → `findBy*`
 * throughout (see test-harness-gotchas).
 */
describe("AdminVerificationsPage — segment switching", () => {
  it("defaults to the Review queue segment and switches to Direct override without losing either segment's own state", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );

    // Review queue is the default segment: a request-fixture member renders,
    // a level-console-only member does not.
    expect(await screen.findByText("Sofia Almeida")).toBeInTheDocument();
    expect(screen.queryByText("Inês Tavares")).not.toBeInTheDocument();

    await user.click(
      await screen.findByRole("button", { name: "Direct override" }),
    );

    // Direct override now shows the level console. Asserted on the segment's
    // own furniture rather than on a name: the two fixtures deliberately
    // overlap on most members (every request member also holds a level), so
    // only the request pipeline's status tabs distinguish the segments.
    expect(await screen.findByText("Inês Tavares")).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /Pending/ }),
    ).not.toBeInTheDocument();

    await user.click(
      await screen.findByRole("button", { name: "Review queue" }),
    );
    expect(await screen.findByRole("tab", { name: /Pending/ })).toBeInTheDocument();
    expect(screen.getByText("Sofia Almeida")).toBeInTheDocument();
  });
});

async function openDirectOverride(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    await screen.findByRole("button", { name: "Direct override" }),
  );
}

describe("AdminVerificationsPage — Direct override segment (Phase 1 level console)", () => {
  it("renders level tabs with counts summing the fixture", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await openDirectOverride(user);

    const allTab = await screen.findByRole("tab", { name: /All/ });
    expect(allTab).toHaveTextContent(String(ADMIN_VERIFICATIONS_DEMO.length));

    const idVerifiedCount = ADMIN_VERIFICATIONS_DEMO.filter(
      (row) => row.level === "id_verified",
    ).length;
    const idVerifiedTab = await screen.findByRole("tab", {
      name: /ID-verified/,
    });
    expect(idVerifiedTab).toHaveTextContent(String(idVerifiedCount));
  });

  it("renders a row per fixture member", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await openDirectOverride(user);

    expect(await screen.findByText("Inês Tavares")).toBeInTheDocument();
    expect(await screen.findByText("Rui Mendes")).toBeInTheDocument();
  });

  it("filters rows by level when a tab is selected", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await openDirectOverride(user);
    await screen.findByText("Inês Tavares");

    await user.click(await screen.findByRole("tab", { name: /^Email/ }));

    expect(await screen.findByText("Marta Sequeira")).toBeInTheDocument();
    expect(screen.queryByText("Inês Tavares")).not.toBeInTheDocument();
  });

  it("narrows rows to a search match", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await openDirectOverride(user);
    await screen.findByText("Inês Tavares");

    const searchInput = screen.getByRole("searchbox", {
      name: /Search members by name/i,
    });
    await user.type(searchInput, "Rui");

    await waitFor(() =>
      expect(screen.queryByText("Inês Tavares")).not.toBeInTheDocument(),
    );
    expect(await screen.findByText("Rui Mendes")).toBeInTheDocument();
  });

  it("shows the empty state for a search with no matches", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await openDirectOverride(user);
    await screen.findByText("Inês Tavares");

    const searchInput = screen.getByRole("searchbox", {
      name: /Search members by name/i,
    });
    await user.type(searchInput, "zzz-no-such-member");

    expect(
      await screen.findByText("No verification records yet."),
    ).toBeInTheDocument();
  });
});

async function openFirstRequest(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByText("Sofia Almeida");
  const reviewButtons = await screen.findAllByRole("button", {
    name: "Review",
  });
  // Rows sort "recent" first by default — Sofia's `request-pending-1`
  // (createdAt 2026-08-10, the fixture's newest) is always first.
  await user.click(reviewButtons[0]!);
  await screen.findByText(/would like phone verification/);
}

describe("AdminVerificationsPage — Review queue segment + request drawer (Task 9)", () => {
  it("renders status tabs with per-status counts, one request per status in the fixture", async () => {
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );

    const allTab = await screen.findByRole("tab", { name: /All/ });
    expect(allTab).toHaveTextContent(String(DEMO_VERIFICATION_REQUESTS.length));

    const pendingTab = await screen.findByRole("tab", { name: /Pending/ });
    expect(pendingTab).toHaveTextContent("1");

    const appealsTab = await screen.findByRole("tab", { name: /Appeals/ });
    expect(appealsTab).toHaveTextContent("1");
  });

  it("renders a row per fixture request, with an Appeal chip on the appealing one", async () => {
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );

    expect(await screen.findByText("Sofia Almeida")).toBeInTheDocument();
    expect(await screen.findByText("Diogo Faria")).toBeInTheDocument();
    expect(await screen.findByText("Beatriz Nogueira")).toBeInTheDocument();

    // Only Beatriz's request is an appeal (`isAppeal: true`) in the fixture.
    const appealChips = await screen.findAllByText("Appeal");
    expect(appealChips).toHaveLength(1);
  });

  it("opens a request and shows its context and audit history", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );

    await openFirstRequest(user);

    expect(await screen.findByText("Submitted")).toBeInTheDocument();
  });

  it("requires a reason before Reject enables, then decides and toasts", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await openFirstRequest(user);

    const rejectButton = screen.getByRole("button", { name: "Reject" });
    expect(rejectButton).toBeDisabled();

    const reasonField = screen.getByLabelText(/^Reason$/i);
    await user.type(reasonField, "Couldn't confirm the reference.");
    expect(rejectButton).not.toBeDisabled();

    await user.click(rejectButton);

    expect(
      await screen.findByText(
        "Request rejected. The member has been notified.",
      ),
    ).toBeInTheDocument();
  });

  it("approves a request without requiring a reason, then toasts and advances to the next request in the queue (Task 4 next-in-queue)", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await openFirstRequest(user);

    const approveButton = screen.getByRole("button", { name: "Approve" });
    expect(approveButton).not.toBeDisabled();
    await user.click(approveButton);

    expect(
      await screen.findByText(
        "Request approved. The member has been notified.",
      ),
    ).toBeInTheDocument();
    // Task 4: rather than closing, the drawer auto-advances to whichever
    // request followed Sofia's `request-pending-1` in the default "recent"
    // sort order — Catarina's `request-review-1`, the fixture's
    // second-newest. Still one dialog (the same drawer instance, never
    // unmounted — see `VerificationRequestDrawer`'s `onDecided` note), now
    // showing Catarina's context instead of Sofia's.
    expect(
      await screen.findByText(/reading-group meetups/),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it("closes the drawer (no next-in-queue) once a decision leaves nothing after it in the current filtered view", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await screen.findByText("Sofia Almeida");

    // The Appeals tab holds exactly one request (Beatriz's) in the fixture —
    // deciding it leaves no "next" row in that filtered view.
    await user.click(await screen.findByRole("tab", { name: /Appeals/ }));
    expect(await screen.findByText("Beatriz Nogueira")).toBeInTheDocument();

    const reviewButtons = await screen.findAllByRole("button", {
      name: "Review",
    });
    await user.click(reviewButtons[0]!);
    const markInReviewButton = await screen.findByRole("button", {
      name: "Mark in-review",
    });
    await user.click(markInReviewButton);

    expect(
      await screen.findByText("Request marked in review."),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("marks a request in-review", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await openFirstRequest(user);

    const markInReviewButton = screen.getByRole("button", {
      name: "Mark in-review",
    });
    expect(markInReviewButton).not.toBeDisabled();
    await user.click(markInReviewButton);

    expect(
      await screen.findByText("Request marked in review."),
    ).toBeInTheDocument();
  });
});

describe("AdminVerificationsPage — Task 4: row selection + bulk actions + keyboard flow", () => {
  it("shows the bulk action bar once a row is selected, and hides it again on Clear", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await screen.findByText("Sofia Almeida");

    expect(
      screen.queryByRole("region", { name: "Bulk actions" }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", { name: "Select Sofia Almeida" }),
    );

    const bar = await screen.findByRole("region", { name: "Bulk actions" });
    expect(bar).toHaveTextContent("1 selected");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      screen.queryByRole("region", { name: "Bulk actions" }),
    ).not.toBeInTheDocument();
  });

  it("bulk-approves the selected requests via the bulk action bar and reports the outcome", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await screen.findByText("Sofia Almeida");

    // Two ids, so `bulkDecide` is called with `ids.length === 2` — the
    // resulting "2 requests updated." toast is the observable proof (this is
    // a demo-mode integration test; the mutation isn't mocked/spied
    // directly, its outcome is).
    await user.click(
      screen.getByRole("checkbox", { name: "Select Sofia Almeida" }),
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Select Catarina Brito" }),
    );
    await screen.findByRole("region", { name: "Bulk actions" });

    await user.click(screen.getByRole("button", { name: "Approve" }));

    expect(await screen.findByText("2 requests updated.")).toBeInTheDocument();
    // The bar disappears once the bulk action succeeds and clears the
    // selection.
    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: "Bulk actions" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("J focuses a row and A approves the focused row via keyboard, without opening the drawer", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await screen.findByText("Sofia Almeida");

    await user.keyboard("j");
    await user.keyboard("a");

    expect(await screen.findByText("1 request updated.")).toBeInTheDocument();
    // The keyboard path decides through `useBulkDecideVerificationRequests`
    // directly (Task 4's design note: keyboard shortcuts never open the
    // drawer), so next-in-queue never engages here.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("/ focuses the search field", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await screen.findByText("Sofia Almeida");

    const searchInput = screen.getByRole("searchbox", {
      name: /Search requests by member name/i,
    });
    expect(searchInput).not.toHaveFocus();

    await user.keyboard("/");

    expect(searchInput).toHaveFocus();
  });

  it("stays inert while the drawer is open (J/K/A/R don't act on the queue behind it)", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <AdminVerificationsPage />
      </TestProviders>,
    );
    await openFirstRequest(user);

    // With the drawer open, "a" must not silently bulk-approve whatever row
    // was keyboard-focused before the drawer opened.
    await user.keyboard("a");
    expect(
      screen.queryByText("1 request updated."),
    ).not.toBeInTheDocument();
  });
});
