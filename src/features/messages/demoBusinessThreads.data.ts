// src/features/messages/demoBusinessThreads.data.ts
import type { MailboxSummary } from "../../shared/api/mailboxViewer";
import { messages as enMessages } from "../../shared/i18n/catalogs/en/messages";
import { messages as ptMessages } from "../../shared/i18n/catalogs/pt/messages";
import { detectLanguage, intlLocale } from "../../shared/i18n/locale";
import { resolveEntry } from "../../shared/i18n/translate";
import type { Conversation } from "./data";
import { belongsToMailbox } from "./mailboxes/mailboxScope";
import {
  DEMO_IDENTITY,
  DEMO_MAILBOX_SUMMARIES,
  DEMO_STAFFED_IDENTITY_IDS,
} from "./demoIdentities.data";
import {
  daysAgoAt,
  demoConversation,
  demoThread,
  minutesAgo,
} from "./demoTimeline.data";

// Demo business mailbox threads (spec 2026-09-20, section 6.3). Every message
// carries a stable `demo-msg-<thread>-NNN` id, and every body stays in
// English like every other demo seed. The six threads exercise the switcher's
// mailbox kinds: an unclaimed and a claimed Café Lisboa thread, a persona
// mailbox the viewer claimed after taking it over, a read-only persona
// mailbox, the viewer as a business's own customer, and a thread whose
// business counterpart has since been deleted.

const fatimaLine =
  "Hi! Is the terrace step-free? I use a wheelchair and would love to come on Saturday.";

/** Café Lisboa, unclaimed: the demo switcher's unread badge counts this one. */
export const cafeLisboaFatimaConversation: Conversation = demoConversation({
  id: "demo-cafe-lisboa-fatima",
  slug: "fatima",
  initials: "FM",
  tint: "coral",
  name: "Fátima Mendes",
  pronouns: "she/her",
  mailboxIdentityId: DEMO_IDENTITY.cafeLisboa,
  preview: fatimaLine,
  unread: true,
  unreadCount: 1,
  claimedBy: null,
  messages: demoThread([
    {
      id: "demo-msg-cafe-lisboa-fatima-001",
      from: "them",
      text: fatimaLine,
      at: minutesAgo(20),
    },
  ]),
});

const nunoReplyLine =
  "We do! Saturdays fill up fast, so shall I hold the long table for 13:00?";

/** Café Lisboa, claimed by Rui: the moved note names the business, and the
 *  business reply carries Rui's own attribution. */
export const cafeLisboaNunoConversation: Conversation = demoConversation({
  id: "demo-cafe-lisboa-nuno",
  slug: "nuno",
  initials: "NA",
  tint: "plum",
  name: "Nuno Alves",
  pronouns: "he/him",
  mailboxIdentityId: DEMO_IDENTITY.cafeLisboa,
  preview: nunoReplyLine,
  unread: false,
  claimedBy: { handle: "rui", name: "Rui Marçal", firstName: "Rui" },
  claimedAt: minutesAgo(60),
  claimTakenOverFrom: null,
  messages: demoThread([
    {
      id: "demo-msg-cafe-lisboa-nuno-001",
      from: "me",
      text: "Good to see you at the market last week!",
      at: daysAgoAt(2, 11, 0),
    },
    {
      id: "demo-msg-cafe-lisboa-nuno-002",
      from: "me",
      text: "This thread moved to Café Lisboa",
      kind: "system",
      systemEvent: {
        type: "moved_to_business_mailbox",
        actorName: "Tiago Costa",
        actorIsMe: true,
        targetName: null,
        value: DEMO_IDENTITY.cafeLisboa,
        mailboxName: "Café Lisboa",
      },
      at: daysAgoAt(2, 11, 5),
    },
    {
      id: "demo-msg-cafe-lisboa-nuno-003",
      from: "them",
      text: "Do you take bookings for a birthday lunch, around 12 people?",
      at: minutesAgo(75),
    },
    {
      id: "demo-msg-cafe-lisboa-nuno-004",
      from: "me",
      text: nunoReplyLine,
      at: minutesAgo(65),
      senderIdentityId: DEMO_IDENTITY.cafeLisboa,
      senderIdentityKind: "listing",
      senderStaffFirstName: "Rui",
      isSentByViewer: false,
    },
  ]),
});

const saraReplyLine = "Thursday at 19:00 works well. Does that suit you?";

/** Atelier Pulso, claimed by the viewer after taking it over from Rui. */
export const atelierPulsoSaraConversation: Conversation = demoConversation({
  id: "demo-atelier-pulso-sara",
  slug: "sara-pinheiro",
  initials: "SP",
  tint: "jade",
  name: "Sara Pinheiro",
  pronouns: "she/her",
  mailboxIdentityId: DEMO_IDENTITY.atelierPulso,
  preview: saraReplyLine,
  unread: false,
  claimedBy: { handle: "tiago", name: "Tiago Costa", firstName: "Tiago" },
  claimedAt: minutesAgo(30),
  claimTakenOverFrom: { handle: "rui", name: "Rui Marçal", firstName: "Rui" },
  messages: demoThread([
    {
      id: "demo-msg-atelier-pulso-sara-001",
      from: "them",
      text: "Do you have any evening slots this week for a portrait sitting?",
      at: minutesAgo(45),
    },
    {
      id: "demo-msg-atelier-pulso-sara-002",
      from: "me",
      text: saraReplyLine,
      at: minutesAgo(35),
      senderIdentityId: DEMO_IDENTITY.atelierPulso,
      senderIdentityKind: "subprofile",
      senderStaffFirstName: "Tiago",
      isSentByViewer: true,
    },
  ]),
});

const danielLine = "Is the zine's print run still available to order?";

/** Estúdio Norte, read-only (a persona moderation removed) and unclaimed. */
export const estudioNorteDanielConversation: Conversation = demoConversation({
  id: "demo-estudio-norte-daniel",
  slug: "daniel-oliveira",
  initials: "DO",
  tint: "plum",
  name: "Daniel Oliveira",
  pronouns: "he/him",
  mailboxIdentityId: DEMO_IDENTITY.estudioNorte,
  preview: danielLine,
  unread: false,
  claimedBy: null,
  messages: demoThread([
    {
      id: "demo-msg-estudio-norte-daniel-001",
      from: "them",
      text: danielLine,
      at: daysAgoAt(1, 10, 0),
    },
  ]),
});

const livrariaReplyLine =
  "Yes, we can hold a copy at the counter for you until Friday.";

/** Livraria Aurora: the viewer is the CUSTOMER here, so this thread stays out
 *  of `DEMO_STAFFED_IDENTITY_IDS` and out of the switcher. */
export const livrariaAuroraConversation: Conversation = demoConversation({
  id: "demo-livraria-aurora",
  slug: "livraria-aurora",
  initials: "LA",
  tint: "jade",
  name: "Livraria Aurora",
  pronouns: "",
  mailboxIdentityId: DEMO_IDENTITY.livrariaAurora,
  counterpartIdentityId: DEMO_IDENTITY.livrariaAurora,
  counterpartIdentityKind: "listing",
  preview: livrariaReplyLine,
  unread: false,
  claimedBy: null,
  messages: demoThread([
    {
      id: "demo-msg-livraria-aurora-001",
      from: "me",
      text: "Do you have a copy of 'Vidas Trans em Portugal' in stock?",
      at: daysAgoAt(1, 16, 0),
    },
    {
      id: "demo-msg-livraria-aurora-002",
      from: "them",
      text: livrariaReplyLine,
      at: daysAgoAt(1, 16, 10),
      senderIdentityId: DEMO_IDENTITY.livrariaAurora,
      senderIdentityKind: "listing",
      senderStaffFirstName: "Inês",
    },
  ]),
});

const formerBusinessLine =
  "Thanks for reaching out! We can arrange a callback tomorrow.";

const MESSAGES_CATALOGS = { en: enMessages, pt: ptMessages };

/** The "Former business" placeholder in the reader's language, read without
 *  a hook the way `linkSafetyCopy.ts` does, falling back to English. */
function formerBusinessName(): string {
  const path = "mailbox.formerBusiness";
  const language = detectLanguage();
  return (
    resolveEntry(MESSAGES_CATALOGS[language], path, intlLocale(language)) ??
    resolveEntry(MESSAGES_CATALOGS.en, path, "en") ??
    `messages:${path}`
  );
}

/** The counterpart business has since been deleted; the thread still reads,
 *  under the shared "Former business" placeholder. The row matches the live
 *  adapter: the placeholder in the reader's language and no initials. */
export const formerBusinessConversation: Conversation = demoConversation({
  id: "demo-former-business",
  initials: "",
  tint: "plum",
  name: formerBusinessName(),
  pronouns: "",
  isCounterpartFormerBusiness: true,
  preview: formerBusinessLine,
  unread: false,
  messages: demoThread([
    {
      id: "demo-msg-former-business-001",
      from: "them",
      text: formerBusinessLine,
      isSenderFormerBusiness: true,
      at: daysAgoAt(5, 9, 0),
    },
  ]),
});
// A getter, so a language switch renames the row on its next read, and a
// spread copy keeps the name it had at copy time.
Object.defineProperty(formerBusinessConversation, "name", {
  get: formerBusinessName,
  enumerable: true,
  configurable: true,
});

/**
 * Every mailbox thread this build seeds, in the order the switcher's summary
 * counts them. Kept separate from `data.ts`'s `conversations` export so a
 * mailbox count can be derived from any filtered subset (a deleted-aware demo
 * list, a test fixture) without importing the whole registry.
 */
export const businessThreadConversations: Conversation[] = [
  cafeLisboaFatimaConversation,
  cafeLisboaNunoConversation,
  atelierPulsoSaraConversation,
  estudioNorteDanielConversation,
  livrariaAuroraConversation,
  formerBusinessConversation,
];

/**
 * `DEMO_MAILBOX_SUMMARIES` with each mailbox's `unreadCount` computed over
 * `conversations`, "unread and not archived" per mailbox, the same rule the
 * nav badge and `useUnreadMessages` use for the whole inbox.
 */
export function demoMailboxSummaries(
  conversations: Conversation[],
): MailboxSummary[] {
  return DEMO_MAILBOX_SUMMARIES.map((mailbox) => {
    const scope = {
      identityId: mailbox.identityId,
      isPersonal: mailbox.kind === "profile",
      isReadOnly: mailbox.isReadOnly,
      staffedIdentityIds: DEMO_STAFFED_IDENTITY_IDS,
    };
    return {
      ...mailbox,
      unreadCount: conversations.filter(
        (conversation) =>
          conversation.unread &&
          !conversation.archivedAt &&
          belongsToMailbox(conversation, scope),
      ).length,
    };
  });
}
