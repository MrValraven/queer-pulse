import type { SavedItem } from "../../app/providers/useSaved";
import { ALBUM_COVER } from "./studioAlbum.data";
import { TRACKS as HOME_CARDS } from "./studioPage.data";
import type { StudioLibraryTab } from "./studioPaths";

// ── Studio v2 live library ─────────────────────────────────────────────────

export const LIVE_LIBRARY_TABS: { id: StudioLibraryTab; labelKey: string }[] = [
  { id: "playlists", labelKey: "studio:libraryLive.tabs.playlists" },
  { id: "releases", labelKey: "studio:libraryLive.tabs.releases" },
  { id: "artists", labelKey: "studio:libraryLive.tabs.artists" },
];

/** Demo only: saves the library shows beside whatever the demo member saved
 *  this session, so every tab and Liked songs have something in them. The
 *  `studio_track` saves are the demo member's liked songs. One release and
 *  one track are withdrawn by our team and one release is gone for another
 *  reason, to show each state. An available release or playlist carries
 *  the cover the server would send: the release's own, and for a playlist
 *  the release of its first playable track. Titles and names are content
 *  and stay as written. */
export const DEMO_LIBRARY_SAVES: SavedItem[] = [
  {
    id: "studio_release:demo-release-cidade-dos-santos",
    kind: "studio_release",
    title: "Cidade dos santos",
    href: "/studio/album?id=demo-release-cidade-dos-santos",
    meta: "Mariana Sol",
    availability: "available",
    coverUrl: ALBUM_COVER,
  },
  {
    id: "studio_release:demo-release-home-2",
    kind: "studio_release",
    title: "Bicha, with love",
    href: "/studio/album?id=demo-release-home-2",
    meta: "LeChatDashinko",
    availability: "available",
    // demo-release-home-2 is built from the second home card.
    coverUrl: HOME_CARDS[1]?.image ?? null,
  },
  {
    id: "studio_release:demo-release-withdrawn",
    kind: "studio_release",
    title: "Bairro antigo",
    href: "/studio/album?id=demo-release-withdrawn",
    meta: "Mariana Sol",
    availability: "unavailable",
    unavailableReason: "withdrawn",
  },
  {
    id: "studio_release:demo-release-gone",
    kind: "studio_release",
    title: "Demo tape, 2019",
    href: null,
    meta: "NIGHTFORM",
    availability: "unavailable",
  },
  {
    id: "studio_track:demo-track-cidade-dos-santos-06",
    kind: "studio_track",
    title: "Carta para a santa",
    href: "/studio/track?id=demo-track-cidade-dos-santos-06",
    meta: "Mariana Sol · Cidade dos santos",
    availability: "available",
  },
  {
    id: "studio_track:demo-track-home-4-01",
    kind: "studio_track",
    title: "Pedro on the 25",
    href: "/studio/track?id=demo-track-home-4-01",
    meta: "NIGHTFORM",
    availability: "available",
  },
  {
    id: "studio_track:demo-track-home-1-01",
    kind: "studio_track",
    title: "The kitchen in April",
    href: "/studio/track?id=demo-track-home-1-01",
    meta: "Rita Ferreira",
    availability: "available",
  },
  {
    id: "studio_track:demo-track-cidade-dos-santos-01",
    kind: "studio_track",
    title: "Abertura: a luz",
    href: "/studio/track?id=demo-track-cidade-dos-santos-01",
    meta: "Mariana Sol · Cidade dos santos",
    availability: "available",
  },
  {
    id: "studio_track:demo-track-home-2-01",
    kind: "studio_track",
    title: "Bicha, with love",
    href: "/studio/track?id=demo-track-home-2-01",
    meta: "LeChatDashinko",
    availability: "available",
  },
  {
    id: "studio_track:demo-track-mariana-2-01",
    kind: "studio_track",
    title: "Planície",
    href: "/studio/track?id=demo-track-mariana-2-01",
    meta: "Mariana Sol · A Beja",
    availability: "available",
  },
  {
    id: "studio_track:demo-track-withdrawn-01",
    kind: "studio_track",
    title: "Bairro antigo",
    href: "/studio/track?id=demo-track-withdrawn-01",
    meta: "Mariana Sol",
    availability: "unavailable",
    unavailableReason: "withdrawn",
  },
  {
    id: "studio_playlist:demo-playlist-dyke-bar-standards",
    kind: "studio_playlist",
    title: "Lisbon dyke-bar standards",
    href: "/studio/collection?id=demo-playlist-dyke-bar-standards",
    meta: "Sara Marques",
    availability: "available",
    // Its first track is from Cidade dos santos.
    coverUrl: ALBUM_COVER,
  },
];
