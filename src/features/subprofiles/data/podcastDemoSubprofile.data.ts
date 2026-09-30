import { entryToItem } from "../api/feedEpisodeMapping";
import { currentUserSlug } from "../../members/data/demoCurrentUser";
import type { DemoSubprofile } from "./subprofiles.data";
import {
  DEMO_PODCAST_SUBPROFILE_ID,
  buildSeedEntries,
} from "./subprofileFeeds.data";

// ── Demo podcaster persona ───────────────────────────────────────────────────
// The demo viewer's own podcast, so the Import pane (podcast RSS import) has a
// persona to live on in demo mode. Its `episodes` section already holds the
// oldest episodes of the seeded feed, mapped exactly as a real publish would
// write them; the newest are waiting in the feed's review queue
// (`subprofileFeedsDemo.ts`).

const PUBLISHED_SEED_DATE = "2026-09-22T08:30:00.000Z";

const publishedEpisodeItems = buildSeedEntries()
  .filter((entry) => entry.status === "published")
  .map((entry) => entryToItem(entry, "episodes", PUBLISHED_SEED_DATE));

export const LATE_BLOOMERS: DemoSubprofile = {
  ownerSlug: currentUserSlug,
  ownerName: "Tiago Costa",
  id: DEMO_PODCAST_SUBPROFILE_ID,
  kind: "podcaster",
  slug: "late-bloomers",
  handle: "late-bloomers",
  displayName: "Late Bloomers",
  avatarUrl: null,
  tagline: "A podcast for people who found themselves later than expected",
  bio: "Two friends, one kitchen table and a microphone. We talk about coming out late, dating again, chosen family and the small rituals that get us through. New episodes every other Monday.",
  coverUrl: null,
  accent: "jade",
  availability: null,
  ctaLabel: "Listen wherever you get podcasts",
  ctaUrl: "https://latebloomers.example",
  socialLinks: [{ platform: "instagram", urlOrHandle: "@latebloomers.pod" }],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  position: 1,
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 41,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  items: [
    ...publishedEpisodeItems,
    {
      id: "itm-appearances-queer-radio-lisboa",
      section: "appearances",
      createdAt: "2026-05-04T10:00:00.000Z",
      title: "Queer Radio Lisboa, guest spot",
      subtitle: null,
      description:
        "An hour on the air about why late-blooming stories matter, with live calls from listeners.",
      url: null,
      imageUrl: null,
      date: "2026-05",
      meta: null,
      tags: [],
      isFeatured: false,
      collaborators: [],
    },
  ],
};
