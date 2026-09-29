import { describe, expect, it } from "vitest";
import type { ForumPostResponse } from "./forum.api";
import { threadReadUpTo } from "./threadReadWatermark";

function post(overrides: Partial<ForumPostResponse> = {}): ForumPostResponse {
  return {
    id: "post-1",
    threadId: "thread-1",
    parentPostId: null,
    author: { handle: "rita", displayName: "Rita V", avatarUrl: null },
    body: "hello",
    voteCount: 0,
    myVote: 0,
    createdAt: "2026-07-23T10:00:00Z",
    editedAt: null,
    deleted: false,
    canEdit: false,
    canDelete: false,
    canRestore: false,
    canViewHistory: false,
    image: null,
    photos: [],
    isAccepted: false,
    isOp: false,
    ...overrides,
  };
}

const openingPost = post({
  id: "op",
  isOp: true,
  createdAt: "2026-07-23T09:00:00Z",
});
const firstRoot = post({ id: "root-1", createdAt: "2026-07-23T10:00:00Z" });
const nestedUnderFirst = post({
  id: "child-1",
  parentPostId: "root-1",
  createdAt: "2026-07-23T12:30:00Z",
});
const secondRoot = post({ id: "root-2", createdAt: "2026-07-23T11:00:00Z" });

describe("threadReadUpTo", () => {
  it("returns undefined while nothing has loaded", () => {
    expect(
      threadReadUpTo({ posts: [], sort: "oldest", hasNextPage: false }),
    ).toBeUndefined();
  });

  it("uses the newest loaded post when every page is in", () => {
    expect(
      threadReadUpTo({
        posts: [openingPost, firstRoot, nestedUnderFirst, secondRoot],
        sort: "top",
        hasNextPage: false,
      }),
    ).toBe("2026-07-23T12:30:00Z");
  });

  it("uses the last loaded root under oldest with more pages", () => {
    expect(
      threadReadUpTo({
        posts: [openingPost, firstRoot, nestedUnderFirst, secondRoot],
        sort: "oldest",
        hasNextPage: true,
      }),
    ).toBe("2026-07-23T11:00:00Z");
  });

  it("counts a reply parented to the opening post as a root", () => {
    const replyToOpeningPost = post({
      id: "root-3",
      parentPostId: "op",
      createdAt: "2026-07-23T11:30:00Z",
    });
    expect(
      threadReadUpTo({
        posts: [
          openingPost,
          firstRoot,
          nestedUnderFirst,
          secondRoot,
          replyToOpeningPost,
        ],
        sort: "oldest",
        hasNextPage: true,
      }),
    ).toBe("2026-07-23T11:30:00Z");
  });

  it("returns null under newest with more pages", () => {
    expect(
      threadReadUpTo({
        posts: [openingPost, secondRoot, firstRoot],
        sort: "newest",
        hasNextPage: true,
      }),
    ).toBeNull();
  });
});
