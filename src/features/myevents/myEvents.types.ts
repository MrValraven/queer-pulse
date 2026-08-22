/** Domain types for the My Events dashboard (all mock/static). */

export type EventCategory =
  "going" | "hosting" | "waitlisted" | "past" | "saved" | "invite" | "sent";

/** Avatar tints used by the stacked attendee avatars. */
export type Tint = "coral" | "jade" | "plum";
export type AvatarSpec = [initials: string, tint: Tint];

export interface EventSeries {
  label: string;
  more?: string;
  dates?: string;
}

export interface DayOf {
  run?: [time: string, label: string][];
  bring?: string[];
  weather?: string;
  meet?: string;
  door?: string;
}

export interface MyEvent {
  id: string;
  category: EventCategory;
  /** Slug of the gathering detail page this event links to (see gatherings/data.ts). */
  slug?: string;
  title: string;
  date: string; // YYYY-MM-DD
  start: string;
  end?: string;
  /** The raw ISO 8601 instants the API sent, kept alongside the display-ready
   *  `date`/`start`/`end` strings (which are the browser's local rendering of
   *  them). The .ics exporter needs a real instant rather than a floating
   *  wall-clock time — see `myEvents.ics.ts`. Absent in demo mode, where the
   *  mock authors local wall-clock times directly. */
  startAtIso?: string;
  endAtIso?: string;
  venue: string;
  community?: string;
  /** The event's real host — a member slug, so "Block host"
   *  (`useMyEventsSafety`) can call the real block primitive. `hostName` is
   *  the display name for the confirm dialog. Absent when the event has no
   *  individual member host (an org-hosted event) or (in demo mode) the
   *  mock registry doesn't model one. */
  hostSlug?: string;
  hostName?: string;
  going: number;
  /** state flags */
  reminder?: boolean;
  maybe?: boolean;
  cancelled?: boolean;
  review?: boolean;
  blocked?: boolean;
  online?: boolean;
  timezone?: string;
  ticket?: boolean;
  sliding?: boolean;
  paid?: string;
  /** hosting */
  waitlist?: number;
  cohost?: boolean;
  cohosts?: AvatarSpec[];
  cohostName?: string;
  /** waitlist */
  position?: number;
  ahead?: number;
  /** social */
  friends?: number;
  who?: AvatarSpec[];
  whoText?: string;
  /** access + notes */
  access?: string[];
  contentNote?: string;
  changed?: string;
  series?: EventSeries;
  dayof?: DayOf;
  /** saved / invite */
  spotsLeft?: number;
  soldOut?: boolean;
  from?: string;
  deadline?: string;
  invitee?: string;
  /** past */
  photos?: boolean;
  taggedPhotos?: number;
  connect?: boolean;
  receipt?: boolean;
  noShow?: boolean;
}

export interface Notif {
  id: string;
  lead?: string;
  bold: string;
  tail?: string;
  time: string;
  eventId: string;
  unread: boolean;
}

export type Pill =
  "upcoming" | "going" | "hosting" | "waitlisted" | "past" | "saved";
export type CalView = "month" | "week" | "year";
export type SortBy = "date" | "community" | "status";
export type Density = "comfortable" | "compact";
export type MobileView = "list" | "cal";

export interface Prefs {
  reminderLead: string;
  visibility: string;
  email: boolean;
  push: boolean;
}

export type FilterKey = "inperson" | "online" | "free" | "paid" | "month";
