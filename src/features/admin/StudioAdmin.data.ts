import { foldForSearch } from "../../shared/lib/foldForSearch";
import {
  STUDIO_DISCOVERY_LIMITS,
  type StudioCurationShelf,
} from "../studio/api/studio.types";
import {
  DEMO_OWNER_RELEASES,
  DEMO_RELEASES,
} from "../studio/api/studioDemo.data";
import { demoReleaseCard } from "../studio/api/studioDemoCards";
import { DEMO_CURATION_SEED } from "../studio/api/studioDemoCuration.data";
import { DEMO_STUDIO_SCENES } from "../studio/api/studioDemoScenes.data";
import type {
  AdminStudioCurationDTO,
  AdminStudioEventOptionDTO,
  AdminStudioPickDTO,
  AdminStudioReleaseCardDTO,
  AdminStudioSceneDTO,
  AdminStudioSceneEventDTO,
} from "./api/studioDiscoveryAdmin.api";

// The Studio discovery console's demo seed, derived from the same demo
// releases, picks and scenes the member pages read. Loaded through a
// dynamic import by the console's hooks in demo mode only.

function adminCardOf(releaseId: string): AdminStudioReleaseCardDTO | null {
  const release = DEMO_RELEASES.find((candidate) => candidate.id === releaseId);
  return release
    ? { ...demoReleaseCard(release), status: release.status }
    : null;
}

function demoPicksFor(shelf: StudioCurationShelf): AdminStudioPickDTO[] {
  return DEMO_CURATION_SEED[shelf].flatMap((seed, index) => {
    const release = adminCardOf(seed.releaseId);
    return release
      ? [
          {
            id: seed.id,
            shelf,
            position: index + 1,
            note: seed.note,
            createdAt: seed.createdAt,
            isListenable: release.status === "published",
            release,
          },
        ]
      : [];
  });
}

export function demoAdminStudioCuration(): AdminStudioCurationDTO {
  return {
    featured: demoPicksFor("featured"),
    staffPicks: demoPicksFor("staff_picks"),
    newThisWeek: demoPicksFor("new_this_week"),
  };
}

export function demoAdminStudioScenes(): AdminStudioSceneDTO[] {
  return DEMO_STUDIO_SCENES.map((scene) => ({
    id: scene.id,
    slug: scene.slug,
    name: scene.name,
    city: scene.city,
    blurb: scene.blurb,
    coverUrl: scene.coverUrl,
    status: scene.status,
    position: scene.position,
    releaseCount: scene.releaseIds.length,
    pinnedEventCount: scene.pinnedEvents.length,
    createdAt: scene.createdAt,
    updatedAt: scene.createdAt,
  }));
}

/** Upcoming demo events staff can pin; slugs match demo gatherings. */
export const DEMO_ADMIN_EVENT_OPTIONS: AdminStudioEventOptionDTO[] = [
  {
    id: "demo-event-supper-club-12",
    slug: "supper-club-12",
    title: "Queer Supper Club №12",
    startAt: "2026-11-14T19:30:00.000Z",
    venue: null,
    neighbourhood: "Mouraria",
  },
  {
    id: "demo-event-queer-history-walk",
    slug: "queer-history-walk",
    title: "Queer history walk: Mouraria",
    startAt: "2026-11-21T10:00:00.000Z",
    venue: null,
    neighbourhood: "Mouraria",
  },
  {
    id: "demo-event-portfolio-night",
    slug: "portfolio-night",
    title: "Portfolio Night: Designers & Photographers",
    startAt: "2026-11-27T18:30:00.000Z",
    venue: null,
    neighbourhood: "Marvila",
  },
  {
    id: "demo-event-trans-hub-meetup",
    slug: "trans-hub-meetup",
    title: "Trans & NB Hub: Monthly Meetup",
    startAt: "2026-12-03T18:00:00.000Z",
    venue: null,
    neighbourhood: "Arroios",
  },
];

export function demoAdminSceneEvents(
  sceneId: string,
): AdminStudioSceneEventDTO[] {
  const scene = DEMO_STUDIO_SCENES.find(
    (candidate) => candidate.id === sceneId,
  );
  return (scene?.pinnedEvents ?? []).map((event) => ({
    eventId: `demo-event-${event.slug}`,
    slug: event.slug,
    title: event.title,
    startAt: event.startAt,
    venue: event.venue,
    neighbourhood: event.neighbourhood,
    isUpcoming: true,
    pinnedAt: scene?.createdAt ?? event.startAt,
  }));
}

export function demoAdminSceneReleases(
  sceneId: string,
): AdminStudioReleaseCardDTO[] {
  const scene = DEMO_STUDIO_SCENES.find(
    (candidate) => candidate.id === sceneId,
  );
  return (scene?.releaseIds ?? []).flatMap((releaseId) => {
    const card = adminCardOf(releaseId);
    return card ? [card] : [];
  });
}

const matches = (query: string, ...texts: string[]) => {
  const needle = foldForSearch(query.trim());
  return (
    needle.length > 0 &&
    texts.some((text) => foldForSearch(text).includes(needle))
  );
};

/** Published releases by title or artist name, at most 20. The owner's
 *  draft and taken down releases are searched too and left out, as the
 *  server leaves out every release that is not published. A blank query
 *  answers the newest published releases, by published date, as the
 *  server does. */
export function demoAdminReleaseSearch(
  query: string,
): AdminStudioReleaseCardDTO[] {
  const isBlank = query.trim().length === 0;
  const published = [...DEMO_RELEASES, ...DEMO_OWNER_RELEASES].filter(
    (release) => release.status === "published",
  );
  const found = isBlank
    ? published.sort((left, right) =>
        (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""),
      )
    : published.filter((release) =>
        matches(query, release.title, release.artist.name),
      );
  return found
    .slice(0, STUDIO_DISCOVERY_LIMITS.adminSearchResults)
    .map((release) => ({
      ...demoReleaseCard(release),
      status: release.status,
    }));
}

/** Upcoming events by title, soonest first, at most 20. */
export function demoAdminEventSearch(
  query: string,
): AdminStudioEventOptionDTO[] {
  return DEMO_ADMIN_EVENT_OPTIONS.filter((event) => matches(query, event.title))
    .sort((left, right) => left.startAt.localeCompare(right.startAt))
    .slice(0, STUDIO_DISCOVERY_LIMITS.adminSearchResults);
}
