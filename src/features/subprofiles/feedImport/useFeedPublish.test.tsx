import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_PODCAST_SUBPROFILE_ID } from "../data/subprofileFeeds.data";
import {
  demoListEntries,
  demoListFeeds,
  resetDemoFeedsForTests,
} from "../data/subprofileFeedsDemo";
import {
  resetDemoEditVersionsForTests,
  resetDemoItemWritesForTests,
} from "../data/subprofiles.data";
import { emptyItem, withUid } from "../subprofileSectionEditorRows";
import { editorStub } from "./feedImportTestData";
import { WithEditor } from "./feedImportTestSupport";
import { useFeedPublish } from "./useFeedPublish";

const reset = () => {
  resetDemoFeedsForTests();
  resetDemoItemWritesForTests();
  resetDemoEditVersionsForTests();
};
beforeEach(reset);
afterEach(reset);

function setup(editor = editorStub()) {
  const feed = demoListFeeds(DEMO_PODCAST_SUBPROFILE_ID)[0];
  if (!feed) throw new Error("demo feed is missing");
  const entryIds = demoListEntries(
    DEMO_PODCAST_SUBPROFILE_ID,
    feed.id,
    "pending",
  ).map((entry) => entry.id);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders>
      <WithEditor editor={editor}>{children}</WithEditor>
    </TestProviders>
  );
  const hook = renderHook(() => useFeedPublish(feed), { wrapper });
  return { editor, entryIds, hook };
}

describe("useFeedPublish edit-version hand-back", () => {
  it("takes the new version and re-seeds the section when nothing was being edited", async () => {
    const { editor, entryIds, hook } = setup();
    let outcome: Awaited<
      ReturnType<typeof hook.result.current.publishEntries>
    > | null = null;
    await act(async () => {
      outcome = await hook.result.current.publishEntries(entryIds);
    });
    expect(outcome).toEqual({ kind: "done", published: 5, skipped: 0 });
    expect(editor.adoptEditVersion).toHaveBeenCalledWith(1);
    expect(editor.reseedSection).toHaveBeenCalledWith(
      "episodes",
      expect.anything(),
    );
    expect(editor.setSectionRows).not.toHaveBeenCalled();
  });

  it("keeps a draft typed while the publish was in flight, putting the new episodes on top of it", async () => {
    const { editor, entryIds, hook } = setup();
    const draft = withUid({
      ...emptyItem("episodes"),
      title: "My draft episode",
    });

    let pending: Promise<unknown> = Promise.resolve();
    act(() => {
      pending = hook.result.current.publishEntries(entryIds);
    });
    // The member starts editing the very section being published into.
    editor.pending = [
      {
        area: { kind: "section", section: "episodes" },
        areaLabelKey: "subprofiles:section.episodes",
        summaryKey: "subprofiles:pending.added",
      },
    ];
    editor.sectionRows = { episodes: [draft] };
    await act(async () => {
      await pending;
    });

    // The version is taken all the same, so the next Save does not conflict.
    expect(editor.adoptEditVersion).toHaveBeenCalledWith(1);
    // The draft is not thrown away by a re-seed.
    expect(editor.reseedSection).not.toHaveBeenCalled();
    const [section, rows] =
      vi.mocked(editor.setSectionRows).mock.calls[0] ?? [];
    expect(section).toBe("episodes");
    expect(rows).toHaveLength(6);
    expect(rows?.[0]?.title).toBe("The second coming out");
    expect(rows?.[5]).toBe(draft);
  });

  it("refuses to start while the editor holds unsaved edits", async () => {
    const { editor, entryIds, hook } = setup(editorStub({ dirty: true }));
    let outcome: unknown = null;
    await act(async () => {
      outcome = await hook.result.current.publishEntries(entryIds);
    });
    expect(outcome).toEqual({
      kind: "failed",
      messageKey: "subprofiles:feedImport.review.lock.dirty",
    });
    expect(editor.adoptEditVersion).not.toHaveBeenCalled();
  });
});
