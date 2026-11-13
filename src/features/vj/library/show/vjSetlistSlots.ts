import { useMemo, useRef, useState } from "react";
import {
  vjResolvedStepDuration,
  vjStepDurationMs,
  type VjSetlistDTO,
  type VjSetlistItemDTO,
  type VjSetlistItemInput,
  type VjSetlistItemKind,
  type VjStepDuration,
  type VjTempo,
} from "../../../../shared/contracts/vj";
import type { TFunction } from "../../../../shared/i18n/types";
import {
  useVjSetlistMutations,
  type UpdateVjSetlistVariables,
} from "../../api/useVjSetlistMutations";
import { createVjUuid } from "../../live/vjUuid";

/**
 * One step of a sequence as an editor holds it: what it plays, its own length
 * and a key that outlives saves. The library editor and the remote steps
 * panel both build on this one shape (sequences contract 12, call 29).
 */
export interface VjSetlistSlot {
  /** The item id for a loaded step, `new:<uuid>` for one not saved yet. */
  key: string;
  /** The stored item this step keeps on the next save; null for a new step. */
  itemId: string | null;
  kind: VjSetlistItemKind;
  /** Set on a scene step; null on a clip step. */
  sceneId: string | null;
  /** Set on a clip step; null on a scene step. */
  clipId: string | null;
  /** Null plays the sequence's default length. */
  duration: VjStepDuration | null;
}

/** The key prefix of a step that has no stored item yet. */
export const VJ_NEW_SLOT_KEY_PREFIX = "new:";

/** Whether a slot key names a step that has no stored item yet. */
export function isVjNewSlotKey(slotKey: string): boolean {
  return slotKey.startsWith(VJ_NEW_SLOT_KEY_PREFIX);
}

/**
 * One slot per item in order. A loaded step is keyed by its item id, so a
 * save keeps its row in place (the server keeps ids it is sent, design 13.2).
 * `keyByItemId` carries the keys of steps that were new when they were sent:
 * the item the server made for one keeps the row key it had before the save.
 */
export function vjSetlistSlotsOf(
  items: readonly VjSetlistItemDTO[],
  keyByItemId?: ReadonlyMap<string, string>,
): VjSetlistSlot[] {
  return items.map((item) => ({
    key: keyByItemId?.get(item.id) ?? item.id,
    itemId: item.id,
    kind: item.kind,
    sceneId: item.kind === "scene" ? item.sceneId : null,
    clipId: item.kind === "clip" ? item.clipId : null,
    duration: item.duration,
  }));
}

/** A new scene step on the sequence's default length. */
export function newVjSceneSlot(sceneId: string): VjSetlistSlot {
  return {
    key: `${VJ_NEW_SLOT_KEY_PREFIX}${createVjUuid()}`,
    itemId: null,
    kind: "scene",
    sceneId,
    clipId: null,
    duration: null,
  };
}

/** A new clip step on the sequence's default length. */
export function newVjClipSlot(clipId: string): VjSetlistSlot {
  return {
    key: `${VJ_NEW_SLOT_KEY_PREFIX}${createVjUuid()}`,
    itemId: null,
    kind: "clip",
    sceneId: null,
    clipId,
    duration: null,
  };
}

/**
 * The body of a whole-list save (`PUT setlists/:id/items`). A loaded step
 * sends its item id so the server keeps it; a new step leaves `id` out
 * entirely, since the server refuses `id: null`.
 */
export function vjSetlistItemsBodyOf(
  slots: readonly VjSetlistSlot[],
): VjSetlistItemInput[] {
  return slots.flatMap((slot): VjSetlistItemInput[] => {
    const idPart = slot.itemId === null ? {} : { id: slot.itemId };
    if (slot.kind === "scene" && slot.sceneId !== null) {
      return [
        {
          ...idPart,
          kind: "scene",
          sceneId: slot.sceneId,
          duration: slot.duration,
        },
      ];
    }
    if (slot.kind === "clip" && slot.clipId !== null) {
      return [
        {
          ...idPart,
          kind: "clip",
          clipId: slot.clipId,
          duration: slot.duration,
        },
      ];
    }
    return [];
  });
}

/** The slots with every new step the server already stored given its item
 *  id, so a save built after that answer keeps the item. */
export function vjRebasedSlots(
  slots: readonly VjSetlistSlot[],
  itemIdByNewKey: ReadonlyMap<string, string>,
): VjSetlistSlot[] {
  return slots.map((slot) => {
    if (slot.itemId !== null) return slot;
    const storedItemId = itemIdByNewKey.get(slot.key);
    return storedItemId === undefined
      ? slot
      : { ...slot, itemId: storedItemId };
  });
}

/** What one step plays and for how long, as one comparable string. */
function contentKeyOfStep(step: {
  kind: VjSetlistItemKind;
  sceneId: string | null;
  clipId: string | null;
  duration: VjStepDuration | null;
}): string {
  const targetId = step.kind === "scene" ? step.sceneId : step.clipId;
  const lengthPart =
    step.duration === null
      ? "default"
      : `${step.duration.kind}:${step.duration.value}`;
  return `${step.kind}:${targetId ?? ""}:${lengthPart}`;
}

/** One string per step list, ids left out: two lists that play the same
 *  steps for the same lengths in the same order compare with `===`. */
export function vjSetlistContentKeyOf(
  steps: readonly {
    kind: VjSetlistItemKind;
    sceneId: string | null;
    clipId: string | null;
    duration: VjStepDuration | null;
  }[],
): string {
  return steps.map(contentKeyOfStep).join("|");
}

/** One string per stored list, ids included, so any change to the server
 *  list (a new id, a reorder, a length) compares unequal. */
export function vjSetlistServerKeyOf(
  items: readonly VjSetlistItemDTO[],
): string {
  return items.map((item) => `${item.id}=${contentKeyOfStep(item)}`).join("|");
}

/** Whether a shown new step plays the same scene or clip as a stored item. */
function isSameTarget(slot: VjSetlistSlot, item: VjSetlistItemDTO): boolean {
  return (
    slot.kind === item.kind &&
    (item.kind === "scene"
      ? slot.sceneId === item.sceneId
      : slot.clipId === item.clipId)
  );
}

function isSameLength(slot: VjSetlistSlot, item: VjSetlistItemDTO): boolean {
  if (slot.duration === null || item.duration === null) {
    return slot.duration === item.duration;
  }
  return (
    slot.duration.kind === item.duration.kind &&
    slot.duration.value === item.duration.value
  );
}

/**
 * The row keys the server's items take over from the slots shown before
 * them. A key already carried stays, and a shown step whose key differs
 * from its item id hands that key on. A stored item the shown slots knew
 * only as a new step takes that step's key: by position when both lists play
 * the same steps (the answer to the last save), else the first new step
 * still unclaimed that plays the same scene or clip for the same length,
 * then the first that plays the same scene or clip. Items with no match
 * keep their id as key.
 */
export function vjAdoptedSlotKeys(
  items: readonly VjSetlistItemDTO[],
  shownSlots: readonly VjSetlistSlot[],
  keyByItemId: ReadonlyMap<string, string>,
): Map<string, string> {
  const storedItemIds = new Set(items.map((item) => item.id));
  const adoptedKeys = new Map<string, string>();
  for (const item of items) {
    const knownKey = keyByItemId.get(item.id);
    if (knownKey !== undefined) adoptedKeys.set(item.id, knownKey);
  }
  for (const slot of shownSlots) {
    if (
      slot.itemId !== null &&
      slot.key !== slot.itemId &&
      storedItemIds.has(slot.itemId)
    ) {
      adoptedKeys.set(slot.itemId, slot.key);
    }
  }
  const isSameList =
    vjSetlistContentKeyOf(items) === vjSetlistContentKeyOf(shownSlots);
  if (isSameList) {
    items.forEach((item, itemIndex) => {
      const shownSlot = shownSlots[itemIndex];
      if (shownSlot !== undefined && shownSlot.itemId === null) {
        adoptedKeys.set(item.id, shownSlot.key);
      }
    });
    return adoptedKeys;
  }
  const shownItemIds = new Set(
    shownSlots.flatMap((slot) => (slot.itemId === null ? [] : [slot.itemId])),
  );
  const claimedKeys = new Set(adoptedKeys.values());
  const unclaimedNewSlots = shownSlots.filter(
    (slot) => slot.itemId === null && !claimedKeys.has(slot.key),
  );
  const unmatchedItems = items.filter(
    (item) => !shownItemIds.has(item.id) && !adoptedKeys.has(item.id),
  );
  const claimFirst = (
    isMatch: (slot: VjSetlistSlot, item: VjSetlistItemDTO) => boolean,
  ) => {
    for (const item of unmatchedItems) {
      if (adoptedKeys.has(item.id)) continue;
      const matchIndex = unclaimedNewSlots.findIndex((slot) =>
        isMatch(slot, item),
      );
      if (matchIndex < 0) continue;
      const [matchedSlot] = unclaimedNewSlots.splice(matchIndex, 1);
      if (matchedSlot !== undefined) adoptedKeys.set(item.id, matchedSlot.key);
    }
  };
  claimFirst(
    (slot, item) => isSameTarget(slot, item) && isSameLength(slot, item),
  );
  claimFirst(isSameTarget);
  return adoptedKeys;
}

/** How long a whole sequence runs, when it can be told. */
export type VjSetlistRunTime =
  /** Every step is in seconds: the exact total. */
  | { kind: "exact"; totalSeconds: number }
  /** Some step counts beats: the total at the given tempo. */
  | { kind: "about"; totalMs: number; bpm: number };

/**
 * The run time of one pass through the steps. Every step in seconds gives
 * the exact total; a step in beats needs the live tempo, so with no tempo
 * known the answer is null. An empty sequence has no run time either.
 */
export function vjSetlistRunTimeOf(
  slots: readonly Pick<VjSetlistSlot, "duration">[],
  sequenceDefault: VjStepDuration,
  tempo: VjTempo | null,
): VjSetlistRunTime | null {
  if (slots.length === 0) return null;
  const durations = slots.map((slot) =>
    vjResolvedStepDuration(slot.duration, sequenceDefault),
  );
  const hasBeats = durations.some((duration) => duration.kind === "beats");
  if (!hasBeats) {
    return {
      kind: "exact",
      totalSeconds: durations.reduce(
        (totalSeconds, duration) => totalSeconds + duration.value,
        0,
      ),
    };
  }
  if (tempo === null) return null;
  return {
    kind: "about",
    totalMs: durations.reduce(
      (totalMs, duration) => totalMs + vjStepDurationMs(duration, tempo),
      0,
    ),
    bpm: tempo.bpm,
  };
}

/** A step length in words: "12 s" or "16 beats". */
export function vjStepDurationTextOf(
  duration: VjStepDuration,
  t: TFunction,
): string {
  return duration.kind === "seconds"
    ? t("vj:duration.secondsValue", { count: duration.value })
    : t("vj:duration.beatsValue", { count: duration.value });
}

/** The run time line: "Runs 40 s" under a minute, "Runs 1 min 4 s", or
 *  "About 3 min at 124 BPM". */
export function vjSetlistRunTimeTextOf(
  runTime: VjSetlistRunTime,
  t: TFunction,
): string {
  if (runTime.kind === "exact" && runTime.totalSeconds < 60) {
    return t("vj:setlistItems.runTimeSeconds", {
      seconds: runTime.totalSeconds,
    });
  }
  if (runTime.kind === "exact") {
    return t("vj:librarySetlists.runTime", {
      minutes: Math.floor(runTime.totalSeconds / 60),
      seconds: runTime.totalSeconds % 60,
    });
  }
  return t("vj:librarySetlists.runTimeAbout", {
    minutes: Math.max(1, Math.round(runTime.totalMs / 60_000)),
    bpm: Math.round(runTime.bpm),
  });
}

// Senders: the writes of one sequence, kept by its row so the row, the
// settings and the steps all read the values on their way.

/** The steps shown ahead of the server while saves run or until it answers. */
interface VjPendingSlots {
  slots: VjSetlistSlot[];
  /** The server list seen once nothing was on its way; null while a save
   *  runs. A later server list replaces the steps shown. */
  settledServerKey: string | null;
}

/** One step list asked for, with the promise its caller awaits. */
interface VjQueuedSend {
  sendNumber: number;
  slots: VjSetlistSlot[];
  resolve: (isNewest: boolean) => void;
  reject: (cause: unknown) => void;
}

export interface VjSetlistItemsSender {
  /** The steps shown: the newest list asked for while saves run, else the
   *  server's list. */
  visibleSlots: VjSetlistSlot[];
  /** The list the next change builds on: the newest one asked for. */
  baseSlots: () => VjSetlistSlot[];
  /** Saves this whole list. Resolves true once it lands as the newest list,
   *  false when a newer list replaced it; rejects with the refusal of the
   *  newest list, which also goes back to the server list. */
  send: (slots: VjSetlistSlot[]) => Promise<boolean>;
  /** A save runs or waits its turn. */
  isPending: boolean;
}

/**
 * The step saves of one sequence. Each save sends the whole step list with
 * the item id of every stored step, so the server keeps those items (design
 * 13.2) and makes new ones for new steps only. One save runs at a time: a
 * change made while one runs waits, and only the newest waiting list goes
 * out once it answers, carrying the ids the answer gave the new steps, so an
 * edit made while an add saves keeps the added item. The list shown is the
 * newest one asked for until the server holds it (or changes it from
 * elsewhere) with nothing on its way, so the rows answer each click at once;
 * a new step's row keeps its `new:` key on the item the server made for it.
 */
export function useVjSetlistItemsSender(
  setlist: VjSetlistDTO,
): VjSetlistItemsSender {
  const { setSetlistItems } = useVjSetlistMutations();
  const [keyByItemId, setKeyByItemId] = useState<ReadonlyMap<string, string>>(
    () => new Map(),
  );
  const serverSlots = useMemo(
    () => vjSetlistSlotsOf(setlist.items, keyByItemId),
    [setlist.items, keyByItemId],
  );
  const serverKey = vjSetlistServerKeyOf(setlist.items);
  const [pending, setPending] = useState<VjPendingSlots | null>(null);
  const [isSending, setIsSending] = useState(false);
  const wantedSlotsRef = useRef<VjSetlistSlot[] | null>(null);
  const isInFlightRef = useRef(false);
  const queuedSendRef = useRef<VjQueuedSend | null>(null);
  const latestSendRef = useRef(0);
  const itemIdByNewKeyRef = useRef(new Map<string, string>());

  // With nothing on its way, the server list is the truth again once it
  // holds what was sent, or once it changes after the saves settled.
  if (pending !== null && !isSending) {
    const isAnswered =
      vjSetlistContentKeyOf(setlist.items) ===
      vjSetlistContentKeyOf(pending.slots);
    const hasChangedSince =
      pending.settledServerKey !== null &&
      pending.settledServerKey !== serverKey;
    if (isAnswered || hasChangedSince) {
      setKeyByItemId(
        vjAdoptedSlotKeys(setlist.items, pending.slots, keyByItemId),
      );
      setPending(null);
    } else if (pending.settledServerKey === null) {
      setPending({ slots: pending.slots, settledServerKey: serverKey });
    }
  }

  const visibleSlots = pending?.slots ?? serverSlots;
  const baseSlots = (): VjSetlistSlot[] => [
    ...(wantedSlotsRef.current ?? visibleSlots),
  ];

  const rememberNewItems = (
    sentSlots: readonly VjSetlistSlot[],
    savedSetlist: VjSetlistDTO,
  ) => {
    // The answer lists the steps in body order, so the item at a new step's
    // index is the one the server made for it.
    const newKeyByItemId = new Map<string, string>();
    sentSlots.forEach((slot, slotIndex) => {
      const savedItem = savedSetlist.items[slotIndex];
      if (slot.itemId !== null || savedItem === undefined) return;
      itemIdByNewKeyRef.current.set(slot.key, savedItem.id);
      newKeyByItemId.set(savedItem.id, slot.key);
    });
    if (newKeyByItemId.size === 0) return;
    setKeyByItemId(
      (currentKeys) => new Map([...currentKeys, ...newKeyByItemId]),
    );
  };

  const dispatch = (queuedSend: VjQueuedSend) => {
    isInFlightRef.current = true;
    const sentSlots = vjRebasedSlots(
      queuedSend.slots,
      itemIdByNewKeyRef.current,
    );
    void setSetlistItems
      .mutateAsync({
        setlistId: setlist.id,
        items: vjSetlistItemsBodyOf(sentSlots),
      })
      .then(
        (savedSetlist) => {
          rememberNewItems(sentSlots, savedSetlist);
          queuedSend.resolve(latestSendRef.current === queuedSend.sendNumber);
        },
        (cause: unknown) => {
          if (latestSendRef.current !== queuedSend.sendNumber) {
            queuedSend.resolve(false);
            return;
          }
          wantedSlotsRef.current = null;
          setPending(null);
          queuedSend.reject(cause);
        },
      )
      .finally(() => {
        isInFlightRef.current = false;
        const nextSend = queuedSendRef.current;
        queuedSendRef.current = null;
        if (nextSend !== null) {
          dispatch(nextSend);
          return;
        }
        wantedSlotsRef.current = null;
        setIsSending(false);
      });
  };

  const send = (slots: VjSetlistSlot[]): Promise<boolean> =>
    new Promise<boolean>((resolve, reject) => {
      const sendNumber = latestSendRef.current + 1;
      latestSendRef.current = sendNumber;
      wantedSlotsRef.current = slots;
      setPending({ slots, settledServerKey: null });
      setIsSending(true);
      const queuedSend: VjQueuedSend = { sendNumber, slots, resolve, reject };
      if (isInFlightRef.current) {
        // Only the newest waiting list goes out; the one it replaces is done.
        queuedSendRef.current?.resolve(false);
        queuedSendRef.current = queuedSend;
        return;
      }
      dispatch(queuedSend);
    });

  return { visibleSlots, baseSlots, send, isPending: isSending };
}

/** The settings a sequence's settings panel writes. */
export type VjSetlistSettingsPatch = Pick<
  UpdateVjSetlistVariables,
  "isLooping" | "stepDuration"
>;

export interface VjSetlistSettingsSender {
  /** Loop as sent while saves run, else as saved. */
  shownIsLooping: boolean;
  /** The default step length as sent while saves run, else as saved. */
  shownStepDuration: VjStepDuration;
  save: (patch: VjSetlistSettingsPatch) => void;
  /** The newest save landed. */
  isSaved: boolean;
  /** The refusal of the newest save, once no save runs. */
  error: unknown;
}

/**
 * The settings saves of one sequence (Loop, default step length) through the
 * set list PATCH. The values sent show ahead of the saved ones while saves
 * run, so a tap answers at once; once every save settles the saved values
 * show again, so a refusal rolls the control back.
 */
export function useVjSetlistSettingsSender(
  setlist: VjSetlistDTO,
): VjSetlistSettingsSender {
  const { updateSetlist } = useVjSetlistMutations();
  const [sentPatch, setSentPatch] = useState<VjSetlistSettingsPatch>({});
  const [isSaved, setIsSaved] = useState(false);
  const inFlightCountRef = useRef(0);
  const latestSaveRef = useRef(0);

  const save = (patch: VjSetlistSettingsPatch) => {
    const saveNumber = latestSaveRef.current + 1;
    latestSaveRef.current = saveNumber;
    inFlightCountRef.current += 1;
    setIsSaved(false);
    setSentPatch((currentPatch) => ({ ...currentPatch, ...patch }));
    void updateSetlist
      .mutateAsync({ setlistId: setlist.id, ...patch })
      .then(
        () => {
          if (latestSaveRef.current === saveNumber) setIsSaved(true);
        },
        // The refusal stays on the mutation, where `error` reads it.
        () => undefined,
      )
      .finally(() => {
        inFlightCountRef.current -= 1;
        if (inFlightCountRef.current === 0) setSentPatch({});
      });
  };

  return {
    shownIsLooping: sentPatch.isLooping ?? setlist.isLooping,
    shownStepDuration: sentPatch.stepDuration ?? setlist.stepDuration,
    save,
    isSaved,
    error: updateSetlist.isPending ? null : updateSetlist.error,
  };
}
