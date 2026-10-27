import type { TFunction } from "../../../../shared/i18n/types";
import type { Person } from "../../../communities/communityDetails";
import type { AttendeeRow } from "../../../gatherings/api/events.adapters";
import type {
  GoingChipPerson,
  GoingChipRole,
} from "../../../gatherings/GoingAttendeeChip";
import { sampleDateTime } from "../shared/sampleDates";
import {
  ANA,
  EVENT_DAYS_AHEAD,
  INES,
  JOANA,
  SAMPLE_COLLECTIVE_NAME,
  samplePerson,
  TOME,
  unsplash,
} from "./communitiesSample.data";

/**
 * The sample content the walkthrough steps show and the hero does not: a
 * join request waiting for the team, two threads in Discussion, who hosts
 * the event and who comes in through the door. Every name is fictional.
 */

const LEO = samplePerson(
  "Leo Matos",
  "LM",
  "jade",
  "photo-1492562080023-ab3db95bfbce",
);

/** One person asking to join the sample collective, as the team's queue
 *  shows them. */
export interface SampleJoinRequest {
  person: Person;
  sharedConnectionCount: number;
  note: string;
  timeLabel: string;
}

export function buildSampleJoinRequest(t: TFunction): SampleJoinRequest {
  return {
    person: LEO,
    sharedConnectionCount: 3,
    note: t("forCommunities:sample.joinRequest.note"),
    timeLabel: t("forCommunities:sample.joinRequest.time"),
  };
}

/** One thread in the collective's Discussion tab. */
export interface SampleThread {
  threadId: string;
  title: string;
  author: Person;
  timeLabel: string;
  voteCount: number;
  replyCount: number;
}

export function buildSampleThreads(t: TFunction): readonly SampleThread[] {
  return [
    {
      threadId: "zine",
      title: t("forCommunities:sample.thread.zine.title"),
      author: TOME,
      timeLabel: t("forCommunities:sample.thread.zine.time"),
      voteCount: 18,
      replyCount: 24,
    },
    {
      threadId: "first-timers",
      title: t("forCommunities:sample.thread.firstTimers.title"),
      author: INES,
      timeLabel: t("forCommunities:sample.thread.firstTimers.time"),
      voteCount: 11,
      replyCount: 9,
    },
  ];
}

/** One person in the event's "Who's going" row, with their host role. */
export interface SampleGoingChip {
  person: GoingChipPerson;
  role: GoingChipRole;
}

function goingPerson(person: Person, slug: string): GoingChipPerson {
  return {
    slug,
    firstName: person.name.split(" ")[0] ?? person.name,
    fullName: person.name,
    initials: person.initials,
    avatarUrl: person.avatarUrl ?? undefined,
  };
}

export function buildSampleGoing(): readonly SampleGoingChip[] {
  return [
    { person: goingPerson(INES, "sample-ines"), role: "host" },
    { person: goingPerson(JOANA, "sample-joana"), role: "cohost" },
    { person: goingPerson(ANA, "sample-ana"), role: null },
  ];
}

/** A community on the event: the one hosting it, or one invited as a guest. */
export interface SampleHostingCommunity {
  slug: string;
  name: string;
  /** Null draws the community icon in place of a mark. */
  avatarImageUrl: string | null;
}

export const SAMPLE_LEAD_COMMUNITY: SampleHostingCommunity = {
  slug: "sample-collective",
  name: SAMPLE_COLLECTIVE_NAME,
  avatarImageUrl: unsplash("photo-1529156069898-49953e39b3ac", 120),
};

export const SAMPLE_GUEST_COMMUNITY: SampleHostingCommunity = {
  slug: "sample-roller-crew",
  name: "Roller Riot Lisboa",
  avatarImageUrl: null,
};

/** The guest list at the door: one guest already in, two still to come. */
export function buildSampleDoorGuests(today: Date): readonly AttendeeRow[] {
  const guest = (
    person: Person,
    slug: string,
    tone: Pick<AttendeeRow, "background" | "color">,
  ): AttendeeRow => ({
    id: slug,
    slug,
    name: person.name,
    initials: person.initials,
    avatarUrl: person.avatarUrl ?? undefined,
    checkedInAt: null,
    ...tone,
  });
  const jadeTone = {
    background: "rgba(var(--jade-rgb), .12)",
    color: "var(--jade)",
  };
  const accentTone = {
    background: "rgba(var(--accent-rgb), .12)",
    color: "var(--accent-ink)",
  };
  return [
    {
      ...guest(ANA, "sample-ana", accentTone),
      checkedInAt: sampleDateTime(today, EVENT_DAYS_AHEAD, 20, 12),
    },
    { ...guest(LEO, "sample-leo", jadeTone), guestCount: 1 },
    guest(TOME, "sample-tome", accentTone),
  ];
}
