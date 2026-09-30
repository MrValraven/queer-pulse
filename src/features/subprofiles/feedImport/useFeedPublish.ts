import { useEffect, useRef } from "react";
import { feedErrorMessageKey } from "../api/feedImportErrors";
import { isPersonaEditConflict } from "../api/personaEditConflict";
import { subprofileToView } from "../api/subprofiles.adapters";
import type { SubprofileFeedDTO } from "../api/subprofileFeeds.api";
import { useSubprofileFeedMutations } from "../api/useSubprofileFeedMutations";
import { useSubprofileEditorContext } from "../subprofileEditorContext";
import { withUid } from "../subprofileSectionEditorRows";

/** How a publish ended: how many went live and how many did not fit, or the
 *  catalog key of what to tell the member. */
export type FeedPublishOutcome =
  | { kind: "done"; published: number; skipped: number }
  | { kind: "failed"; messageKey: string };

/**
 * Publishing episodes from inside the open editor. A publish is a persona
 * write that raises its `editVersion`, so it has to fit the editor's one
 * save model:
 *
 * - While the editor holds unsaved edits (or a save is running, or a save
 *   conflict is waiting on a Reload), publishing is locked with a one-line
 *   reason. The section rows are seed-once, so publishing over a draft of the
 *   same section would leave the draft showing the old list.
 * - The publish carries the editor's `editVersion` as `expectedEditVersion`.
 *   A 409 `PERSONA_EDIT_CONFLICT` raises the editor's conflict alert.
 * - On success the editor takes the version the server answered with, at
 *   once (the mutation resolves before any refetch), so a Save in that window
 *   carries the right one. The section the episodes landed in is re-seeded
 *   from the returned persona so the new items show in the section editor.
 *   If the member started editing that very section while the publish was in
 *   flight, their draft is kept and the new items are put on top of it
 *   instead; re-seeding would throw their typing away. (The owner query cache
 *   is adopted by the mutation itself.)
 */
export function useFeedPublish(feed: SubprofileFeedDTO) {
  const editor = useSubprofileEditorContext();
  const { publish } = useSubprofileFeedMutations();
  // The editor as it is when the response lands, not as it was at the click.
  const latestEditor = useRef(editor);
  useEffect(() => {
    latestEditor.current = editor;
  });

  const lockReasonKey = editor.dirty
    ? "subprofiles:feedImport.review.lock.dirty"
    : editor.hasEditConflict
      ? "subprofiles:feedImport.review.lock.conflict"
      : editor.saving || editor.isReloading
        ? "subprofiles:feedImport.review.lock.saving"
        : null;

  async function publishEntries(
    entryIds: string[],
  ): Promise<FeedPublishOutcome> {
    if (lockReasonKey) return { kind: "failed", messageKey: lockReasonKey };
    try {
      const result = await publish.mutateAsync({
        subprofileId: feed.subprofileId,
        feedId: feed.id,
        entryIds,
        expectedEditVersion: editor.getEditVersion(),
      });
      const current = latestEditor.current;
      if (typeof result.subprofile.editVersion === "number") {
        current.adoptEditVersion(result.subprofile.editVersion);
      }
      const view = subprofileToView(result.subprofile);
      const isSectionBeingEdited = current.pending.some(
        (change) =>
          change.area.kind === "section" &&
          change.area.section === feed.section,
      );
      if (isSectionBeingEdited) {
        const draftRows = current.sectionRows[feed.section] ?? [];
        // The server inserts what it published at the top of the section.
        const arrived = (
          view.sections.find((section) => section.section === feed.section)
            ?.items ?? []
        ).slice(0, result.published);
        current.setSectionRows(feed.section, [
          ...arrived.map(withUid),
          ...draftRows,
        ]);
      } else {
        current.reseedSection(feed.section, view);
      }
      return {
        kind: "done",
        published: result.published,
        skipped: result.skipped,
      };
    } catch (error) {
      if (isPersonaEditConflict(error)) editor.markEditConflict();
      return { kind: "failed", messageKey: feedErrorMessageKey(error) };
    }
  }

  return {
    publishEntries,
    isPublishing: publish.isPending,
    lockReasonKey,
  };
}
