import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { JoinRequestBulkActionBar } from "./JoinRequestBulkActionBar";
import { makeJoinRequestRow } from "./joinRequestTestRow";

/**
 * Two contracts this bar exists to keep:
 *
 * 1. NOTHING FIRES WITHOUT A CONFIRMATION. Approve, waitlist and decline all
 *    close applications from real people, and none of them is undoable here.
 * 2. A PARTIAL RESULT IS REPORTED AS ONE. `POST /admin/join-requests/bulk`
 *    reviews each id independently, so a batch routinely half-lands, and the
 *    reviewer has to see which applicant was refused and why rather than a
 *    success message covering the whole batch.
 */
const bulkReview = vi.fn();
vi.mock("./api/useBulkReviewJoinRequests", () => ({
  useBulkReviewJoinRequests: () => ({
    bulkReview,
    pending: false,
  }),
}));

const showToast = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

const rows = [
  makeJoinRequestRow({ id: "req-1", name: "Kai Mendes" }),
  makeJoinRequestRow({ id: "req-2", name: "Ana Ferreira" }),
];

function renderBar(onOutcome = vi.fn()) {
  render(
    <JoinRequestBulkActionBar
      selectedIds={new Set(["req-1", "req-2"])}
      rows={rows}
      onClear={vi.fn()}
      onOutcome={onOutcome}
    />,
    { wrapper: TestProviders },
  );
  return onOutcome;
}

beforeEach(() => {
  bulkReview.mockReset();
  showToast.mockReset();
});

describe("JoinRequestBulkActionBar", () => {
  it("shows the selection count and the three decisions", async () => {
    renderBar();

    expect(await screen.findByText("2 selected")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Bulk actions" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Waitlist" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decline" })).toBeInTheDocument();
  });

  it("confirms before approving, and calls nothing until confirmed", async () => {
    const user = userEvent.setup();
    bulkReview.mockResolvedValue({ succeeded: ["req-1", "req-2"], failed: [] });
    renderBar();

    await user.click(await screen.findByRole("button", { name: "Approve" }));

    // The confirmation names the count and the action before anything is sent.
    expect(
      await screen.findByRole("heading", { name: "Approve 2 requests?" }),
    ).toBeInTheDocument();
    expect(bulkReview).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Approve all" }));

    await waitFor(() =>
      expect(bulkReview).toHaveBeenCalledWith(
        ["req-1", "req-2"],
        "approved",
        undefined,
      ),
    );
  });

  it("drops the confirmation without calling the endpoint when cancelled", async () => {
    const user = userEvent.setup();
    renderBar();

    await user.click(await screen.findByRole("button", { name: "Waitlist" }));
    expect(
      await screen.findByRole("heading", { name: "Waitlist 2 requests?" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Waitlist 2 requests?" }),
      ).not.toBeInTheDocument(),
    );
    expect(bulkReview).not.toHaveBeenCalled();
  });

  it("renders both halves of a partial result and keeps the failures selected", async () => {
    const user = userEvent.setup();
    bulkReview.mockResolvedValue({
      succeeded: ["req-1"],
      failed: [
        { id: "req-2", reason: "Join request has already been reviewed" },
      ],
    });
    const onOutcome = renderBar();

    await user.click(await screen.findByRole("button", { name: "Approve" }));
    await user.click(
      await screen.findByRole("button", { name: "Approve all" }),
    );

    // The successes are counted, never rounded up to cover the whole batch.
    expect(
      await screen.findByText("1 request went through."),
    ).toBeInTheDocument();
    expect(screen.getByText("1 was left as it was")).toBeInTheDocument();

    // The failure is named by applicant, with the server's own reason.
    expect(screen.getByText("Ana Ferreira")).toBeInTheDocument();
    expect(
      screen.getByText("Join request has already been reviewed"),
    ).toBeInTheDocument();

    // Succeeded ids leave the queue; failed ids stay selected for the retry.
    expect(onOutcome).toHaveBeenCalledWith(["req-1"], ["req-2"]);
    // A half-landed batch is never announced as a plain success.
    expect(showToast).not.toHaveBeenCalled();
  });

  it("announces a clean sweep as a success and shows no result panel", async () => {
    const user = userEvent.setup();
    bulkReview.mockResolvedValue({ succeeded: ["req-1", "req-2"], failed: [] });
    const onOutcome = renderBar();

    await user.click(await screen.findByRole("button", { name: "Approve" }));
    await user.click(
      await screen.findByRole("button", { name: "Approve all" }),
    );

    await waitFor(() =>
      expect(onOutcome).toHaveBeenCalledWith(["req-1", "req-2"], []),
    );
    expect(showToast).toHaveBeenCalled();
    expect(screen.queryByText("What went through")).not.toBeInTheDocument();
  });

  it("requires a reason before a bulk decline, and names it in the confirmation", async () => {
    const user = userEvent.setup();
    bulkReview.mockResolvedValue({ succeeded: ["req-1", "req-2"], failed: [] });
    renderBar();

    await user.click(await screen.findByRole("button", { name: "Decline" }));

    const confirmDecline = await screen.findByRole("button", {
      name: "Decline all",
    });
    expect(confirmDecline).toBeDisabled();

    // The Select's trigger is named by its FormField label, same wiring
    // JoinRequestDeclineModal.test.tsx exercises.
    await user.click(await screen.findByRole("button", { name: "Reason" }));
    await user.click(
      await screen.findByRole("option", { name: "Looks like spam" }),
    );

    // The confirmation states the reason that will be recorded against all of
    // them, so the reviewer confirms against the record rather than a dropdown.
    expect(
      await screen.findByText(
        "This records “Looks like spam” against all 2 selected requests.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Decline all" }));
    await waitFor(() =>
      expect(bulkReview).toHaveBeenCalledWith(
        ["req-1", "req-2"],
        "declined",
        "spam_pattern",
      ),
    );
  });
});
