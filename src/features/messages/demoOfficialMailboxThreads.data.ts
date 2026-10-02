// src/features/messages/demoOfficialMailboxThreads.data.ts
import type { Conversation } from "./data";
import { DEMO_IDENTITY } from "./demoIdentities.data";
import {
  daysAgoAt,
  demoConversation,
  demoThread,
  minutesAgo,
} from "./demoTimeline.data";

// The QueerPulse Team mailbox, seen from the staff side: two members who
// replied in their own official thread. Each thread names the team mailbox
// and the member as counterpart, so it reads like any business mailbox
// thread, with the claim bar and "Replying as QueerPulse Team" above the
// composer. Bodies stay in English like every other demo seed.

const listingNudgeLine =
  "Hi Inês! We noticed you started a listing on QueerPulse. If something got in the way, or you'd like a hand finishing it, just reply here and we'll help. No rush at all.";

const inesReplyLine =
  "Thank you! I got stuck on the accessibility section. Does step-free mean the whole venue, or just the entrance?";

/** Unclaimed and unread: the switcher's team mailbox badge counts this one. */
export const officialInesConversation: Conversation = demoConversation({
  id: "demo-official-ines",
  slug: "ines-pinheiro",
  initials: "IP",
  tint: "coral",
  name: "Inês Pinheiro",
  pronouns: "she/her",
  mailboxIdentityId: DEMO_IDENTITY.queerPulseTeam,
  preview: inesReplyLine,
  unread: true,
  unreadCount: 1,
  claimedBy: null,
  messages: demoThread([
    {
      id: "demo-msg-official-ines-001",
      from: "me",
      text: listingNudgeLine,
      at: daysAgoAt(1, 15, 31),
      senderIdentityId: DEMO_IDENTITY.queerPulseTeam,
      senderIdentityKind: "official",
      isSentByViewer: false,
    },
    {
      id: "demo-msg-official-ines-002",
      from: "them",
      text: inesReplyLine,
      at: minutesAgo(12),
    },
  ]),
});

const welcomeLine =
  "Welcome to QueerPulse! Here's what to explore first: your profile, upcoming gatherings, and the member directory. We're glad you're here.";

const joanaQuestionLine =
  "Hi! Is there a way to hide my profile from people I'm not connected with?";

const martaReplyLine =
  "There is. In Settings, under Privacy, set your profile to Connections only. Want me to walk you through it?";

/** Claimed by a colleague, whose reply the member sees signed "Marta". */
export const officialJoanaConversation: Conversation = demoConversation({
  id: "demo-official-joana",
  slug: "joana-reis",
  initials: "JR",
  tint: "jade",
  name: "Joana Reis",
  pronouns: "they/them",
  mailboxIdentityId: DEMO_IDENTITY.queerPulseTeam,
  preview: martaReplyLine,
  unread: false,
  claimedBy: { handle: "marta", name: "Marta Silva", firstName: "Marta" },
  claimedAt: daysAgoAt(1, 18, 40),
  claimTakenOverFrom: null,
  messages: demoThread([
    {
      id: "demo-msg-official-joana-001",
      from: "me",
      text: welcomeLine,
      at: daysAgoAt(3, 9, 0),
      senderIdentityId: DEMO_IDENTITY.queerPulseTeam,
      senderIdentityKind: "official",
      isSentByViewer: false,
    },
    {
      id: "demo-msg-official-joana-002",
      from: "them",
      text: joanaQuestionLine,
      at: daysAgoAt(1, 18, 20),
    },
    {
      id: "demo-msg-official-joana-003",
      from: "me",
      text: martaReplyLine,
      at: daysAgoAt(1, 18, 45),
      senderIdentityId: DEMO_IDENTITY.queerPulseTeam,
      senderIdentityKind: "official",
      senderStaffFirstName: "Marta",
      isSentByViewer: false,
    },
  ]),
});
