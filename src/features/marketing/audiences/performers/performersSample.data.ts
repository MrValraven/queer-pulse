import type { TFunction } from "../../../../shared/i18n/types";
import type { CohostInviteEventSummaryDTO } from "../../../gatherings/api/events.api";
import type {
  SubprofileItemDTO,
  SubprofilePublicDTO,
  SubprofileSection,
} from "../../../subprofiles/api/subprofiles.api";
import type { SampleLineupEntry } from "../shared/SampleLineupPanel";
import { sampleDateTime, sampleIsoDate } from "../shared/sampleDates";

/**
 * The sample performer on the performers page. Juno Lantejoula is made up:
 * the name, the handle, the venues and the gigs belong to nobody. The photos
 * are stock images the demo fixtures already use. Every sentence goes
 * through `t`, so a Portuguese visitor reads Portuguese; proper nouns (the
 * stage name, venues, show and look titles) stay as written.
 */

/** The crafts the "Try it" switch offers. All four wear the Stage skin. */
export const PERFORMER_TRY_KINDS = [
  "drag",
  "dj",
  "comedian",
  "dancer",
] as const;
export type PerformerTryKind = (typeof PERFORMER_TRY_KINDS)[number];

export const SAMPLE_STAGE_NAME = "Juno Lantejoula";
export const SAMPLE_HANDLE = "juno-lantejoula";

/**
 * The member behind the persona, as an event lineup lists them: their own
 * member name and profile photo, with their craft beside the name. A lineup
 * lists members (Correction 3), and Juno is a standalone persona, so the row
 * never shows the persona's name or face.
 */
export const SAMPLE_MEMBER_NAME = "Rafa Monteiro";

const UNSPLASH = "https://images.unsplash.com";
/** The persona's own photo, a stage-lit portrait the demo fixtures already
 *  use. Exported so the guard can keep it off the lineup. */
export const SAMPLE_PERSONA_AVATAR_URL = `${UNSPLASH}/photo-1502823403499-6ccfcf4fb453?q=80&w=800&auto=format&fit=crop`;
const MEMBER_PHOTO_URL = `${UNSPLASH}/photo-1614204424926-196a80bf0be8?q=80&w=400&auto=format&fit=crop`;
const LOOK_SAINT_URL = `${UNSPLASH}/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop`;
const LOOK_SAILOR_URL = `${UNSPLASH}/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop`;
const MIX_SUNRISE_URL = `${UNSPLASH}/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop`;
const MIX_HARBOUR_URL = `${UNSPLASH}/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop`;
const LINEUP_DJ_URL = `${UNSPLASH}/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop`;
const LINEUP_HOST_URL = `${UNSPLASH}/photo-1506863530036-1efeddceb993?q=80&w=400&auto=format&fit=crop`;

const EXAMPLE_SITE = "https://example.com/juno-lantejoula";

/** The one show every craft plays next, so the switch keeps the same date. */
const NEXT_SHOW_TITLE = "Lantejoula Late Show";
const NEXT_SHOW_VENUE = "Teatro do Cais Velho";
const PAST_SHOW_VENUE = "Armazém Nove";

/** The upcoming and the past date, counted from today. */
const NEXT_SHOW_IN_DAYS = 9;
const PAST_SHOW_DAYS_AGO = -38;

/** The host on the sample lineup, who invites the member onto the bill. */
export const SAMPLE_INVITER_FIRST_NAME = "Noor";

/** The two sections a craft fills, in the order `KIND_SECTIONS` lists them,
 *  and which of them carries the dated shows. */
interface CraftSections {
  datedSection: SubprofileSection;
  workSection: SubprofileSection;
}

const CRAFT_SECTIONS: Record<PerformerTryKind, CraftSections> = {
  drag: { datedSection: "shows", workSection: "looks" },
  dj: { datedSection: "gigs", workSection: "mixes" },
  comedian: { datedSection: "tour", workSection: "sets" },
  dancer: { datedSection: "performances", workSection: "reel" },
};

function item(
  itemId: string,
  section: SubprofileSection,
  fields: Partial<SubprofileItemDTO> & { title: string },
): SubprofileItemDTO {
  return {
    id: itemId,
    section,
    createdAt: "2026-01-15T10:00:00.000Z",
    tags: [],
    isFeatured: false,
    collaborators: [],
    ...fields,
  };
}

/** The upcoming show and one already played, in the craft's dated section. */
function datedItems(
  t: TFunction,
  kind: PerformerTryKind,
  today: Date,
): SubprofileItemDTO[] {
  const section = CRAFT_SECTIONS[kind].datedSection;
  return [
    item(`sample-${kind}-next`, section, {
      title: NEXT_SHOW_TITLE,
      subtitle: t(`forPerformers:sample.${kind}.nextSubtitle`),
      date: sampleIsoDate(today, NEXT_SHOW_IN_DAYS),
      venue: NEXT_SHOW_VENUE,
      doors: "22:30",
      ticketUrl: `${EXAMPLE_SITE}/tickets`,
    }),
    item(`sample-${kind}-past`, section, {
      title: "Sequin Sunday",
      subtitle: t(`forPerformers:sample.${kind}.pastSubtitle`),
      date: sampleIsoDate(today, PAST_SHOW_DAYS_AGO),
      venue: PAST_SHOW_VENUE,
    }),
  ];
}

/** The craft's work: looks, mixes, sets or a reel. Undated, so the only
 *  date after today is the next show. */
function workItems(t: TFunction, kind: PerformerTryKind): SubprofileItemDTO[] {
  const section = CRAFT_SECTIONS[kind].workSection;
  switch (kind) {
    case "drag":
      return [
        item("sample-drag-look-saint", section, {
          title: "Saint of Sequins",
          imageUrl: LOOK_SAINT_URL,
        }),
        item("sample-drag-look-sailor", section, {
          title: "Sailor's Return",
          imageUrl: LOOK_SAILOR_URL,
        }),
      ];
    case "dj":
      return [
        item("sample-dj-mix-sunrise", section, {
          title: "Sunrise Over the River",
          subtitle: t("forPerformers:sample.dj.mixSubtitle"),
          imageUrl: MIX_SUNRISE_URL,
        }),
        item("sample-dj-mix-harbour", section, {
          title: "Harbour Lights",
          subtitle: t("forPerformers:sample.dj.mixSubtitle"),
          imageUrl: MIX_HARBOUR_URL,
        }),
      ];
    case "comedian":
      return [
        item("sample-comedian-set-mother", section, {
          title: "My Mother Reads My Reviews",
          subtitle: t("forPerformers:sample.comedian.setSubtitle"),
        }),
      ];
    case "dancer":
      return [
        item("sample-dancer-reel", section, {
          title: "Juno in Motion",
          subtitle: t("forPerformers:sample.dancer.reelSubtitle"),
        }),
      ];
  }
}

/** Three or four links per craft; handles only, nothing that resolves to a
 *  real account. */
function socialLinksFor(kind: PerformerTryKind) {
  const website = { platform: "website", urlOrHandle: "example.com/juno" };
  const instagram = { platform: "instagram", urlOrHandle: "@juno.lantejoula" };
  const tiktok = { platform: "tiktok", urlOrHandle: "@juno.lantejoula" };
  switch (kind) {
    case "dj":
      return [
        instagram,
        { platform: "soundcloud", urlOrHandle: "juno-lantejoula" },
        website,
      ];
    case "comedian":
      return [
        instagram,
        tiktok,
        { platform: "youtube", urlOrHandle: "@junolantejoula" },
        website,
      ];
    default:
      return [instagram, tiktok, website];
  }
}

/**
 * The sample persona for one craft. The stage name, handle, photo and next
 * show stay the same across crafts, so the visitor watches one persona page
 * change. Exactly one item is dated after `today`.
 */
export function buildSamplePerformer(
  t: TFunction,
  kind: PerformerTryKind,
  today: Date,
): SubprofilePublicDTO {
  return {
    id: `sample-performer-${kind}`,
    kind,
    slug: SAMPLE_HANDLE,
    handle: SAMPLE_HANDLE,
    displayName: SAMPLE_STAGE_NAME,
    avatarUrl: SAMPLE_PERSONA_AVATAR_URL,
    tagline: t(`forPerformers:sample.${kind}.tagline`),
    bio: t(`forPerformers:sample.${kind}.bio`),
    // No cover: every place on the page shows single blocks or the page in
    // a phone frame, where a cover band would only push the content down.
    coverUrl: null,
    accent: "coral",
    availability: "booking",
    ctaLabel: t("forPerformers:sample.cta"),
    ctaUrl: `${EXAMPLE_SITE}/book`,
    socialLinks: socialLinksFor(kind),
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    items: [...datedItems(t, kind, today), ...workItems(t, kind)],
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData: {
      booker: {
        fee: t("forPerformers:sample.booker.fee"),
        rider: t(`forPerformers:sample.${kind}.rider`),
        press: t("forPerformers:sample.booker.press"),
        contact: "booking@example.com",
      },
    },
  };
}

/** The sample event lineup: the member behind the persona, with a DJ and a
 *  host beside them. A lineup lists members by their member name and photo
 *  with their craft (Correction 3). */
export function buildSampleLineup(): readonly SampleLineupEntry[] {
  return [
    {
      entryId: "lineup-rafa",
      name: SAMPLE_MEMBER_NAME,
      avatarUrl: MEMBER_PHOTO_URL,
      kind: "drag",
    },
    {
      entryId: "lineup-dario",
      name: "Dário Brilho",
      avatarUrl: LINEUP_DJ_URL,
      kind: "dj",
    },
    {
      entryId: "lineup-noor",
      name: "Noor Vale",
      avatarUrl: LINEUP_HOST_URL,
      kind: "host",
    },
  ];
}

/**
 * The event a host invites the member to play, as the lineup invite page
 * reads it: the persona's next show, at its venue. The attendee count stays
 * hidden (null), and an empty time zone reads on the visitor's own clock.
 */
export function buildSampleInviteEvent(
  today: Date,
): CohostInviteEventSummaryDTO {
  return {
    slug: "sample-lantejoula-late-show",
    title: NEXT_SHOW_TITLE,
    startAt: sampleDateTime(today, NEXT_SHOW_IN_DAYS, 22, 30).toISOString(),
    endAt: null,
    timezone: "",
    venue: NEXT_SHOW_VENUE,
    isOnline: false,
    goingCount: null,
    waitlistCount: null,
  };
}
