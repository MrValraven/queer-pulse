import { describe, expect, it } from "vitest";
import { postToReply, threadDetail } from "./forum.adapters";
import type {
  ForumPostResponse,
  ForumThreadResponse,
} from "../../../shared/contracts/contracts";

const t = ((k: string) => k) as never;
const fmt = { number: (n: number) => String(n), relativeTime: () => "1m", date: () => "d" } as never;

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
      replyCount: 1,
      lastActivityAt: "2026-07-23T10:00:00Z",
      createdAt: "2026-07-23T10:00:00Z",
      canEdit: false,
      canDelete: false,
      canRestore: false,
      canViewHistory: false,
      canLock: false,
      opPostId: "op-1",
      opVoteCount: 0,
      myVote: 0,
      tags: [],
    };
    const detail = threadDetail(
      thread,
      [post({ id: "op-1" }), post({ id: "reply-1", canEdit: false })],
      t,
      fmt,
    );
    expect(detail.opPostId).toBe("op-1");
    expect(detail.replies[0]?.postId).toBe("reply-1");
  });
});
