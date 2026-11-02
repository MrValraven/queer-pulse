import { useCallback, useEffect, useRef, useState } from "react";
import { ADD_MONTH_DRAFT_SAVE_DELAY_MS } from "./addMonth.data";
import {
  addMonthDraftKey,
  isAddMonthDraftWorthKeeping,
  readAddMonthDraft,
  removeAddMonthDraft,
  writeAddMonthDraft,
  type StoredAddMonthDraft,
} from "./addMonthDraftStorage";
import type { AddMonthState } from "./addMonthState";

const MILLISECONDS_PER_MINUTE = 60_000;

/** What the resume strip says about the stored month. */
export interface AddMonthDraftOffer {
  dateCount: number;
  ageMinutes: number;
}

export interface AddMonthDraftOptions {
  memberId: string | null | undefined;
  state: AddMonthState;
  /** Called with the stored month when the host resumes it. */
  onRestore: (state: AddMonthState) => void;
}

/** What one storage slot held when it was read, and whether the host has
 *  answered the offer it makes. */
interface SlotReading {
  loadedKey: string;
  stored: StoredAddMonthDraft | null;
  ageMinutes: number;
  isAnswered: boolean;
}

function readSlot(storageKey: string): SlotReading {
  const stored = readAddMonthDraft(storageKey);
  const isWorthOffering =
    stored !== null && isAddMonthDraftWorthKeeping(stored.state);
  return {
    loadedKey: storageKey,
    stored: isWorthOffering ? stored : null,
    ageMinutes: isWorthOffering
      ? Math.max(
          0,
          Math.floor((Date.now() - stored.savedAt) / MILLISECONDS_PER_MINUTE),
        )
      : 0,
    isAnswered: false,
  };
}

/**
 * The page's local draft: offers the month stored for this member, then keeps
 * the current month saved after the page goes quiet.
 *
 * The slot is read once per storage key (the member id can resolve after the
 * first render, so a new key reads again during render). Saving waits while a
 * stored month is waiting for an answer, so the page's empty first state never
 * overwrites it. A state with no template and no dates removes the stored month.
 */
export function useAddMonthDraft({
  memberId,
  state,
  onRestore,
}: AddMonthDraftOptions): {
  offer: AddMonthDraftOffer | null;
  resume: () => void;
  startFresh: () => void;
  forget: () => void;
} {
  const storageKey = addMonthDraftKey(memberId);
  const [slot, setSlot] = useState(() => readSlot(storageKey));
  if (slot.loadedKey !== storageKey) setSlot(readSlot(storageKey));

  const hasOpenOffer = slot.stored !== null && !slot.isAnswered;
  // Publish forgets the stored month while the state it published stays on the
  // page. Saving stays off until the state changes, so the results screen never
  // writes the published month back.
  const forgottenStateRef = useRef<AddMonthState | null>(null);
  // The newest state, so `forget` marks the state on the page when it runs
  // (a late photo preview can land while the publish request is in flight)
  // and stays one stable function.
  const latestStateRef = useRef(state);
  useEffect(() => {
    latestStateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (hasOpenOffer) return;
    const timer = window.setTimeout(() => {
      if (forgottenStateRef.current === state) return;
      if (isAddMonthDraftWorthKeeping(state)) {
        writeAddMonthDraft(storageKey, state, Date.now());
      } else {
        removeAddMonthDraft(storageKey);
      }
    }, ADD_MONTH_DRAFT_SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hasOpenOffer, state, storageKey]);

  const resume = useCallback(() => {
    if (slot.stored === null) return;
    onRestore(slot.stored.state);
    setSlot((current) => ({ ...current, isAnswered: true }));
  }, [onRestore, slot.stored]);

  const startFresh = useCallback(() => {
    removeAddMonthDraft(storageKey);
    setSlot((current) => ({ ...current, isAnswered: true }));
  }, [storageKey]);

  const forget = useCallback(() => {
    forgottenStateRef.current = latestStateRef.current;
    removeAddMonthDraft(storageKey);
  }, [storageKey]);

  return {
    offer:
      hasOpenOffer && slot.stored
        ? {
            dateCount: slot.stored.state.rows.length,
            ageMinutes: slot.ageMinutes,
          }
        : null,
    resume,
    startFresh,
    forget,
  };
}
