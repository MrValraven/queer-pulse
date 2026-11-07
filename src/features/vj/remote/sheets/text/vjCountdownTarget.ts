import { VJ_LIMITS } from "../../../../../shared/contracts/vj";

/** When the countdown ends: some minutes from now, or a clock time later today. */
export type VjCountdownTargetInput =
  | { mode: "minutes"; minutes: number }
  | { mode: "clock"; hours: number; minutes: number };

/** The minute chips of the Countdown section. */
export const VJ_COUNTDOWN_MINUTE_CHOICES = [1, 5, 10, 15, 30] as const;

const MS_PER_MINUTE = 60_000;

/**
 * The countdown's length in ms, read on this device's own clock (the remote
 * always sends `durationMs`, so the server sets the end from its own now).
 * A clock time reads as today in the device's time zone; a time at or before
 * now, or under the contract's 1 s lead, is "past". A length over the
 * contract's 24 h lead is "tooFar".
 */
export function vjCountdownDurationMs(
  input: VjCountdownTargetInput,
  localNowMs: number,
): number | "past" | "tooFar" {
  const durationMs =
    input.mode === "minutes"
      ? input.minutes * MS_PER_MINUTE
      : clockTargetMs(input.hours, input.minutes, localNowMs) - localNowMs;
  const roundedMs = Math.round(durationMs);
  if (roundedMs < VJ_LIMITS.countdownLeadMsMin) return "past";
  if (roundedMs > VJ_LIMITS.countdownLeadMsMax) return "tooFar";
  return roundedMs;
}

/** Today's hours:minutes:00.000 on the device's clock, in epoch ms. */
function clockTargetMs(
  hours: number,
  minutes: number,
  localNowMs: number,
): number {
  const target = new Date(localNowMs);
  target.setHours(hours, minutes, 0, 0);
  return target.getTime();
}

/** "21:30" from an `input type="time"` value; null while it is empty or partial. */
export function vjClockTimeOf(
  value: string,
): { hours: number; minutes: number } | null {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (match === null) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}
