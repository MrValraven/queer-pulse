import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ModerationQueueHealthPanel } from "./ModerationQueueHealthPanel";
import {
  makeQueueEntry,
  makeQueueHealth,
} from "./moderationQueueHealthTestData";
import type { ModerationQueueHealthDTO } from "./api/moderationHealth.api";

/**
 * TS-04's contract, in three parts:
 *
 * 1. Five healthy queues read as healthy, and every threshold shown comes off
 *    the response rather than from a table on this side.
 * 2. A critical queue names the axes that tripped it, so a moderator knows
 *    which of the three problems they have.
 * 3. THE NULLS. Three fields are nullable and each null means something
 *    different. Rendering any of them as `0` would state the opposite of what
 *    the wire said, which is why they get a test of their own.
 */
let health: ModerationQueueHealthDTO = makeQueueHealth();
vi.mock("./api/useModerationQueueHealth", () => ({
  useModerationQueueHealth: () => ({
    data: health,
    isLoading: false,
    isError: false,
  }),
}));

function renderPanel(dto: ModerationQueueHealthDTO) {
  health = dto;
  render(<ModerationQueueHealthPanel />, { wrapper: TestProviders });
}

beforeEach(() => {
  health = makeQueueHealth();
});

describe("ModerationQueueHealthPanel", () => {
  it("lists every queue and reads clear when nothing is breaching", async () => {
    renderPanel(makeQueueHealth());

    expect(await screen.findByText("Invite requests")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Appeals")).toBeInTheDocument();
    expect(screen.getByText("Verification requests")).toBeInTheDocument();
    expect(
      screen.getByText("Bans waiting on a second look"),
    ).toBeInTheDocument();

    // One chip per queue plus the overall summary chip.
    expect(screen.getAllByText("Clear")).toHaveLength(6);
    // Nothing tripped, so no queue explains itself.
    expect(screen.queryByText("What tipped it:")).not.toBeInTheDocument();
  });

  it("names the rota size without attributing work to anyone", async () => {
    renderPanel(makeQueueHealth({ activeModeratorCount: 4 }));

    expect(
      await screen.findByText("4 people can work these queues"),
    ).toBeInTheDocument();
  });

  it("shows the threshold each figure is measured against, from the response", async () => {
    renderPanel(
      makeQueueHealth({
        queues: [
          makeQueueEntry("reports", {
            depth: 3,
            thresholds: {
              // Deliberately NOT the shipped numbers: a panel reading its own
              // table instead of the wire would print 10 and 25 here.
              depth: { warning: 7, critical: 19 },
              oldestHours: { warning: 24, critical: 72 },
              overdue: { warning: 1, critical: 5 },
            },
          }),
        ],
      }),
    );

    expect(await screen.findByText("Flags at 7")).toBeInTheDocument();
  });

  it("moves the threshold note up a band once a figure is past the warning level", async () => {
    renderPanel(
      makeQueueHealth({
        overallSeverity: "warning",
        queues: [
          makeQueueEntry("reports", {
            depth: 12,
            severity: "warning",
            breaches: ["depth"],
          }),
        ],
      }),
    );

    // Already at the warning band, so the next thing to trip is critical.
    expect(await screen.findByText("Needs someone at 25")).toBeInTheDocument();
  });

  it("renders a critical queue with the axes that tripped it", async () => {
    renderPanel(
      makeQueueHealth({
        overallSeverity: "critical",
        queues: [
          makeQueueEntry("invite_requests", {
            depth: 44,
            overdueCount: 7,
            oldestItemHours: 80,
            severity: "critical",
            breaches: ["depth", "oldest", "overdue"],
          }),
        ],
      }),
    );

    expect(await screen.findByText("What tipped it:")).toBeInTheDocument();
    expect(
      screen.getByText(
        "a lot is waiting · something has waited a long time · windows we published have passed",
      ),
    ).toBeInTheDocument();
    // The level is a word, never colour alone.
    expect(screen.getAllByText("Needs someone now").length).toBeGreaterThan(0);
    // Past the top band, so the note says so instead of naming a level behind it.
    expect(screen.getByText("Already past 25")).toBeInTheDocument();
  });

  describe("the nullable fields", () => {
    it("renders a null unassigned count as not applicable, never as zero", async () => {
      renderPanel(
        makeQueueHealth({
          queues: [makeQueueEntry("appeals", { unassignedCount: null })],
        }),
      );

      expect(await screen.findByText("Not applicable")).toBeInTheDocument();
      expect(
        screen.getByText("This queue has no claiming step"),
      ).toBeInTheDocument();
    });

    it("renders a null oldest item as good news, never as zero hours", async () => {
      renderPanel(
        makeQueueHealth({
          queues: [
            makeQueueEntry("ban_ratifications", {
              depth: 0,
              oldestItemHours: null,
              unassignedCount: null,
            }),
          ],
        }),
      );

      expect(await screen.findByText("Nothing waiting")).toBeInTheDocument();
      expect(screen.queryByText("0 hours")).not.toBeInTheDocument();
    });

    it("omits the turnaround line for a queue that publishes none", async () => {
      renderPanel(
        makeQueueHealth({
          queues: [makeQueueEntry("reports", { medianResponseHours: null })],
        }),
      );

      await screen.findByText("Reports");
      expect(screen.queryByText("Usual turnaround")).not.toBeInTheDocument();
    });

    it("shows the turnaround line for the queue that does publish one", async () => {
      renderPanel(
        makeQueueHealth({
          queues: [
            makeQueueEntry("invite_requests", { medianResponseHours: 26.4 }),
          ],
        }),
      );

      expect(await screen.findByText("Usual turnaround")).toBeInTheDocument();
      expect(screen.getByText("26.4 hours")).toBeInTheDocument();
    });

    it("says nobody is on rota when there are no active moderators", async () => {
      renderPanel(
        makeQueueHealth({
          activeModeratorCount: 0,
          queues: [makeQueueEntry("reports", { depthPerModerator: null })],
        }),
      );

      expect(await screen.findByText("Nobody on rota")).toBeInTheDocument();
      expect(
        screen.getByText("No active moderator or admin accounts"),
      ).toBeInTheDocument();
      // The summary states the same fact plainly rather than hiding it: an
      // empty rota is the loudest thing this panel can report.
      expect(
        screen.getByText("0 people can work these queues"),
      ).toBeInTheDocument();
    });
  });
});
