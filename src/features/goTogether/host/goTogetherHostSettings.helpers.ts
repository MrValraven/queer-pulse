import { useQueryClient } from "@tanstack/react-query";
import { eventKeys } from "../../gatherings/api/eventKeys";
import type { EventResult } from "../../gatherings/api/useEvent";
import { zonedWallTimeToUtc } from "../../../shared/lib/zonedTime";
import type {
  HostConfigBody,
  HostConfigDTO,
  HostQuestion,
} from "../api/goTogether.types";

/**
 * The pure half of the host settings: the question drafts, the
 * `datetime-local` conversions in the gathering's own zone, and the rule for
 * when a save carries `cutoffAt`.
 */

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
/** The backend's defaults: matching 48h before the start, opt-in closing 6h
 *  before it (`latestCutoffAt`). */
const DEFAULT_CUTOFF_LEAD_MS = 48 * HOUR_MS;
const OPT_IN_CLOSE_LEAD_MS = 6 * HOUR_MS;

export interface HostOptionDraft {
  key: string;
  label: string;
}

export interface HostQuestionDraft {
  key: string;
  prompt: string;
  options: HostOptionDraft[];
}

let draftKeySequence = 0;

/** A key for a row the host just added, stable for the life of the row. */
export function nextDraftKey(): string {
  draftKeySequence += 1;
  return `draft-${draftKeySequence}`;
}

export function questionsToDrafts(
  questions: HostQuestion[],
): HostQuestionDraft[] {
  return questions.map((question) => ({
    key: question.id,
    prompt: question.prompt,
    options: question.options.map((option) => ({
      key: `${question.id}-${option.id}`,
      label: option.label,
    })),
  }));
}

/** What the PUT takes: trimmed prompts, and blank answer rows left out. */
export function draftsToQuestionBodies(
  drafts: HostQuestionDraft[],
): HostConfigBody["hostQuestions"] {
  return drafts.map((draft) => ({
    prompt: draft.prompt.trim(),
    options: draft.options
      .map((option) => option.label.trim())
      .filter((label) => label.length > 0),
  }));
}

export function savedQuestionBodies(
  questions: HostQuestion[],
): HostConfigBody["hostQuestions"] {
  return questions.map((question) => ({
    prompt: question.prompt,
    options: question.options.map((option) => option.label),
  }));
}

/** Every question needs a prompt and at least 2 filled answers. */
export function areQuestionBodiesValid(
  bodies: HostConfigBody["hostQuestions"],
  minimumOptions: number,
): boolean {
  return bodies.every(
    (body) => body.prompt.length > 0 && body.options.length >= minimumOptions,
  );
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** The wall clock of `epochMs` in `timeZone` (the viewer's zone when absent)
 *  as a `datetime-local` value, `YYYY-MM-DDTHH:mm`. */
export function epochToZonedInputValue(
  epochMs: number,
  timeZone: string | undefined,
): string {
  if (Number.isNaN(epochMs)) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      ...(timeZone ? { timeZone } : {}),
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(epochMs));
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((entry) => entry.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
  } catch {
    const date = new Date(epochMs);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}

/** A `datetime-local` value read as a wall clock in `timeZone`, back to an
 *  ISO instant. `null` for an empty or unreadable value. */
export function zonedInputValueToIso(
  value: string,
  timeZone: string | undefined,
): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [year = 0, month = 1, day = 1, hours = 0, minutes = 0] = match
    .slice(1)
    .map(Number);
  const instant = timeZone
    ? zonedWallTimeToUtc(year, month - 1, day, hours, minutes, timeZone)
    : new Date(year, month - 1, day, hours, minutes);
  return Number.isNaN(instant.getTime()) ? null : instant.toISOString();
}

/** The range the input allows, whole minutes inside the server's range. A
 *  new cutoff in the past is refused, so the floor is never before now. */
export function cutoffInputBounds(
  config: Pick<HostConfigDTO, "earliestCutoffAt" | "latestCutoffAt">,
  nowMs: number,
  timeZone: string | undefined,
): { min: string; max: string; minMs: number; maxMs: number } {
  const floorMs = Math.max(Date.parse(config.earliestCutoffAt), nowMs);
  const minMs = Math.ceil(floorMs / MINUTE_MS) * MINUTE_MS;
  const maxMs =
    Math.floor(Date.parse(config.latestCutoffAt) / MINUTE_MS) * MINUTE_MS;
  return {
    min: epochToZonedInputValue(minMs, timeZone),
    max: epochToZonedInputValue(maxMs, timeZone),
    minMs,
    maxMs,
  };
}

/**
 * Does a save that leaves the cutoff field alone still carry the saved
 * cutoff? The server re-applies its default to any PUT without `cutoffAt`, so
 * a time the host chose on an earlier visit is sent back to keep it. The
 * saved cutoff is left out, and the server works it out again, when it sits
 * at the 48 hour default, is already past, or falls outside today's range
 * (the gathering was rescheduled after it was saved, and resending it would
 * fail every save).
 */
export function shouldResendSavedCutoff(
  config: Pick<
    HostConfigDTO,
    "cutoffAt" | "earliestCutoffAt" | "latestCutoffAt"
  >,
  nowMs: number,
): boolean {
  const savedMs = Date.parse(config.cutoffAt);
  const earliestMs = Date.parse(config.earliestCutoffAt);
  const latestMs = Date.parse(config.latestCutoffAt);
  if (Number.isNaN(savedMs) || savedMs <= nowMs) return false;
  if (!(savedMs >= earliestMs && savedMs <= latestMs)) return false;
  const startMs = latestMs + OPT_IN_CLOSE_LEAD_MS;
  return Math.abs(savedMs - (startMs - DEFAULT_CUTOFF_LEAD_MS)) >= MINUTE_MS;
}

/** The saved config as a PUT body, with one field changed by the caller. */
export function savedConfigBody(
  config: HostConfigDTO,
  nowMs: number,
): HostConfigBody {
  return {
    enabled: config.enabled,
    ...(shouldResendSavedCutoff(config, nowMs)
      ? { cutoffAt: config.cutoffAt }
      : {}),
    hostQuestions: savedQuestionBodies(config.hostQuestions),
    meetingPointNote: config.meetingPointNote,
  };
}

/**
 * The cutoff part of a details save. The host's own time when they changed
 * the field (checked against the range, `false` when outside it), nothing
 * when they cleared it so the server default applies, and otherwise the saved
 * time only when `shouldResendSavedCutoff` keeps it.
 */
export function cutoffBodyPart({
  config,
  isCutoffTouched,
  cutoffValue,
  timeZone,
  nowMs,
}: {
  config: Pick<
    HostConfigDTO,
    "cutoffAt" | "earliestCutoffAt" | "latestCutoffAt"
  >;
  isCutoffTouched: boolean;
  cutoffValue: string;
  timeZone: string | undefined;
  nowMs: number;
}): Pick<HostConfigBody, "cutoffAt"> | false {
  if (!isCutoffTouched) {
    return shouldResendSavedCutoff(config, nowMs)
      ? { cutoffAt: config.cutoffAt }
      : {};
  }
  if (cutoffValue === "") return {};
  const cutoffIso = zonedInputValueToIso(cutoffValue, timeZone);
  if (!cutoffIso) return false;
  const bounds = cutoffInputBounds(config, nowMs, timeZone);
  const cutoffMs = Date.parse(cutoffIso);
  if (cutoffMs < bounds.minMs || cutoffMs > bounds.maxMs) return false;
  return { cutoffAt: cutoffIso };
}

/**
 * The gathering's IANA zone, read from the event detail the manage page has
 * already loaded. Absent in demo (the mock registry carries none) and on an
 * older event, where the input falls back to the viewer's own clock, as the
 * rest of the manage page does.
 */
export function useCachedEventTimezone(slug: string): string | undefined {
  const queryClient = useQueryClient();
  const cachedDetails = queryClient.getQueriesData<EventResult>({
    queryKey: eventKeys.detailRoot,
  });
  const match = cachedDetails.find(
    ([, result]) => result?.gathering.slug === slug,
  );
  return match?.[1]?.gathering.timezone;
}
