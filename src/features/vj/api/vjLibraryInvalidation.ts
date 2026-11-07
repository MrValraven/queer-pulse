import type {
  VjLibraryChange,
  VjLibraryChangeKind,
} from "../../../shared/contracts/vj";

/** One group of library queries a change leaves stale. `useInvalidateVjLibrary`
 *  turns each into a `vjKeys` key. */
export type VjInvalidationTarget =
  | { kind: "root" }
  | { kind: "packs" }
  | { kind: "clips" }
  | { kind: "packClipsRoot" }
  | { kind: "packClips"; packId: string }
  | { kind: "packEventRoot" }
  | { kind: "scenes" }
  | { kind: "setlists" };

const ROOT: VjInvalidationTarget = { kind: "root" };
const PACKS: VjInvalidationTarget = { kind: "packs" };
const CLIPS: VjInvalidationTarget = { kind: "clips" };
const PACK_CLIPS_ROOT: VjInvalidationTarget = { kind: "packClipsRoot" };
const PACK_EVENT_ROOT: VjInvalidationTarget = { kind: "packEventRoot" };
const SCENES: VjInvalidationTarget = { kind: "scenes" };
const SETLISTS: VjInvalidationTarget = { kind: "setlists" };

/** A pack's clip list changed: the packs it names, then the pack list (counts
 *  and covers) and the clip list (pack membership). */
function packClipsTargetsOf(change: VjLibraryChange): VjInvalidationTarget[] {
  const touchedPackIds = new Set<string>(change.packIds);
  if (change.packId !== null) touchedPackIds.add(change.packId);
  const packTargets: VjInvalidationTarget[] = [...touchedPackIds].map(
    (packId) => ({ kind: "packClips", packId }),
  );
  return [...packTargets, PACKS, CLIPS];
}

/** The targets of one change, by kind. */
function targetsOfChange(change: VjLibraryChange): VjInvalidationTarget[] {
  const kind: VjLibraryChangeKind = change.kind;
  switch (kind) {
    case "pack_clips_changed":
      return packClipsTargetsOf(change);
    // The other v1 kinds read the whole library again; `root` also covers the
    // scenes a clip delete may have rewritten (contract 9.3).
    case "pack_created":
    case "pack_renamed":
    case "pack_deleted":
    case "packs_reordered":
    case "clip_created":
    case "clip_updated":
    case "clip_deleted":
      return [ROOT];
    case "clip_favorite_changed":
    case "clip_defaults_changed":
      return [CLIPS, PACK_CLIPS_ROOT];
    // A new preview may become a pack cover.
    case "clip_preview_changed":
      return [CLIPS, PACK_CLIPS_ROOT, PACKS];
    case "pack_event_changed":
      return [PACKS, PACK_EVENT_ROOT];
    case "scene_created":
    case "scene_updated":
    case "scenes_reordered":
      return [SCENES];
    // The server drops the scene from every set list that held it.
    case "scene_deleted":
      return [SCENES, SETLISTS];
    case "setlist_created":
    case "setlist_renamed":
    case "setlists_reordered":
      return [SETLISTS];
    // Scenes carry `setlistItemCount`, which these two change (library call 15).
    case "setlist_items_changed":
    case "setlist_deleted":
      return [SETLISTS, SCENES];
    default: {
      const unhandledKind: never = kind;
      throw new Error(
        `VJ_LIBRARY_CHANGE_KIND_UNHANDLED ${String(unhandledKind)}`,
      );
    }
  }
}

/** What a change leaves stale (contract 9.3, plus this plan's calls 15 and 16).
 *  A null change (an unknown sender, or a demo tab that missed messages) reads
 *  the whole library again. */
export function vjInvalidationTargetsOf(
  change: VjLibraryChange | null,
): VjInvalidationTarget[] {
  if (change === null) return [ROOT];
  return targetsOfChange(change);
}

/** A full VjLibraryChange from the fields a writer knows; the rest take their
 *  empty values. */
export function vjLibraryChangeOf(
  change: Pick<VjLibraryChange, "kind"> &
    Partial<Omit<VjLibraryChange, "kind">>,
): VjLibraryChange {
  return {
    packId: null,
    clipId: null,
    packIds: [],
    sceneId: null,
    setlistId: null,
    setlistIds: [],
    eventId: null,
    ...change,
  };
}
