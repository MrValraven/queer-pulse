import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ThreadOpSection } from "./ThreadOpSection";
import { deriveOpView, type useThreadModeration } from "./useThreadModeration";
import type { Thread } from "./forum.data";

/**
 * Forum report targeting (audit P1-1). The opening-post "Report" affordance must
 * target the OP's REAL backend post id (`thread.opPostId`), NOT the FE-synthetic
 * numeric `thread.id`. The synthetic id points at no real subject, so a report
 * built from it silently never reaches moderators. This is the regression the
 * `subjectId: thread.opPostId ?? String(thread.id)` line in `ThreadOpSection`
 * guards; here we click Report and assert the target the moderation store is
 * handed.
 */

function makeThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: 42,
    slug: "welcome-to-the-forum",
    category: "general",
    title: "Welcome to the forum",
    excerpt: "Say hi",
    author: {
      initials: "RV",
      name: "Rita Valente",
      background: "var(--plum)",
      color: "var(--cream)",
      slug: "rita-valente",
    },
    posted: "2h ago",
    views: 120,
    upvotes: 8,
    comments: 3,
    tags: ["welcome"],
    body: ["Hello everyone."],
    replies: [],
    opPostId: "op-real-post-abc",
    ...overrides,
  };
}

/** Every moderation handler stubbed; only `setReportTarget` is observed. Cast to
 *  the hook's return type — the render never invokes the other handlers. */
function moderationStub(setReportTarget: ReturnType<typeof vi.fn>) {
  return {
    setReportTarget,
    setEditingOpInitialBody: vi.fn(),
    setEditingOp: vi.fn(),
    onOpDelete: vi.fn(),
    doRestorePost: vi.fn(),
    setHistoryPostId: vi.fn(),
    opOverride: {},
  } as unknown as ReturnType<typeof useThreadModeration>;
}

function renderOp(thread: Thread, setReportTarget: ReturnType<typeof vi.fn>) {
  // Live-mode view-model (demoMode=false): permission flags read straight off
  // the thread; nothing here is owned by the demo persona.
  const opView = deriveOpView(thread, false, false, {});
  render(
    <TestProviders>
      <ThreadOpSection
        thread={thread}
        opView={opView}
        onVote={() => {}}
        bookmarked={false}
        onToggleBookmark={() => {}}
        moderation={moderationStub(setReportTarget)}
      />
    </TestProviders>,
  );
}

describe("ThreadOpSection report target", () => {
  it("reports the OP's real opPostId, not the synthetic thread id", async () => {
    const setReportTarget = vi.fn();
    renderOp(makeThread({ id: 42, opPostId: "op-real-post-abc" }), setReportTarget);

    fireEvent.click(await screen.findByRole("button", { name: "Report" }));

    expect(setReportTarget).toHaveBeenCalledWith({
      authorName: "Rita Valente",
      subjectId: "op-real-post-abc",
      subjectType: "post",
    });
    // Explicitly guard against the old bug: the numeric thread id is never used.
    expect(setReportTarget.mock.calls[0]?.[0].subjectId).not.toBe("42");
  });

  it("falls back to the thread id only when there is no opPostId (demo mock)", async () => {
    const setReportTarget = vi.fn();
    renderOp(makeThread({ id: 7, opPostId: undefined }), setReportTarget);

    fireEvent.click(await screen.findByRole("button", { name: "Report" }));

    expect(setReportTarget).toHaveBeenCalledWith(
      expect.objectContaining({ subjectId: "7", subjectType: "post" }),
    );
  });
});
