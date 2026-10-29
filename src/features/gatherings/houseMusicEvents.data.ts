import type { GatheringDetail } from "./data";

/**
 * The four demo events the QueerPulse team hosts in the Music family, one per
 * kind of house music event: a club night, a live session, a listening party
 * that already happened and a jam session that was called off. They are
 * registry entries only; `data.ts` spreads them into `gatheringDetails`, so
 * demo mode can open each of them from its slug.
 */
export const HOUSE_MUSIC_DEMO_SLUGS = {
  clubNight: "queerpulse-club-night",
  liveSession: "queerpulse-live-session",
  listeningParty: "queerpulse-listening-party",
  jamSession: "queerpulse-jam-session",
} as const;

/** The registry keys of `HOUSE_MUSIC_DEMO_SLUGS`, which key the venues too. */
const HOUSE_EVENT_KEYS = [
  "clubNight",
  "liveSession",
  "listeningParty",
  "jamSession",
] as const;

/** Offsets in days from today. The listening party sits in the past, so the
 *  demo shows one finished music event beside the upcoming ones. */
const CLUB_NIGHT_DAY_OFFSET = 12;
const LIVE_SESSION_DAY_OFFSET = 20;
const LISTENING_PARTY_DAY_OFFSET = -14;
const JAM_SESSION_DAY_OFFSET = 5;

/** One capacity for every house demo event: the Overview, Attendees and public
 *  demo pages all read 20 seats, so the public "spots left" is derived from it
 *  and each event's going count rather than written down a second time. */
const HOUSE_DEMO_CAPACITY = 20;

/** The going count each house demo event reports, within the capacity. The
 *  club night and live session match the Overview demo's 14 going. */
const GOING_COUNT = {
  clubNight: 14,
  liveSession: 14,
  listeningParty: 18,
  jamSession: 12,
} as const;

/** The venue each house demo event is held at, also named by its demo
 *  announcements so the two never disagree. */
const HOUSE_DEMO_VENUES = {
  clubNight: "Armazém Marvila",
  liveSession: "Sala do Intendente",
  listeningParty: "Casa de Arroios",
  jamSession: "The Hub, Anjos",
} as const;

/** The spots-left label: capacity minus the going count. */
function spotsLeft(goingCount: number): GatheringDetail["spots"] {
  return {
    key: "gatherings:spots.spotsLeft",
    values: { count: HOUSE_DEMO_CAPACITY - goingCount },
  };
}

/** A local Date `dayOffset` days from today at the given clock time. Dated
 *  here, relative to the day the page loads, because the demo registries that
 *  carry fixed dates fall into the past and leave the board empty. */
function daysFromToday(dayOffset: number, hour: number, minute: number): Date {
  const today = new Date();
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + dayOffset,
    hour,
    minute,
  );
}

export const HOUSE_MUSIC_DEMO_DETAILS: Record<string, GatheringDetail> = {
  [HOUSE_MUSIC_DEMO_SLUGS.clubNight]: {
    slug: HOUSE_MUSIC_DEMO_SLUGS.clubNight,
    type: "club-night",
    gatheringFamily: "music",
    formatDetails: { isAdultsOnly: true, isSoberFriendly: true },
    date: daysFromToday(CLUB_NIGHT_DAY_OFFSET, 23, 0),
    title: "QueerPulse Club Night",
    hood: "Marvila",
    host: "QueerPulse",
    hostSlug: "",
    venue: HOUSE_DEMO_VENUES.clubNight,
    capacity: HOUSE_DEMO_CAPACITY,
    goingCount: GOING_COUNT.clubNight,
    spots: spotsLeft(GOING_COUNT.clubNight),
    ctaKey: "gatherings:cta.illBeThere",
    body: "Our team takes over a warehouse in Marvila for a night of queer club music, with resident DJs from the Studio and a floor that stays open until sunrise. Water is free all night, there is a quiet room whenever you need a break, and a sober-friendly bar serves the full evening. The address goes out to confirmed guests on the day.",
  },
  [HOUSE_MUSIC_DEMO_SLUGS.liveSession]: {
    slug: HOUSE_MUSIC_DEMO_SLUGS.liveSession,
    type: "live-performance",
    gatheringFamily: "music",
    formatDetails: { runtimeMinutes: 90 },
    date: daysFromToday(LIVE_SESSION_DAY_OFFSET, 20, 30),
    title: "QueerPulse Live: Songs from the Studio",
    hood: "Intendente",
    host: "QueerPulse",
    hostSlug: "",
    venue: HOUSE_DEMO_VENUES.liveSession,
    capacity: HOUSE_DEMO_CAPACITY,
    goingCount: GOING_COUNT.liveSession,
    spots: spotsLeft(GOING_COUNT.liveSession),
    ctaKey: "gatherings:cta.reserveSeat",
    body: "Three artists from the QueerPulse Studio play their new songs live in a small room in Intendente, with a few words about how each one came together. Expect around ninety minutes of music with a short break in the middle. Seats are first come, first served, and the room is step-free.",
  },
  [HOUSE_MUSIC_DEMO_SLUGS.listeningParty]: {
    slug: HOUSE_MUSIC_DEMO_SLUGS.listeningParty,
    type: "listening-party",
    gatheringFamily: "music",
    date: daysFromToday(LISTENING_PARTY_DAY_OFFSET, 19, 0),
    title: "Listening Party: New Lisbon Sounds",
    hood: "Arroios",
    host: "QueerPulse",
    hostSlug: "",
    venue: HOUSE_DEMO_VENUES.listeningParty,
    capacity: HOUSE_DEMO_CAPACITY,
    goingCount: GOING_COUNT.listeningParty,
    spots: spotsLeft(GOING_COUNT.listeningParty),
    ctaKey: "gatherings:cta.rsvp",
    body: "An evening of new releases from queer artists across Lisbon, played start to finish on a proper sound system. Each record came with a short introduction from the artist or from our team, and the floor opened for talk between tracks. Thank you to everyone who came and listened.",
  },
  [HOUSE_MUSIC_DEMO_SLUGS.jamSession]: {
    slug: HOUSE_MUSIC_DEMO_SLUGS.jamSession,
    type: "jam-session",
    gatheringFamily: "music",
    formatDetails: { bring: "Your instrument and a cable" },
    date: daysFromToday(JAM_SESSION_DAY_OFFSET, 19, 0),
    title: "Open Jam at the Hub",
    hood: "Anjos",
    host: "QueerPulse",
    hostSlug: "",
    venue: HOUSE_DEMO_VENUES.jamSession,
    capacity: HOUSE_DEMO_CAPACITY,
    goingCount: GOING_COUNT.jamSession,
    spots: spotsLeft(GOING_COUNT.jamSession),
    ctaKey: "gatherings:cta.rsvp",
    body: "An open evening for anyone who plays, with a shared backline and no setlist. Come with an instrument and a cable, find people to play with and stay for a song or the whole night. This session has been cancelled and we will announce the next date soon.",
    cancelled: true,
  },
};

/** One announcement in the manage Messages tab's demo history. */
export interface HouseDemoMessage {
  id: string;
  subject: string;
  sentAt: Date;
  preview: string;
  openedCount: number;
}

/**
 * The demo announcements of a house music event, each naming that event's own
 * venue. The member demo keeps its own brunch history in
 * `manageGathering.data.ts`; a house event reading that history would tell its
 * guests about a terrace somewhere else. A slug with no entry here has no
 * history yet.
 */
export function houseDemoMessages(slug: string): HouseDemoMessage[] {
  const eventKey = HOUSE_EVENT_KEYS.find(
    (houseEventKey) => HOUSE_MUSIC_DEMO_SLUGS[houseEventKey] === slug,
  );
  if (!eventKey) return [];
  const venueName = HOUSE_DEMO_VENUES[eventKey];
  return [
    {
      id: "msg-venue",
      subject: "Venue details confirmed",
      sentAt: daysFromToday(-4, 18, 0),
      preview: `We have confirmed ${venueName}. The address and the door time go out to confirmed guests on the day, and our team will be at the entrance with the QueerPulse sign…`,
      openedCount: 11,
    },
    {
      id: "msg-bring",
      subject: "What to bring",
      sentAt: daysFromToday(-2, 12, 0),
      preview:
        "Just yourselves. Water is free and there is a quiet corner for anyone who needs a break from the crowd…",
      openedCount: 9,
    },
  ];
}

/** One performer on a house event's demo lineup. A Studio artist carries the
 *  stage name they play under; a member of the demo registry (Inês) leaves
 *  `name` out and is read from it, so her photo and staff badge follow. */
export interface HouseDemoLineupEntry {
  slug: string;
  name?: string;
  role: string;
  status: "accepted" | "pending" | "declined";
}

/**
 * The demo lineup of each house music event. The confirmed, invited and
 * declined counts of the admin music events list rows are tallied from these
 * entries (`demoLineupCounts`), so the list and the manage page's lineup
 * editor agree: club night 3/2/1, live session 2/1/0, the finished listening party
 * 3/0/0 and the jam session 1/1/1.
 */
export const HOUSE_DEMO_LINEUPS: Readonly<
  Record<string, readonly HouseDemoLineupEntry[]>
> = {
  [HOUSE_MUSIC_DEMO_SLUGS.clubNight]: [
    { slug: "ines", role: "drag", status: "accepted" },
    { slug: "marta-reis", name: "DJ Maré", role: "dj", status: "accepted" },
    { slug: "bruna-seixas", name: "DJ Seixo", role: "dj", status: "accepted" },
    {
      slug: "caio-mendes",
      name: "Caio and the Tides",
      role: "musician",
      status: "pending",
    },
    { slug: "iris-calado", name: "Íris", role: "musician", status: "pending" },
    {
      slug: "ravi-almeida",
      name: "Miss Saudade",
      role: "drag",
      status: "declined",
    },
  ],
  [HOUSE_MUSIC_DEMO_SLUGS.liveSession]: [
    {
      slug: "caio-mendes",
      name: "Caio and the Tides",
      role: "musician",
      status: "accepted",
    },
    { slug: "iris-calado", name: "Íris", role: "musician", status: "accepted" },
    {
      slug: "bruna-seixas",
      name: "Bruna Seixas Trio",
      role: "musician",
      status: "pending",
    },
  ],
  [HOUSE_MUSIC_DEMO_SLUGS.listeningParty]: [
    {
      slug: "caio-mendes",
      name: "Caio and the Tides",
      role: "musician",
      status: "accepted",
    },
    { slug: "iris-calado", name: "Íris", role: "musician", status: "accepted" },
    {
      slug: "bruna-seixas",
      name: "Bruna Seixas Trio",
      role: "musician",
      status: "accepted",
    },
  ],
  [HOUSE_MUSIC_DEMO_SLUGS.jamSession]: [
    {
      slug: "caio-mendes",
      name: "Caio and the Tides",
      role: "musician",
      status: "accepted",
    },
    { slug: "iris-calado", name: "Íris", role: "musician", status: "pending" },
    {
      slug: "bruna-seixas",
      name: "Bruna Seixas Trio",
      role: "musician",
      status: "declined",
    },
  ],
};
