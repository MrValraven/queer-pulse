// src/features/messages/demoDirectThreads.data.ts
import type { Conversation } from "./data";
import { isDemoPresenceOnline } from "./demoSignalSimulation";
import {
  daysAgoAt,
  demoConversation,
  demoThread,
  hoursAfterAnchor,
  minutesAgo,
} from "./demoTimeline.data";

// Demo 1:1 threads. Every message carries a stable `demo-msg-<thread>-NNN` id
// so the action surface (overlay, reply, copy, forward, report) opens in demo.
// Bodies are content and stay in English; every label is derived from `at`.

const anikaLastLine =
  "Thanks for sending the brunch link, I'll be there! Really appreciate you looping me in.";

/** Favorite, unread, with a reply quote, a starred and an edited message.
 *  Also the thread `useDemoTypingSimulation` answers with a typing burst. */
export const anikaConversation: Conversation = demoConversation({
  id: "anika",
  slug: "anika",
  initials: "AK",
  tint: "coral",
  name: "Anika Kovač",
  pronouns: "she/they",
  connectedSinceAt: "2026-02-12T12:00:00.000Z",
  preview: anikaLastLine,
  unread: true,
  unreadCount: 2,
  favorite: true,
  otherLastReadAt: minutesAgo(1),
  messages: demoThread([
    {
      id: "demo-msg-anika-001",
      from: "them",
      text: "Hey! I saw your question in the Trans & Non-Binary thread about GPs. Dr. Carla Nunes at Clínica do Marquês is brilliant. She gets it without needing a full explanation every visit.",
      at: daysAgoAt(1, 15, 2),
      starred: true,
    },
    {
      id: "demo-msg-anika-002",
      from: "me",
      text: "Oh brilliant, thank you! Is she taking new patients?",
      at: daysAgoAt(1, 15, 10),
    },
    {
      id: "demo-msg-anika-003",
      from: "them",
      text: "Yes, I'd recommend booking by email rather than phone, she's quicker to respond. You can request a first appointment here: https://clinicadomarques.pt/book",
      at: daysAgoAt(1, 15, 14),
      replyTo: {
        id: "demo-msg-anika-002",
        snippet: "Oh brilliant, thank you! Is she taking new patients?",
        senderName: "Tiago Costa",
        deleted: false,
        kind: "user",
      },
    },
    {
      id: "demo-msg-anika-004",
      from: "me",
      text: "That would be amazing, yes please. And I saw the brunch is confirmed: https://queerpulse.example/pride-brunch",
      at: minutesAgo(9),
      editedAt: minutesAgo(7),
    },
    {
      id: "demo-msg-anika-005",
      from: "them",
      text: "Also, are you coming to the peer circle at Casa Aberta on Thursday?",
      at: minutesAgo(3),
    },
    {
      id: "demo-msg-anika-006",
      from: "them",
      text: anikaLastLine,
      at: minutesAgo(1),
      reactions: [{ key: "love", count: 1, mine: true }],
    },
    // F1: an inbound "deleted for everyone" tombstone still within the
    // server's 30-day evidence hold, so it stays reportable to the viewer
    // even though its content is gone (e.g. an explicit image unsent
    // seconds after it was seen). `reportableTombstone` stamps
    // `canReport: true` in place of `serverFlags`' usual "deleted → never
    // reportable" default — see `demoTimeline.data.ts`'s own doc.
    {
      id: "demo-msg-anika-007",
      from: "them",
      text: "",
      at: minutesAgo(0.5),
      deletedAt: minutesAgo(0.45),
      reportableTombstone: true,
    },
  ]),
});

/** A plain, always-online DM. The e2e specs open it by its preview line and
 *  hover its own-bubble text, so both lines must stay exactly as written. */
export const jordanConversation: Conversation = demoConversation({
  id: "jordan",
  slug: "jordan",
  initials: "JP",
  tint: "plum",
  name: "Jordan Park",
  pronouns: "they/them",
  connectedSinceAt: "2026-03-08T12:00:00.000Z",
  preview: "See you at the book club on Saturday",
  unread: false,
  online: true,
  otherLastReadAt: daysAgoAt(1, 15, 14),
  messages: demoThread([
    {
      id: "demo-msg-jordan-001",
      from: "me",
      text: "Are you going to the book club on Saturday?",
      at: daysAgoAt(1, 14, 58),
    },
    {
      id: "demo-msg-jordan-002",
      from: "them",
      text: "See you at the book club on Saturday",
      at: daysAgoAt(1, 15, 14),
    },
  ]),
});

const tomasLine =
  "The venue confirmed. We're all set for the Pride Brunch. They've given us the whole terrace from 11am.";

/** PRD-349: a TIMED mute still in its window, relative to load time like the
 *  real "8 hours" choice, so "Muted until {time}" is always in the future. */
export const tomasConversation: Conversation = demoConversation({
  id: "tomas",
  slug: "tomas-mendes",
  initials: "TM",
  tint: "jade",
  name: "Tomás Mendes",
  pronouns: "he/him",
  connectedSinceAt: "2026-01-20T12:00:00.000Z",
  preview: tomasLine,
  unread: true,
  unreadCount: 1,
  muted: true,
  mutedUntil: hoursAfterAnchor(8),
  messages: demoThread([
    {
      id: "demo-msg-tomas-001",
      from: "them",
      text: tomasLine,
      at: daysAgoAt(3, 14, 30),
    },
  ]),
});

/** Marked unread by hand (PRD-225): read, with nothing new, still flagged. */
export const kaiConversation: Conversation = demoConversation({
  id: "kai",
  slug: "kai",
  initials: "KL",
  tint: "plum",
  name: "Kai Larsson",
  pronouns: "they/them",
  connectedSinceAt: "2026-05-03T12:00:00.000Z",
  preview: "That's exactly the angle I was looking for, thank you",
  unread: true,
  markedUnreadAt: daysAgoAt(2, 9, 0),
  otherLastReadAt: daysAgoAt(4, 18, 48),
  messages: demoThread([
    {
      id: "demo-msg-kai-001",
      from: "me",
      text: "I think the angle you want is less about documentation and more about memory: what communities choose to remember vs forget.",
      at: daysAgoAt(4, 18, 30),
    },
    {
      id: "demo-msg-kai-002",
      from: "them",
      text: "That's exactly the angle I was looking for, thank you",
      at: daysAgoAt(4, 18, 48),
    },
  ]),
});

const teamLine =
  "Welcome to QueerPulse! Here's what to explore first: your profile, upcoming gatherings, and the member directory. We're glad you're here.";

/** The official thread (PRD-372): severed composer, no counterpart profile,
 *  pinned so the welcome stays at the top of the inbox. It is the member's one
 *  official thread, the same one `/admin/official-messages` posts into.
 *
 *  `pinnedAt` is the NEWEST of the demo pins on purpose: the inbox sorts
 *  pinned rows by `pinnedAt` descending (`useMessageThreadList.ts`), so the
 *  old 45-days-ago value put the welcome UNDER the other pinned demo rows,
 *  which is the opposite of what the line above promises. */
export const teamConversation: Conversation = demoConversation({
  id: "team",
  initials: "QP",
  tint: "plum",
  name: "QueerPulse Team",
  pronouns: "Official",
  preview: teamLine,
  unread: false,
  official: true,
  pinnedAt: daysAgoAt(1, 20, 0),
  messages: demoThread([
    {
      id: "demo-msg-team-001",
      from: "them",
      text: teamLine,
      at: daysAgoAt(45, 9, 0),
    },
  ]),
});

const bilalLine =
  "Let me know if you want me to introduce you to Nadia. She does exactly the kind of work you're describing.";

/** Archived (SOC-16): only the Archived tab lists it. */
export const bilalConversation: Conversation = demoConversation({
  id: "bilal",
  slug: "bilal-kaya",
  initials: "BK",
  tint: "coral",
  name: "Bilal Kaya",
  pronouns: "he/him",
  connectedSinceAt: "2026-05-15T12:00:00.000Z",
  preview: bilalLine,
  unread: false,
  archivedAt: daysAgoAt(10, 11, 0),
  messages: demoThread([
    {
      id: "demo-msg-bilal-001",
      from: "them",
      text: bilalLine,
      at: daysAgoAt(18, 16, 12),
    },
  ]),
});

/** The viewer's OWN last message already read (DES-190), so the row shows
 *  "You: " plus the seen double-check.
 *
 *  Deliberately NOT pinned. With this row pinned, demo sat at the 3-chat
 *  `PIN_CAP` (`api/useConversationPrefs.ts`) out of the box, so a demo visitor
 *  could only ever unpin: the pin action itself had nothing left to
 *  demonstrate. The official thread and the brunch crew keep their pins. */
export const priyaConversation: Conversation = demoConversation({
  id: "priya",
  slug: "priya-shah",
  initials: "PS",
  tint: "jade",
  name: "Priya Shah",
  pronouns: "she/her",
  connectedSinceAt: "2026-06-05T12:00:00.000Z",
  preview: "Sounds perfect, see you at 7!",
  otherLastReadAt: minutesAgo(69),
  lastMessageSenderHandle: "tiago",
  unread: false,
  messages: demoThread([
    {
      id: "demo-msg-priya-001",
      from: "them",
      text: "Dinner Friday? I found a new place near you.",
      at: minutesAgo(75),
    },
    {
      id: "demo-msg-priya-002",
      from: "me",
      text: "Sounds perfect, see you at 7!",
      at: minutesAgo(70),
    },
  ]),
});

/** A server-synced draft (DES-190) and the connection whose presence the
 *  demo simulation flips (`useDemoPresenceSimulation`). */
export const noahConversation: Conversation = demoConversation({
  id: "noah",
  slug: "noah-reyes",
  initials: "NR",
  tint: "plum",
  name: "Noah Reyes",
  pronouns: "he/they",
  connectedSinceAt: "2026-05-22T12:00:00.000Z",
  preview: "Are you still up for the volunteering shift?",
  unread: false,
  draft: "Yes! Just checking the start time is still 10am",
  messages: demoThread([
    {
      id: "demo-msg-noah-001",
      from: "them",
      text: "Are you still up for the volunteering shift?",
      at: daysAgoAt(2, 17, 2),
    },
  ]),
});
// Follows the presence clock, so any refetch between two simulated flips
// agrees with what the simulation last published.
Object.defineProperty(noahConversation, "online", {
  get: () => isDemoPresenceOnline(),
  enumerable: true,
  configurable: true,
});

/** PRD-340: the viewer started this thread cold and waits on the first reply
 *  that would open it (`replyGate: "awaitingTheirReply"`). */
export const yusufConversation: Conversation = demoConversation({
  id: "yusuf",
  slug: "yusuf-demir",
  initials: "YD",
  tint: "coral",
  name: "Yusuf Demir",
  pronouns: "he/him",
  preview:
    "Hey! I saw your board post about the community garden and would love to help out.",
  unread: false,
  replyRequiresConnection: true,
  replyGate: "awaitingTheirReply",
  messages: demoThread([
    {
      id: "demo-msg-yusuf-001",
      from: "me",
      text: "Hey! I saw your board post about the community garden and would love to help out.",
      at: daysAgoAt(3, 11, 20),
    },
  ]),
});

const marcoLeaseLine =
  "Here's the lease so you can look it over before we go further.";

/** PRD-367/369/371: a cold housing enquiry from a stranger the viewer hasn't
 *  accepted (`replyRequiresConnection: true`, `replyGate: "needsConnection"`
 *  — neither side may send yet), demonstrating all three P0.9 member-safety
 *  states in one thread: an inbound off-platform push, a lookalike payment
 *  link, and an inbound document — see `contactSafetyDetector.ts`,
 *  `linkSafety.ts` and `MessageDocumentAttachment.tsx`'s own docs. */
export const marcoConversation: Conversation = demoConversation({
  id: "marco",
  slug: "marco-teixeira",
  initials: "MT",
  tint: "plum",
  name: "Marco Teixeira",
  pronouns: "he/him",
  preview: marcoLeaseLine,
  unread: true,
  unreadCount: 3,
  replyRequiresConnection: true,
  replyGate: "needsConnection",
  messages: demoThread([
    {
      id: "demo-msg-marco-001",
      from: "them",
      text: "Hi! Thanks for reaching out about the room. Can we continue on WhatsApp? I'll send more photos there.",
      at: daysAgoAt(1, 9, 0),
    },
    {
      id: "demo-msg-marco-002",
      from: "them",
      text: "Great, here's the booking confirmation for the deposit: https://revoiut.com/confirm-deposit",
      at: daysAgoAt(1, 9, 6),
    },
    {
      id: "demo-msg-marco-003",
      from: "them",
      text: marcoLeaseLine,
      at: daysAgoAt(1, 9, 12),
      kind: "document",
      attachment: {
        url: "/press/queerpulse-brand-reference.pdf",
        fileName: "Lease_Agreement.pdf",
        byteSize: 158_720,
        contentType: "application/pdf",
        provider: "upload",
      },
    },
  ]),
});
