// Query-key factory for the admin roadmap tools (`useAdminRoadmap` +
// `useAdminRoadmapMutations`). Centralized here (rather than inline in the
// hook file) so C-phase components that need to invalidate/prefetch the
// bundle (e.g. after a modal action) import the same stable keys instead of
// re-typing the tuple.

/** Root key segment — kept identical to the pre-B3 `ADMIN_ROADMAP_KEY`
 *  string so nothing already depending on it breaks. */
export const ADMIN_ROADMAP_KEY = "admin-roadmap";

/** Public page's query key (`marketing/api/useRoadmap.ts`) — invalidated by
 *  live-mode admin mutations so `/about/roadmap` reflects admin edits
 *  immediately. */
export const PUBLIC_ROADMAP_KEY = "roadmap";

export const roadmapKeys = {
  root: [ADMIN_ROADMAP_KEY] as const,
  /** The full admin bundle (items/ideas/team/audit/heroStats), scoped by
   *  demo-vs-live so switching modes never serves the other mode's cache. */
  admin: (demoMode: boolean) => [ADMIN_ROADMAP_KEY, demoMode] as const,
};
