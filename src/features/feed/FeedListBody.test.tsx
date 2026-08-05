import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { FeedListBody } from "./FeedPage";
import type { FeedItem } from "./api/feed.api";

/**
 * `FeedListBody`'s live branch (Task 9): the `/feed` endpoint returns a
 * single merged `liveItems: FeedItem[]` (Task 7), and this component maps
 * each item to its card by switching on `item.type` — `community_post` via
 * `feedItemToPost` + `CommunityPostCard`, `gathering` → `GatheringCard`,
 * `forum_thread` → `ForumThreadCard`, `new_member` → `MemberCard`. Deliberately
 * NOT grouped by type (that was the old, now-removed `livePosts`/`liveMembers`
 * partitioning), so the fixture below interleaves all four types and the test
 * asserts they render in that exact order.
 */
const COMMUNITY_POST_ITEM: FeedItem = {
  id: "post-1",
  type: "community_post",
  createdAt: "2026-08-04T12:00:00.000Z",
  title: "Trans Wellness Circle",
  summary: "COMMUNITY_POST_UNIQUE_BODY_TEXT",
  link: "/communities/trans-wellness/posts/post-1",
  actor: { handle: "maya", displayName: "Maya Okonkwo", avatarUrl: null },
};

const FORUM_THREAD_ITEM: FeedItem = {
  id: "thread-1",
  type: "forum_thread",
  createdAt: "2026-08-04T11:00:00.000Z",
  title: "FORUM_THREAD_UNIQUE_TITLE",
  summary: "Nightlife · 12 replies",
  link: "/forum/threads/best-bars-porto",
  actor: { handle: "noor", displayName: "Noor Haddad", avatarUrl: null },
};

const GATHERING_ITEM: FeedItem = {
  id: "gathering-1",
  type: "gathering",
  createdAt: "2026-08-04T10:00:00.000Z",
  title: "GATHERING_UNIQUE_TITLE",
  summary: "Casual meetup, all levels welcome.",
  link: "/gatherings/board-games-night",
  actor: { handle: "sam", displayName: "Sam Duarte", avatarUrl: null },
};

const NEW_MEMBER_ITEM: FeedItem = {
  id: "member-1",
  type: "new_member",
  createdAt: "2026-08-04T09:00:00.000Z",
  title: "NEW_MEMBER_UNIQUE_NAME",
  summary: "Photographer, new to the city.",
  link: "/members/new-member-unique",
  actor: {
    handle: "new-member-unique",
    displayName: "NEW_MEMBER_UNIQUE_NAME",
    avatarUrl: null,
  },
};

// Deliberately interleaved, not grouped by type.
const MIXED_TYPE_FEED_ITEMS: FeedItem[] = [
  COMMUNITY_POST_ITEM,
  FORUM_THREAD_ITEM,
  GATHERING_ITEM,
  NEW_MEMBER_ITEM,
];

function renderLiveBody(items: FeedItem[]) {
  return render(
    <TestProviders>
      <FeedListBody
        loading={false}
        demoMode={false}
        isError={false}
        empty={false}
        emptyPanel={null}
        errorPanel={null}
        liveItems={items}
        pulse={[]}
        staticItems={[]}
        revealDelay={(index) => `${index * 40}ms`}
      />
    </TestProviders>,
  );
}

describe("FeedListBody (live mode)", () => {
  it("renders one card per FeedItem type, in the server's item order", async () => {
    renderLiveBody(MIXED_TYPE_FEED_ITEMS);

    // Each card renders its own item's distinguishing text — proves all four
    // types render (gathering/forum_thread previously rendered nothing at
    // all, since the pre-Task-7 hook silently dropped them).
    await screen.findByText(COMMUNITY_POST_ITEM.summary);
    await screen.findByText(FORUM_THREAD_ITEM.title);
    await screen.findByText(GATHERING_ITEM.title);
    await screen.findByText(NEW_MEMBER_ITEM.title);

    // Order preservation: the DOM should read community_post, forum_thread,
    // gathering, new_member — the fixture's order — not regrouped by type.
    const bodyText = document.body.textContent ?? "";
    const communityPostIndex = bodyText.indexOf(COMMUNITY_POST_ITEM.summary);
    const forumThreadIndex = bodyText.indexOf(FORUM_THREAD_ITEM.title);
    const gatheringIndex = bodyText.indexOf(GATHERING_ITEM.title);
    const newMemberIndex = bodyText.indexOf(NEW_MEMBER_ITEM.title);

    expect(communityPostIndex).toBeGreaterThanOrEqual(0);
    expect(forumThreadIndex).toBeGreaterThan(communityPostIndex);
    expect(gatheringIndex).toBeGreaterThan(forumThreadIndex);
    expect(newMemberIndex).toBeGreaterThan(gatheringIndex);
  });

  it("links the community_post card's thread action to the item's own link, not a generic fallback", async () => {
    renderLiveBody(MIXED_TYPE_FEED_ITEMS);

    // `ForumThreadCard` shares the same "Open thread" action label, so this
    // scopes the assertion to whichever such links are present rather than
    // assuming there's exactly one.
    const openThreadLinks = await screen.findAllByRole("link", {
      name: "Open thread",
    });
    const hrefs = openThreadLinks.map((link) => link.getAttribute("href"));

    expect(hrefs).toContain(COMMUNITY_POST_ITEM.link);
    expect(hrefs).not.toContain("/communities");
  });
});
