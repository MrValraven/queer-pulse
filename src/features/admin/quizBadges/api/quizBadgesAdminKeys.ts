/** `demoMode` sits last in every key, matching the events domain's convention.
 *  The events key holds the typed search text, so its query sets `isPrivateQueryKey`. */
export const quizBadgesAdminKeys = {
  root: ["quiz-badges-admin"] as const,
  library: (demoMode: boolean) =>
    ["quiz-badges-admin", "library", demoMode] as const,
  events: (q: string, page: number, demoMode: boolean) =>
    ["quiz-badges-admin", "events", q, page, demoMode] as const,
  eventSetup: (eventId: string, demoMode: boolean) =>
    ["quiz-badges-admin", "event-setup", eventId, demoMode] as const,
};
