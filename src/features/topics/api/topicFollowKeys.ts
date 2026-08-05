/**
 * Per-domain react-query key factory for topic follows (P2-15).
 *
 * `demoMode` sits LAST (audit P1-10 convention), so the bare `["topic-follows"]`
 * root invalidates every variant regardless of mode, and read/write sites can
 * never drift on position. The followed-slugs list is a single per-user set (no
 * id in the key) that seeds every topic header's follow button, so there is one
 * list query per mode; the follow/unfollow mutation patches it optimistically.
 */
export const topicFollowKeys = {
  /** Prefix matching the followed-slugs list in either mode. */
  listRoot: ["topic-follows"] as const,
  list: (demoMode: boolean) => ["topic-follows", demoMode] as const,
};
