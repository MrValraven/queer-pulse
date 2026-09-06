import { describe, expect, it } from "vitest";
import { postToReply, threadDetail, threadToCard } from "./forum.adapters";
import type { ForumPostResponse, ForumThreadResponse } from "./forum.api";

const t = ((k: string) => k) as never;
const fmt = {
  number: (n: number) => String(n),
  relativeTime: () => "1m",
  date: () => "d",
} as never;

function post(overrides: Partial<ForumPostResponse> = {}): ForumPostResponse {
  return {
    id: "post-42",
    threadId: "thread-1",
    parentPostId: null,
    author: { handle: "rita", displayName: "Rita V", avatarUrl: null },
    body: "hello world",
    voteCount: 3,
    myVote: 0,
    createdAt: "2026-07-23T10:00:00Z",
    editedAt: null,
    deleted: false,
    canEdit: true,
    canDelete: true,
    canRestore: false,
    canViewHistory: false,
    image: null,
    isAccepted: false,
    isOp: false,
    ...overrides,
  };
}

describe("forum adapters carry the post id + flags", () => {
  it("postToReply exposes the backend post id (previously dropped)", () => {
    const reply = postToReply(post(), t, fmt);
    expect(reply.postId).toBe("post-42");
    expect(reply.canEdit).toBe(true);
  });

  it("threadDetail attaches OP id + flags and maps replies", () => {
    const thread: ForumThreadResponse = {
      id: "thread-1",
      slug: "welcome",
      title: "Welcome",
      author: { handle: "rita", displayName: "Rita V", avatarUrl: null },
      category: "general",
      isPinned: false,
      isLocked: false,
      lockReason: null,
      replyCount: 1,
      lastActivityAt: "2026-07-23T10:00:00Z",
      createdAt: "2026-07-23T10:00:00Z",
      canEdit: false,
      canDelete: false,
      canRestore: false,
      canViewHistory: false,
      canLock: false,
      canPin: false,
      opPostId: "op-1",
      opVoteCount: 0,
      myVote: 0,
      tags: [],
      isSubscribed: false,
      acceptedPostId: null,
      canAcceptAnswer: false,
      canEditTags: false,
      isDeleted: false,
      excerpt: null,
      unreadReplyCount: null,
    };
    // ENG-130: the opening post is the one flagged `isOp`, wherever it sits in
    // the page — here it is SECOND, which under the old `data[0]` rule promoted
    // the reply into the OP card and dropped it from the reply list.
    const detail = threadDetail(
      thread,
      [
        post({ id: "reply-1", canEdit: false }),
        post({ id: "op-1", isOp: true }),
      ],
      t,
      fmt,
      true,
    );
    expect(detail.opPostId).toBe("op-1");
    expect(detail.replies.map((reply) => reply.postId)).toEqual(["reply-1"]);
  });

  it("threadDetail renders every post as a reply when there is no OP", () => {
    const thread: ForumThreadResponse = {
      id: "thread-1",
      slug: "welcome",
      title: "Welcome",
      author: { handle: "rita", displayName: "Rita V", avatarUrl: null },
      category: "general",
      isPinned: false,
      isLocked: false,
      lockReason: null,
      replyCount: 1,
      lastActivityAt: "2026-07-23T10:00:00Z",
      createdAt: "2026-07-23T10:00:00Z",
      canEdit: false,
      canDelete: false,
      canRestore: false,
      canViewHistory: false,
      canLock: false,
      canPin: false,
      opPostId: "op-1",
      opVoteCount: 0,
      myVote: 0,
      tags: [],
      isSubscribed: false,
      acceptedPostId: null,
      canAcceptAnswer: false,
      canEditTags: false,
      isDeleted: false,
      excerpt: null,
      unreadReplyCount: null,
    };
    const detail = threadDetail(
      thread,
      [post({ id: "reply-1" }), post({ id: "reply-2" })],
      t,
      fmt,
      false,
    );
    expect(detail.isOpAvailable).toBe(false);
    expect(detail.body).toEqual([]);
    expect(detail.replies.map((reply) => reply.postId)).toEqual([
      "reply-1",
      "reply-2",
    ]);
  });

  it("threadToCard carries the official flag onto the author", () => {
    const thread: ForumThreadResponse = {
      id: "thread-1",
      slug: "guide",
      title: "Master resource guide",
      author: {
        handle: "queerpulse",
        displayName: "QueerPulse",
        avatarUrl: null,
        official: true,
      },
      category: "guides",
      isPinned: false,
      isLocked: false,
      lockReason: null,
      replyCount: 0,
      lastActivityAt: "2026-07-23T10:00:00Z",
      createdAt: "2026-07-23T10:00:00Z",
      canEdit: false,
      canDelete: false,
      canRestore: false,
      canViewHistory: false,
      canLock: false,
      canPin: false,
      opPostId: "op-1",
      opVoteCount: 0,
      myVote: 0,
      tags: [],
      isSubscribed: false,
      acceptedPostId: null,
      canAcceptAnswer: false,
      canEditTags: false,
      isDeleted: false,
      excerpt: null,
      unreadReplyCount: null,
    };
    const card = threadToCard(thread, t, fmt);
    expect(card.author.official).toBe(true);
  });
});
