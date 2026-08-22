import { apiPost } from "../../../shared/api/client";

/**
 * `POST /community-posts` — the flat community-post alias, which already
 * accepts an optional `communitySlug`.
 *
 * This is deliberately NOT a new "feed post" endpoint. The feed is a read-time
 * aggregator over community posts, forum threads and gatherings, and every item
 * inherits moderation from the domain it came from. A free-floating feed post
 * would have no moderation owner; a community post lands in a room that has
 * one, and reaches the feed through the aggregation anyway.
 */
export interface CreateCommunityPostBody {
  body: string;
  /** The room the post belongs to. Omitted, the post has no community — which
   *  is exactly the case sharing a job avoids, so the modal always sends one. */
  communitySlug?: string;
}

export interface CreatedCommunityPostDTO {
  id: string;
}

export const createCommunityPost = (body: CreateCommunityPostBody) =>
  apiPost<CreatedCommunityPostDTO>("/community-posts", body);
