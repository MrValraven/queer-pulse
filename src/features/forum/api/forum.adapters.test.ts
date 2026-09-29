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
    photos: [],
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
      kind: null,
      contentWarnings: [],
      isAnonymous: false,
      coAuthor: null,
      publishedAt: "2026-07-23T10:00:00Z",
      reviewState: null,
      isPublished: true,
      crossPosted: false,
      neighbourhood: null,
      closesAt: null,
      language: null,
      isClosed: false,
      poll: null,
      opPhotos: [],
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
      kind: null,
      contentWarnings: [],
      isAnonymous: false,
      coAuthor: null,
      publishedAt: "2026-07-23T10:00:00Z",
      reviewState: null,
      isPublished: true,
      crossPosted: false,
      neighbourhood: null,
      closesAt: null,
      language: null,
      isClosed: false,
      poll: null,
      opPhotos: [],
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
      kind: null,
      contentWarnings: [],
      isAnonymous: false,
      coAuthor: null,
      publishedAt: "2026-07-23T10:00:00Z",
      reviewState: null,
      isPublished: true,
      crossPosted: false,
      neighbourhood: null,
      closesAt: null,
      language: null,
      isClosed: false,
      poll: null,
      opPhotos: [],
    };
    const card = threadToCard(thread, t, fmt);
    expect(card.author.official).toBe(true);
  });
});

/** A minimal thread response; each test overrides only what it asserts on. */
function threadResponse(
  overrides: Partial<ForumThreadResponse> = {},
): ForumThreadResponse {
  return {
    id: "thread-1",
    slug: "welcome",
    title: "Welcome",
    author: { handle: "rita", displayName: "Rita V", avatarUrl: null },
    category: "general",
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
    kind: null,
    contentWarnings: [],
    isAnonymous: false,
    coAuthor: null,
    publishedAt: "2026-07-23T10:00:00Z",
    reviewState: null,
    isPublished: true,
    crossPosted: false,
    neighbourhood: null,
    closesAt: null,
    language: null,
    isClosed: false,
    poll: null,
    opPhotos: [],
    ...overrides,
  };
}

describe("forum adapters: washes and co-author (DES-406, PRD-408)", () => {
  it("reply avatar washes use rgb tokens only", () => {
    const handles = "abcdefghijklmnopqrstuvwxyz".split("");
    const replies = handles.map((handle) =>
      postToReply(
        post({
          author: { handle, displayName: handle, avatarUrl: null },
        }),
        t,
        fmt,
      ),
    );
    const washes = new Set(replies.map((reply) => reply.background));
    // Every tint the slug hash can land on is exercised.
    expect(washes.size).toBe(3);
    for (const wash of washes) {
      expect(wash).toMatch(/^rgba\(var\(--[a-z]+-rgb\), \.\d+\)$/);
    }
    for (const reply of replies) {
      expect(reply.color).toMatch(/^var\(--[a-z-]+\)$/);
    }
  });

  it("maps viewerIsCoAuthor", () => {
    const coAuthor = { handle: "joana", displayName: "Joana", avatarUrl: null };
    expect(
      threadToCard(threadResponse({ coAuthor, viewerIsCoAuthor: true }), t, fmt)
        .viewerIsCoAuthor,
    ).toBe(true);
    expect(
      threadToCard(threadResponse({ coAuthor }), t, fmt).viewerIsCoAuthor,
    ).toBe(false);
  });
});

describe("forum adapters: the OP badge on a thread with no named author (ENG-494)", () => {
  const erasedAuthor = { handle: "", displayName: "Member", avatarUrl: null };

  it("no reply is badged OP when the thread author handle is empty", () => {
    // The author erased their account: the thread survives with the
    // placeholder byline and no opening post, and a tombstoned reply or a
    // reply with no resolvable profile also carries an empty handle.
    const detail = threadDetail(
      threadResponse({ author: erasedAuthor }),
      [
        post({ id: "reply-1" }),
        post({
          id: "reply-2",
          deleted: true,
          author: { handle: "", displayName: "", avatarUrl: null },
        }),
        post({ id: "reply-3", author: erasedAuthor }),
      ],
      t,
      fmt,
      false,
    );

    expect(detail.replies.map((reply) => reply.isOP)).toEqual([
      false,
      false,
      false,
    ]);
  });

  it("still badges the thread author's replies when the OP is unavailable", () => {
    const detail = threadDetail(
      threadResponse({
        author: { handle: "rita", displayName: "Rita V", avatarUrl: null },
      }),
      [
        post({ id: "reply-1" }),
        post({
          id: "reply-2",
          author: { handle: "joana", displayName: "Joana R", avatarUrl: null },
        }),
      ],
      t,
      fmt,
      false,
    );

    expect(detail.replies.map((reply) => reply.isOP)).toEqual([true, false]);
  });
});
