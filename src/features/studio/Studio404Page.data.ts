import type { IconType } from "react-icons";
import { FiBookmark, FiHome, FiSearch } from "react-icons/fi";
import { routes } from "../../app/routeMap";

/** What a missing Studio address was pointing at, read from its path. */
export type StudioMissingKind =
  "release" | "track" | "artist" | "playlist" | "scene" | "pressKit" | "page";

/** Path prefix to kind, longest prefixes first so `/studio/press/edit`
 *  never reads as a plain page. */
const MISSING_KIND_BY_PREFIX: readonly [string, StudioMissingKind][] = [
  [routes.studioPress, "pressKit"],
  [routes.studioAlbum, "release"],
  [routes.studioTrack, "track"],
  [routes.studioArtist, "artist"],
  [routes.studioCollection, "playlist"],
  [routes.studioScene, "scene"],
];

/** The kind the 404 names: "This release isn't here" on a broken album
 *  link, "This page" for anything it cannot place. */
export function studioMissingKindOf(pathname: string): StudioMissingKind {
  const match = MISSING_KIND_BY_PREFIX.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match ? match[1] : "page";
}

export interface StudioRecoveryLink {
  key: string;
  to: string;
  icon: IconType;
  labelKey: string;
  subKey: string;
}

/** Where the 404 sends a member instead: places that exist in live. */
export const STUDIO_404_LINKS: readonly StudioRecoveryLink[] = [
  {
    key: "search",
    to: routes.studioSearch,
    icon: FiSearch,
    labelKey: "studio:error404.link.search.label",
    subKey: "studio:error404.link.search.sub",
  },
  {
    key: "library",
    to: routes.studioLibrary,
    icon: FiBookmark,
    labelKey: "studio:error404.link.library.label",
    subKey: "studio:error404.link.library.sub",
  },
  {
    key: "home",
    to: routes.studio,
    icon: FiHome,
    labelKey: "studio:error404.link.home.label",
    subKey: "studio:error404.link.home.sub",
  },
];
