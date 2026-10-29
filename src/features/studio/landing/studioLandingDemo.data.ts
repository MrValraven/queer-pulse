// Demo answers for the public Studio landing (`GET /studio/landing` and the
// preview stream), wire-shaped so the adapters run on them exactly as on a
// live answer. Every name is a demo persona; nothing names the demo member.
// Previews and covers come from the demo catalogue, so they stay in step with
// the releases the demo Studio plays.
import type { StudioArtistRefDTO, StudioReleaseDTO } from "../api/studio.types";
import { DEMO_RELEASES } from "../api/studioDemo.data";
import {
  DEMO_ARTIST_LUA_CARDOSO,
  DEMO_ARTIST_VANDA_DIESEL,
  DEMO_FORMAT_RELEASES,
} from "../api/studioDemoFormats.data";
import { DEMO_FOUNDING_ARTIST_IDS } from "../api/studioDemoFounding.data";
import {
  DEMO_ARTIST_LECHATDASHINKO,
  DEMO_ARTIST_NIGHTFORM,
} from "../api/studioDemoMe.data";
import type {
  StudioLandingArtistCardDTO,
  StudioLandingDTO,
  StudioLandingPersonaDTO,
  StudioLandingPreviewCardDTO,
} from "../api/studioLanding.types";

const LISBON_TIMEZONE = "Europe/Lisbon";
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const FRIDAY = 5;
const SHOW_START_HOUR = 22;

/** The offset of Europe/Lisbon from UTC at an instant, in milliseconds. */
function lisbonOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LISBON_TIMEZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const part = (type: string) =>
    Number(parts.find((entry) => entry.type === type)?.value ?? 0);
  const wallClockAsUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
  return wallClockAsUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** The instant a Lisbon wall clock reads `hour`:00 on a calendar day. */
function lisbonInstantOf(dayUtcMs: number, hour: number): Date {
  const guess = dayUtcMs + hour * HOUR_MS;
  return new Date(guess - lisbonOffsetMs(new Date(guess)));
}

/** The next Friday at 22:00 Lisbon time, always after `now`. */
export function nextFridayShowStart(now: Date = new Date()): Date {
  const lisbonToday = new Date(now.getTime() + lisbonOffsetMs(now));
  const todayUtcMs = Date.UTC(
    lisbonToday.getUTCFullYear(),
    lisbonToday.getUTCMonth(),
    lisbonToday.getUTCDate(),
  );
  for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
    const dayUtcMs = todayUtcMs + dayOffset * DAY_MS;
    const candidate = lisbonInstantOf(dayUtcMs, SHOW_START_HOUR);
    const isFriday = new Date(dayUtcMs).getUTCDay() === FRIDAY;
    if (isFriday && candidate.getTime() > now.getTime()) return candidate;
  }
  return lisbonInstantOf(todayUtcMs + 7 * DAY_MS, SHOW_START_HOUR);
}

function personaOf(
  artist: StudioArtistRefDTO,
  avatarUrl: string | null = artist.avatarUrl,
): StudioLandingPersonaDTO {
  return {
    name: artist.name,
    handle: artist.handle,
    kind: artist.kind,
    avatarUrl,
  };
}

const ALL_RELEASES: StudioReleaseDTO[] = [
  ...DEMO_RELEASES,
  ...DEMO_FORMAT_RELEASES,
];

function releaseOf(releaseId: string): StudioReleaseDTO | undefined {
  return ALL_RELEASES.find((release) => release.id === releaseId);
}

function coverOf(releaseId: string): string | null {
  return releaseOf(releaseId)?.coverUrl ?? null;
}

/** The first playable track of a release that carries no content warning and
 *  is not explicit, as a preview card. */
function previewOf(
  previewId: string,
  releaseId: string,
): StudioLandingPreviewCardDTO | null {
  const release = releaseOf(releaseId);
  const track = release?.tracks.find(
    (candidate) =>
      candidate.hasAudio &&
      !candidate.isExplicit &&
      (candidate.contentWarnings ?? []).length === 0 &&
      candidate.durationSeconds !== null,
  );
  if (!release || !track) return null;
  return {
    id: previewId,
    trackTitle: track.title,
    durationSeconds: track.durationSeconds ?? 0,
    coverUrl: release.coverUrl,
    artist: personaOf(release.artist),
  };
}

const DEMO_PREVIEWS: StudioLandingPreviewCardDTO[] = [
  previewOf("demo-landing-preview-1", "demo-release-home-4"),
  previewOf("demo-landing-preview-2", "demo-release-vanda-motorbike"),
  previewOf("demo-landing-preview-3", "demo-release-home-1"),
  previewOf("demo-landing-preview-4", "demo-release-lua-ultimo-eletrico"),
  previewOf("demo-landing-preview-5", "demo-release-home-3"),
].filter((card): card is StudioLandingPreviewCardDTO => card !== null);

const DEMO_RITA: StudioArtistRefDTO = {
  id: "demo-persona-rita-ferreira",
  handle: "",
  name: "Rita Ferreira",
  kind: "musician",
  avatarUrl: null,
};
const DEMO_CORO: StudioArtistRefDTO = {
  id: "demo-persona-coro-de-outubro",
  handle: "",
  name: "Coro de Outubro",
  kind: "musician",
  avatarUrl: null,
};

const isFoundingOf = (artist: StudioArtistRefDTO) =>
  DEMO_FOUNDING_ARTIST_IDS.includes(artist.id);

const DEMO_ARTIST_CARDS: StudioLandingArtistCardDTO[] = [
  {
    id: "demo-landing-card-nightform",
    artist: personaOf(DEMO_ARTIST_NIGHTFORM, coverOf("demo-release-home-4")),
    quote:
      "I made the whole record on the night bus home with a drum machine on my knees and a stranger nodding along to every beat",
    isFoundingArtist: isFoundingOf(DEMO_ARTIST_NIGHTFORM),
  },
  {
    id: "demo-landing-card-vanda-diesel",
    artist: personaOf(DEMO_ARTIST_VANDA_DIESEL),
    quote:
      "my mother watched Sunday Mass from the third row and cried and then asked who did my hair",
    isFoundingArtist: isFoundingOf(DEMO_ARTIST_VANDA_DIESEL),
  },
  {
    id: "demo-landing-card-lechatdashinko",
    artist: personaOf(
      DEMO_ARTIST_LECHATDASHINKO,
      coverOf("demo-release-home-2"),
    ),
    quote:
      "I play the hour after the lights come up when everybody is still dancing and nobody wants to go find their coat",
    isFoundingArtist: isFoundingOf(DEMO_ARTIST_LECHATDASHINKO),
  },
  {
    id: "demo-landing-card-lua-cardoso",
    artist: personaOf(DEMO_ARTIST_LUA_CARDOSO),
    quote:
      "I wrote Paragem on the last tram and now people hum it back to me at the bus stop and I love that",
    isFoundingArtist: isFoundingOf(DEMO_ARTIST_LUA_CARDOSO),
  },
  {
    id: "demo-landing-card-rita-ferreira",
    artist: personaOf(DEMO_RITA),
    quote: null,
    isFoundingArtist: isFoundingOf(DEMO_RITA),
  },
  {
    id: "demo-landing-card-coro-de-outubro",
    artist: personaOf(DEMO_CORO, coverOf("demo-release-home-3")),
    quote:
      "we rehearse on Tuesdays and put the recording out the same night and the neighbours press play before we are even home",
    isFoundingArtist: isFoundingOf(DEMO_CORO),
  },
];

const NEXT_EVENT_SLUG = "queer-karaoke-night";

export const DEMO_STUDIO_LANDING: StudioLandingDTO = {
  counts: { artists: 14, releases: 37, eventsThisMonth: 6 },
  nextEvent: {
    slug: NEXT_EVENT_SLUG,
    title: "Queer Karaoke Night",
    startAt: nextFridayShowStart().toISOString(),
    timezone: LISBON_TIMEZONE,
    area: "Bairro Alto",
    isOnline: false,
    artist: personaOf(DEMO_ARTIST_NIGHTFORM, coverOf("demo-release-home-4")),
  },
  previews: DEMO_PREVIEWS,
  artists: DEMO_ARTIST_CARDS,
  photos: {
    hero: {
      url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1600&auto=format&fit=crop",
      altText: {
        en: "A performer sings into a microphone under warm stage lights while the audience sings along",
        pt: "Uma pessoa canta ao microfone sob luzes quentes de palco enquanto o público canta com ela",
      },
      credit: null,
    },
    manifesto: {
      url: "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=1600&auto=format&fit=crop",
      altText: {
        en: "A choir rehearses together, singers standing close and reading from the same pages",
        pt: "Um coro ensaia em conjunto, com as pessoas bem juntas a ler das mesmas páginas",
      },
      credit: null,
    },
  },
};
