import { describe, expect, it } from "vitest";
import { postDtoToPost, postToThread } from "./communities.adapters";
import type { Post } from "../community.model";
import type { CommunityPostDTO } from "./communities.api";

// The adapters localize their own copy now, so they take a `t`. The stub
// echoes the key: these assertions are about the post/reply FLAGS, not copy.
const translate = ((key: string) => key) as Parameters<typeof postDtoToPost>[2];

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    author: { initials: "RV", name: "Rita V", tint: "plum" },
    body: "First line is the heading\nSecond line is more body.",
    kind: "post",
    pinned: false,
    reactions: [{ key: "heart", count: 3, reacted: true }],
    replies: [
      {
        id: "reply-1",
        author: { initials: "JD", name: "Jo D", tint: "jade" },
        text: "hi",
        time: "1m",
      },
    ],
    time: "2m",
    createdAt: "2026-07-23T10:00:00Z",
    communitySlug: "lisbon",
    ...overrides,
  };
}

describe("postToThread", () => {
  it("derives the heading from the first body line and maps ids", () => {
    const thread = postToThread(makePost());
    expect(thread.id).toBe("post-1");
    expect(thread.title).toBe("First line is the heading");
    expect(thread.post).toContain("Second line");
    expect(thread.replies[0]?.id).toBe("reply-1");
  });

  it("maps the Heart reaction to the votes/voted upvote state", () => {
    const thread = postToThread(makePost());
    expect(thread.votes).toBe(3);
    expect(thread.voted).toBe(true);
  });

  it("defaults votes to 0 when there is no Heart reaction", () => {
    const thread = postToThread(makePost({ reactions: [] }));
    expect(thread.votes).toBe(0);
    expect(thread.voted).toBe(false);
  });
});

function post(overrides: Partial<CommunityPostDTO> = {}): CommunityPostDTO {
  return {
    id: "post-42",
    author: { slug: "rita", firstName: "Rita", lastName: "V", avatarUrl: null },
    body: "hello world",
    image: null,
    kind: "post",
    pinned: false,
    createdAt: "2026-07-23T10:00:00Z",
    editedAt: null,
    deleted: false,
    canEdit: true,
    canDelete: true,
    canRestore: false,
    canViewHistory: false,
    reactions: [],
    replies: [
      {
        id: "reply-1",
        author: {
          slug: "sam",
          firstName: "Sam",
          lastName: "T",
          avatarUrl: null,
        },
        text: "nice",
        createdAt: "2026-07-23T10:05:00Z",
        editedAt: null,
        deleted: false,
        canEdit: false,
        canDelete: true,
        canRestore: false,
        canViewHistory: false,
      },
    ],
    replyCount: 1,
    ...overrides,
  };
}

describe("communities adapters carry the post/reply flags", () => {
  it("postDtoToPost carries the OP flags + reply flags", () => {
    const mapped = postDtoToPost(post(), "queer-runners", translate);
    expect(mapped.canEdit).toBe(true);
    expect(mapped.replies[0]?.canDelete).toBe(true);
    expect(mapped.replies[0]?.id).toBe("reply-1");
  });

  it("postToThread attaches OP id + flags and maps replies", () => {
    const thread = postToThread(
      postDtoToPost(post({ id: "op-1" }), "queer-runners", translate),
    );
    expect(thread.id).toBe("op-1");
    expect(thread.canDelete).toBe(true);
    expect(thread.replies[0]?.id).toBe("reply-1");
    expect(thread.replies[0]?.canEdit).toBe(false);
  });
});
