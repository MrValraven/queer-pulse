import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { Mention, MentionAction, MentionCategory } from "./mentions.data";

// Heavy demo-only mention seed registry + builder. Imported *only* via the
// demo-gated dynamic import() in api/useMentions.ts so it code-splits out of
// the live bundle (live mode has no mentions endpoint yet and returns []).

interface MentionSeed {
  id: string;
  initials: string;
  tint: Mention["tint"];
  name: string;
  actorSlug?: string;
  category: MentionCategory;
  context: (t: TFunction) => ReactNode;
  when: (fmt: Formatters) => string;
  fresh?: boolean;
  unread?: boolean;
  content: ReactNode;
  whereText: string;
  whereTo?: string;
  actions: MentionAction[];
  day: "today" | "yesterday" | "thisWeek";
}

const MENTION_SEEDS: MentionSeed[] = [
  {
    id: "m1",
    initials: "AK",
    tint: "coral",
    name: "Anika Kovač",
    actorSlug: "anika",
    category: "post",
    context: (t) => t("notifications:mentions.context.reply"),
    when: (fmt) => fmt.relativeTime(-14, "minute"),
    fresh: true,
    unread: true,
    content: (
      <>
        "Thanks <mark>@tomás</mark>, Inês's mobile was the right answer. Got
        the slot. <em>Calling tomorrow morning to confirm.</em>"
      </>
    ),
    whereText:
      '"Anyone have recommendations for a queer-friendly GP in Lisbon?"',
    actions: [
      { type: "reply", primary: true },
      { type: "openThread" },
      { type: "markRead" },
    ],
    day: "today",
  },
  {
    id: "m2",
    initials: "SP",
    tint: "jade",
    name: "Sara Pinheiro",
    actorSlug: "sara-pinheiro",
    category: "article",
    context: (t) => t("notifications:mentions.context.articleComment"),
    when: (fmt) => fmt.relativeTime(-3, "hour"),
    fresh: true,
    unread: true,
    content: (
      <>
        "<mark>@tomás</mark>, your Issue 5 piece on the four-day week comes up
        here too, particularly the section about clinic schedules. Worth
        re-reading."
      </>
    ),
    whereText:
      '"Five things I learned navigating Lisbon\'s trans health system"',
    actions: [{ type: "reply", primary: true }, { type: "openArticle" }],
    day: "today",
  },
  {
    id: "m3",
    initials: "MR",
    tint: "plum",
    name: "Marta Reis",
    category: "event",
    context: (_t) => (
      <Translation
        i18nKey="notifications:mentions.context.namedInvite"
        values={{ name: "Open Studio" }}
      />
    ),
    when: (fmt) => fmt.relativeTime(-6, "hour"),
    fresh: true,
    unread: true,
    content: (
      <>
        "<mark>@tomás</mark>, bringing the Issue 10 spreads for live edit on
        Thu 26 Jun. Hope you can make it. <em>Bring a red pen.</em>"
      </>
    ),
    whereText: "Open Studio · 26 Jun · Atelier Pulso",
    actions: [{ type: "rsvp", primary: true }, { type: "reply" }],
    day: "today",
  },
  {
    id: "m4",
    initials: "LG",
    tint: "coral",
    name: "Luísa Gomes",
    actorSlug: "luisa",
    category: "post",
    context: (_t) => (
      <Translation
        i18nKey="notifications:mentions.context.communityPost"
        values={{ community: "Creatives" }}
      />
    ),
    when: (fmt) => fmt.relativeTime(-1, "day"),
    content: (
      <>
        "For anyone going to <mark>@tomás</mark>'s portfolio night on Wed.
        Bring three pieces, not five, and at least one that you think is bad."
      </>
    ),
    whereText: "Creatives community",
    actions: [{ type: "openPost" }],
    day: "yesterday",
  },
  {
    id: "m5",
    initials: "FL",
    tint: "jade",
    name: "Filipa Lopes",
    category: "post",
    context: (t) => t("notifications:mentions.context.thread"),
    when: (fmt) => fmt.relativeTime(-1, "day"),
    content: (
      <>
        "<mark>@tomás</mark> ran a great session at the riso night. Recommend
        if you're new to the medium."
      </>
    ),
    whereText: '"What\'s a Lisbon workshop worth the money?"',
    actions: [],
    day: "yesterday",
  },
  {
    id: "m6",
    initials: "CV",
    tint: "plum",
    name: "Catarina Vaz",
    actorSlug: "catarina-vaz",
    category: "event",
    context: (t) => t("notifications:mentions.context.eventInvite"),
    when: (fmt) => fmt.date(new Date(2026, 5, 15), { weekday: "short" }),
    content: (
      <>
        "Inviting <mark>@tomás</mark>, <mark>@luísa</mark>, and{" "}
        <mark>@filipa</mark> to a small post-Pride dinner at my place.{" "}
        <em>Bring something to grill.</em>"
      </>
    ),
    whereText: "a private invite · 6 people",
    actions: [],
    day: "thisWeek",
  },
  {
    id: "m7",
    initials: "TC",
    tint: "coral",
    name: "Tó Cunha",
    category: "post",
    context: (t) => t("notifications:mentions.context.reply"),
    when: (fmt) => fmt.date(new Date(2026, 5, 13), { weekday: "short" }),
    content: (
      <>
        "<mark>@tomás</mark>, your Issue 5 long-read is the piece that got me
        into riso. Full circle."
      </>
    ),
    whereText: "Riso workshop · feedback thread",
    actions: [],
    day: "thisWeek",
  },
  {
    id: "m8",
    initials: "RV",
    tint: "jade",
    name: "Rita Vasquez",
    category: "post",
    context: (_t) => (
      <Translation
        i18nKey="notifications:mentions.context.communityReply"
        values={{ community: "Wellbeing" }}
      />
    ),
    when: (fmt) => fmt.date(new Date(2026, 5, 12), { weekday: "short" }),
    content: (
      <>
        "<mark>@tomás</mark>, could you message me about the post-march
        decompression event? Want to co-host."
      </>
    ),
    whereText: "Wellbeing community",
    actions: [],
    day: "thisWeek",
  },
];

/**
 * Build the day-grouped mention list. A function of `t` + `fmt` (Pattern B):
 * `context` carries a translated phrase (some with an embedded proper noun
 * token) and `when` is computed through `fmt.relativeTime`/`fmt.date` rather
 * than a hand-rolled string.
 */
export function buildMentionDays(
  t: TFunction,
  fmt: Formatters,
): { day: string; items: Mention[] }[] {
  const dayLabel: Record<MentionSeed["day"], string> = {
    today: t("notifications:mentions.day.today"),
    yesterday: t("notifications:mentions.day.yesterday"),
    thisWeek: t("notifications:mentions.day.thisWeek"),
  };
  const groups = new Map<string, Mention[]>();
  for (const seed of MENTION_SEEDS) {
    const label = dayLabel[seed.day];
    const mention: Mention = {
      id: seed.id,
      initials: seed.initials,
      tint: seed.tint,
      name: seed.name,
      actorSlug: seed.actorSlug,
      category: seed.category,
      context: seed.context(t),
      when: seed.when(fmt),
      fresh: seed.fresh,
      unread: seed.unread,
      content: seed.content,
      whereText: seed.whereText,
      whereTo: seed.whereTo,
      actions: seed.actions,
    };
    const existing = groups.get(label);
    if (existing) existing.push(mention);
    else groups.set(label, [mention]);
  }
  return Array.from(groups, ([day, items]) => ({ day, items }));
}
