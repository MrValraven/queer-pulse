import type { ComponentProps } from "react";
import { routes } from "../../../../app/routeMap";
import type { ImageSlotTint } from "../../../../shared/components/ui/ImageSlot";
import type { TFunction } from "../../../../shared/i18n/types";
import type { CommunityCardShell } from "../../../communities/CommunityCardShell";
import type { Reaction } from "../../../communities/community.model";
import type { Person } from "../../../communities/communityDetails";
import type {
  AccessTier,
  CommunityRole,
} from "../../../communities/membership.types";
import type { CheckinMeter } from "../../../gatherings/checkin/CheckinMeter";
import type { CalendarEvent } from "../../../gatherings/data";
import type { SampleLineupEntry } from "../shared/SampleLineupPanel";
import { sampleDateTime } from "../shared/sampleDates";

/**
 * The made-up collective the communities page shows: its card, one event
 * moving through its life, the lineup, a post from its co-owner, the door on
 * the night and the album after. Every name is fictional and every photo is
 * one the demo fixtures already use.
 */

/** The sample collective's name, the event's `org` too. */
export const SAMPLE_COLLECTIVE_NAME = "Glitter Paste Collective";

/** How the sample collective lets people in: they ask, and the team answers. */
export const SAMPLE_COMMUNITY_TIER: AccessTier = "request";

/** Days from today to the sample event, so it is always coming up. */
export const EVENT_DAYS_AHEAD = 12;
const EVENT_START_HOUR = 20;

export function unsplash(photoId: string, width: number): string {
  return `https://images.unsplash.com/${photoId}?q=80&w=${width}&auto=format&fit=crop`;
}

export function samplePerson(
  name: string,
  initials: string,
  tint: Person["tint"],
  photoId: string,
): Person {
  return { name, initials, tint, avatarUrl: unsplash(photoId, 240) };
}

export const JOANA = samplePerson(
  "Joana Prata",
  "JP",
  "coral",
  "photo-1531123897727-8f129e1688ce",
);
export const INES = samplePerson(
  "Inês Vidal",
  "IV",
  "jade",
  "photo-1438761681033-6461ffad8d80",
);
export const TOME = samplePerson(
  "Tomé Lago",
  "TL",
  "plum",
  "photo-1507003211169-0a1dd7228f2d",
);
export const ANA = samplePerson(
  "Ana Brás",
  "AB",
  "coral",
  "photo-1554151228-14d9def656e4",
);

/** The collective's card, as Discover draws it. The page adds the tier badge
 *  and the join pill, which are markup. */
export function buildSampleCommunity(
  t: TFunction,
): ComponentProps<typeof CommunityCardShell> {
  return {
    name: SAMPLE_COLLECTIVE_NAME,
    type: "arts",
    typeLabel: t("communities:category.arts"),
    description: t("forCommunities:sample.community.description"),
    countLabel: t("communities:common.count.members", { count: 120 }),
    activeThisWeek: 30,
    coverImageUrl: unsplash("photo-1529156069898-49953e39b3ac", 720),
    tags: ["creative-collective", "nightlife-events", "drag-performance"],
    roster: [INES, JOANA, TOME, ANA],
    isPreview: true,
  };
}

/** The collective's next club night, free at the door. Its link points back
 *  at this page; it sits inside an inert frame either way. */
export function buildSampleEvent(t: TFunction, today: Date): CalendarEvent {
  return {
    date: sampleDateTime(today, EVENT_DAYS_AHEAD, EVENT_START_HOUR),
    org: SAMPLE_COLLECTIVE_NAME,
    orgColor: "var(--violet)",
    title: t("forCommunities:sample.event.title"),
    hood: "Arroios",
    to: routes.forCommunities,
    kind: "gathering",
    eventType: "club-night",
    gatheringFamily: "party",
    isFree: true,
    coverImageUrl: unsplash("photo-1516450360452-9312f5e86fc7", 1200),
    themes: ["greeter-at-the-door", "good-to-come-solo", "drag"],
    hostingCommunity: {
      id: "sample-collective",
      slug: "sample-collective",
      name: SAMPLE_COLLECTIVE_NAME,
    },
    isCoHosted: true,
  };
}

/** The bill: four people the hosts invited, each with their craft. */
export function buildSampleLineup(): readonly SampleLineupEntry[] {
  return [
    {
      entryId: "mara",
      name: "Mara Sol",
      kind: "dj",
      avatarUrl: unsplash("photo-1534528741775-53994a69daeb", 240),
    },
    {
      entryId: "faisca",
      name: "Dona Faísca",
      kind: "drag",
      avatarUrl: unsplash("photo-1544005313-94ddf0286df2", 240),
    },
    {
      entryId: "rui",
      name: "Rui Bento",
      kind: "dancer",
      avatarUrl: unsplash("photo-1506794778202-cad84cf45f1d", 240),
    },
    {
      entryId: "ines",
      name: INES.name,
      kind: "host",
      avatarUrl: INES.avatarUrl ?? undefined,
    },
  ];
}

/** One post on the collective's page, from its co-owner. */
export interface SampleDiscussion {
  author: Person;
  role: CommunityRole;
  timeLabel: string;
  text: string;
  reactions: Reaction[];
  replyCount: number;
}

export function buildSampleDiscussion(t: TFunction): SampleDiscussion {
  return {
    author: JOANA,
    role: "co_owner",
    timeLabel: t("forCommunities:sample.discussion.time"),
    text: t("forCommunities:sample.discussion.text"),
    reactions: [
      { key: "heart", count: 12 },
      { key: "celebrate", count: 8 },
      { key: "fire", count: 5 },
    ],
    replyCount: 6,
  };
}

/** The three people who run the collective, one per role. */
export interface SampleTeamMember {
  person: Person;
  role: CommunityRole;
}

export function buildSampleTeam(): readonly SampleTeamMember[] {
  return [
    { person: INES, role: "owner" },
    { person: JOANA, role: "co_owner" },
    { person: TOME, role: "mod" },
  ];
}

/** The door on the night: the event has started, and most people are in. */
export function buildSampleCheckin(
  today: Date,
): ComponentProps<typeof CheckinMeter> {
  return {
    arrivedCount: 30,
    goingCount: 40,
    seatsTaken: 40,
    waitlistCount: 6,
    startAt: sampleDateTime(today, EVENT_DAYS_AHEAD, EVENT_START_HOUR),
    endAt: sampleDateTime(today, EVENT_DAYS_AHEAD, 23, 30),
    now: sampleDateTime(today, EVENT_DAYS_AHEAD, 21, 15),
  };
}

/** One photo in the event's album. */
export interface SampleAlbumPhoto {
  photoId: string;
  src: string;
  tint: ImageSlotTint;
}

const ALBUM_PHOTOS: readonly [string, ImageSlotTint][] = [
  ["photo-1582213782179-e0d53f98f2ca", "coral"],
  ["photo-1719590839309-5dbf71989e8d", "jade"],
  ["photo-1720524119990-97c506ee1246", "plum"],
  ["photo-1720741741673-ce5c7a2c2fb2", "coral"],
  ["photo-1723199686044-32743f788589", "jade"],
  ["photo-1731174218715-9b4d23795265", "plum"],
];

export function buildSampleAlbum(): readonly SampleAlbumPhoto[] {
  return ALBUM_PHOTOS.map(([photoId, tint]) => ({
    photoId,
    src: unsplash(photoId, 640),
    tint,
  }));
}
