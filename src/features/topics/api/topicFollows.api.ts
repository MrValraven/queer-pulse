import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";

// ── Topic follows DTOs + raw calls (P2-15) ──────────────────────────────────
// Mirrors the backend's `queerpulse-backend/src/topics` module:
//   GET    /topics/follows        -> { slugs: string[] }
//   POST   /topics/:slug/follow   -> { following: true }
//   DELETE /topics/:slug/follow   -> { following: false }
// `:slug` is the topic's tag (e.g. "healthcare"), NOT a uuid.

interface TopicFollowsResponse {
  slugs: string[];
}

/** GET /topics/follows — the caller's followed topic slugs (seeds follow state). */
export const getTopicFollows = (): Promise<string[]> =>
  apiGet<TopicFollowsResponse>("/topics/follows").then((res) => res.slugs);

/** POST /topics/:slug/follow — follow a topic (idempotent). */
export const followTopic = (slug: string): Promise<{ following: true }> =>
  apiPost<{ following: true }>(`/topics/${encodeURIComponent(slug)}/follow`);

/** DELETE /topics/:slug/follow — unfollow a topic (idempotent). */
export const unfollowTopic = (slug: string): Promise<{ following: false }> =>
  apiDelete<{ following: false }>(`/topics/${encodeURIComponent(slug)}/follow`);
