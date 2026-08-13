import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { SubprofileView } from "./subprofiles.adapters";
import {
  getDemoRevision,
  listDemoRevisions,
  restoreDemoRevisionSnapshot,
  type ItemRevisionDetail,
  type ItemRevisionSummary,
} from "./itemRevisions";

export type { ItemRevisionDetail, ItemRevisionSummary };

/**
 * Newest-first list of a saved portfolio item's revision history ("Protect
 * Your Work" version history). Demo mode reads the in-memory overlay in
 * `itemRevisions.ts` (seeded + runtime-recorded); live calls
 * `GET subprofiles/:subprofileId/items/:itemId/revisions`. `demoMode` rides in
 * the query key (mirrors `useSubprofile`) so flipping the toggle never serves
 * one mode's cached rows to the other. Disabled until `itemId` is a real,
 * saved id, a brand-new unsaved item has no revisions yet.
 */
export function useItemRevisions(subprofileId: string, itemId: string) {
  const { demoMode } = useDemoMode();
  return useQuery<ItemRevisionSummary[]>({
    queryKey: ["item-revisions", demoMode, subprofileId, itemId],
    enabled: itemId.length > 0,
    queryFn: async ({ signal }) => {
      if (demoMode) return listDemoRevisions(itemId);
      return apiGet<ItemRevisionSummary[]>(
        `/subprofiles/${subprofileId}/items/${itemId}/revisions`,
        undefined,
        undefined,
        signal,
      );
    },
  });
}

/**
 * One revision's full saved snapshot, fetched on demand for the read-only
 * "View" preview. Live: `GET .../revisions/:revisionId`. Demo: reads the same
 * in-memory overlay `useItemRevisions` lists from. Disabled until a revision
 * is actually selected (`revisionId` set).
 */
export function useItemRevisionDetail(
  subprofileId: string,
  itemId: string,
  revisionId: string | null,
) {
  const { demoMode } = useDemoMode();
  return useQuery<ItemRevisionDetail | undefined>({
    queryKey: [
      "item-revisions",
      demoMode,
      subprofileId,
      itemId,
      "detail",
      revisionId,
    ],
    enabled: itemId.length > 0 && Boolean(revisionId),
    queryFn: async ({ signal }) => {
      if (!revisionId) return undefined;
      if (demoMode) return getDemoRevision(itemId, revisionId);
      return apiGet<ItemRevisionDetail>(
        `/subprofiles/${subprofileId}/items/${itemId}/revisions/${revisionId}`,
        undefined,
        undefined,
        signal,
      );
    },
  });
}

export interface RestoreItemRevisionVariables {
  subprofileId: string;
  itemId: string;
  revisionId: string;
}

export interface RestoreItemRevisionResult {
  ok: true;
  /** The persona, refetched immediately after a LIVE restore so this already
   *  holds the restored item's content. The open editor's row state is
   *  seed-once (see `useEditorRowsState`) and would otherwise keep showing
   *  the pre-restore rows until a full reload — the caller (currently
   *  `ItemRevisionHistoryModal`) passes this straight to
   *  `reseedSection(section, subprofile)` so the section list + docked
   *  preview pick up the restored content immediately, and a later
   *  "Save all" can't PUT the stale rows back over the restore. `null` for a
   *  demo restore (see the mutationFn doc below) or if the persona query
   *  was not already active in the cache to refetch. */
  subprofile: SubprofileView | null;
}

/**
 * Restore a saved revision as the item's current content.
 *
 * Live: `POST .../revisions/:revisionId/restore`, then refetches the
 * persona's owner-editor query (`["subprofile", demoMode, subprofileId]`,
 * the exact key `useSubprofile` reads) and returns that fresh data as
 * `subprofile`. The refetch reuses whichever queryFn is already registered
 * for that key, since the only place this mutation is reachable from is the
 * open persona editor, which keeps that query active for the lifetime of the
 * page. Ownership + active-member guard is enforced server-side, same as
 * every other subprofile mutation. This is the real, correct path.
 *
 * Demo: demo items are static fixtures re-derived from `subprofiles.data.ts`
 * on every read (see `useSubprofile`), and a demo item's id churns on every
 * section save, so there is no stable row here to actually rewrite. The demo
 * branch calls `restoreDemoRevisionSnapshot`, which records the restore as a
 * fresh history entry and resolves successfully so the UI can still show a
 * "restored" toast, with `subprofile: null` since there is nothing to reseed.
 * It deliberately does NOT rewrite the item content a member sees elsewhere
 * in the demo UI, that is out of scope for the static fixtures; live mode is
 * unaffected by this limitation.
 *
 * `onSuccess` invalidates this item's revisions list so "Version history"
 * itself picks up the new top entry.
 */
export function useRestoreItemRevision() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<
    RestoreItemRevisionResult,
    Error,
    RestoreItemRevisionVariables
  >({
    mutationFn: async ({ subprofileId, itemId, revisionId }) => {
      if (demoMode) {
        restoreDemoRevisionSnapshot(itemId, revisionId);
        return { ok: true, subprofile: null };
      }
      await apiPost<{ ok: true }>(
        `/subprofiles/${subprofileId}/items/${itemId}/revisions/${revisionId}/restore`,
      );
      // Refetch (not just invalidate) and AWAIT it here, inside the
      // mutationFn, so the restored data is what this mutation resolves
      // with — an `onSuccess`-only invalidate would race the caller, which
      // needs the refetched rows in hand the moment `mutateAsync` resolves.
      const subprofileQueryKey = ["subprofile", demoMode, subprofileId];
      await queryClient.refetchQueries({
        queryKey: subprofileQueryKey,
        exact: true,
      });
      const subprofile =
        queryClient.getQueryData<SubprofileView | null>(subprofileQueryKey) ??
        null;
      return { ok: true, subprofile };
    },
    onSuccess: (_data, { subprofileId, itemId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["item-revisions", demoMode, subprofileId, itemId],
      });
    },
  });
}
