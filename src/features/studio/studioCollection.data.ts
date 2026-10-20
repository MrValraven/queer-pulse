import { MEMBERS } from "../members/data/members";
import type {
  StudioPlaylistEditorSource,
  StudioPlaylistEditorStatus,
  StudioPlaylistPersonDTO,
  StudioPlaylistVisibility,
} from "./api/studio.types";

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

/** The photo the members and connections demo shows for a member. */
const demoMemberPhoto = (slug: string): string | null =>
  MEMBERS[slug]?.photo ?? null;

/** Everyone the demo's playlists name as an owner, an editor or an invitee,
 *  the viewer's seeded connections included (connectionSeeds.data.ts). */
export const DEMO_PLAYLIST_PEOPLE: Record<string, StudioPlaylistPersonDTO> = {
  tiago: { slug: "tiago", displayName: "Tiago Costa", avatarUrl: null },
  "sara-marques": {
    slug: "sara-marques",
    displayName: "Sara Marques",
    avatarUrl: null,
  },
  "catarina-vaz": {
    slug: "catarina-vaz",
    displayName: "Catarina Vaz",
    avatarUrl: demoMemberPhoto("catarina-vaz"),
  },
  jonas: {
    slug: "jonas",
    displayName: "Jonas Ferreira",
    avatarUrl: demoMemberPhoto("jonas"),
  },
  luisa: {
    slug: "luisa",
    displayName: "Luísa Gomes",
    avatarUrl: demoMemberPhoto("luisa"),
  },
  rita: {
    slug: "rita",
    displayName: "Rita Varela",
    avatarUrl: demoMemberPhoto("rita"),
  },
  nuno: {
    slug: "nuno",
    displayName: "Nuno Alves",
    avatarUrl: demoMemberPhoto("nuno"),
  },
  anika: {
    slug: "anika",
    displayName: "Anika Kovač",
    avatarUrl: demoMemberPhoto("anika"),
  },
  "sofia-castano": {
    slug: "sofia-castano",
    displayName: "Sofia Castaño",
    avatarUrl: demoMemberPhoto("sofia-castano"),
  },
  "sara-pinheiro": {
    slug: "sara-pinheiro",
    displayName: "Sara Pinheiro",
    avatarUrl: demoMemberPhoto("sara-pinheiro"),
  },
};

/** The demo personas' other co-owners: who a persona-credited playlist can
 *  pick as editors. The viewer co-owns Mariana Sol with Rita and Nuno. */
export const DEMO_PERSONA_CO_OWNERS: Record<string, string[]> = {
  "demo-persona-mariana-sol": ["rita", "nuno"],
};

export interface DemoEditorSeed {
  /** The row id the owner's remove names: `demo-editor-<playlist>-<slug>`,
   *  reused when the same member is invited again (one row per member). */
  editorId: string;
  slug: string;
  status: StudioPlaylistEditorStatus;
  source: StudioPlaylistEditorSource;
  invitedAt: string;
}

export const demoEditorIdOf = (playlistId: string, slug: string) =>
  `demo-editor-${playlistId}-${slug}`;

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
  /** The owner's slug when the viewer is someone else. */
  ownerSlug?: string;
  /** Editors and invites, the viewer's own row included when they have one. */
  editors?: DemoEditorSeed[];
  /** Who added each track, by track id. */
  addedBySlugByTrackId?: Record<string, string>;
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
    editors: [
      {
        editorId: "demo-editor-demo-playlist-cartas-que-voltam-rita",
        slug: "rita",
        status: "active",
        source: "persona_co_owner",
        invitedAt: "2026-10-11T09:30:00.000Z",
      },
    ],
    addedBySlugByTrackId: {
      "demo-track-cidade-dos-santos-06": "tiago",
      "demo-track-mariana-single-1-01": "rita",
      "demo-track-mariana-2-01": "tiago",
    },
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
    editors: [
      {
        editorId: "demo-editor-demo-playlist-for-the-group-chat-catarina-vaz",
        slug: "catarina-vaz",
        status: "active",
        source: "member_invite",
        invitedAt: "2026-10-10T20:30:00.000Z",
      },
      {
        editorId: "demo-editor-demo-playlist-for-the-group-chat-jonas",
        slug: "jonas",
        status: "active",
        source: "member_invite",
        invitedAt: "2026-10-10T21:00:00.000Z",
      },
      {
        editorId: "demo-editor-demo-playlist-for-the-group-chat-luisa",
        slug: "luisa",
        status: "invited",
        source: "member_invite",
        invitedAt: "2026-10-12T18:00:00.000Z",
      },
    ],
    addedBySlugByTrackId: {
      "demo-track-home-2-01": "tiago",
      "demo-track-home-4-01": "catarina-vaz",
      "demo-track-gone-01": "jonas",
    },
  },
  {
    // The viewer edits this one: Rita made it for the persona she co-owns
    // with them, and picked them as an editor.
    id: "demo-playlist-tour-diary",
    name: "Tour diary",
    description: "What we played between Porto and Lisbon",
    visibility: "private",
    isViewerOwner: false,
    ownerSlug: "rita",
    creditPersonaId: "demo-persona-mariana-sol",
    creditMember: null,
    creditMemberSlug: null,
    // The last id matches no published track, so an editor meets an
    // unavailable row too.
    trackIds: [
      "demo-track-mariana-2-02",
      "demo-track-mariana-3-01",
      "demo-track-home-3-01",
      "demo-track-gone-02",
    ],
    updatedAt: "2026-10-13T19:00:00.000Z",
    editors: [
      {
        editorId: "demo-editor-demo-playlist-tour-diary-tiago",
        slug: "tiago",
        status: "active",
        source: "persona_co_owner",
        invitedAt: "2026-10-12T10:00:00.000Z",
      },
    ],
    addedBySlugByTrackId: {
      "demo-track-mariana-2-02": "rita",
      "demo-track-mariana-3-01": "tiago",
      "demo-track-home-3-01": "rita",
      "demo-track-gone-02": "rita",
    },
  },
  {
    // The viewer is invited to this one and has not answered yet.
    id: "demo-playlist-pride-warm-up",
    name: "Pride warm-up",
    description: "Getting ready at Catarina's, June edition",
    visibility: "private",
    isViewerOwner: false,
    ownerSlug: "catarina-vaz",
    creditPersonaId: null,
    creditMember: {
      id: "demo-member-catarina-vaz",
      slug: "catarina-vaz",
      displayName: "Catarina Vaz",
      avatarUrl: null,
    },
    creditMemberSlug: "catarina-vaz",
    trackIds: [
      "demo-track-home-1-01",
      "demo-track-cidade-dos-santos-02",
      "demo-track-home-4-01",
    ],
    updatedAt: "2026-10-14T08:00:00.000Z",
    editors: [
      {
        editorId: "demo-editor-demo-playlist-pride-warm-up-tiago",
        slug: "tiago",
        status: "invited",
        source: "member_invite",
        invitedAt: "2026-10-14T08:00:00.000Z",
      },
    ],
    addedBySlugByTrackId: {
      "demo-track-home-1-01": "catarina-vaz",
      "demo-track-cidade-dos-santos-02": "catarina-vaz",
      "demo-track-home-4-01": "catarina-vaz",
    },
  },
];
