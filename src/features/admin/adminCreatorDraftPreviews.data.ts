import type { StudioReleaseDTO } from "../studio/api/studio.types";
import { toPublicDto } from "../subprofiles/data/subprofiles.data";
import {
  ADMIN_CREATOR_DRAFTS,
  DEMO_CREATOR_DRAFT_IDS,
  DEMO_DRAFT_PERSONA,
  DEMO_DRAFT_SHOW,
  DEMO_SCHEDULED_DRAFT_RELEASE,
} from "./adminCreatorDrafts.data";
import { ADMIN_LISTING_DRAFT_PAYLOADS } from "./adminListingDraftPayloads.data";
import type {
  AdminCreatorDraftDetail,
  AdminCreatorDraftRow,
  CommunityDraftPreview,
  CreatorDraftKind,
  EventDraftPreview,
  ListingDraftPreview,
} from "./api/adminCreatorDrafts.api";

/** What staff see of a release: the owner-only fields are emptied, as the
 *  server sends them for anyone but the owner. */
function staffReleaseView(release: StudioReleaseDTO): StudioReleaseDTO {
  const {
    claims: _claims,
    previewToken: _previewToken,
    previewLinkCreatedAt: _previewLinkCreatedAt,
    hasUnnotedChanges: _hasUnnotedChanges,
    ...publicFields
  } = release;
  return {
    ...publicFields,
    isOwner: false,
    isPreview: true,
    rightsConfirmedAt: null,
    takedownReason: null,
    dispute: null,
    canDispute: false,
    sceneId: null,
  };
}

/** The show with its published episodes plus the one draft episode, the live
 *  shape (settled 2026-10-19). */
function episodePreview(): StudioReleaseDTO {
  const episodes = DEMO_DRAFT_SHOW.tracks.filter(
    (track) =>
      track.id === DEMO_CREATOR_DRAFT_IDS.studio_episode ||
      track.isDraft !== true,
  );
  return { ...staffReleaseView(DEMO_DRAFT_SHOW), tracks: episodes };
}

/** The allow-listed business half of the member's new-listing draft. One
 *  gallery slot is null, the live shape for an image the server cannot
 *  resolve. */
function tascaPreview(): ListingDraftPreview {
  const payload = ADMIN_LISTING_DRAFT_PAYLOADS["listing-draft-0004"] ?? {};
  return {
    name: payload.name,
    cats: payload.cats,
    hood: payload.hood,
    price: payload.price,
    blurb: payload.blurb,
    tagline: payload.tagline,
    langs: ["pt", "en"],
    address: payload.address,
    online: false,
    social: payload.social,
    photos: { wide: null },
  };
}

/** A different venue for the listing edit, so the list never shows one place
 *  twice. A physical café with an address, a menu with no file and a small
 *  shop, its one photo unresolvable (the live null shapes). */
function casaLilasPreview(): ListingDraftPreview {
  return {
    name: "Casa Lilás Café",
    cats: ["food"],
    hood: "Alfama",
    price: "€€",
    blurb: "Coffee, cake and a sofa corner for long afternoons.",
    tagline: "Slow mornings in Alfama",
    langs: ["pt", "en"],
    address: "Rua de São Pedro 8, Lisboa",
    online: false,
    social: { instagram: "casalilascafe", website: "", email: "", phone: "" },
    photos: { wide: null, d1: null },
    coverPhoto: { image: null, alt: "The front of Casa Lilás Café" },
    pricingMode: "menu",
    menu: {
      sections: [
        {
          id: "casa-lilas-menu-cakes",
          title: "Cakes",
          items: [
            {
              id: "casa-lilas-menu-orange-cake",
              name: "Orange and olive oil cake",
              price: "3,50 €",
              description: "Baked every morning",
              dietary: ["vegan"],
            },
            {
              id: "casa-lilas-menu-pastel",
              name: "Pastel de nata",
              price: "1,40 €",
              description: "",
              dietary: ["vegetarian"],
            },
          ],
        },
      ],
      file: null,
      link: "",
    },
    shopItems: [
      {
        id: "casa-lilas-shop-mug",
        name: "Casa Lilás mug",
        price: "12 €",
        link: "",
        photo: { image: null, alt: "A lilac mug", caption: "" },
      },
      {
        id: "casa-lilas-shop-beans",
        name: "House blend beans, 250 g",
        price: "9 €",
        link: "",
        photo: null,
      },
    ],
  };
}

function inTwoWeeks(): string {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

const EVENT_PREVIEW: EventDraftPreview = {
  title: "Sunday picnic in Monsanto",
  description:
    "Bring a blanket and something to share. We meet at the top of the park and walk down together.",
  family: "eat",
  format: "picnic",
  cap: "24",
  showAttendeeCount: true,
  date: inTwoWeeks(),
  time: "13:00",
  hood: "Monsanto",
  communitySlug: "rainbow-runners",
  audienceScope: "community",
  // A value the event form stores (`LANGS` in createGathering.data.ts).
  lang: "English only",
  costKind: "free",
  themes: ["outdoors", "low-key"],
  accessNotes:
    "The meeting point is flat. The path down is gravel and gently sloped.",
  houseRules: "Be kind, share the shade, take your rubbish home.",
  allowWaitlist: true,
  community: { slug: "rainbow-runners", name: "Rainbow Runners" },
  runByListing: null,
};

const COMMUNITY_PREVIEW: CommunityDraftPreview = {
  name: "Trans Book Club Porto",
  purpose:
    "A monthly reading circle for trans and nonbinary readers in Porto, with tea and no homework guilt.",
  type: "arts",
  whoFor: "Trans and nonbinary people who like to read and talk about it.",
  accessTier: "request",
  features: ["discussion", "events"],
  rules: ["Be kind", "Spoilers get a warning", "What is said here stays here"],
  nowReading: "Nevada by Imogen Binnie",
  tint: "plum",
  tagline: "Tea, books and good company",
  handle: "transbookclubporto",
  tags: ["trans-nonbinary"],
  avatarImageUrl: null,
};

function previewFor(row: AdminCreatorDraftRow): AdminCreatorDraftDetail | null {
  switch (row.kind) {
    case "persona":
      return {
        ...row,
        kind: "persona",
        preview: {
          ...toPublicDto(DEMO_DRAFT_PERSONA, false),
          status: "draft",
          avatarUrl: null,
          bio: "Lisbon producer and DJ.",
        },
      };
    case "studio_release":
      return {
        ...row,
        kind: "studio_release",
        preview: {
          ...staffReleaseView(DEMO_SCHEDULED_DRAFT_RELEASE),
          coverUrl: null,
        },
      };
    case "studio_episode":
      return {
        ...row,
        kind: "studio_episode",
        preview: episodePreview(),
        episodeTrackId: DEMO_CREATOR_DRAFT_IDS.studio_episode,
      };
    case "listing":
      return { ...row, kind: "listing", preview: tascaPreview() };
    case "listing_edit":
      return {
        ...row,
        kind: "listing_edit",
        preview: casaLilasPreview(),
        listing: {
          ref: "QP-L-0051",
          slug: "casa-lilas-cafe",
          name: "Casa Lilás Café",
        },
      };
    case "event":
      return { ...row, kind: "event", preview: EVENT_PREVIEW };
    case "community":
      return { ...row, kind: "community", preview: COMMUNITY_PREVIEW };
  }
}

/** The demo answer for one draft: its list row plus a preview in the shape
 *  the server sends, or null when no fixture has that kind and id. */
export function demoAdminCreatorDraftDetail(
  kind: CreatorDraftKind,
  id: string,
): AdminCreatorDraftDetail | null {
  const row = ADMIN_CREATOR_DRAFTS.find(
    (candidate) => candidate.kind === kind && candidate.id === id,
  );
  return row ? previewFor(row) : null;
}
