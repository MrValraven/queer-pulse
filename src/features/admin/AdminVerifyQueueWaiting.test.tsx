import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { readableTextIs } from "../../test/readableText";
import { TestProviders } from "../../test/TestProviders";
import { AdminVerifyQueueWaiting } from "./AdminVerifyQueueWaiting";
import { makeJoinRequestRow } from "./joinRequestTestRow";
import { useJoinRequestAssignment } from "./useJoinRequestAssignment";
import { useJoinRequestQueueDecisions } from "./useJoinRequestQueueDecisions";
import type { JoinRequestView } from "./api/useJoinRequests";

/**
 * Selection is the gate on every bulk action, so it is exercised through the
 * real hooks rather than with stand-in props: the checkbox on a card, the
 * select-all above them and the bar that appears are one wiring, and a test
 * that hand-fed a selection would pass with that wiring broken.
 */
function Harness({
  rows,
  hasLoadError = false,
  isRetrying = false,
  onRetry = () => {},
}: {
  rows: JoinRequestView[];
  hasLoadError?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
}) {
  const assignment = useJoinRequestAssignment();
  const decisions = useJoinRequestQueueDecisions(rows);
  return (
    <AdminVerifyQueueWaiting
      pending={rows}
      waitlisted={[]}
      isLoading={false}
      hasLoadError={hasLoadError}
      isRetrying={isRetrying}
      onRetry={onRetry}
      decisions={decisions}
      assignment={assignment}
    />
  );
}

const rows = [
  makeJoinRequestRow({ id: "req-1", name: "Kai Mendes" }),
  makeJoinRequestRow({ id: "req-2", name: "Ana Ferreira" }),
];

function renderQueue() {
  render(<Harness rows={rows} />, { wrapper: TestProviders });
}

describe("AdminVerifyQueueWaiting selection", () => {
  it("keeps the bulk bar hidden until something is selected", async () => {
    renderQueue();

    // Waits on the lazily-loaded admin namespace before asserting an absence.
    await screen.findByRole("checkbox", {
      name: "Select Kai Mendes's request",
    });
    expect(
      screen.queryByRole("region", { name: "Bulk actions" }),
    ).not.toBeInTheDocument();
  });

  it("names the applicant on every checkbox and the exact set on select-all", async () => {
    renderQueue();

    expect(
      await screen.findByRole("checkbox", {
        name: "Select Kai Mendes's request",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Select Ana Ferreira's request" }),
    ).toBeInTheDocument();
    // Select-all says the set it takes: the requests waiting on this page,
    // never the whole queue and never the waitlisted section.
    expect(
      screen.getByRole("checkbox", {
        name: "Select all 2 requests waiting here",
      }),
    ).toBeInTheDocument();
  });

  it("brings up the bulk bar with a live count as rows are selected", async () => {
    const user = userEvent.setup();
    renderQueue();

    await user.click(
      await screen.findByRole("checkbox", {
        name: "Select Kai Mendes's request",
      }),
    );

    expect(
      await screen.findByRole("region", { name: "Bulk actions" }),
    ).toBeInTheDocument();
    expect(screen.getByText(readableTextIs("1 selected"))).toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", { name: "Select Ana Ferreira's request" }),
    );
    expect(
      await screen.findByText(readableTextIs("2 selected")),
    ).toBeInTheDocument();
  });

  it("takes the whole visible page with select-all, and gives it back again", async () => {
    const user = userEvent.setup();
    renderQueue();

    const selectAll = await screen.findByRole("checkbox", {
      name: "Select all 2 requests waiting here",
    });
    await user.click(selectAll);

    expect(
      await screen.findByText(readableTextIs("2 selected")),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Select Kai Mendes's request" }),
    ).toBeChecked();

    await user.click(selectAll);
    expect(
      screen.queryByRole("region", { name: "Bulk actions" }),
    ).not.toBeInTheDocument();
  });
});

describe("AdminVerifyQueueWaiting load error (DES-424)", () => {
  it("offers a retry and hides the clear-queue line when the read failed", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<Harness rows={[]} hasLoadError onRetry={onRetry} />, {
      wrapper: TestProviders,
    });

    await user.click(await screen.findByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/The queue is clear/)).not.toBeInTheDocument();
  });

  it("keeps loaded rows on screen beside the error", async () => {
    render(<Harness rows={rows} hasLoadError />, { wrapper: TestProviders });

    expect(
      await screen.findByRole("checkbox", {
        name: "Select Kai Mendes's request",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
    // The copy names the missing part, since half the queue is on screen.
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "We couldn't load part of the queue",
      }),
    ).toBeInTheDocument();
  });

  it("keeps the Retry in place and marks it busy while a retry runs", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<Harness rows={[]} hasLoadError isRetrying onRetry={onRetry} />, {
      wrapper: TestProviders,
    });

    const retryButton = await screen.findByRole("button", {
      name: "Trying again…",
    });
    expect(retryButton).toHaveAttribute("aria-disabled", "true");
    await user.click(retryButton);
    expect(onRetry).not.toHaveBeenCalled();
  });
});
