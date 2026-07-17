import type { TFunction } from "../../shared/i18n/types";

export type NotifType =
  "connection" | "gathering" | "reply" | "mention" | "moderation";
export type AvTint = "jade" | "coral" | "plum";

export const NOTIF_TYPES: { id: NotifType; labelKey: string }[] = [
  { id: "connection", labelKey: "notifications:deepLink.types.connection" },
  { id: "gathering", labelKey: "notifications:deepLink.types.gathering" },
  { id: "reply", labelKey: "notifications:deepLink.types.reply" },
  { id: "mention", labelKey: "notifications:deepLink.types.mention" },
  { id: "moderation", labelKey: "notifications:deepLink.types.moderation" },
];

/** One-line summary per type shown in the strip above the preview card.
 * A function of `t` (Pattern B) since each sentence interpolates a mock
 * member/event name or appeal reference — never a hardcoded English sentence. */
export function buildSummaries(t: TFunction): Record<NotifType, string> {
  return {
    connection: t("notifications:deepLink.summary.connection", {
      name: CONNECTION.name,
    }),
    gathering: t("notifications:deepLink.summary.gathering", {
      event: GATHERING.title,
    }),
    reply: t("notifications:deepLink.summary.reply", { name: REPLY.name }),
    mention: t("notifications:deepLink.summary.mention", {
      name: MENTION.name,
    }),
    moderation: t("notifications:deepLink.summary.moderation", {
      ref: MODERATION.ref,
    }),
  };
}

export const CONNECTION = {
  initials: "SR",
  tint: "jade" as AvTint,
  name: "Sofia Rodrigues",
  meta: "she/her · Lisbon · Member since Jan 2025",
  note: '"Hi! I saw your talk at Pride Brunch last month and really admired your perspective on community building. Would love to connect."',
  mutuals: [
    { initials: "TM", tint: "jade" as AvTint },
    { initials: "AK", tint: "coral" as AvTint },
    { initials: "JP", tint: "plum" as AvTint },
  ],
  /** Count only — the "{count} mutual connections →" phrase is a CLDR plural
   * catalog key (`deepLink.connection.mutualConnections`), not a baked string. */
  mutualCount: 6,
};

export const GATHERING = {
  title: "Pride Brunch — June Edition",
  meta: ["Sat 21 June · 11:00–14:00", "A Cevicheria, Príncipe Real, Lisbon"],
};

export const REPLY = {
  initials: "AK",
  tint: "coral" as AvTint,
  name: "Anika Kovač",
  postExcerpt:
    "Anyone have recommendations for a queer-friendly GP in Lisbon? Preferably someone familiar with trans healthcare. Tired of explaining myself from scratch every time.",
  /** Minutes-ago count only — formatted through `fmt.relativeTime` at render,
   * never a hand-rolled "12 min ago" string. */
  repliedMinutesAgo: 12,
  replyText:
    "Dr. Carla Nunes at Clínica do Marquês has been brilliant for me — she gets it without needing a full explanation every visit. DM me if you want her number!",
};

export const MENTION = {
  initials: "JP",
  tint: "plum" as AvTint,
  name: "Jordan Park",
  mentionedHoursAgo: 1,
};

export const MODERATION = {
  ref: "QP-APP-2847",
  updatedAt: new Date(2026, 5, 9),
  body: "Our moderation team has reviewed your appeal and a decision has been reached. Please visit the appeal page for the full outcome and next steps.",
};
