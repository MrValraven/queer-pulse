import type { Cause, Commit } from "./volunteering.api";

/**
 * Per-domain react-query key factory for the volunteering / opportunities
 * domain. `demoMode` sits **LAST** in every key (audit P1-10 recommendation), so
 * the read site (query definition) and the write site (mutation invalidation)
 * share one source of truth and can never drift. The previous bug invalidated
 * `["opportunity", slug]` / `["opportunity-signups", slug]`, which put the slug
 * where the query held `demoMode`, so a signup / withdrawal / close never
 * refreshed the detail or roster.
 *
 * Use `.detail` / `.list` / `.signups` where a query is DEFINED; use the `*Root`
 * prefixes to INVALIDATE every matching query after a mutation.
 */
export const opportunityKeys = {
  detailRoot: ["opportunity"] as const,
  detail: (slug: string | undefined, demoMode: boolean) =>
    ["opportunity", slug, demoMode] as const,

  listRoot: ["opportunities"] as const,
  list: (params: { cause?: Cause; commit?: Commit }, demoMode: boolean) =>
    ["opportunities", params, demoMode] as const,

  signupsRoot: ["opportunity-signups"] as const,
  signups: (slug: string | undefined, demoMode: boolean) =>
    ["opportunity-signups", slug, demoMode] as const,
};
