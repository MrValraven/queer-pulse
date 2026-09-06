import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { FeedListBody } from "./FeedPage";
import type { FeedItem } from "./api/feed.api";

/**
 * `FeedListBody`'s live branch (Task 9): the `/feed` endpoint returns a
 * single merged `liveItems: FeedItem[]` (Task 7), and this component maps
 * each item to its card by switching on `item.type` — `community_post` via
 * `feedItemToPost` + `CommunityPostCard`, `gathering` → `GatheringCard`,
 * `forum_thread` → `ForumThreadCard`, `new_member` → `MemberCard`, and
 * (PRD-107) `article` → `ArticleCard`. Deliberately NOT grouped by type (that
 * was the old, now-removed `livePosts`/`liveMembers` partitioning), so the
 * fixture below interleaves all five types and the test asserts they render in
 * that exact order.
 */
const COMMUNITY_POST_ITEM: FeedItem = {
  id: "post-1",
  type: "community_post",
  createdAt: "2026-08-04T12:00:00.000Z",
  title: "Trans Wellness Circle",
  summary: "COMMUNITY_POST_UNIQUE_BODY_TEXT",
  link: "/community/trans-wellness/post/post-1",
  actor: { handle: "maya", displayName: "Maya Okonkwo", avatarUrl: null },
  // SOC-04/SOC-18 signals the backend now carries on every ranked item.
  reason: "membership",
  reasonSubject: "Trans Wellness Circle",
  reactionCount: 3,
  replyCount: 2,
  myReaction: null,
  source: {
    kind: "community",
    id: "community-1",
    name: "Trans Wellness Circle",
  },
};

const FORUM_THREAD_ITEM: FeedItem = {
  id: "thread-1",
  type: "forum_thread",
  createdAt: "2026-08-04T11:00:00.000Z",
  title: "FORUM_THREAD_UNIQUE_TITLE",
  summary: "Nightlife · 12 replies",
  link: "/thread/best-bars-porto",
  actor: { handle: "noor", displayName: "Noor Haddad", avatarUrl: null },
  reason: "topic",
  reasonSubject: "nightlife",
  replyCount: 12,
  source: {
    kind: "forum_thread",
    id: "thread-1",
    name: "FORUM_THREAD_UNIQUE_TITLE",
  },
};

const GATHERING_ITEM: FeedItem = {
  id: "gathering-1",
  type: "gathering",
  createdAt: "2026-08-04T10:00:00.000Z",
  title: "GATHERING_UNIQUE_TITLE",
  summary: "Casual meetup, all levels welcome.",
  link: "/gatherings/board-games-night",
  actor: { handle: "sam", displayName: "Sam Duarte", avatarUrl: null },
  reason: "recent",
  reasonSubject: null,
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

/**
 * PRD-107: a published magazine piece. `title` is the headline and `summary`
 * the dek; the magazine's own furniture rides alongside. `byline` is a
 * `magazine_author`, which is why `actor` is null here: this contributor is
 * credited by name only and holds no member account.
 */
const ARTICLE_ITEM: FeedItem = {
  id: "article-1",
  type: "article",
  createdAt: "2026-08-04T08:00:00.000Z",
  title: "ARTICLE_UNIQUE_HEADLINE",
  summary: "ARTICLE_UNIQUE_DEK",
  link: "/magazine/article?id=a-room-of-our-own",
  actor: null,
  kicker: "Housing",
  section: "Features",
  readMinutes: 9,
  imageUrl: null,
  locale: "en",
  byline: { name: "Rita Mendes", slug: "rita-mendes", avatarUrl: null },
  reason: "recent",
  reasonSubject: null,
};

// Deliberately interleaved, not grouped by type.
const MIXED_TYPE_FEED_ITEMS: FeedItem[] = [
  COMMUNITY_POST_ITEM,
  FORUM_THREAD_ITEM,
  GATHERING_ITEM,
  NEW_MEMBER_ITEM,
  ARTICLE_ITEM,
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

    // Each card renders its own item's distinguishing text, proving all five
    // types render (gathering/forum_thread previously rendered nothing at
    // all, since the pre-Task-7 hook silently dropped them; `article` reached
    // the switch's `default: null` before PRD-107).
    await screen.findByText(COMMUNITY_POST_ITEM.summary);
    await screen.findByText(FORUM_THREAD_ITEM.title);
    await screen.findByText(GATHERING_ITEM.title);
    await screen.findByText(NEW_MEMBER_ITEM.title);
    await screen.findByText(ARTICLE_ITEM.title);

    // Order preservation: the DOM should read community_post, forum_thread,
    // gathering, new_member, article, which is the fixture's order, not regrouped by
    // type.
    const bodyText = document.body.textContent ?? "";
    const communityPostIndex = bodyText.indexOf(COMMUNITY_POST_ITEM.summary);
    const forumThreadIndex = bodyText.indexOf(FORUM_THREAD_ITEM.title);
    const gatheringIndex = bodyText.indexOf(GATHERING_ITEM.title);
    const newMemberIndex = bodyText.indexOf(NEW_MEMBER_ITEM.title);
    const articleIndex = bodyText.indexOf(ARTICLE_ITEM.title);

    expect(communityPostIndex).toBeGreaterThanOrEqual(0);
    expect(forumThreadIndex).toBeGreaterThan(communityPostIndex);
    expect(gatheringIndex).toBeGreaterThan(forumThreadIndex);
    expect(newMemberIndex).toBeGreaterThan(gatheringIndex);
    expect(articleIndex).toBeGreaterThan(newMemberIndex);
  });

  it("renders a magazine article's headline, dek and byline, linked to the piece (PRD-107)", async () => {
    renderLiveBody([ARTICLE_ITEM]);

    await screen.findByText(ARTICLE_ITEM.title);
    await screen.findByText(ARTICLE_ITEM.summary);

    // The card opens the piece at the slug the backend addressed it by.
    const articleLinks = await screen.findAllByRole("link");
    const hrefs = articleLinks.map((link) => link.getAttribute("href"));
    expect(hrefs).toContain(ARTICLE_ITEM.link);
    // The byline is a magazine author page, never a member profile: a
    // contributor credited by name only has no account to link to.
    expect(hrefs).toContain("/magazine/author/rita-mendes");
    expect(hrefs).not.toContain("/members/rita-mendes");
  });

  it("credits the desk when a piece carries no byline row", async () => {
    renderLiveBody([{ ...ARTICLE_ITEM, byline: null }]);

    await screen.findByText(ARTICLE_ITEM.title);
    const hrefs = (await screen.findAllByRole("link")).map((link) =>
      link.getAttribute("href"),
    );
    // No byline, so no author link at all. Never a link to nowhere.
    expect(hrefs.some((href) => href?.startsWith("/magazine/author/"))).toBe(
      false,
    );
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

  it("says why a ranked item is in the feed, naming the fact behind it (SOC-04)", async () => {
    renderLiveBody(MIXED_TYPE_FEED_ITEMS);

    // Membership names the community; a followed topic names the topic; an
    // item with no explicit tie says exactly that and nothing more.
    await screen.findByText("You're in Trans Wellness Circle");
    await screen.findByText("You follow nightlife");
    await screen.findByText("New across QueerPulse");
  });

  it("renders the community_post card's inline reaction and reply controls with the item's counts (SOC-04)", async () => {
    renderLiveBody([COMMUNITY_POST_ITEM]);

    const reactButton = await screen.findByRole("button", {
      name: "Like post",
    });
    expect(reactButton).toHaveAttribute("aria-pressed", "false");
    expect(reactButton).toHaveTextContent("Count me in · 3");

    const replyButton = await screen.findByRole("button", {
      name: "Reply to post",
    });
    expect(replyButton).toHaveTextContent("Reply · 2");
  });

  it("shows an already-reacted post as pressed", async () => {
    renderLiveBody([{ ...COMMUNITY_POST_ITEM, myReaction: "like" }]);

    const reactButton = await screen.findByRole("button", {
      name: "Unlike post",
    });
    expect(reactButton).toHaveAttribute("aria-pressed", "true");
  });

  it("opens an inline reply composer instead of navigating away (SOC-04)", async () => {
    const user = userEvent.setup();
    renderLiveBody([COMMUNITY_POST_ITEM]);

    await user.click(
      await screen.findByRole("button", { name: "Reply to post" }),
    );

    expect(await screen.findByLabelText("Write a reply")).toBeInTheDocument();
  });

  it("offers 'show less of this' for the card's own source, never for the person (SOC-18)", async () => {
    const user = userEvent.setup();
    renderLiveBody([COMMUNITY_POST_ITEM]);

    await user.click(
      await screen.findByRole("button", { name: "Post options" }),
    );
    const menu = await screen.findByRole("menu");

    // The community is the source; muting it is a feed preference, so the
    // copy must never read as leaving.
    within(menu).getByRole("menuitem", {
      name: "Show less of Trans Wellness Circle",
    });
    // The person-scoped mute is a separate, existing affordance.
    within(menu).getByRole("menuitem", { name: "Mute Maya Okonkwo" });
  });
});
