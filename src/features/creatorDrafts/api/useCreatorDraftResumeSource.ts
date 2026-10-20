import { hashKey, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useSyncExternalStore } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { findAutosaveMachine } from "./creatorDraftAutosave.machine";
import { creatorDraftQueryKey } from "./creatorDraftQueryKeys";
import type {
  CreatorDraftResponse,
  CreatorDraftSlot,
} from "./creatorDrafts.types";
import { useCreatorDraft } from "./useCreatorDraft";

/** One slot's resume source as an editor about to open reads it. */
export interface CreatorDraftResumeSource {
  /** The draft to open on; null for an empty slot, and while unsettled. */
  draft: CreatorDraftResponse | null;
  /** False until the slot settles; once true it stays true for this slot. */
  isSettled: boolean;
}

const NO_ENGINE = Symbol("no engine");
const UNSETTLED: CreatorDraftResumeSource = { draft: null, isSettled: false };
const subscribeToNothing = () => () => undefined;

/**
 * The draft an editor should open on, read without holding the slot's
 * autosave engine. Use it in the page that decides what the editor starts
 * from, and show a skeleton until `isSettled`.
 *
 * - When the slot's engine is still in the registry (an editor that just
 *   closed may have a save on the wire), it waits for that engine: unsettled
 *   while a request is out, while the closed editor's unmount flush is due,
 *   or while a carried body waits, then the slot as the cache holds it.
 * - With no engine, it falls back to the slot's query and settles when the
 *   first read does (an error settles as an empty slot).
 * - It never attaches, so it saves nothing and starts no editor session.
 * - Once settled it keeps that draft for this slot and mode. The editor it
 *   opens then saves through the engine, and those saves stay out of what
 *   this hook answers, so the editor is never swapped for a skeleton.
 */
export function useCreatorDraftResumeSource(
  slot: CreatorDraftSlot,
): CreatorDraftResumeSource {
  const { kind, listingRef } = slot;
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const machineKey = hashKey(
    creatorDraftQueryKey({ kind, listingRef }, demoMode),
  );
  const read = useCreatorDraft({ kind, listingRef });
  const [settled, setSettled] = useState<{
    machineKey: string;
    source: CreatorDraftResumeSource;
  } | null>(null);
  const machine = findAutosaveMachine(queryClient, machineKey);
  const getSnapshot = useCallback(() => {
    const current = findAutosaveMachine(queryClient, machineKey);
    return current === undefined ? NO_ENGINE : current.peekResumeSource();
  }, [queryClient, machineKey]);
  const isLatched = settled !== null && settled.machineKey === machineKey;
  // Once latched the engine's saves never reach the answer, so stop listening.
  const engineSource = useSyncExternalStore(
    isLatched ? subscribeToNothing : (machine?.subscribe ?? subscribeToNothing),
    getSnapshot,
    getSnapshot,
  );

  if (settled !== null && isLatched) {
    return settled.source;
  }
  const isQuerySettled = engineSource === NO_ENGINE && !read.isLoading;
  const isEngineSettled =
    engineSource !== NO_ENGINE && engineSource !== undefined;
  if (!isQuerySettled && !isEngineSettled) return UNSETTLED;
  const source: CreatorDraftResumeSource = {
    draft: engineSource === NO_ENGINE ? read.draft : (engineSource ?? null),
    isSettled: true,
  };
  setSettled({ machineKey, source });
  return source;
}
