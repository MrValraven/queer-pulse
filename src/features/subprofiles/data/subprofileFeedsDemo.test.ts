import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { MAX_ITEMS_PER_SECTION } from "../subprofileEditor.data";
import {
  demoConnectFeed,
  demoDisconnectFeed,
  demoDismissEntries,
  demoListEntries,
  demoListFeeds,
  demoPreviewFeed,
  demoPublishEntries,
  demoRestoreEntries,
  demoSyncFeed,
  demoUpdateFeed,
  resetDemoFeedsForTests,
} from "./subprofileFeedsDemo";
import {
  DEMO_EPISODES,
  DEMO_FEED_ID,
  DEMO_FEED_URL,
  DEMO_PODCAST_SUBPROFILE_ID,
  DEMO_PUBLISHED_EPISODE_COUNT,
} from "./subprofileFeeds.data";
import {
  mockPrependSectionItems,
  mockSubprofileById,
  resetDemoEditVersionsForTests,
  resetDemoItemWritesForTests,
} from "./subprofiles.data";

const PERSONA = DEMO_PODCAST_SUBPROFILE_ID;

const episodeTitles = () =>
  mockSubprofileById(PERSONA)
    ?.items.filter((item) => item.section === "episodes")
    .map((item) => item.title) ?? [];

function expectRefusal(action: () => unknown, status: number, code?: string) {
  try {
    action();
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(status);
    if (code) expect((error as ApiError).data).toMatchObject({ code });
    return;
  }
  throw new Error("expected the call to be refused");
}

beforeEach(() => {
  resetDemoFeedsForTests();
  resetDemoItemWritesForTests();
  resetDemoEditVersionsForTests();
});
afterEach(() => {
  resetDemoFeedsForTests();
  resetDemoItemWritesForTests();
  resetDemoEditVersionsForTests();
});

describe("demo feed fixtures", () => {
  it("is a believable show: twelve episodes, some numbered, all with a length", () => {
    expect(DEMO_EPISODES).toHaveLength(12);
    expect(DEMO_EPISODES.some((episode) => episode.season !== null)).toBe(true);
    expect(DEMO_EPISODES.some((episode) => episode.season === null)).toBe(true);
    expect(
      DEMO_EPISODES.every((episode) => (episode.durationSeconds ?? 0) > 0),
    ).toBe(true);
  });

  it("seeds the demo persona with a feed: its oldest episodes published, the rest waiting", () => {
    const [feed] = demoListFeeds(PERSONA);
    expect(feed).toMatchObject({
      id: DEMO_FEED_ID,
      feedUrl: DEMO_FEED_URL,
      section: "episodes",
      autoPublish: false,
      status: "active",
      publishedCount: DEMO_PUBLISHED_EPISODE_COUNT,
      pendingCount: DEMO_EPISODES.length - DEMO_PUBLISHED_EPISODE_COUNT,
    });
    expect(episodeTitles()).toHaveLength(DEMO_PUBLISHED_EPISODE_COUNT);
  });
});

describe("demoPreviewFeed", () => {
  it("previews any URL that looks like a feed: newest five, no images", () => {
    const preview = demoPreviewFeed("https://example.com/feed.xml", PERSONA);
    expect(preview.feedUrl).toBe("https://example.com/feed.xml");
    expect(preview.episodeCount).toBe(12);
    expect(preview.latest).toHaveLength(5);
    expect(preview.latest[0]?.title).toBe(DEMO_EPISODES[0]?.title);
    expect(preview.alreadyConnected).toBe(false);
    expect(JSON.stringify(preview)).not.toMatch(/image/i);
  });

  it("flags a feed already connected to the persona", () => {
    expect(demoPreviewFeed(DEMO_FEED_URL, PERSONA).alreadyConnected).toBe(true);
  });

  it("refuses an address that is not a feed, and the failures it is asked to fake", () => {
    expectRefusal(
      () => demoPreviewFeed("https://example.com/about"),
      422,
      "not_a_feed",
    );
    expectRefusal(() => demoPreviewFeed("not a url"), 422, "not_a_feed");
    expectRefusal(
      () => demoPreviewFeed("https://unreachable.example/rss"),
      422,
      "unreachable",
    );
    expectRefusal(
      () => demoPreviewFeed("https://timeout.example/rss"),
      422,
      "timeout",
    );
  });
});

describe("demoConnectFeed", () => {
  it("backfill 'all' offers every episode for review", () => {
    const feed = demoConnectFeed(PERSONA, {
      url: "https://example.com/rss",
      section: "episodes",
      backfill: "all",
    });
    expect(feed).toMatchObject({
      autoPublish: false,
      pendingCount: 12,
      publishedCount: 0,
      section: "episodes",
    });
    expect(demoListEntries(PERSONA, feed.id, "pending")).toHaveLength(12);
  });

  it("backfill 'none' sets the current episodes aside, restorable", () => {
    const feed = demoConnectFeed(PERSONA, {
      url: "https://example.com/rss",
      section: "episodes",
      backfill: "none",
    });
    expect(feed.pendingCount).toBe(0);
    const dismissed = demoListEntries(PERSONA, feed.id, "dismissed");
    expect(dismissed).toHaveLength(12);
    demoRestoreEntries(PERSONA, feed.id, [dismissed[0]?.id ?? ""]);
    expect(demoListEntries(PERSONA, feed.id, "pending")).toHaveLength(1);
  });

  it("refuses a URL connected twice, a fourth feed, and a section the kind lacks", () => {
    expectRefusal(
      () =>
        demoConnectFeed(PERSONA, {
          url: DEMO_FEED_URL,
          section: "episodes",
          backfill: "all",
        }),
      409,
      "FEED_ALREADY_CONNECTED",
    );
    expectRefusal(
      () =>
        demoConnectFeed(PERSONA, {
          url: "https://example.com/rss",
          section: "gigs",
          backfill: "all",
        }),
      400,
    );
    for (const host of ["a", "b"]) {
      demoConnectFeed(PERSONA, {
        url: `https://${host}.example.com/rss`,
        section: "episodes",
        backfill: "none",
      });
    }
    expectRefusal(
      () =>
        demoConnectFeed(PERSONA, {
          url: "https://c.example.com/rss",
          section: "episodes",
          backfill: "none",
        }),
      422,
      "FEED_LIMIT",
    );
  });
});

describe("demoPublishEntries", () => {
  const pendingIds = () =>
    demoListEntries(PERSONA, DEMO_FEED_ID, "pending").map((entry) => entry.id);

  it("puts the episodes at the top of the section, newest first, in the store the editor reads", () => {
    const before = episodeTitles();
    const result = demoPublishEntries(PERSONA, DEMO_FEED_ID, {
      // Out of order on purpose: the newest still lands first.
      entryIds: [...pendingIds()].reverse(),
    });
    expect(result).toMatchObject({ published: 5, skipped: 0 });
    const after = episodeTitles();
    expect(after).toEqual([
      ...DEMO_EPISODES.slice(0, 5).map((episode) => episode.title),
      ...before,
    ]);
    // The same store answers a fresh owner read.
    expect(episodeTitles()).toEqual(after);
    expect(
      result.subprofile.items.filter((item) => item.section === "episodes"),
    ).toHaveLength(12);
  });

  it("maps an episode the way the server does", () => {
    demoPublishEntries(PERSONA, DEMO_FEED_ID, { entryIds: pendingIds() });
    const newest = mockSubprofileById(PERSONA)?.items.find(
      (item) => item.section === "episodes",
    );
    expect(newest).toMatchObject({
      title: "The second coming out",
      subtitle: "S2 · E10",
      date: "2026-09",
      meta: "48 min",
      url: "https://latebloomers.example/episodes/the-second-coming-out",
    });
  });

  it("moves the entries from pending to published and updates the counts", () => {
    demoPublishEntries(PERSONA, DEMO_FEED_ID, { entryIds: pendingIds() });
    expect(pendingIds()).toHaveLength(0);
    expect(demoListFeeds(PERSONA)[0]).toMatchObject({
      pendingCount: 0,
      publishedCount: DEMO_EPISODES.length,
    });
  });

  it("raises the persona's editVersion, and refuses a stale expectedEditVersion", () => {
    const startVersion = mockSubprofileById(PERSONA)?.editVersion ?? 0;
    const first = demoPublishEntries(PERSONA, DEMO_FEED_ID, {
      entryIds: pendingIds().slice(0, 1),
      expectedEditVersion: startVersion,
    });
    expect(first.subprofile.editVersion).toBe(startVersion + 1);
    expectRefusal(
      () =>
        demoPublishEntries(PERSONA, DEMO_FEED_ID, {
          entryIds: pendingIds().slice(0, 1),
          expectedEditVersion: startVersion,
        }),
      409,
      "PERSONA_EDIT_CONFLICT",
    );
  });

  it("fills the room left under the 100-item cap newest-first and skips the rest", () => {
    const filler = Array.from({ length: 90 }, (_, index) => ({
      id: `filler-${index}`,
      section: "episodes" as const,
      createdAt: "2026-01-01T00:00:00.000Z",
      title: `Filler ${index}`,
      tags: [],
      isFeatured: false,
      collaborators: [],
    }));
    mockPrependSectionItems(PERSONA, "episodes", filler);
    // 7 + 90 = 97 in the section: room for 3 of the 5 waiting.
    const result = demoPublishEntries(PERSONA, DEMO_FEED_ID, {
      entryIds: pendingIds(),
    });
    expect(result).toMatchObject({ published: 3, skipped: 2 });
    expect(episodeTitles()).toHaveLength(MAX_ITEMS_PER_SECTION);
    expect(episodeTitles().slice(0, 3)).toEqual(
      DEMO_EPISODES.slice(0, 3).map((episode) => episode.title),
    );
    // The two that did not fit are still waiting.
    expect(pendingIds()).toHaveLength(2);
  });

  it("answers SECTION_FULL when the section has no room at all", () => {
    const filler = Array.from({ length: 93 }, (_, index) => ({
      id: `filler-${index}`,
      section: "episodes" as const,
      createdAt: "2026-01-01T00:00:00.000Z",
      title: `Filler ${index}`,
      tags: [],
      isFeatured: false,
      collaborators: [],
    }));
    mockPrependSectionItems(PERSONA, "episodes", filler);
    expectRefusal(
      () =>
        demoPublishEntries(PERSONA, DEMO_FEED_ID, { entryIds: pendingIds() }),
      422,
      "SECTION_FULL",
    );
  });

  it("ignores entries that are not waiting", () => {
    const dismissedId = pendingIds()[0] ?? "";
    demoDismissEntries(PERSONA, DEMO_FEED_ID, [dismissedId]);
    const result = demoPublishEntries(PERSONA, DEMO_FEED_ID, {
      entryIds: [dismissedId],
    });
    // The server counts every requested id it did not publish as skipped.
    expect(result).toMatchObject({ published: 0, skipped: 1 });
  });
});

describe("dismiss, restore, sync, update, disconnect", () => {
  it("dismisses and restores waiting episodes", () => {
    const waiting = demoListEntries(PERSONA, DEMO_FEED_ID, "pending");
    const ids = waiting.slice(0, 2).map((entry) => entry.id);
    expect(demoDismissEntries(PERSONA, DEMO_FEED_ID, ids)).toEqual({
      dismissed: 2,
    });
    expect(demoListEntries(PERSONA, DEMO_FEED_ID, "dismissed")).toHaveLength(2);
    expect(demoRestoreEntries(PERSONA, DEMO_FEED_ID, ids)).toEqual({
      restored: 2,
    });
    expect(demoListEntries(PERSONA, DEMO_FEED_ID, "pending")).toHaveLength(
      waiting.length,
    );
  });

  it("Check now finds a new episode once, then answers 429 inside the cooldown", () => {
    const before = demoListFeeds(PERSONA)[0]?.pendingCount ?? 0;
    const checked = demoSyncFeed(PERSONA, DEMO_FEED_ID);
    expect(checked.pendingCount).toBe(before + 1);
    expectRefusal(
      () => demoSyncFeed(PERSONA, DEMO_FEED_ID),
      429,
      "SYNC_TOO_SOON",
    );
  });

  it("an auto-publish feed puts what it finds straight on the page", () => {
    demoUpdateFeed(PERSONA, DEMO_FEED_ID, { autoPublish: true });
    const before = episodeTitles().length;
    const checked = demoSyncFeed(PERSONA, DEMO_FEED_ID);
    expect(episodeTitles()).toHaveLength(before + 1);
    expect(episodeTitles()[0]).toBe("Small rituals");
    expect(checked.publishedCount).toBe(DEMO_PUBLISHED_EPISODE_COUNT + 1);
  });

  it("updates a feed's section and auto-publish", () => {
    const updated = demoUpdateFeed(PERSONA, DEMO_FEED_ID, {
      section: "appearances",
      autoPublish: true,
    });
    expect(updated).toMatchObject({
      section: "appearances",
      autoPublish: true,
    });
  });

  it("disconnecting leaves the published items on the persona", () => {
    const before = episodeTitles();
    demoDisconnectFeed(PERSONA, DEMO_FEED_ID);
    expect(demoListFeeds(PERSONA)).toHaveLength(0);
    expect(episodeTitles()).toEqual(before);
    expectRefusal(() => demoSyncFeed(PERSONA, DEMO_FEED_ID), 404);
  });
});
