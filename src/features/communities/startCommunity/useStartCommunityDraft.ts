import { useCallback, useEffect, useMemo, useRef } from "react";
import { useCreatorDraftResumeSource } from "../../creatorDrafts/api/useCreatorDraftResumeSource";
import {
  useCreatorDraftAutosave,
  type CreatorDraftSaveStatus,
} from "../../creatorDrafts/api/useCreatorDraftAutosave";
import type {
  CreatorDraftConflict,
  CreatorDraftResponse,
  CreatorDraftSlot,
} from "../../creatorDrafts/api/creatorDrafts.types";
import type { CommunityDraft } from "./startCommunity.data";
import {
  clearCommunityDraft,
  readCommunityDraft,
  type StoredCommunityDraft,
} from "./communityDraftStorage";
import { communityDraftProgress } from "./startCommunityDraftProgress";

/** The founder's one community draft slot on the server. */
const COMMUNITY_DRAFT_SLOT: CreatorDraftSlot = {
  kind: "community",
  listingRef: null,
};

/** Where the wizard's starting draft came from. */
export type StartCommunityDraftSource = "server" | "legacy" | null;

export interface StartCommunityDraftLoad {
  isLoading: boolean;
  initial: StoredCommunityDraft | null;
  source: StartCommunityDraftSource;
}

/** True when a stored payload has the wizard's shape: an object draft and a numeric step. */
function isStoredCommunityPayload(payload: Record<string, unknown>): boolean {
  const { draft, step } = payload;
  return (
    typeof draft === "object" && draft !== null && typeof step === "number"
  );
}

/** Reads a stored payload back as the wizard's draft and chapter; null for any other shape. */
function storedCommunityDraftFrom(
  serverDraft: CreatorDraftResponse | null,
): StoredCommunityDraft | null {
  if (serverDraft === null) return null;
  if (!isStoredCommunityPayload(serverDraft.payload)) return null;
  const { draft, step } = serverDraft.payload as {
    draft: CommunityDraft;
    step: number;
  };
  return { draft, step };
}

/**
 * The draft the wizard opens on: the server copy first, then the old tab copy
 * an earlier build left in sessionStorage, else a blank wizard. It waits for a
 * save a closed wizard still has on the wire, so the founder's last words seed it.
 */
export function useStartCommunityDraftLoad(
  ownerSlug: string,
): StartCommunityDraftLoad {
  const resumeSource = useCreatorDraftResumeSource(COMMUNITY_DRAFT_SLOT);
  const serverInitial = useMemo(
    () => storedCommunityDraftFrom(resumeSource.draft),
    [resumeSource.draft],
  );
  const hasServerDraft = serverInitial !== null;
  const legacyInitial = useMemo(
    () => (hasServerDraft ? null : readCommunityDraft(ownerSlug)),
    [hasServerDraft, ownerSlug],
  );
  if (!resumeSource.isSettled) {
    return { isLoading: true, initial: null, source: null };
  }
  if (serverInitial !== null) {
    return { isLoading: false, initial: serverInitial, source: "server" };
  }
  if (legacyInitial !== null) {
    return { isLoading: false, initial: legacyInitial, source: "legacy" };
  }
  return { isLoading: false, initial: null, source: null };
}

export interface StartCommunityAutosaveOptions {
  ownerSlug: string;
  draft: CommunityDraft;
  step: number;
  missingByStep: Record<number, string[]>;
  isDirty: boolean;
  /** True once the founder changed something or moved chapter. */
  hasEdited: boolean;
  isEnabled: boolean;
  source: StartCommunityDraftSource;
}

export interface StartCommunityAutosave {
  status: CreatorDraftSaveStatus;
  conflict: CreatorDraftConflict | null;
  isConflictBusy: boolean;
  loadNewer: () => Promise<StoredCommunityDraft | null>;
  keepThisVersion: () => void;
  discard: () => Promise<void>;
  forget: () => void;
}

/**
 * Autosaves the founder's words and chapter to the server. A reopened draft
 * waits for the founder's first edit, so opening the wizard saves nothing. A
 * wizard restored from the old tab copy uploads it on open and deletes that
 * copy once the save lands, so nothing of it stays in this browser.
 */
export function useStartCommunityAutosave({
  ownerSlug,
  draft,
  step,
  missingByStep,
  isDirty,
  hasEdited,
  isEnabled,
  source,
}: StartCommunityAutosaveOptions): StartCommunityAutosave {
  const shouldSave = isDirty && (hasEdited || source === "legacy");
  const payload = useMemo(
    () => (shouldSave ? { draft, step } : null),
    [shouldSave, draft, step],
  );
  const { progress, missing } = useMemo(
    () => communityDraftProgress(missingByStep, step),
    [missingByStep, step],
  );
  const autosave = useCreatorDraftAutosave({
    slot: COMMUNITY_DRAFT_SLOT,
    payload,
    progress,
    missing,
    isEnabled,
  });

  const hasClearedLegacyCopyRef = useRef(false);
  const isSaved = autosave.status.kind === "saved";
  useEffect(() => {
    if (source !== "legacy" || !isSaved || hasClearedLegacyCopyRef.current) {
      return;
    }
    hasClearedLegacyCopyRef.current = true;
    clearCommunityDraft(ownerSlug);
  }, [source, isSaved, ownerSlug]);

  const engineLoadNewer = autosave.loadNewer;
  // A newer payload the wizard cannot read resolves null with the conflict
  // still open, so the founder's typed words stay and the choice stays theirs.
  const loadNewer = useCallback(
    async () =>
      storedCommunityDraftFrom(
        await engineLoadNewer({ isReadable: isStoredCommunityPayload }),
      ),
    [engineLoadNewer],
  );

  return {
    status: autosave.status,
    conflict: autosave.conflict,
    isConflictBusy: autosave.isConflictBusy,
    loadNewer,
    keepThisVersion: autosave.keepThisVersion,
    discard: autosave.discard,
    forget: autosave.forget,
  };
}
