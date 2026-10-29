import {
  eventKeySegment,
  type EventApiTarget,
} from "../../gatherings/api/eventApiTarget";

/**
 * React-query keys for Go together. `demoMode` sits LAST among the identifying
 * parts of every key, like `eventKeys`, so a bare `*Root` prefix invalidates
 * every variant whatever the mode. Only the host config and summary keys of an
 * event take an `apiTarget`; for the music admin target they add a
 * `"musicAdmin"` segment AFTER `demoMode`, and a member key ends at
 * `demoMode`. Use the functions where a query is defined and the roots to
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
  hostConfig: (
    slug: string | undefined,
    demoMode: boolean,
    apiTarget?: EventApiTarget,
  ) =>
    [
      "go-together-host-config",
      slug,
      demoMode,
      ...eventKeySegment(apiTarget),
    ] as const,
  hostSummary: (
    slug: string | undefined,
    demoMode: boolean,
    apiTarget?: EventApiTarget,
  ) =>
    [
      "go-together-host-summary",
      slug,
      demoMode,
      ...eventKeySegment(apiTarget),
    ] as const,
};
