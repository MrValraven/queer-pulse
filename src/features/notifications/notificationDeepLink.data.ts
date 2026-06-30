export type NotifType =
  "connection" | "gathering" | "reply" | "mention" | "moderation";
export type AvTint = "jade" | "coral" | "plum";

export const NOTIF_TYPES: { id: NotifType; label: string }[] = [
  { id: "connection", label: "Connection" },
  { id: "gathering", label: "Gathering" },
  { id: "reply", label: "Reply" },
  { id: "mention", label: "Mention" },
  { id: "moderation", label: "Moderation" },
];

export const SUMMARIES: Record<NotifType, string> = {
  connection: "Sofia Rodrigues wants to connect with you",
  gathering: "Your RSVP to Pride Brunch was accepted",
  reply: "Anika Kovač replied to your post",
  mention: "Jordan Park mentioned you in a post",
  moderation: "An update on your account — appeal QP-APP-2847",
};

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
  mutualLabel: "6 mutual connections →",
};

export const GATHERING = {
  badge: "You're in",
  title: "Pride Brunch — June Edition",
  meta: ["Sat 21 June · 11:00–14:00", "A Cevicheria, Príncipe Real, Lisbon"],
  confirm: "Your RSVP has been confirmed by the host.",
};

export const REPLY = {
  initials: "AK",
  tint: "coral" as AvTint,
  name: "Anika Kovač",
  meta: "replied to your post · 12 min ago",
  postExcerpt:
    "Anyone have recommendations for a queer-friendly GP in Lisbon? Preferably someone familiar with trans healthcare. Tired of explaining myself from scratch every time.",
  replyTime: "12 min ago",
  replyText:
    "Dr. Carla Nunes at Clínica do Marquês has been brilliant for me — she gets it without needing a full explanation every visit. DM me if you want her number!",
};

export const MENTION = {
  initials: "JP",
  tint: "plum" as AvTint,
  name: "Jordan Park",
  meta: "mentioned you in a post · 1 hour ago",
};

export const MODERATION = {
  ref: "QP-APP-2847",
  updated: "Updated 9 June 2026",
  body: "Our moderation team has reviewed your appeal and a decision has been reached. Please visit the appeal page for the full outcome and next steps.",
};
