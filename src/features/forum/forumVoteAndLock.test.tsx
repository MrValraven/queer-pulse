import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { ForumPostResponse } from "../../shared/contracts/contracts";
import { useVotePost } from "./api/useForumMutations";
import type { ThreadPostsPage } from "./api/useForum";
import { ThreadReplySection } from "./ThreadReplySection";
import { REPLY_SORTS, type Reply } from "./forum.data";
import type { ReplyNode } from "./buildReplyTree";
import type { useThreadModeration } from "./useThreadModeration";
import type { useNestedReplyComposer } from "./useNestedReplyComposer";

/**
 * Forum voting + moderation (audit item #16). See `api/forum.adapters.test.ts`
 * for the adapter-level conventions this builds on.
 *
 *  - `useVotePost` patches the thread-posts cache optimistically in `onMutate`,
 *    BEFORE any request. Demo mode is patch-only (no network, no rollback), so a
 *    seeded cache lets us observe the derived count move by the vote delta.
 *  - A moderator-locked thread replaces the reply composer with a banner, so no
 *    new replies can be posted.
 */
const POSTS_KEY = ["forum-thread-posts", true, "welcome", "en"] as const;

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

describe("useVotePost optimistic patch", () => {
  it("bumps voteCount and sets myVote by the vote delta, in place", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const seeded: InfiniteData<ThreadPostsPage> = {
      pages: [{ items: [post({ voteCount: 3, myVote: 0 })], nextCursor: null }],
      pageParams: [null],
    };
    client.setQueryData(POSTS_KEY, seeded);

    const { result } = renderHook(() => useVotePost(), {
      wrapper: ({ children }) => (
        <TestProviders queryClient={client}>{children}</TestProviders>
      ),
    });

    // Cast an upvote (0 → 1): delta +1.
    result.current.vote("post-42", 1);

    await waitFor(() => {
      const patched =
        client.getQueryData<InfiniteData<ThreadPostsPage>>(POSTS_KEY);
      const patchedPost = patched?.pages[0]?.items[0];
      expect(patchedPost?.myVote).toBe(1);
      expect(patchedPost?.voteCount).toBe(4);
    });
  });
});

/** Minimal, render-safe stubs for the two hook results ThreadReplySection
 *  forwards. With `nodes: []` the reply tree is empty, so none of the callbacks
 *  fire — they exist only to satisfy the prop contract. */
const moderationStub = {
  editingReplyPostId: null,
  setEditingReplyPostId: () => {},
  saveReplyEdit: () => {},
  onReplyDelete: () => {},
  doRestorePost: () => {},
  setHistoryPostId: () => {},
} as unknown as ReturnType<typeof useThreadModeration>;

const nestedRepliesStub = {
  collapsedIds: new Set<string>(),
  toggleCollapse: () => {},
  replyTargetId: null,
  startReply: () => {},
  cancelReply: () => {},
  inlineDraft: "",
  setInlineDraft: () => {},
} as unknown as ReturnType<typeof useNestedReplyComposer>;

function renderReplySection(isLocked: boolean) {
  return render(
    <TestProviders>
      <ThreadReplySection
        sort={REPLY_SORTS[0]!.id}
        setSort={() => {}}
        count={0}
        loading={false}
        isLocked={isLocked}
        nodes={[] as ReplyNode[]}
        replyKey={(reply: Reply) => reply.name}
        likedReplies={{}}
        toggleReplyLike={() => {}}
        hasNextPage={false}
        fetchNextPage={() => {}}
        isFetchingNextPage={false}
        demoMode
        demoOwns={() => false}
        moderation={moderationStub}
        nestedReplies={nestedRepliesStub}
        authorName="Rita V"
        reply=""
        setReply={() => {}}
        onPost={() => {}}
        textareaRef={{ current: null }}
      />
    </TestProviders>,
  );
}

describe("ThreadReplySection lock", () => {
  it("shows the closed-thread banner and no composer when locked", async () => {
    renderReplySection(true);
    expect(
      await screen.findByText("This thread is closed to new replies"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Post reply")).not.toBeInTheDocument();
  });

  it("shows the reply composer when the thread is open", async () => {
    renderReplySection(false);
    expect(await screen.findByText("Post reply")).toBeInTheDocument();
    expect(
      screen.queryByText("This thread is closed to new replies"),
    ).not.toBeInTheDocument();
  });
});
