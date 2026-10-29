import { foldForSearch } from "../../../connect/connectionsFilter";
import { DEMO_INVITE_REQUESTS } from "../../../gatherings/api/inviteRequests.data";
import type { GatheringDetail } from "../../../gatherings/data";
import {
  HOUSE_DEMO_LINEUPS,
  HOUSE_MUSIC_DEMO_DETAILS,
  HOUSE_MUSIC_DEMO_SLUGS,
} from "../../../gatherings/houseMusicEvents.data";
import { matchesStudioArtist } from "./musicEvents.adapters";
import {
  STUDIO_ARTIST_PAGE_SIZE,
  type AdminMusicEventAttentionDTO,
  type AdminMusicEventLineupCountsDTO,
  type AdminMusicEventListItemDTO,
  type AdminMusicEventListPageDTO,
  type MusicEventBucket,
  type StudioArtistCandidateDTO,
  type StudioArtistSearchPageDTO,
} from "./musicEvents.types";

/**
 * Demo answers for the music events console. Loaded only from the demo
 * branches of the hooks (a dynamic import), so live mode never ships it.
 */

/** How each house event's lineup stands, tallied from the lineup the manage
 *  page's editor reads, so the list rows and the editor always agree. A slug
 *  with no demo lineup counts zero everywhere. */
function demoLineupCounts(slug: string): AdminMusicEventLineupCountsDTO {
  const counts: AdminMusicEventLineupCountsDTO = {
    accepted: 0,
    pending: 0,
    declined: 0,
  };
  for (const entry of HOUSE_DEMO_LINEUPS[slug] ?? []) {
    counts[entry.status] += 1;
  }
  return counts;
}

/** A wire-shaped list item built from the house registry entry, so the list
 *  and the event it opens carry the same title, date and place. */
function demoListItem(
  slug: string,
  bucket: MusicEventBucket,
): AdminMusicEventListItemDTO {
  const detail: GatheringDetail | undefined = HOUSE_MUSIC_DEMO_DETAILS[slug];
  if (!detail) throw new Error(`No house music demo event for ${slug}`);
  return {
    slug,
    title: detail.title,
    startAt: detail.date.toISOString(),
    neighbourhood: detail.hood,
    visibility: "members",
    status: bucket === "cancelled" ? "cancelled" : "published",
    coverImageUrl: detail.coverImageUrl ?? null,
    org: detail.host,
    eventType: detail.type,
    gatheringFamily: detail.gatheringFamily ?? "music",
    formatDetails: detail.formatDetails ?? null,
    lineupCounts: demoLineupCounts(slug),
    pendingInviteRequestCount:
      bucket === "upcoming" ? DEMO_INVITE_REQUESTS.length : 0,
  };
}

const DEMO_SLUGS_BY_BUCKET: Readonly<
  Record<MusicEventBucket, readonly string[]>
> = {
  upcoming: [
    HOUSE_MUSIC_DEMO_SLUGS.clubNight,
    HOUSE_MUSIC_DEMO_SLUGS.liveSession,
  ],
  past: [HOUSE_MUSIC_DEMO_SLUGS.listeningParty],
  cancelled: [HOUSE_MUSIC_DEMO_SLUGS.jamSession],
};

/** The four house music events, grouped the way the server buckets them. */
export const DEMO_MUSIC_EVENTS_BY_BUCKET: Readonly<
  Record<MusicEventBucket, readonly AdminMusicEventListItemDTO[]>
> = {
  upcoming: DEMO_SLUGS_BY_BUCKET.upcoming.map((slug) =>
    demoListItem(slug, "upcoming"),
  ),
  past: DEMO_SLUGS_BY_BUCKET.past.map((slug) => demoListItem(slug, "past")),
  cancelled: DEMO_SLUGS_BY_BUCKET.cancelled.map((slug) =>
    demoListItem(slug, "cancelled"),
  ),
};

/** The badge totals, summed over the upcoming rows as the server sums them. */
export const DEMO_MUSIC_EVENT_ATTENTION: AdminMusicEventAttentionDTO =
  DEMO_MUSIC_EVENTS_BY_BUCKET.upcoming.reduce<AdminMusicEventAttentionDTO>(
    (totals, item) => ({
      pendingInviteRequestCount:
        totals.pendingInviteRequestCount + item.pendingInviteRequestCount,
      pendingLineupCount: totals.pendingLineupCount + item.lineupCounts.pending,
    }),
    { pendingInviteRequestCount: 0, pendingLineupCount: 0 },
  );

/** One demo bucket as a single, final page. */
export function demoMusicEventPage(
  bucket: MusicEventBucket,
): AdminMusicEventListPageDTO {
  const items = DEMO_MUSIC_EVENTS_BY_BUCKET[bucket];
  return {
    items: [...items],
    page: 1,
    pageSize: items.length,
    hasMore: false,
    attention: DEMO_MUSIC_EVENT_ATTENTION,
  };
}

/** Six fictional members with linked DJ, drag and musician personas. */
export const DEMO_STUDIO_ARTISTS: readonly StudioArtistCandidateDTO[] = [
  {
    slug: "marta-reis",
    firstName: "Marta",
    lastName: "Reis",
    avatarUrl: null,
    artistPersonas: [
      {
        subprofileId: "demo-persona-dj-mare",
        handle: "djmare",
        displayName: "DJ Maré",
        kind: "dj",
      },
    ],
  },
  {
    slug: "leonor-vaz",
    firstName: "Leonor",
    lastName: "Vaz",
    avatarUrl: null,
    artistPersonas: [
      {
        subprofileId: "demo-persona-rainha-leo",
        handle: "rainhaleo",
        displayName: "Rainha Leo",
        kind: "drag",
      },
    ],
  },
  {
    slug: "caio-mendes",
    firstName: "Caio",
    lastName: "Mendes",
    avatarUrl: null,
    artistPersonas: [
      {
        subprofileId: "demo-persona-caio-tides",
        handle: "caiotides",
        displayName: "Caio and the Tides",
        kind: "musician",
      },
    ],
  },
  {
    slug: "bruna-seixas",
    firstName: "Bruna",
    lastName: "Seixas",
    avatarUrl: null,
    artistPersonas: [
      {
        subprofileId: "demo-persona-dj-seixo",
        handle: "djseixo",
        displayName: "DJ Seixo",
        kind: "dj",
      },
      {
        subprofileId: "demo-persona-bruna-trio",
        handle: "brunaseixastrio",
        displayName: "Bruna Seixas Trio",
        kind: "musician",
      },
    ],
  },
  {
    slug: "ravi-almeida",
    firstName: "Ravi",
    lastName: "Almeida",
    avatarUrl: null,
    artistPersonas: [
      {
        subprofileId: "demo-persona-miss-saudade",
        handle: "misssaudade",
        displayName: "Miss Saudade",
        kind: "drag",
      },
    ],
  },
  {
    slug: "iris-calado",
    firstName: "Íris",
    lastName: "Calado",
    avatarUrl: null,
    artistPersonas: [
      {
        subprofileId: "demo-persona-iris",
        handle: "iriscalado",
        displayName: "Íris",
        kind: "musician",
      },
    ],
  },
];

/** Demo stand-in for the server search: accent-folded `q`, one final page. */
export function demoStudioArtistSearchPage(
  query: string,
): StudioArtistSearchPageDTO {
  const foldedTerm = foldForSearch(query.trim());
  const items = DEMO_STUDIO_ARTISTS.filter((candidate) =>
    matchesStudioArtist(candidate, foldedTerm),
  );
  return {
    items,
    total: items.length,
    page: 1,
    pageSize: STUDIO_ARTIST_PAGE_SIZE,
  };
}
