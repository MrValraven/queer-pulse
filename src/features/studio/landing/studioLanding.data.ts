import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiDisc,
  FiHeart,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import type { Theme } from "../../../app/providers/themeContext";

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

export interface StudioLandingScreen {
  screenId: StudioLandingScreenId;
  tabKey: string;
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

export interface StudioLandingComparisonRow {
  rowId: string;
  topicKey: string;
  bigAppsKey: string;
  studioKey: string;
}

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

/* Phone captures of the four laptop screens, for the gallery below 720px.
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
    tabKey: "studio:landing.gallery.home.tab",
    captionKey: "studio:landing.gallery.home.caption",
    shot: HOME_SHOT,
    phoneShot: HOME_PHONE_SHOT,
  },
  {
    screenId: "artist",
    tabKey: "studio:landing.gallery.artist.tab",
    captionKey: "studio:landing.gallery.artist.caption",
    shot: ARTIST_SHOT,
    phoneShot: ARTIST_PHONE_SHOT,
  },
  {
    screenId: "release",
    tabKey: "studio:landing.gallery.release.tab",
    captionKey: "studio:landing.gallery.release.caption",
    shot: RELEASE_SHOT,
    phoneShot: RELEASE_PHONE_SHOT,
  },
  {
    screenId: "playlists",
    tabKey: "studio:landing.gallery.playlists.tab",
    captionKey: "studio:landing.gallery.playlists.caption",
    shot: PLAYLISTS_SHOT,
    phoneShot: PLAYLISTS_PHONE_SHOT,
  },
  {
    screenId: "player",
    tabKey: "studio:landing.gallery.player.tab",
    captionKey: "studio:landing.gallery.player.caption",
    shot: PLAYER_SHOT,
    phoneShot: PLAYER_SHOT,
  },
  {
    screenId: "share",
    tabKey: "studio:landing.gallery.share.tab",
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

export const STUDIO_LANDING_PROMISES: readonly StudioLandingPoint[] = [
  {
    pointId: "artistPage",
    titleKey: "studio:landing.promises.artistPage.title",
    bodyKey: "studio:landing.promises.artistPage.body",
    Icon: FiUser,
  },
  {
    pointId: "picks",
    titleKey: "studio:landing.promises.picks.title",
    bodyKey: "studio:landing.promises.picks.body",
    Icon: FiHeart,
  },
  {
    pointId: "scene",
    titleKey: "studio:landing.promises.scene.title",
    bodyKey: "studio:landing.promises.scene.body",
    Icon: FiCalendar,
  },
  {
    pointId: "safety",
    titleKey: "studio:landing.promises.safety.title",
    bodyKey: "studio:landing.promises.safety.body",
    Icon: FiShield,
  },
];

export const STUDIO_LANDING_COMPARISON_ROWS: readonly StudioLandingComparisonRow[] =
  [
    {
      rowId: "featured",
      topicKey: "studio:landing.compare.featured.topic",
      bigAppsKey: "studio:landing.compare.featured.bigApps",
      studioKey: "studio:landing.compare.featured.studio",
    },
    {
      rowId: "ads",
      topicKey: "studio:landing.compare.ads.topic",
      bigAppsKey: "studio:landing.compare.ads.bigApps",
      studioKey: "studio:landing.compare.ads.studio",
    },
    {
      rowId: "listening",
      topicKey: "studio:landing.compare.listening.topic",
      bigAppsKey: "studio:landing.compare.listening.bigApps",
      studioKey: "studio:landing.compare.listening.studio",
    },
    {
      rowId: "artists",
      topicKey: "studio:landing.compare.artists.topic",
      bigAppsKey: "studio:landing.compare.artists.bigApps",
      studioKey: "studio:landing.compare.artists.studio",
    },
    {
      rowId: "scene",
      topicKey: "studio:landing.compare.scene.topic",
      bigAppsKey: "studio:landing.compare.scene.bigApps",
      studioKey: "studio:landing.compare.scene.studio",
    },
    {
      rowId: "playlists",
      topicKey: "studio:landing.compare.playlists.topic",
      bigAppsKey: "studio:landing.compare.playlists.bigApps",
      studioKey: "studio:landing.compare.playlists.studio",
    },
    {
      rowId: "owner",
      topicKey: "studio:landing.compare.owner.topic",
      bigAppsKey: "studio:landing.compare.owner.bigApps",
      studioKey: "studio:landing.compare.owner.studio",
    },
  ];

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

export const STUDIO_LANDING_GALLERY_ID = "studio-look-inside";
export const STUDIO_LANDING_GALLERY_HEADING_ID = "studio-look-inside-heading";
export const STUDIO_LANDING_OG_IMAGE = "/studio-landing/og-studio.jpg";
