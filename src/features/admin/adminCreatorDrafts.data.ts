import { DEMO_OWNER_RELEASES } from "../studio/api/studioDemo.data";
import {
  DEMO_DRAFT_EPISODE_ID,
  DEMO_FORMAT_RELEASES,
  DEMO_SHOW_ID,
} from "../studio/api/studioDemoFormats.data";
import type { StudioArtistRefDTO } from "../studio/api/studio.types";
import {
  DEMO_SUBPROFILES,
  type DemoSubprofile,
} from "../subprofiles/data/subprofiles.data";
import type {
  AdminCreatorDraftRow,
  CreatorDraftKind,
  CreatorDraftMadeFor,
  CreatorDraftOwner,
} from "./api/adminCreatorDrafts.api";

/** An ISO timestamp `days` (and `hours`) before page load, so the demo always
 *  shows a mix of fresh and stalled drafts however long ago it was built. */
function daysAgo(days: number, hours = 0): string {
  return new Date(
    Date.now() - (days * 24 + hours) * 60 * 60 * 1000,
  ).toISOString();
}

function ownerOf(
  slug: string,
  firstName: string,
  lastName: string,
): CreatorDraftOwner {
  return {
    userId: `demo-user-${slug}`,
    slug,
    firstName,
    lastName,
    avatarUrl: null,
  };
}

const MARTA = ownerOf("marta", "Marta", "Fonseca");
const JOANA = ownerOf("joana", "Joana", "Pires");
const TIAGO = ownerOf("tiago", "Tiago", "Almeida");

/** The first demo persona anyone may see: a private draft persona is out of
 *  scope for staff previews (settled 2026-10-19). */
export const DEMO_DRAFT_PERSONA: DemoSubprofile = (() => {
  const persona = DEMO_SUBPROFILES.find(
    (candidate) => candidate.visibility !== "private",
  );
  if (!persona) throw new Error("The demo needs one non-private persona");
  return persona;
})();

/** A scheduled release from the demo owner's catalogue. */
export const DEMO_SCHEDULED_DRAFT_RELEASE = (() => {
  const release = DEMO_OWNER_RELEASES.find(
    (candidate) => candidate.status === "scheduled",
  );
  if (!release) throw new Error("The demo needs one scheduled release");
  return release;
})();

/** The demo podcast whose draft episode staff open. */
export const DEMO_DRAFT_SHOW = (() => {
  const show = DEMO_FORMAT_RELEASES.find(
    (release) => release.id === DEMO_SHOW_ID,
  );
  if (!show) throw new Error("The demo needs its podcast show");
  return show;
})();

/** Who a Studio draft is made for: the artist's persona, linked only when
 *  that persona is published and has a public address. */
function personaMadeFor(artist: StudioArtistRefDTO): CreatorDraftMadeFor {
  const persona = DEMO_SUBPROFILES.find(
    (candidate) => candidate.id === artist.id,
  );
  const isLive =
    persona?.status === "published" &&
    persona.visibility !== "private" &&
    artist.handle !== "";
  return {
    kind: "persona",
    name: artist.name,
    slug: isLive ? artist.handle : null,
  };
}

export const DEMO_CREATOR_DRAFT_IDS: Record<CreatorDraftKind, string> = {
  event: "5b1c7c1e-0001-4c55-9a51-000000000001",
  listing_edit: "5b1c7c1e-0002-4c55-9a51-000000000002",
  community: "5b1c7c1e-0003-4c55-9a51-000000000003",
  persona: DEMO_DRAFT_PERSONA.id,
  studio_release: DEMO_SCHEDULED_DRAFT_RELEASE.id,
  studio_episode: DEMO_DRAFT_EPISODE_ID,
  listing: "listing-draft-0004",
};

/** Demo-only creator drafts, one per kind. The endpoint is Admin only, so
 *  this fabricated data must never appear as platform truth in live mode. */
export const ADMIN_CREATOR_DRAFTS: AdminCreatorDraftRow[] = [
  {
    kind: "event",
    id: DEMO_CREATOR_DRAFT_IDS.event,
    title: "Sunday picnic in Monsanto",
    madeFor: {
      kind: "community",
      name: "Rainbow Runners",
      slug: "rainbow-runners",
    },
    owner: JOANA,
    lastSavedAt: daysAgo(0, 2),
    progress: { done: 3, total: 5 },
    missing: ["who", "care"],
  },
  {
    kind: "listing_edit",
    id: DEMO_CREATOR_DRAFT_IDS.listing_edit,
    title: "Casa Lilás Café",
    madeFor: {
      kind: "listing",
      name: "Casa Lilás Café",
      slug: "casa-lilas-cafe",
    },
    owner: MARTA,
    lastSavedAt: daysAgo(1, 4),
    progress: null,
    // What the preview shows as empty: the gallery (its one photo did not
    // resolve) and the accessibility answers.
    missing: ["photos", "accessibility"],
  },
  {
    kind: "community",
    id: DEMO_CREATOR_DRAFT_IDS.community,
    title: "Trans Book Club Porto",
    madeFor: null,
    owner: TIAGO,
    lastSavedAt: daysAgo(2),
    progress: { done: 6, total: 9 },
    missing: ["feeling", "confirm"],
  },
  {
    kind: "persona",
    id: DEMO_CREATOR_DRAFT_IDS.persona,
    title: DEMO_DRAFT_PERSONA.displayName,
    madeFor: {
      kind: "persona",
      name: DEMO_DRAFT_PERSONA.displayName,
      slug: null,
    },
    owner: JOANA,
    lastSavedAt: daysAgo(3),
    progress: null,
    missing: ["avatar_missing", "bio_too_short"],
  },
  {
    kind: "studio_release",
    id: DEMO_CREATOR_DRAFT_IDS.studio_release,
    title: DEMO_SCHEDULED_DRAFT_RELEASE.title,
    madeFor: personaMadeFor(DEMO_SCHEDULED_DRAFT_RELEASE.artist),
    owner: MARTA,
    lastSavedAt: daysAgo(4),
    progress: null,
    // The preview carries no cover, so the checklist names it.
    missing: ["studio_publish_missing_cover"],
  },
  {
    kind: "studio_episode",
    id: DEMO_CREATOR_DRAFT_IDS.studio_episode,
    title: "Our parents, part two",
    madeFor: personaMadeFor(DEMO_DRAFT_SHOW.artist),
    owner: TIAGO,
    lastSavedAt: daysAgo(5),
    progress: null,
    missing: null,
  },
  {
    kind: "listing",
    id: DEMO_CREATOR_DRAFT_IDS.listing,
    title: "Tasca da Graça",
    madeFor: null,
    owner: MARTA,
    lastSavedAt: daysAgo(0, 3),
    progress: { done: 5, total: 6 },
    missing: null,
  },
];
