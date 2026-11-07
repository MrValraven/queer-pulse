/**
 * Upcoming events the demo VJ library can link a pack to (C 9.5). Each one
 * reuses a demo event's slug, title and neighbourhood so the projector's QR
 * opens a real demo page. Start times count from the store clock at read
 * time, so the three always lie ahead: in 2 hours, tomorrow and in a week.
 * Ids are fixed v4-shaped uuids so the shared uuid checks pass.
 */

export interface VjDemoEventFixture {
  id: string;
  title: string;
  slug: string;
  /** From the store clock at read time. */
  startOffsetMs: number;
  durationMs: number | null;
  timezone: string;
  area: string | null;
  isOnline: boolean;
}

const HOUR_MS = 60 * 60 * 1000;

export const VJ_DEMO_EVENT_IDS: {
  supperClub: string;
  portfolioNight: string;
  historyWalk: string;
} = {
  supperClub: "00000000-0000-4000-8000-00000000ee01",
  portfolioNight: "00000000-0000-4000-8000-00000000ee02",
  historyWalk: "00000000-0000-4000-8000-00000000ee03",
};

export const VJ_DEMO_EVENTS: readonly VjDemoEventFixture[] = [
  {
    id: VJ_DEMO_EVENT_IDS.supperClub,
    title: "Queer Supper Club №12",
    slug: "supper-club-12",
    startOffsetMs: 2 * HOUR_MS,
    durationMs: 3 * HOUR_MS,
    timezone: "Europe/Lisbon",
    area: "Mouraria",
    isOnline: false,
  },
  {
    id: VJ_DEMO_EVENT_IDS.portfolioNight,
    title: "Portfolio Night: Designers & Photographers",
    slug: "portfolio-night",
    startOffsetMs: 24 * HOUR_MS,
    durationMs: 2 * HOUR_MS,
    timezone: "Europe/Lisbon",
    area: "Príncipe Real",
    isOnline: false,
  },
  {
    id: VJ_DEMO_EVENT_IDS.historyWalk,
    title: "Queer history walk: Mouraria",
    slug: "queer-history-walk",
    startOffsetMs: 7 * 24 * HOUR_MS,
    durationMs: 2.5 * HOUR_MS,
    timezone: "Europe/Lisbon",
    area: "Mouraria",
    isOnline: false,
  },
];
