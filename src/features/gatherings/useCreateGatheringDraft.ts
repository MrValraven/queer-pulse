import { useEffect, useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { safeStorage } from "../../shared/storage/safeStorage";
import type {
  CreatorDraftConflict,
  CreatorDraftResponse,
  CreatorDraftSlot,
} from "../creatorDrafts/api/creatorDrafts.types";
import {
  useCreatorDraftAutosave,
  type CreatorDraftSaveStatus,
} from "../creatorDrafts/api/useCreatorDraftAutosave";
import { DRAFT_CLOCK_TICK_MS } from "./createGathering.data";
import {
  eventDraftProgress,
  isEventDraftMadeFor,
} from "./createGatheringDraftProgress";
import { removeStoredDraft } from "./createGatheringDraftStorage";
import { findFormat, OTHER_FORMAT_KEY } from "./gatheringCatalog";
import type { GatheringDraftSnapshot, GatheringForm } from "./useGatheringForm";

export {
  clearStoredGatheringDrafts,
  createGatheringDraftKey,
  removeStoredDraft,
} from "./createGatheringDraftStorage";

/**
 * The create wizard's draft: saved to the member's account through the shared
 * creator draft autosave as the host types, offered back on the next visit.
 *
 * A copy an older release kept in this browser is offered once when the
 * account slot is empty, uploaded on resume and then deleted here. Reading it
 * goes through `safeStorage` (each call is its own try/catch) and the parse
 * sits in a try/catch, so blocked site data or a corrupt entry degrades to
 * "no draft". Nothing is written to browser storage any more.
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

interface StoredDraft {
  version: 1;
  /** Epoch milliseconds. */
  savedAt: number;
  snapshot: GatheringDraftSnapshot;
}

export type DraftSaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; minutesAgo: number }
  | { kind: "retrying" }
  | { kind: "tooLarge" }
  | { kind: "notSaved" }
  | { kind: "conflict" };

export interface DraftResumeOffer {
  /** The draft's title, else its format, else "Untitled draft". */
  label: string;
  ageMinutes: number;
}

function isStoredDraft(value: unknown): value is StoredDraft {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<StoredDraft>;
  return (
    typeof candidate.savedAt === "number" &&
    typeof candidate.snapshot === "object" &&
    candidate.snapshot !== null &&
    typeof candidate.snapshot.title === "string"
  );
}

function readStoredDraft(storageKey: string): StoredDraft | null {
  const raw = safeStorage.get(storageKey);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isStoredDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** "just now", "12 min", "3 h", "2 days": how old a save is. */
export function draftAgeText(minutes: number, t: TFunction): string {
  if (minutes < 1) return t("gatherings:create.v2.draft.age.justNow");
  if (minutes < MINUTES_PER_HOUR) {
    return t("gatherings:create.v2.draft.age.minutes", { count: minutes });
  }
  if (minutes < MINUTES_PER_DAY) {
    return t("gatherings:create.v2.draft.age.hours", {
      count: Math.floor(minutes / MINUTES_PER_HOUR),
    });
  }
  return t("gatherings:create.v2.draft.age.days", {
    count: Math.floor(minutes / MINUTES_PER_DAY),
  });
}

function draftLabel(snapshot: GatheringDraftSnapshot, t: TFunction): string {
  const title = snapshot.title.trim();
  if (title) return title;
  if (snapshot.format === OTHER_FORMAT_KEY && snapshot.otherText?.trim()) {
    return snapshot.otherText.trim();
  }
  const formatEntry = findFormat(snapshot.format);
  return formatEntry
    ? t(formatEntry.nameKey)
    : t("gatherings:create.v2.draft.untitled");
}

/** The event wizard's one account slot. */
const EVENT_DRAFT_SLOT: CreatorDraftSlot = { kind: "event", listingRef: null };

/** Whole minutes from `fromMs` to `nowMs`; zero for a future or unknown time. */
function minutesSince(fromMs: number, nowMs: number): number {
  if (Number.isNaN(fromMs)) return 0;
  return Math.max(0, Math.floor((nowMs - fromMs) / MILLISECONDS_PER_MINUTE));
}

/** A stored payload read as the wizard's snapshot, or null when it is not one. */
function snapshotFromPayload(
  payload: Record<string, unknown>,
): GatheringDraftSnapshot | null {
  return typeof payload.title === "string"
    ? (payload as unknown as GatheringDraftSnapshot)
    : null;
}

/** A draft waiting for the host's answer: the account copy or an old local one. */
interface EventDraftOfferSource {
  snapshot: GatheringDraftSnapshot;
  /** Epoch milliseconds; NaN when the time cannot be read. */
  savedAtMs: number;
  isLegacy: boolean;
}

function serverOfferSource(
  serverDraft: CreatorDraftResponse | null | undefined,
): EventDraftOfferSource | null {
  if (!serverDraft) return null;
  const snapshot = snapshotFromPayload(serverDraft.payload);
  if (snapshot === null) return null;
  return {
    snapshot,
    savedAtMs: Date.parse(serverDraft.savedAt),
    isLegacy: false,
  };
}

function legacyOfferSource(
  storedDraft: StoredDraft | null,
): EventDraftOfferSource | null {
  if (storedDraft === null) return null;
  return {
    snapshot: storedDraft.snapshot,
    savedAtMs: storedDraft.savedAt,
    isLegacy: true,
  };
}

/**
 * Which draft the resume strip offers, and whether saving has to wait for an
 * answer. The account copy comes first; an old local copy is offered only
 * while the account slot is empty.
 */
function useEventDraftOffer({
  serverDraft,
  legacyStorageKey,
  shouldOfferResume,
  communitySlugParam,
}: {
  serverDraft: CreatorDraftResponse | null | undefined;
  legacyStorageKey: string;
  shouldOfferResume: boolean;
  communitySlugParam: string;
}) {
  const [loadedKey, setLoadedKey] = useState(legacyStorageKey);
  const [legacyDraft, setLegacyDraft] = useState(() =>
    readStoredDraft(legacyStorageKey),
  );
  const [isOfferAnswered, setIsOfferAnswered] = useState(false);
  // The member id can resolve after the first render. Re-read the old local
  // slot for the new key during render, React's pattern for state that
  // follows a prop, and ask again about whatever that slot holds.
  if (loadedKey !== legacyStorageKey) {
    setLoadedKey(legacyStorageKey);
    setLegacyDraft(readStoredDraft(legacyStorageKey));
    setIsOfferAnswered(false);
  }

  const source =
    serverOfferSource(serverDraft) ?? legacyOfferSource(legacyDraft);
  // Any draft still unanswered holds saving: while the strip is open, and
  // also on a visit that does not offer it at all (a `?duplicate=` visit, or
  // a `?community=` link for another community). Saving then would replace
  // a draft the host has not chosen to give up.
  const hasUnansweredOffer = source !== null && !isOfferAnswered;
  // The strip waits for the account read, so an old local copy never shows
  // first and then swaps for the account copy.
  const isOfferOpen =
    hasUnansweredOffer &&
    serverDraft !== undefined &&
    shouldOfferResume &&
    (!communitySlugParam ||
      source.snapshot.communitySlug === communitySlugParam);

  return {
    source,
    hasUnansweredOffer,
    isOfferOpen,
    markAnswered: () => setIsOfferAnswered(true),
    /** Delete the old local copy from this browser. */
    dropLegacy: () => {
      removeStoredDraft(legacyStorageKey);
      setLegacyDraft(null);
    },
  };
}

/** The clock "Saved 3 min ago" reads, ticking while a save is shown. */
function useDraftClock(isTicking: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isTicking) return;
    const interval = window.setInterval(
      () => setNow(Date.now()),
      DRAFT_CLOCK_TICK_MS,
    );
    return () => window.clearInterval(interval);
  }, [isTicking]);
  return now;
}

function eventSaveStatus(
  status: CreatorDraftSaveStatus,
  now: number,
): DraftSaveStatus {
  if (status.kind !== "saved") return status;
  return {
    kind: "saved",
    minutesAgo: minutesSince(Date.parse(status.savedAt), now),
  };
}

export interface CreateGatheringDraftOptions {
  form: GatheringForm;
  /** From `createGatheringDraftKey(memberId)`: the old local copy, offered once. */
  legacyStorageKey: string;
  /** False on a `?duplicate=` visit: the seed lands asynchronously and would
   *  overwrite whatever a resume restored. */
  shouldOfferResume: boolean;
  /** The `?community=` param. A draft posted to a different community is not
   *  offered, since resuming it would silently replace that pick. */
  communitySlugParam: string;
  /** False while publishing and after it, so the draft slot stays clear once
   *  the event is published. */
  isSavingEnabled: boolean;
}

export function useCreateGatheringDraft({
  form,
  legacyStorageKey,
  shouldOfferResume,
  communitySlugParam,
  isSavingEnabled,
}: CreateGatheringDraftOptions): {
  saveStatus: DraftSaveStatus;
  resumeOffer: DraftResumeOffer | null;
  resume: () => void;
  startFresh: () => void;
  conflict: CreatorDraftConflict | null;
  isConflictBusy: boolean;
  loadNewer: () => void;
  keepThisVersion: () => void;
  /** After a publish: drops the client copy and the old local key. */
  forget: () => void;
  isNoteShown: boolean;
} {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // The engine's settled read, undefined while it loads. Kept as state so
  // saving waits for the offer this read decides.
  const [knownServerDraft, setKnownServerDraft] = useState<
    CreatorDraftResponse | null | undefined
  >(undefined);
  const offer = useEventDraftOffer({
    serverDraft: knownServerDraft,
    legacyStorageKey,
    shouldOfferResume,
    communitySlugParam,
  });
  const { progress, missing } = eventDraftProgress(form);
  const autosave = useCreatorDraftAutosave({
    slot: EVENT_DRAFT_SLOT,
    payload: form.dirty ? { ...form.draftSnapshot } : null,
    progress,
    missing,
    isEnabled:
      isSavingEnabled &&
      knownServerDraft !== undefined &&
      !offer.hasUnansweredOffer,
  });
  const latestServerDraft = autosave.isServerDraftLoading
    ? undefined
    : autosave.serverDraft;
  if (latestServerDraft !== knownServerDraft) {
    setKnownServerDraft(latestServerDraft);
  }
  const now = useDraftClock(autosave.status.kind === "saved");

  // A resumed draft uploads on the next autosave. The old local copy stays
  // until that upload reports its first "saved", so a failed upload keeps it.
  const isLegacyClearPendingRef = useRef(false);
  const isSaved = autosave.status.kind === "saved";
  const { dropLegacy } = offer;
  useEffect(() => {
    if (!isLegacyClearPendingRef.current || !isSaved) return;
    isLegacyClearPendingRef.current = false;
    dropLegacy();
  }, [isSaved, dropLegacy]);

  const resumeOffer: DraftResumeOffer | null =
    offer.isOfferOpen && offer.source
      ? {
          label: draftLabel(offer.source.snapshot, t),
          ageMinutes: minutesSince(offer.source.savedAtMs, now),
        }
      : null;

  /** Put the offered draft back. The pledges start unticked, since the
   *  snapshot holds form fields only. A field an older snapshot lacks keeps
   *  the form's value. The old local copy leaves this browser on the first
   *  save after a resume from a legacy copy, so a failed upload keeps it. A
   *  draft that came from the server leaves no local copy to wait on. */
  const resume = () => {
    const { source } = offer;
    if (!source) return;
    form.restoreDraft({ ...form.draftSnapshot, ...source.snapshot });
    offer.markAnswered();
    if (source.isLegacy === false) offer.dropLegacy();
    else isLegacyClearPendingRef.current = true;
    showToast(t("gatherings:create.v2.toast.draftResumed"), "success");
  };

  /** Throw the offered draft away and keep the form as it is. An account
   *  copy is deleted on the server; when that fails the host hears it, and
   *  the next save replaces the old copy anyway. */
  const startFresh = () => {
    const isServerSource = offer.source?.isLegacy === false;
    offer.markAnswered();
    offer.dropLegacy();
    if (!isServerSource) return;
    autosave.discard().catch(() => {
      showToast(t("gatherings:create.v2.toast.draftDiscardFailed"), "error");
    });
  };

  /** Restore the newer account copy. An emptied slot keeps the typed event. */
  const loadNewer = () => {
    void autosave
      .loadNewer({
        isReadable: (payload) => snapshotFromPayload(payload) !== null,
      })
      .then((newerDraft) => {
        const snapshot =
          newerDraft === null ? null : snapshotFromPayload(newerDraft.payload);
        if (snapshot !== null) {
          form.restoreDraft({ ...form.draftSnapshot, ...snapshot });
        }
      });
  };

  const forget = () => {
    autosave.forget();
    offer.dropLegacy();
  };

  return {
    saveStatus: eventSaveStatus(autosave.status, now),
    resumeOffer,
    resume,
    startFresh,
    conflict: autosave.conflict,
    isConflictBusy: autosave.isConflictBusy,
    loadNewer,
    keepThisVersion: autosave.keepThisVersion,
    forget,
    isNoteShown: isEventDraftMadeFor(form.draftSnapshot),
  };
}
