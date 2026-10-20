import {
  hashKey,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { creatorDraftQueryKey } from "./creatorDraftQueryKeys";
import {
  acquireAutosaveMachine,
  type AutosaveMachinePorts,
  type CreatorDraftAutosaveMachine,
  type CreatorDraftSaveStatus,
  type LoadNewerOptions,
} from "./creatorDraftAutosave.machine";
import { deleteCreatorDraft, saveCreatorDraft } from "./creatorDrafts.api";
import type {
  CreatorDraftConflict,
  CreatorDraftProgress,
  CreatorDraftResponse,
  CreatorDraftSlot,
} from "./creatorDrafts.types";
import {
  creatorDraftQueryOptions,
  isCreatorDraftKindOff,
  useCreatorDraft,
} from "./useCreatorDraft";

export type {
  CreatorDraftSaveStatus,
  LoadNewerOptions,
} from "./creatorDraftAutosave.machine";
export { CreatorDraftDiscardError } from "./creatorDraftAutosave.machine";

/** What an editor feeds the shared autosave engine. */
export interface CreatorDraftAutosaveOptions {
  slot: CreatorDraftSlot;
  /** What to save now; null means nothing worth keeping (a clean editor). */
  payload: Record<string, unknown> | null;
  progress: CreatorDraftProgress | null;
  missing: string[] | null;
  /** False while a stored draft waits for an answer, while publishing, and after. */
  isEnabled: boolean;
}

/** The engine's state and the creator's choices. */
export interface CreatorDraftAutosave {
  status: CreatorDraftSaveStatus;
  conflict: CreatorDraftConflict | null;
  /** True while Load the newer draft or Keep this version is in flight. */
  isConflictBusy: boolean;
  /** The loaded server draft (the resume source). */
  serverDraft: CreatorDraftResponse | null;
  isServerDraftLoading: boolean;
  /**
   * Load the newer draft. With `isReadable`, a payload the editor cannot
   * restore counts as a failed read: the 409 pause and the conflict stay as
   * they were, and the promise resolves null.
   */
  loadNewer: (
    options?: LoadNewerOptions,
  ) => Promise<CreatorDraftResponse | null>;
  keepThisVersion: () => void;
  /**
   * DELETE the slot (Start fresh, Discard). Rejects with
   * `CreatorDraftDiscardError` when the delete fails: the status goes back to
   * idle and the server copy stays, so the caller catches it and tells the creator.
   */
  discard: () => Promise<void>;
  /** Drop the client copy after a publish; in demo also deletes the demo slot. */
  forget: () => void;
}

const loadDemoStore = () => import("./creatorDrafts.demoStore");

/** Wires one slot's engine to the wire (or the demo store) and the query cache. */
function buildAutosavePorts(
  queryClient: QueryClient,
  slot: CreatorDraftSlot,
  demoMode: boolean,
  isRetired: () => boolean,
): AutosaveMachinePorts {
  const queryOptions = creatorDraftQueryOptions(slot, demoMode);
  const { queryKey } = queryOptions;
  const queryHash = hashKey(queryKey);
  return {
    save: async (body) => {
      if (!demoMode) return saveCreatorDraft(slot, body);
      const store = await loadDemoStore();
      // Sign-out may have emptied the store while the module loaded.
      if (isRetired()) throw new Error("creator_draft_slot_retired");
      return store.demoSaveCreatorDraft(slot, body);
    },
    remove: async () => {
      if (!demoMode) return deleteCreatorDraft(slot);
      const store = await loadDemoStore();
      if (!isRetired()) await store.demoDeleteCreatorDraft(slot);
    },
    readFresh: () => queryClient.fetchQuery({ ...queryOptions, staleTime: 0 }),
    readSettled: () => {
      const state = queryClient.getQueryState(queryKey);
      if (state === undefined || state.status === "pending") return undefined;
      return {
        draft: state.data ?? null,
        isUnavailable:
          !demoMode && isCreatorDraftKindOff(queryClient, slot.kind),
      };
    },
    writeCache: (draft) => {
      queryClient.setQueryData(queryKey, draft);
    },
    removeAfterPublish: () => {
      if (!demoMode) return;
      void loadDemoStore().then((store) =>
        isRetired() ? undefined : store.demoDeleteCreatorDraft(slot),
      );
    },
    // removeQueries and clear notify "removed" synchronously, so sign-out
    // retires the engine before the editor's unmount flush can run.
    subscribeRemoved: (onRemoved) =>
      queryClient.getQueryCache().subscribe((event) => {
        if (event.type === "removed" && event.query.queryHash === queryHash)
          onRemoved();
      }),
  };
}

interface HeldMachine {
  queryClient: QueryClient;
  machineKey: string;
  machine: CreatorDraftAutosaveMachine;
}

function acquireSlotMachine(
  queryClient: QueryClient,
  slot: CreatorDraftSlot,
  demoMode: boolean,
): HeldMachine {
  const machineKey = hashKey(creatorDraftQueryKey(slot, demoMode));
  const machine = acquireAutosaveMachine(queryClient, machineKey, (isRetired) =>
    buildAutosavePorts(queryClient, slot, demoMode, isRetired),
  );
  return { queryClient, machineKey, machine };
}

/**
 * Holds the slot's engine from the registry across renders and remounts. A new
 * slot takes its own engine and the old one flushes once; a demo switch
 * retires the old mode's engine without sending.
 */
function useSlotMachine(
  queryClient: QueryClient,
  slot: CreatorDraftSlot,
  demoMode: boolean,
): CreatorDraftAutosaveMachine {
  const { kind, listingRef } = slot;
  const machineKey = hashKey(
    creatorDraftQueryKey({ kind, listingRef }, demoMode),
  );
  const [holder] = useState(() => ({}));
  const [held, setHeld] = useState(() =>
    acquireSlotMachine(queryClient, { kind, listingRef }, demoMode),
  );
  let current = held;
  if (held.queryClient !== queryClient || held.machineKey !== machineKey) {
    current = acquireSlotMachine(queryClient, { kind, listingRef }, demoMode);
    setHeld(current);
  }
  const { machine } = current;
  const lastAttachedRef = useRef<{
    machine: CreatorDraftAutosaveMachine;
    demoMode: boolean;
  } | null>(null);

  useEffect(() => {
    const previous = lastAttachedRef.current;
    if (
      previous !== null &&
      previous.machine !== machine &&
      previous.demoMode !== demoMode
    ) {
      // Runs after the old engine's detach and before its deferred flush.
      previous.machine.retire();
    }
    lastAttachedRef.current = { machine, demoMode };
    machine.attach(holder);
    return () => machine.detach();
  }, [machine, demoMode, holder]);

  return machine;
}

/**
 * The one debounced autosave every creator draft editor shares. It waits for
 * the slot's first read, saves on the revision the server last confirmed,
 * pauses on a 409 until the creator chooses, and stops on a 413 until the
 * payload changes. Sign-out retires it on the spot. Draft content never
 * reaches browser storage, a log or a toast.
 *
 * `discard()` rejects when the delete fails; callers must catch it and show
 * the creator that the draft is still saved.
 */
export function useCreatorDraftAutosave(
  options: CreatorDraftAutosaveOptions,
): CreatorDraftAutosave {
  const { slot, payload, progress, missing, isEnabled } = options;
  const { kind, listingRef } = slot;
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  // First, so the engine is attached before it receives anything.
  const machine = useSlotMachine(queryClient, { kind, listingRef }, demoMode);
  const read = useCreatorDraft({ kind, listingRef });
  const view = useSyncExternalStore(
    machine.subscribe,
    machine.getView,
    machine.getView,
  );
  const serializedPayload = useMemo(
    () => (payload === null ? null : JSON.stringify(payload)),
    [payload],
  );

  useEffect(() => {
    machine.receive({
      payload,
      serializedPayload,
      progress,
      missing,
      isEnabled,
    });
  });

  useEffect(() => {
    if (!read.isLoading) machine.noteReadSettled();
  }, [machine, read.isLoading]);

  useEffect(() => {
    const sendPendingNow = () => machine.flushPendingNow();
    window.addEventListener("pagehide", sendPendingNow);
    return () => window.removeEventListener("pagehide", sendPendingNow);
  }, [machine]);

  return useMemo(
    () => ({
      status: view.status,
      conflict: view.conflict,
      isConflictBusy: view.isConflictBusy,
      serverDraft: view.resumeSource ?? null,
      isServerDraftLoading: view.resumeSource === undefined,
      loadNewer: machine.loadNewer,
      keepThisVersion: machine.keepThisVersion,
      discard: machine.discard,
      forget: machine.forget,
    }),
    [view, machine],
  );
}
