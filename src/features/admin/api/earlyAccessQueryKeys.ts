/** Every admin early access query key starts with "admin-early-access" so one
 *  invalidation reaches them all, and carries `demoMode` so the two modes
 *  never share a cache. */
export const earlyAccessKeys = {
  all: ["admin-early-access"] as const,
  /** One member's early access list (the member drawer section). */
  member: (demoMode: boolean, memberId: string) =>
    ["admin-early-access", "member", demoMode, memberId] as const,
  /** Every feature in early access with its grant count (the roster page). */
  features: (demoMode: boolean) =>
    ["admin-early-access", "features", demoMode] as const,
  /** Who holds one feature (the roster page section). */
  roster: (demoMode: boolean, featureKey: string) =>
    ["admin-early-access", "roster", demoMode, featureKey] as const,
};
