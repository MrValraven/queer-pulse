import { describe, expect, it } from "vitest";
import { createFormatters } from "../../../shared/i18n/format";
import { feedItemToPost } from "./feed.adapters";
import type { FeedItem } from "./feed.api";

const formatters = createFormatters("en");
const STUDIO_PATH = "/studio/album?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";

const communityPost: FeedItem = {
  id: "post-1",
  type: "community_post",
  createdAt: "2026-10-14T10:00:00.000Z",
  title: "Trans & Non-Binary Hub",
  summary: "a new one from Coro",
  link: "/community/trans-hub/post/post-1",
  actor: null,
};

describe("feedItemToPost studioLink", () => {
  it("carries the backend's Studio link path", () => {
    expect(
      feedItemToPost({ ...communityPost, studioLink: STUDIO_PATH }, formatters)
        .studioLink,
    ).toBe(STUDIO_PATH);
  });

  it("carries null when the post has no link or was blanked", () => {
    expect(
      feedItemToPost({ ...communityPost, studioLink: null }, formatters)
        .studioLink,
    ).toBeNull();
  });

  it("leaves it undefined for an older backend", () => {
    expect(
      feedItemToPost(communityPost, formatters).studioLink,
    ).toBeUndefined();
  });
});
