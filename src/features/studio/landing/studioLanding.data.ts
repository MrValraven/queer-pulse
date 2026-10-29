import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiDisc,
  FiEye,
  FiSend,
  FiTool,
  FiUploadCloud,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import type { Theme } from "../../../app/providers/themeContext";
import type { StudioLandingListenReason } from "../api/studioLanding.api";

/**
 * Static data for the Studio landing page (`landing/StudioLandingPage`).
 * Every catalog key is written out in full as a quoted string literal with
 * the studio namespace prefix, so the key tests can find each one by reading
 * this file.
 */

export type StudioLandingDevice = "laptop" | "phone";

export type StudioLandingScreenId =
  "home" | "artist" | "release" | "playlists" | "player" | "share";

export interface StudioLandingShot {
  fileBase: string;
  device: StudioLandingDevice;
  width: number;
  height: number;
  altKey: string;
}

/** Who the visitor says they are, picked with the hero's audience switch. */
export type StudioLandingAudience = "listener" | "artist";

/** The sections that follow the hero; their order follows the audience. */
export type StudioLandingSectionId =
  | "proof"
  | "listen"
  | "artists"
  | "forArtists"
  | "story"
  | "compare"
  | "plan"
  | "faq"
  | "next"
  | "team"
  | "manifesto";

export interface StudioLandingScreen {
  screenId: StudioLandingScreenId;
  /** The step title in the scroll story. */
  titleKey: string;
  captionKey: string;
  /** The shot shown from 720px up. */
  shot: StudioLandingShot;
  /** The shot shown below 720px, always a phone shot. */
  phoneShot: StudioLandingShot;
}

export interface StudioLandingPoint {
  pointId: string;
  titleKey: string;
  bodyKey: string;
  Icon: IconType;
}

/** One comparison topic with an answer for each of the three columns. */
export interface StudioLandingComparisonRow {
  rowId: string;
  topicKey: string;
  /** Streaming apps (Spotify, Apple Music). */
  streamingKey: string;
  /** Artist platforms (Bandcamp, SoundCloud). */
  platformsKey: string;
  studioKey: string;
}

export interface StudioLandingFaqItem {
  itemId: string;
  questionKey: string;
  answerKey: string;
}

/** Remembers the audience switch per viewer. Nothing is sent to the server. */
export const STUDIO_LANDING_AUDIENCE_STORAGE_KEY =
  "qp.studioLanding.audience.v1";

/** The For artists section, and the `#artists` hash that opens the page on it. */
export const STUDIO_LANDING_ARTISTS_ID = "artists";
export const STUDIO_LANDING_LISTEN_ID = "studio-hear-it-first";
export const STUDIO_LANDING_STORY_ID = "studio-how-it-works";
export const STUDIO_LANDING_STORY_HEADING_ID = "studio-how-it-works-heading";

/**
 * The order of the sections after the hero. Both lists hold the same ids:
 * "I make music" brings For artists up to right after the proof strip.
 */
export const STUDIO_LANDING_SECTION_ORDER: Record<
  StudioLandingAudience,
  readonly StudioLandingSectionId[]
> = {
  listener: [
    "proof",
    "listen",
    "artists",
    "forArtists",
    "story",
    "compare",
    "plan",
    "faq",
    "next",
    "team",
    "manifesto",
  ],
  artist: [
    "proof",
    "forArtists",
    "listen",
    "artists",
    "story",
    "compare",
    "plan",
    "faq",
    "next",
    "team",
    "manifesto",
  ],
};

export const STUDIO_LANDING_IMAGE_DIR = "/studio-landing";

/** Below 720px the landing shows phone shots and drops the hero laptop. */
export const STUDIO_LANDING_PHONE_QUERY = "(max-width: 719px)";

export const STUDIO_LANDING_SHOT_SIZES: Record<
  StudioLandingDevice,
  { width: number; height: number }
> = {
  laptop: { width: 1600, height: 1000 },
  phone: { width: 640, height: 1385 },
};

/** Public path of a screenshot for one theme, such as `/studio-landing/home-desktop-dark.webp`. */
export function studioLandingShotSrc(
  shot: StudioLandingShot,
  theme: Theme,
): string {
  return `${STUDIO_LANDING_IMAGE_DIR}/${shot.fileBase}-${theme}.webp`;
}

const HOME_SHOT: StudioLandingShot = {
  fileBase: "home-desktop",
  device: "laptop",
  ...STUDIO_LANDING_SHOT_SIZES.laptop,
  altKey: "studio:landing.gallery.home.alt",
};

const ARTIST_SHOT: StudioLandingShot = {
  fileBase: "artist-desktop",
  device: "laptop",
  ...STUDIO_LANDING_SHOT_SIZES.laptop,
  altKey: "studio:landing.gallery.artist.alt",
};

const RELEASE_SHOT: StudioLandingShot = {
  fileBase: "release-desktop",
  device: "laptop",
  ...STUDIO_LANDING_SHOT_SIZES.laptop,
  altKey: "studio:landing.gallery.release.alt",
};

const PLAYLISTS_SHOT: StudioLandingShot = {
  fileBase: "playlists-desktop",
  device: "laptop",
  ...STUDIO_LANDING_SHOT_SIZES.laptop,
  altKey: "studio:landing.gallery.playlists.alt",
};

/* Phone captures of the four laptop screens, for the story below 720px.
   Each has its own alt key, since the phone frame shows less of the page. */
const HOME_PHONE_SHOT: StudioLandingShot = {
  fileBase: "home-phone",
  device: "phone",
  ...STUDIO_LANDING_SHOT_SIZES.phone,
  altKey: "studio:landing.gallery.home.phoneAlt",
};

const ARTIST_PHONE_SHOT: StudioLandingShot = {
  fileBase: "artist-phone",
  device: "phone",
  ...STUDIO_LANDING_SHOT_SIZES.phone,
  altKey: "studio:landing.gallery.artist.phoneAlt",
};

const RELEASE_PHONE_SHOT: StudioLandingShot = {
  fileBase: "release-phone",
  device: "phone",
  ...STUDIO_LANDING_SHOT_SIZES.phone,
  altKey: "studio:landing.gallery.release.phoneAlt",
};

const PLAYLISTS_PHONE_SHOT: StudioLandingShot = {
  fileBase: "playlists-phone",
  device: "phone",
  ...STUDIO_LANDING_SHOT_SIZES.phone,
  altKey: "studio:landing.gallery.playlists.phoneAlt",
};

const PLAYER_SHOT: StudioLandingShot = {
  fileBase: "player-phone",
  device: "phone",
  ...STUDIO_LANDING_SHOT_SIZES.phone,
  altKey: "studio:landing.gallery.player.alt",
};

const SHARE_SHOT: StudioLandingShot = {
  fileBase: "share-phone",
  device: "phone",
  ...STUDIO_LANDING_SHOT_SIZES.phone,
  altKey: "studio:landing.gallery.share.alt",
};

export const STUDIO_LANDING_SCREENS: readonly StudioLandingScreen[] = [
  {
    screenId: "home",
    titleKey: "studio:landing.gallery.home.tab",
    captionKey: "studio:landing.gallery.home.caption",
    shot: HOME_SHOT,
    phoneShot: HOME_PHONE_SHOT,
  },
  {
    screenId: "artist",
    titleKey: "studio:landing.gallery.artist.tab",
    captionKey: "studio:landing.gallery.artist.caption",
    shot: ARTIST_SHOT,
    phoneShot: ARTIST_PHONE_SHOT,
  },
  {
    screenId: "release",
    titleKey: "studio:landing.gallery.release.tab",
    captionKey: "studio:landing.gallery.release.caption",
    shot: RELEASE_SHOT,
    phoneShot: RELEASE_PHONE_SHOT,
  },
  {
    screenId: "playlists",
    titleKey: "studio:landing.gallery.playlists.tab",
    captionKey: "studio:landing.gallery.playlists.caption",
    shot: PLAYLISTS_SHOT,
    phoneShot: PLAYLISTS_PHONE_SHOT,
  },
  {
    screenId: "player",
    titleKey: "studio:landing.gallery.player.tab",
    captionKey: "studio:landing.gallery.player.caption",
    shot: PLAYER_SHOT,
    phoneShot: PLAYER_SHOT,
  },
  {
    screenId: "share",
    titleKey: "studio:landing.gallery.share.tab",
    captionKey: "studio:landing.gallery.share.caption",
    shot: SHARE_SHOT,
    phoneShot: SHARE_SHOT,
  },
];

/** The hero pairs the home screen on a laptop with the player on a phone. */
export const STUDIO_LANDING_HERO_SHOTS: {
  laptop: StudioLandingShot;
  phone: StudioLandingShot;
} = {
  laptop: HOME_SHOT,
  phone: PLAYER_SHOT,
};

/** The For artists section shows the artist dashboard, captured like the
 *  story shots by `scripts/capture-studio-landing-shots.mjs`. */
export const STUDIO_LANDING_ARTIST_SHOTS: {
  laptop: StudioLandingShot;
  phone: StudioLandingShot;
} = {
  laptop: {
    fileBase: "dashboard-desktop",
    device: "laptop",
    ...STUDIO_LANDING_SHOT_SIZES.laptop,
    altKey: "studio:landing.forArtists.shot.alt",
  },
  phone: {
    fileBase: "dashboard-phone",
    device: "phone",
    ...STUDIO_LANDING_SHOT_SIZES.phone,
    altKey: "studio:landing.forArtists.shot.phoneAlt",
  },
};

/** Side by side: nine topics, each answered for streaming apps, artist
 *  platforms and Studio. */
export const STUDIO_LANDING_COMPARISON_ROWS: readonly StudioLandingComparisonRow[] =
  [
    {
      rowId: "featured",
      topicKey: "studio:landing.compare.featured.topic",
      streamingKey: "studio:landing.compare.featured.streaming",
      platformsKey: "studio:landing.compare.featured.platforms",
      studioKey: "studio:landing.compare.featured.studio",
    },
    {
      rowId: "releasing",
      topicKey: "studio:landing.compare.releasing.topic",
      streamingKey: "studio:landing.compare.releasing.streaming",
      platformsKey: "studio:landing.compare.releasing.platforms",
      studioKey: "studio:landing.compare.releasing.studio",
    },
    {
      rowId: "stageName",
      topicKey: "studio:landing.compare.stageName.topic",
      streamingKey: "studio:landing.compare.stageName.streaming",
      platformsKey: "studio:landing.compare.stageName.platforms",
      studioKey: "studio:landing.compare.stageName.studio",
    },
    {
      rowId: "ads",
      topicKey: "studio:landing.compare.ads.topic",
      streamingKey: "studio:landing.compare.ads.streaming",
      platformsKey: "studio:landing.compare.ads.platforms",
      studioKey: "studio:landing.compare.ads.studio",
    },
    {
      rowId: "listening",
      topicKey: "studio:landing.compare.listening.topic",
      streamingKey: "studio:landing.compare.listening.streaming",
      platformsKey: "studio:landing.compare.listening.platforms",
      studioKey: "studio:landing.compare.listening.studio",
    },
    {
      rowId: "fans",
      topicKey: "studio:landing.compare.fans.topic",
      streamingKey: "studio:landing.compare.fans.streaming",
      platformsKey: "studio:landing.compare.fans.platforms",
      studioKey: "studio:landing.compare.fans.studio",
    },
    {
      rowId: "safety",
      topicKey: "studio:landing.compare.safety.topic",
      streamingKey: "studio:landing.compare.safety.streaming",
      platformsKey: "studio:landing.compare.safety.platforms",
      studioKey: "studio:landing.compare.safety.studio",
    },
    {
      rowId: "scene",
      topicKey: "studio:landing.compare.scene.topic",
      streamingKey: "studio:landing.compare.scene.streaming",
      platformsKey: "studio:landing.compare.scene.platforms",
      studioKey: "studio:landing.compare.scene.studio",
    },
    {
      rowId: "owner",
      topicKey: "studio:landing.compare.owner.topic",
      streamingKey: "studio:landing.compare.owner.streaming",
      platformsKey: "studio:landing.compare.owner.platforms",
      studioKey: "studio:landing.compare.owner.studio",
    },
  ];

/** What artists get on Studio today, in the For artists section. */
export const STUDIO_LANDING_FOR_ARTISTS_POINTS: readonly StudioLandingPoint[] =
  [
    {
      pointId: "upload",
      titleKey: "studio:landing.forArtists.upload.title",
      bodyKey: "studio:landing.forArtists.upload.body",
      Icon: FiUploadCloud,
    },
    {
      pointId: "persona",
      titleKey: "studio:landing.forArtists.persona.title",
      bodyKey: "studio:landing.forArtists.persona.body",
      Icon: FiUser,
    },
    {
      pointId: "numbers",
      titleKey: "studio:landing.forArtists.numbers.title",
      bodyKey: "studio:landing.forArtists.numbers.body",
      Icon: FiBarChart2,
    },
    {
      pointId: "tools",
      titleKey: "studio:landing.forArtists.tools.title",
      bodyKey: "studio:landing.forArtists.tools.body",
      Icon: FiTool,
    },
    {
      pointId: "events",
      titleKey: "studio:landing.forArtists.events.title",
      bodyKey: "studio:landing.forArtists.events.body",
      Icon: FiCalendar,
    },
  ];

export const STUDIO_LANDING_FAQ: readonly StudioLandingFaqItem[] = [
  {
    itemId: "free",
    questionKey: "studio:landing.faq.free.question",
    answerKey: "studio:landing.faq.free.answer",
  },
  {
    itemId: "later",
    questionKey: "studio:landing.faq.later.question",
    answerKey: "studio:landing.faq.later.answer",
  },
  {
    itemId: "spotify",
    questionKey: "studio:landing.faq.spotify.question",
    answerKey: "studio:landing.faq.spotify.answer",
  },
  {
    itemId: "ownership",
    questionKey: "studio:landing.faq.ownership.question",
    answerKey: "studio:landing.faq.ownership.answer",
  },
  {
    itemId: "elsewhere",
    questionKey: "studio:landing.faq.elsewhere.question",
    answerKey: "studio:landing.faq.elsewhere.answer",
  },
  {
    itemId: "stageName",
    questionKey: "studio:landing.faq.stageName.question",
    answerKey: "studio:landing.faq.stageName.answer",
  },
  {
    itemId: "listening",
    questionKey: "studio:landing.faq.listening.question",
    answerKey: "studio:landing.faq.listening.answer",
  },
  {
    itemId: "cut",
    questionKey: "studio:landing.faq.cut.question",
    answerKey: "studio:landing.faq.cut.answer",
  },
  {
    itemId: "upload",
    questionKey: "studio:landing.faq.upload.question",
    answerKey: "studio:landing.faq.upload.answer",
  },
  {
    itemId: "getIn",
    questionKey: "studio:landing.faq.getIn.question",
    answerKey: "studio:landing.faq.getIn.answer",
  },
];

/** What happens next, for signed-out visitors: three steps from the invite
 *  request to the Studio list. */
export const STUDIO_LANDING_NEXT_STEPS: readonly StudioLandingPoint[] = [
  {
    pointId: "invite",
    titleKey: "studio:landing.next.invite.title",
    bodyKey: "studio:landing.next.invite.body",
    Icon: FiSend,
  },
  {
    pointId: "review",
    titleKey: "studio:landing.next.review.title",
    bodyKey: "studio:landing.next.review.body",
    Icon: FiEye,
  },
  {
    pointId: "list",
    titleKey: "studio:landing.next.list.title",
    bodyKey: "studio:landing.next.list.body",
    Icon: FiBell,
  },
];

/** Spotify's own announcement of its November 2023 royalty change, the
 *  source the Spotify fact links to. */
export const SPOTIFY_ROYALTY_SOURCE_URL =
  "https://artists.spotify.com/en/blog/modernizing-our-royalty-system";

/** The line a listen row shows for each reason its preview failed. */
export const STUDIO_LANDING_LISTEN_REASON_KEY: Record<
  StudioLandingListenReason,
  string
> = {
  unavailable: "studio:landing.listen.reason.unavailable",
  offline: "studio:landing.listen.reason.offline",
  rateLimited: "studio:landing.listen.reason.rateLimited",
  server: "studio:landing.listen.reason.server",
  playback: "studio:landing.listen.reason.playback",
};

export const STUDIO_LANDING_PLAN_POINTS: readonly StudioLandingPoint[] = [
  {
    pointId: "coop",
    titleKey: "studio:landing.plan.coop.title",
    bodyKey: "studio:landing.plan.coop.body",
    Icon: FiUsers,
  },
  {
    pointId: "money",
    titleKey: "studio:landing.plan.money.title",
    bodyKey: "studio:landing.plan.money.body",
    Icon: FiBookOpen,
  },
  {
    pointId: "masters",
    titleKey: "studio:landing.plan.masters.title",
    bodyKey: "studio:landing.plan.masters.body",
    Icon: FiDisc,
  },
];

export const STUDIO_LANDING_WHY_PARAGRAPH_KEYS: readonly string[] = [
  "studio:landing.why.p1",
  "studio:landing.why.p2",
  "studio:landing.why.p3",
];

export const STUDIO_LANDING_OG_IMAGE = "/studio-landing/og-studio.jpg";
