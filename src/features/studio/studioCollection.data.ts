import type { StudioPlaylistVisibility } from "./api/studio.types";

// ── Studio v2 demo playlists ───────────────────────────────────────────────
// Playlist names and descriptions are member-written content, so they stay
// as written in both languages (the catalog header says the same).

export const DEMO_VIEWER_MEMBER_SLUG = "tiago";

/** The signed-in demo member as a playlist credit. */
export const DEMO_VIEWER_MEMBER = {
  id: "demo-member-tiago",
  slug: DEMO_VIEWER_MEMBER_SLUG,
  displayName: "Tiago Costa",
  avatarUrl: null,
};

export interface DemoPlaylistSeed {
  id: string;
  name: string;
  description: string | null;
  visibility: StudioPlaylistVisibility;
  isViewerOwner: boolean;
  /** A persona credit; null shows the playlist as `creditMember`. */
  creditPersonaId: string | null;
  creditMember: {
    id: string;
    slug: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  /** The credited member's profile slug (the same as `creditMember.slug`),
   *  kept beside it so the profile block's filter reads one field. */
  creditMemberSlug: string | null;
  /** Track ids in playlist order. One that matches no published demo track
   *  plays the part of a track that is no longer available. */
  trackIds: string[];
  updatedAt: string;
}

/** What the old id-less `/studio/collection` link opens in the demo. */
export const DEMO_DEFAULT_PLAYLIST_ID = "demo-playlist-dyke-bar-standards";

export const DEMO_PLAYLIST_SEEDS: DemoPlaylistSeed[] = [
  {
    id: DEMO_DEFAULT_PLAYLIST_ID,
    name: "Lisbon dyke-bar standards",
    description:
      "The songs that actually get played: at Purex, in Anjos, at every house party that goes past 4am",
    visibility: "public",
    isViewerOwner: false,
    creditPersonaId: null,
    creditMember: {
      id: "demo-member-sara-marques",
      slug: "sara-marques",
      displayName: "Sara Marques",
      avatarUrl: null,
    },
    creditMemberSlug: "sara-marques",
    trackIds: [
      "demo-track-cidade-dos-santos-06",
      "demo-track-home-1-01",
      "demo-track-home-2-01",
      "demo-track-home-3-01",
      "demo-track-mariana-2-02",
      "demo-track-cidade-dos-santos-02",
      "demo-track-home-4-01",
    ],
    updatedAt: "2026-10-09T18:00:00.000Z",
  },
  {
    id: "demo-playlist-trans-composers",
    name: "Trans composers vol. iv",
    description: "Voices finding their own register",
    visibility: "public",
    isViewerOwner: false,
    creditPersonaId: "sp-diogo-nightform",
    creditMember: null,
    creditMemberSlug: null,
    trackIds: [
      "demo-track-home-3-01",
      "demo-track-home-2-01",
      "demo-track-cidade-dos-santos-08",
    ],
    updatedAt: "2026-10-07T12:00:00.000Z",
  },
  {
    id: "demo-playlist-cartas-que-voltam",
    name: "Cartas que voltam",
    description: "Letters, sung back",
    visibility: "public",
    isViewerOwner: true,
    creditPersonaId: "demo-persona-mariana-sol",
    creditMember: null,
    creditMemberSlug: null,
    trackIds: [
      "demo-track-cidade-dos-santos-06",
      "demo-track-mariana-single-1-01",
      "demo-track-mariana-2-01",
    ],
    updatedAt: "2026-10-11T09:00:00.000Z",
  },
  {
    id: "demo-playlist-kitchen-tapes",
    name: "Kitchen tapes",
    description: "For washing up slowly",
    visibility: "private",
    isViewerOwner: true,
    creditPersonaId: null,
    creditMember: DEMO_VIEWER_MEMBER,
    creditMemberSlug: DEMO_VIEWER_MEMBER_SLUG,
    trackIds: [
      "demo-track-cidade-dos-santos-01",
      "demo-track-cidade-dos-santos-03",
      "demo-track-withdrawn-01",
      "demo-track-mariana-3-01",
      "demo-track-home-1-01",
    ],
    updatedAt: "2026-10-12T21:00:00.000Z",
  },
  {
    id: "demo-playlist-for-the-group-chat",
    name: "For the group chat",
    description: null,
    visibility: "connections",
    isViewerOwner: true,
    creditPersonaId: null,
    creditMember: DEMO_VIEWER_MEMBER,
    creditMemberSlug: DEMO_VIEWER_MEMBER_SLUG,
    // The last one points at a track that is gone for another reason, so the
    // demo shows a plain "No longer available" row beside Kitchen tapes'
    // withdrawn one.
    trackIds: [
      "demo-track-home-2-01",
      "demo-track-home-4-01",
      "demo-track-gone-01",
    ],
    updatedAt: "2026-10-10T20:00:00.000Z",
  },
];
