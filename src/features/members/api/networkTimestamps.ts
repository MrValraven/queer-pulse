/**
 * Deterministic mock ISO timestamps for DEMO MODE ONLY, so the profile "Your
 * network" groups can sort newest-first and render relative times under
 * `VITE_DEMO=1`. Purely cosmetic — live paths always carry the real
 * `createdAt` / `respondedAt` the API returns, and never call this.
 *
 * A fixed anchor (not `Date.now()`) keeps the values stable across renders, so
 * the demo lists don't reshuffle between paints.
 */
const DEMO_ANCHOR_ISO = "2026-08-01T12:00:00.000Z";
const DAYS_BETWEEN_DEMO_ITEMS = 9;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * A plausible "N items ago" ISO timestamp — earlier the higher `itemIndex` is,
 * spreading a demo list across the recent weeks.
 */
export function demoNetworkTimestamp(itemIndex: number): string {
  const anchorMilliseconds = new Date(DEMO_ANCHOR_ISO).getTime();
  const offsetMilliseconds =
    (itemIndex + 1) * DAYS_BETWEEN_DEMO_ITEMS * MILLISECONDS_PER_DAY;
  return new Date(anchorMilliseconds - offsetMilliseconds).toISOString();
}
