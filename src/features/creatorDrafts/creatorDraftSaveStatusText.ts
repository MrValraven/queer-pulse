import type { TFunction } from "../../shared/i18n/types";
import type { CreatorDraftSaveStatus } from "./api/useCreatorDraftAutosave";

const MILLISECONDS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;

/** The age rhythm of `draftAgeText`: just now, minutes, hours, then days. */
function savedAgeText(savedAt: string, nowMs: number, t: TFunction): string {
  const savedAtMs = Date.parse(savedAt);
  const minutes = Number.isNaN(savedAtMs)
    ? 0
    : Math.max(0, Math.floor((nowMs - savedAtMs) / MILLISECONDS_PER_MINUTE));
  if (minutes < 1) return t("shared:creatorDraft.status.savedJustNow");
  if (minutes < MINUTES_PER_HOUR) {
    return t("shared:creatorDraft.status.savedMinutes", { count: minutes });
  }
  if (minutes < MINUTES_PER_DAY) {
    return t("shared:creatorDraft.status.savedHours", {
      count: Math.floor(minutes / MINUTES_PER_HOUR),
    });
  }
  return t("shared:creatorDraft.status.savedDays", {
    count: Math.floor(minutes / MINUTES_PER_DAY),
  });
}

/** The words for a save status; null while nothing has happened yet. */
export function creatorDraftSaveStatusText(
  status: CreatorDraftSaveStatus,
  nowMs: number,
  t: TFunction,
): string | null {
  switch (status.kind) {
    case "idle":
      return null;
    case "saving":
      return t("shared:creatorDraft.status.saving");
    case "saved":
      return savedAgeText(status.savedAt, nowMs, t);
    case "retrying":
      return t("shared:creatorDraft.status.retrying");
    case "tooLarge":
      return t("shared:creatorDraft.status.tooLarge");
    case "notSaved":
      return t("shared:creatorDraft.status.notSaved");
    case "conflict":
      return t("shared:creatorDraft.status.conflict");
    default: {
      const unhandledStatus: never = status;
      return unhandledStatus;
    }
  }
}
