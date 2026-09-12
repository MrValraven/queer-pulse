import type { TFunction } from "../../../shared/i18n/types";
import type { NowChipInsight } from "../api/nowInsights.api";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/** How long a chip can sit at zero hellos before the swap nudge is fair
 *  rather than noise on a door that simply hasn't been discovered yet. */
export const STALE_AFTER_DAYS = 120;

/** How many whole days ago an ISO timestamp was, as of right now. */
function daysSince(iso: string): number {
  return Math.floor(
    (Date.now() - new Date(iso).getTime()) / MILLISECONDS_PER_DAY,
  );
}

/**
 * The swap-nudge copy for a chip nobody has knocked on in the current window,
 * or `null` when the chip doesn't warrant one. Callers only reach this once
 * they've already confirmed the chip is at zero hellos in the window
 * (`NowOpenToChips`'s `hasNoRecentHellos`), so this decides only how stale is
 * stale enough: missing history gets the "never" copy; a last hello inside
 * `STALE_AFTER_DAYS` gets no nudge at all, since a fresh door deserves a
 * chance before it's offered up for a swap.
 */
export function nudgeCopy(
  chipInsight: NowChipInsight,
  t: TFunction,
): string | null {
  if (chipInsight.lastHelloAt === null) {
    return t("members:content.now.chip.staleNever");
  }
  const daysSinceLastHello = daysSince(chipInsight.lastHelloAt);
  if (daysSinceLastHello <= STALE_AFTER_DAYS) return null;
  const months = Math.floor(daysSinceLastHello / 30);
  return t("members:content.now.chip.staleMonths", { months });
}
