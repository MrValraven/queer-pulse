import type {
  OfficialBroadcastDTO,
  OfficialMessageSentDTO,
  OfficialRecipientDTO,
} from "./api/adminOfficialMessages.api";
import { OFFICIAL_RECIPIENT_MIN_SEARCH_LENGTH } from "./api/adminOfficialMessages.api";

/**
 * Demo fixtures for `/admin/official-messages`, so the page runs standalone
 * (VITE_API_URL unset) with no backend. Names match the demo inbox threads.
 * Bodies are content and stay in English, like the demo message threads.
 */

/** Active members the demo platform pretends a broadcast reaches. */
export const DEMO_ACTIVE_MEMBER_COUNT = 1284;

export const DEMO_OFFICIAL_RECIPIENTS: OfficialRecipientDTO[] = [
  {
    userId: "demo-member-anika",
    slug: "anika",
    name: "Anika Kovač",
    initials: "AK",
    avatarUrl: null,
    status: "active",
  },
  {
    userId: "demo-member-jordan",
    slug: "jordan",
    name: "Jordan Park",
    initials: "JP",
    avatarUrl: null,
    status: "active",
  },
  {
    userId: "demo-member-tomas",
    slug: "tomas-mendes",
    name: "Tomás Mendes",
    initials: "TM",
    avatarUrl: null,
    status: "active",
  },
  {
    userId: "demo-member-priya",
    slug: "priya-shah",
    name: "Priya Shah",
    initials: "PS",
    avatarUrl: null,
    status: "active",
  },
  {
    userId: "demo-member-kai",
    slug: "kai",
    name: "Kai Larsson",
    initials: "KL",
    avatarUrl: null,
    status: "active",
  },
];

export const DEMO_OFFICIAL_BROADCASTS: OfficialBroadcastDTO[] = [
  {
    id: "demo-broadcast-002",
    body: "Scheduled maintenance tonight from 23:00 to 23:30 Lisbon time. Messages you send in that window will arrive once we're back.",
    actorId: "demo-admin",
    actorName: "Tiago Costa",
    status: "completed",
    recipientCount: 1281,
    deliveredCount: 1281,
    createdAt: "2026-09-02T17:40:00.000Z",
    completedAt: "2026-09-02T17:41:12.000Z",
  },
  {
    id: "demo-broadcast-001",
    body: "Welcome to the new official thread. This is where QueerPulse will reach you about safety, your account and anything that affects the whole community.",
    actorId: "demo-admin",
    actorName: "Tiago Costa",
    status: "completed",
    recipientCount: 1266,
    deliveredCount: 1264,
    createdAt: "2026-08-20T09:00:00.000Z",
    completedAt: "2026-08-20T09:01:30.000Z",
  },
];

/** Name or handle match, the same rule the server's ILIKE applies. */
export function searchDemoOfficialRecipients(
  term: string,
): OfficialRecipientDTO[] {
  const needle = term.trim().toLowerCase();
  if (needle.length < OFFICIAL_RECIPIENT_MIN_SEARCH_LENGTH) return [];
  return DEMO_OFFICIAL_RECIPIENTS.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(needle) ||
      recipient.slug.toLowerCase().includes(needle),
  );
}

export function demoOfficialMessageSent(
  recipient: OfficialRecipientDTO,
): OfficialMessageSentDTO {
  const createdAt = new Date().toISOString();
  return {
    conversationId: `demo-official-${recipient.userId}`,
    messageId: `demo-official-message-${createdAt}`,
    recipientId: recipient.userId,
    createdAt,
  };
}

/** A demo broadcast lands delivered at once: there is no queue to watch. */
export function demoOfficialBroadcast(
  body: string,
  idempotencyKey: string,
): OfficialBroadcastDTO {
  const createdAt = new Date().toISOString();
  return {
    id: `demo-broadcast-${idempotencyKey}`,
    body,
    actorId: "demo-admin",
    actorName: "Tiago Costa",
    status: "completed",
    recipientCount: DEMO_ACTIVE_MEMBER_COUNT,
    deliveredCount: DEMO_ACTIVE_MEMBER_COUNT,
    createdAt,
    completedAt: createdAt,
  };
}
