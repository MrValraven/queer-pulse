/**
 * React-query keys for Go together. `demoMode` sits LAST in every key, like
 * `eventKeys`, so a bare `*Root` prefix invalidates every variant whatever
 * the mode. Use the functions where a query is defined and the roots to
 * invalidate after a mutation.
 */
export const goTogetherKeys = {
  cardRoot: ["go-together-card"] as const,
  card: (slug: string | undefined, demoMode: boolean) =>
    ["go-together-card", slug, demoMode] as const,
  profileRoot: ["go-together-profile"] as const,
  profile: (demoMode: boolean) => ["go-together-profile", demoMode] as const,
  groupRoot: ["go-together-group"] as const,
  group: (groupId: string | undefined, demoMode: boolean) =>
    ["go-together-group", groupId, demoMode] as const,
  feedbackRoot: ["go-together-feedback"] as const,
  feedback: (groupId: string | undefined, demoMode: boolean) =>
    ["go-together-feedback", groupId, demoMode] as const,
  hostConfigRoot: ["go-together-host-config"] as const,
  hostConfig: (slug: string | undefined, demoMode: boolean) =>
    ["go-together-host-config", slug, demoMode] as const,
  hostSummary: (slug: string | undefined, demoMode: boolean) =>
    ["go-together-host-summary", slug, demoMode] as const,
};
