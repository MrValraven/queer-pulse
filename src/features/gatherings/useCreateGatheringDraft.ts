import { useEffect, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { safeStorage } from "../../shared/storage/safeStorage";
import {
  DRAFT_CLOCK_TICK_MS,
  DRAFT_SAVE_DELAY_MS,
} from "./createGathering.data";
import { removeStoredDraft } from "./createGatheringDraftStorage";
import { findFormat, OTHER_FORMAT_KEY } from "./gatheringCatalog";
import type { GatheringDraftSnapshot, GatheringForm } from "./useGatheringForm";

export {
  clearStoredGatheringDrafts,
  createGatheringDraftKey,
  removeStoredDraft,
} from "./createGatheringDraftStorage";

/**
 * The create wizard's draft: saved to this browser as the host types, offered
 * back on the next visit.
 *
 * Every storage access goes through `safeStorage` (each call is its own
 * try/catch) and every parse sits in a try/catch, so blocked site data or a
 * corrupt entry degrades to "no draft".
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
  { kind: "idle" } | { kind: "saving" } | { kind: "saved"; minutesAgo: number };

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

export interface CreateGatheringDraftOptions {
  form: GatheringForm;
  /** From `createGatheringDraftKey(memberId)`. */
  storageKey: string;
  /** False on a `?duplicate=` visit: the seed lands asynchronously and would
   *  overwrite whatever a resume restored. */
  shouldOfferResume: boolean;
  /** The `?community=` param. A draft posted to a different community is not
   *  offered, since resuming it would silently replace that pick. */
  communitySlugParam: string;
  /** False while publishing and after it, so the draft slot stays clear once
   *  the gathering is published. */
  isSavingEnabled: boolean;
}

export function useCreateGatheringDraft({
  form,
  storageKey,
  shouldOfferResume,
  communitySlugParam,
  isSavingEnabled,
}: CreateGatheringDraftOptions) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loadedKey, setLoadedKey] = useState(storageKey);
  const [storedDraft, setStoredDraft] = useState(() =>
    readStoredDraft(storageKey),
  );
  const [isOfferDismissed, setIsOfferDismissed] = useState(false);
  // The member id can resolve after the first render. Re-read the slot for
  // the new key during render, React's pattern for state that follows a prop.
  if (loadedKey !== storageKey) {
    setLoadedKey(storageKey);
    setStoredDraft(readStoredDraft(storageKey));
    setIsOfferDismissed(false);
  }

  const isOfferOpen =
    storedDraft !== null &&
    shouldOfferResume &&
    !isOfferDismissed &&
    (!communitySlugParam ||
      storedDraft.snapshot.communitySlug === communitySlugParam);

  // `draftSnapshot` is a fresh object every render, so the effect keys on its
  // serialized form. Saving waits while a stored draft is still unanswered:
  // while the resume offer is open, and also on a visit that does not offer it
  // at all (a `?duplicate=` visit, or a `?community=` link for another
  // community). Writing then would replace a draft the host has not chosen to
  // give up. Resuming or starting fresh answers it.
  const serializedSnapshot = JSON.stringify(form.draftSnapshot);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const hasUnansweredStoredDraft = storedDraft !== null && !isOfferDismissed;
  const shouldSave = isSavingEnabled && !hasUnansweredStoredDraft && form.dirty;

  useEffect(() => {
    if (!shouldSave || serializedSnapshot === savedSnapshot) return;
    const timer = window.setTimeout(() => {
      const savedAt = Date.now();
      safeStorage.set(
        storageKey,
        `{"version":1,"savedAt":${savedAt},"snapshot":${serializedSnapshot}}`,
      );
      setSavedSnapshot(serializedSnapshot);
      setLastSavedAt(savedAt);
      setNow(savedAt);
    }, DRAFT_SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [shouldSave, serializedSnapshot, savedSnapshot, storageKey]);

  useEffect(() => {
    if (lastSavedAt === null) return;
    const interval = window.setInterval(
      () => setNow(Date.now()),
      DRAFT_CLOCK_TICK_MS,
    );
    return () => window.clearInterval(interval);
  }, [lastSavedAt]);

  const saveStatus: DraftSaveStatus =
    shouldSave && serializedSnapshot !== savedSnapshot
      ? { kind: "saving" }
      : lastSavedAt !== null
        ? {
            kind: "saved",
            minutesAgo: Math.max(
              0,
              Math.floor((now - lastSavedAt) / MILLISECONDS_PER_MINUTE),
            ),
          }
        : { kind: "idle" };

  const resumeOffer: DraftResumeOffer | null =
    isOfferOpen && storedDraft
      ? {
          label: draftLabel(storedDraft.snapshot, t),
          ageMinutes: Math.max(
            0,
            Math.floor((now - storedDraft.savedAt) / MILLISECONDS_PER_MINUTE),
          ),
        }
      : null;

  /** Put the stored draft back. The pledges start unticked, since the
   *  snapshot holds form fields only. A field an older snapshot lacks keeps
   *  the form's value. */
  const resume = () => {
    if (!storedDraft) return;
    form.restoreDraft({ ...form.draftSnapshot, ...storedDraft.snapshot });
    setIsOfferDismissed(true);
    showToast(t("gatherings:create.v2.toast.draftResumed"), "success");
  };

  /** Throw the stored draft away and keep the empty form. */
  const startFresh = () => {
    removeStoredDraft(storageKey);
    setStoredDraft(null);
  };

  return { saveStatus, resumeOffer, resume, startFresh };
}
