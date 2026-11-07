// Contract 7.5 show commands for the demo server, pure: the countdown, the
// logo and the event card. Mirrors ruleSetCountdown, ruleSetLogo and
// ruleSetEventCard of queerpulse-backend/src/vj/stage/vj-look-rules.ts in the
// same check order: the field rules, isImmediate, then the library read.

import {
  VJ_EVENT_CARD_KINDS,
  VJ_LOGO_CORNERS,
  type VjCountdown,
  type VjEventCard,
  type VjLogo,
  type VjSocketErrorCode,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  vjDemoChange,
  type VjDemoCommandContext,
  type VjDemoCommandOutcome,
} from "./vjDemoCommandKit";
import { readVjImmediateFlag } from "./vjDemoStageCommands";
import {
  COUNTDOWN_LEAD_MS_RANGE,
  isNumberInRange,
  isOneOf,
  readVjCountdownLabel,
} from "./vjDemoStageInput";

/** The patch fields of each show command; a payload with none answers vj_patch_empty. */
const VJ_COUNTDOWN_FIELDS = [
  "isVisible",
  "targetAt",
  "durationMs",
  "label",
] as const;
const VJ_LOGO_FIELDS = ["isVisible", "corner"] as const;
const VJ_EVENT_CARD_FIELDS = ["isVisible", "kind"] as const;

/** Whether any of the fields is present; an undefined value counts as absent. */
function hasAnyVjField(
  record: Record<string, unknown>,
  fields: readonly string[],
): boolean {
  return fields.some((field) => record[field] !== undefined);
}

/** The countdown target a payload sets: `targetAt` as sent, `now + durationMs`,
 *  or undefined when it sends neither; the code when either is out of range. */
function readVjCountdownTarget(
  record: Record<string, unknown>,
  now: number,
): { targetAt: number | undefined } | { error: VjSocketErrorCode } {
  const { targetAt } = record;
  if (targetAt !== undefined) {
    const targetRange = {
      ...COUNTDOWN_LEAD_MS_RANGE,
      min: now + COUNTDOWN_LEAD_MS_RANGE.min,
      max: now + COUNTDOWN_LEAD_MS_RANGE.max,
    };
    return isNumberInRange(targetAt, targetRange)
      ? { targetAt }
      : { error: "vj_countdown_out_of_range" };
  }
  const { durationMs } = record;
  if (durationMs !== undefined) {
    return isNumberInRange(durationMs, COUNTDOWN_LEAD_MS_RANGE)
      ? { targetAt: now + durationMs }
      : { error: "vj_countdown_out_of_range" };
  }
  return { targetAt: undefined };
}

/** `stage:setCountdown`: target conflict, target range, label, `isVisible`,
 *  then a visible result needs a future target (contract 7.5). */
export function applySetCountdown(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  if (!hasAnyVjField(record, VJ_COUNTDOWN_FIELDS)) {
    return { error: "vj_patch_empty" };
  }
  if (record.targetAt !== undefined && record.durationMs !== undefined) {
    return { error: "vj_countdown_target_conflict" };
  }
  const target = readVjCountdownTarget(record, context.now);
  if ("error" in target) return target;
  const countdown: VjCountdown = { ...state.countdown };
  if (target.targetAt !== undefined) countdown.targetAt = target.targetAt;
  if (record.label !== undefined) {
    const label = readVjCountdownLabel(record.label);
    if (typeof label !== "string") return label;
    countdown.label = label;
  }
  if (record.isVisible !== undefined) {
    if (typeof record.isVisible !== "boolean") {
      return { error: "vj_effect_flag_invalid" };
    }
    countdown.isVisible = record.isVisible;
  }
  const hasFutureTarget =
    countdown.targetAt !== null && countdown.targetAt > context.now;
  if (countdown.isVisible && !hasFutureTarget) {
    return { error: "vj_countdown_target_missing" };
  }
  return vjDemoChange({ ...state, countdown });
}

/** `stage:setLogo`: `isVisible`, then the corner (contract 7.5). */
export function applySetLogo(
  state: VjStageState,
  record: Record<string, unknown>,
): VjDemoCommandOutcome {
  if (!hasAnyVjField(record, VJ_LOGO_FIELDS)) {
    return { error: "vj_patch_empty" };
  }
  const logo: VjLogo = { ...state.logo };
  if (record.isVisible !== undefined) {
    if (typeof record.isVisible !== "boolean") {
      return { error: "vj_effect_flag_invalid" };
    }
    logo.isVisible = record.isVisible;
  }
  if (record.corner !== undefined) {
    if (!isOneOf(VJ_LOGO_CORNERS, record.corner)) {
      return { error: "vj_logo_corner_invalid" };
    }
    logo.corner = record.corner;
  }
  return vjDemoChange({ ...state, logo });
}

/** `stage:setEventCard`: `isVisible`, the kind, isImmediate, then a visible
 *  result needs the active pack to link an event. Only a visible result reads
 *  the pack; with no active pack it answers before any read. */
export function applySetEventCard(
  state: VjStageState,
  record: Record<string, unknown>,
  context: VjDemoCommandContext,
): VjDemoCommandOutcome {
  if (!hasAnyVjField(record, VJ_EVENT_CARD_FIELDS)) {
    return { error: "vj_patch_empty" };
  }
  const eventCard: VjEventCard = { ...state.eventCard };
  if (record.isVisible !== undefined) {
    if (typeof record.isVisible !== "boolean") {
      return { error: "vj_effect_flag_invalid" };
    }
    eventCard.isVisible = record.isVisible;
  }
  if (record.kind !== undefined) {
    if (!isOneOf(VJ_EVENT_CARD_KINDS, record.kind)) {
      return { error: "vj_event_card_kind_invalid" };
    }
    eventCard.kind = record.kind;
  }
  // The backend answers isImmediate before the pack read, so it runs here too.
  const immediate = readVjImmediateFlag("stage:setEventCard", record);
  if ("error" in immediate) return immediate;
  const next: VjStageState = { ...state, eventCard };
  if (!eventCard.isVisible) return vjDemoChange(next);
  if (state.activePackId === null) return { error: "vj_event_card_no_event" };
  const pack = context.library.readPackForStage(
    state.activePackId.toLowerCase(),
  );
  if (pack === null || pack.eventId === null) {
    return { error: "vj_event_card_no_event" };
  }
  return vjDemoChange(next);
}
