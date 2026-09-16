// src/features/messages/demoGroupThreads.data.ts
import type { GifAttachment } from "../../shared/api/gifs";
import type { Conversation } from "./data";
import { DEMO_GIFS } from "./demoGifs.data";
import {
  daysAgoAt,
  demoConversation,
  demoThread,
  minutesAgo,
} from "./demoTimeline.data";

// Demo GROUP threads, one per viewer relationship: owner, admin, a group the
// viewer left, and one they were removed from. Capability flags follow the
// server rule (`messaging-core.service.ts`): owners and admins manage, only
// owners change roles, and a member who has left manages nothing.

const anika = {
  senderName: "Anika Kovač",
  senderHandle: "anika",
  senderTint: "coral",
} as const;
const jordan = {
  senderName: "Jordan Park",
  senderHandle: "jordan",
  senderTint: "jade",
} as const;
const kai = {
  senderName: "Kai Larsson",
  senderHandle: "kai",
  senderTint: "plum",
} as const;
const maria = {
  senderName: "Maria Ferreira",
  senderHandle: "maria",
  senderTint: "jade",
} as const;
const bilal = {
  senderName: "Bilal Kaya",
  senderHandle: "bilal-kaya",
  senderTint: "coral",
} as const;
const priya = {
  senderName: "Priya Shah",
  senderHandle: "priya-shah",
  senderTint: "jade",
} as const;
const noah = {
  senderName: "Noah Reyes",
  senderHandle: "noah-reyes",
  senderTint: "plum",
} as const;

/** A photo from last year's brunch, reusing the gathering-recap demo photos. */
function brunchPhoto(url: string): GifAttachment {
  return { url, previewUrl: url, width: 800, height: 533, provider: "upload" };
}

const prideGif = DEMO_GIFS.find((gif) => gif.id === "pride")!.attachment;

/** The viewer's standing in a group they left or were removed from: the
 *  server stops offering Pin and Edit there (Delete on their own messages
 *  stays, as `deleteMessage` allows it). */
const PAST_MEMBER = { isViewerActiveParticipant: false } as const;

const brunchLastLine = "The terrace is booked for 11am, see you all there!";

/** Owned by the viewer: the full management surface, a pinned chat, an
 *  unread `@` mention, a reply quote, a tombstone, a 3-photo album, a GIF, a
 *  pinned message and a "Seen by 2" receipt (Anika and Jordan read past the
 *  viewer's last message; Kai has no watermark). */
export const brunchCrewConversation: Conversation = demoConversation({
  id: "brunch-crew",
  initials: "PB",
  tint: "coral",
  name: "Pride Brunch Crew",
  pronouns: "",
  // Group previews carry the sender's first name, like the live adapter.
  preview: `Anika: ${brunchLastLine}`,
  lastMessageSenderHandle: "anika",
  lastMessageBody: brunchLastLine,
  unread: true,
  unreadCount: 3,
  hasUnreadMention: true,
  pinnedAt: daysAgoAt(1, 18, 30),
  isGroup: true,
  memberCount: 4,
  myRole: "owner",
  canAddMembers: true,
  canRemoveMembers: true,
  canRename: true,
  canManageRoles: true,
  canTransferOwnership: true,
  canDissolve: true,
  canManageInviteLink: true,
  inviteToken: "brunch-crew-7hq2m9",
  pendingInvites: [
    {
      id: "demo-invite-brunch-maria",
      user: {
        id: "demo-user-maria",
        handle: "maria",
        name: "Maria Ferreira",
        avatarUrl: null,
      },
      createdAt: minutesAgo(200),
    },
  ],
  members: [
    {
      name: "Tiago Costa",
      initials: "TC",
      tint: "plum",
      role: "owner",
      slug: "tiago",
    },
    {
      name: "Anika Kovač",
      initials: "AK",
      tint: "coral",
      role: "member",
      slug: "anika",
      lastReadAt: minutesAgo(1),
    },
    {
      name: "Jordan Park",
      initials: "JP",
      tint: "jade",
      role: "admin",
      slug: "jordan",
      lastReadAt: minutesAgo(1),
    },
    {
      name: "Kai Larsson",
      initials: "KL",
      tint: "plum",
      role: "member",
      slug: "kai",
    },
  ],
  messages: demoThread([
    {
      id: "demo-msg-brunch-001",
      from: "me",
      text: "created the group",
      kind: "system",
      systemEvent: { type: "group_created", actorName: "You", actorIsMe: true },
      at: daysAgoAt(1, 18, 2),
    },
    {
      id: "demo-msg-brunch-002",
      from: "them",
      text: "So excited for this! What time are we thinking?",
      at: daysAgoAt(1, 18, 5),
      ...anika,
    },
    {
      id: "demo-msg-brunch-003",
      from: "them",
      text: "Late morning works best for me, 11ish?",
      at: daysAgoAt(1, 18, 9),
      replyTo: {
        id: "demo-msg-brunch-002",
        snippet: "So excited for this! What time are we thinking?",
        senderName: "Anika Kovač",
        deleted: false,
        kind: "user",
      },
      ...jordan,
    },
    {
      id: "demo-msg-brunch-004",
      from: "me",
      text: "11am it is. I'll confirm the terrace booking.",
      at: daysAgoAt(1, 18, 12),
    },
    {
      // ENG-243: a member who has since erased their account. Their line stays
      // in the thread, labelled "Former member" behind a neutral avatar.
      id: "demo-msg-brunch-004b",
      from: "them",
      text: "I can bring the fruit platter again, it went fast last year.",
      at: daysAgoAt(1, 18, 15),
      isSenderFormerMember: true,
    },
    {
      id: "demo-msg-brunch-005",
      from: "them",
      text: "",
      at: daysAgoAt(1, 18, 20),
      deletedAt: daysAgoAt(1, 18, 21),
      ...kai,
    },
    {
      id: "demo-msg-brunch-006",
      from: "them",
      text: "Found these from last year's brunch, same terrace!",
      at: daysAgoAt(1, 19, 0, 0),
      ...anika,
    },
    {
      id: "demo-msg-brunch-007",
      from: "them",
      text: "Photo",
      kind: "image",
      attachment: brunchPhoto(
        "https://images.unsplash.com/photo-1719590839309-5dbf71989e8d?q=80&w=800&auto=format&fit=crop",
      ),
      at: daysAgoAt(1, 19, 0, 20),
      ...anika,
    },
    {
      id: "demo-msg-brunch-008",
      from: "them",
      text: "Photo",
      kind: "image",
      attachment: brunchPhoto(
        "https://images.unsplash.com/photo-1720524119990-97c506ee1246?q=80&w=800&auto=format&fit=crop",
      ),
      at: daysAgoAt(1, 19, 0, 40),
      ...anika,
    },
    {
      id: "demo-msg-brunch-009",
      from: "them",
      text: "Photo",
      kind: "image",
      attachment: brunchPhoto(
        "https://images.unsplash.com/photo-1720741741673-ce5c7a2c2fb2?q=80&w=800&auto=format&fit=crop",
      ),
      at: daysAgoAt(1, 19, 1, 0),
      ...anika,
    },
    {
      id: "demo-msg-brunch-010",
      from: "them",
      text: "GIF",
      kind: "gif",
      attachment: prideGif,
      at: daysAgoAt(1, 19, 6),
      ...jordan,
    },
    {
      id: "demo-msg-brunch-011",
      from: "them",
      text: "Can we save a seat for Nadia too? She just moved to Lisbon.",
      at: minutesAgo(110),
      ...kai,
    },
    {
      id: "demo-msg-brunch-012",
      from: "me",
      text: "Of course, I'll add one more to the booking.",
      at: minutesAgo(95),
    },
    {
      id: "demo-msg-brunch-013",
      from: "them",
      text: "@tiago can you drop the terrace address in here too?",
      at: minutesAgo(20),
      ...jordan,
    },
    {
      id: "demo-msg-brunch-014",
      from: "them",
      text: "Bringing my rainbow bunting, obviously",
      at: minutesAgo(12),
      reactions: [{ key: "laugh", count: 2, mine: true }],
      ...kai,
    },
    {
      id: "demo-msg-brunch-015",
      from: "them",
      text: brunchLastLine,
      at: minutesAgo(1),
      pinnedAt: minutesAgo(1),
      reactions: [{ key: "love", count: 2, mine: true }],
      ...anika,
    },
  ]),
});

const mentorsLastLine = "Yes please!";

/** The viewer is an ADMIN: can add, remove and rename, cannot change roles.
 *  Carries a forwarded message that is also pinned, and a reply to it. */
export const portoMentorsConversation: Conversation = demoConversation({
  id: "porto-mentors",
  initials: "PM",
  tint: "jade",
  name: "Porto Mentoring Circle",
  pronouns: "",
  preview: `Maria: ${mentorsLastLine}`,
  lastMessageSenderHandle: "maria",
  lastMessageBody: mentorsLastLine,
  unread: false,
  isGroup: true,
  memberCount: 5,
  myRole: "admin",
  canAddMembers: true,
  canRemoveMembers: true,
  canRename: true,
  canManageRoles: false,
  canTransferOwnership: false,
  canDissolve: false,
  canManageInviteLink: true,
  pendingInvites: [
    {
      id: "demo-invite-mentors-jordan",
      user: {
        id: "demo-user-jordan",
        handle: "jordan",
        name: "Jordan Park",
        avatarUrl: null,
      },
      createdAt: daysAgoAt(1, 9, 0),
    },
  ],
  members: [
    {
      name: "Maria Ferreira",
      initials: "MF",
      tint: "jade",
      role: "owner",
      slug: "maria",
      lastReadAt: daysAgoAt(2, 18, 3),
    },
    {
      name: "Tiago Costa",
      initials: "TC",
      tint: "plum",
      role: "admin",
      slug: "tiago",
    },
    {
      name: "Bilal Kaya",
      initials: "BK",
      tint: "coral",
      role: "member",
      slug: "bilal-kaya",
      lastReadAt: daysAgoAt(2, 19, 0),
    },
    {
      name: "Priya Shah",
      initials: "PS",
      tint: "jade",
      role: "member",
      slug: "priya-shah",
    },
    {
      name: "Noah Reyes",
      initials: "NR",
      tint: "plum",
      role: "member",
      slug: "noah-reyes",
      lastReadAt: daysAgoAt(2, 18, 1),
    },
  ],
  messages: demoThread([
    {
      id: "demo-msg-mentors-001",
      from: "them",
      text: "created the group",
      kind: "system",
      systemEvent: { type: "group_created", actorName: "Maria Ferreira" },
      at: daysAgoAt(3, 10, 0),
      ...maria,
    },
    {
      id: "demo-msg-mentors-002",
      from: "them",
      text: "added Tiago Costa",
      kind: "system",
      systemEvent: {
        type: "member_added",
        actorName: "Maria Ferreira",
        targetName: "Tiago Costa",
      },
      at: daysAgoAt(3, 10, 1),
      ...maria,
    },
    {
      id: "demo-msg-mentors-003",
      from: "them",
      text: "Welcome, mentors! This circle is for anyone supporting newcomers moving to Porto. Share what you know about housing, healthcare and paperwork.",
      at: daysAgoAt(3, 10, 4),
      ...maria,
    },
    {
      id: "demo-msg-mentors-004",
      from: "them",
      text: "Happy to cover NIF and bank account questions, I did it all last year.",
      at: daysAgoAt(3, 11, 20),
      ...bilal,
    },
    {
      id: "demo-msg-mentors-005",
      from: "me",
      text: "I can help with flatshares. I've lived in three in Lisbon and one in Bonfim.",
      at: daysAgoAt(3, 12, 2),
    },
    {
      id: "demo-msg-mentors-006",
      from: "them",
      text: "Free legal drop-in for trans and non-binary residents, first Tuesday of every month at the Casa Aberta community centre in Bonfim.",
      at: daysAgoAt(2, 17, 40),
      forwarded: true,
      pinnedAt: daysAgoAt(2, 18, 4),
      ...priya,
    },
    {
      id: "demo-msg-mentors-007",
      from: "them",
      text: "Adding this to the newcomers guide",
      at: daysAgoAt(2, 17, 52),
      replyTo: {
        id: "demo-msg-mentors-006",
        snippet:
          "Free legal drop-in for trans and non-binary residents, first Tuesday of every month",
        senderName: "Priya Shah",
        deleted: false,
        kind: "user",
      },
      ...noah,
    },
    {
      id: "demo-msg-mentors-008",
      from: "me",
      text: "Great find. Maria, want me to pin it for everyone?",
      at: daysAgoAt(2, 18, 0),
    },
    {
      id: "demo-msg-mentors-009",
      from: "them",
      text: mentorsLastLine,
      at: daysAgoAt(2, 18, 3),
      ...maria,
    },
  ]),
});

/** The viewer LEFT this group: history stays, the composer is severed. */
export const bookSwapConversation: Conversation = demoConversation({
  id: "book-swap",
  initials: "AB",
  tint: "coral",
  name: "Arroios Book Swap",
  pronouns: "",
  preview: "Tiago left",
  lastMessageSenderHandle: "tiago",
  lastMessageIsSystem: true,
  unread: false,
  isGroup: true,
  memberCount: 3,
  hasLeft: true,
  myRole: "member",
  canAddMembers: false,
  canRemoveMembers: false,
  canRename: false,
  canManageRoles: false,
  members: [
    {
      name: "Kai Larsson",
      initials: "KL",
      tint: "plum",
      role: "owner",
      slug: "kai",
    },
    {
      name: "Anika Kovač",
      initials: "AK",
      tint: "coral",
      role: "member",
      slug: "anika",
    },
    {
      name: "Jordan Park",
      initials: "JP",
      tint: "jade",
      role: "member",
      slug: "jordan",
    },
  ],
  messages: demoThread(
    [
      {
        id: "demo-msg-bookswap-001",
        from: "them",
        text: "created the group",
        kind: "system",
        systemEvent: { type: "group_created", actorName: "Kai Larsson" },
        at: daysAgoAt(9, 14, 0),
        ...kai,
      },
      {
        id: "demo-msg-bookswap-002",
        from: "them",
        text: "First swap is at Café Vírgula on Sunday. Bring two books you loved.",
        at: daysAgoAt(9, 14, 3),
        ...kai,
      },
      {
        id: "demo-msg-bookswap-003",
        from: "me",
        text: "I'll bring Detransition, Baby and Stone Butch Blues.",
        at: daysAgoAt(9, 15, 10),
      },
      {
        id: "demo-msg-bookswap-004",
        from: "them",
        text: "I've been wanting to read Stone Butch Blues for ages, save it for me!",
        at: daysAgoAt(9, 15, 30),
        ...anika,
      },
      {
        id: "demo-msg-bookswap-005",
        from: "me",
        text: "left",
        kind: "system",
        systemEvent: { type: "member_left", actorName: "You", actorIsMe: true },
        at: daysAgoAt(6, 10, 0),
      },
    ],
    PAST_MEMBER,
  ),
});

/** The viewer was REMOVED by the owner once the event was over. Renders like
 *  a left group (severed composer, read-only history). */
export const prideVolunteersConversation: Conversation = demoConversation({
  id: "pride-volunteers",
  initials: "LP",
  tint: "plum",
  name: "Lisbon Pride Volunteers",
  pronouns: "",
  preview: "Jordan removed Tiago Costa",
  lastMessageSenderHandle: "jordan",
  lastMessageIsSystem: true,
  unread: false,
  isGroup: true,
  memberCount: 3,
  hasLeft: true,
  myRole: "member",
  canAddMembers: false,
  canRemoveMembers: false,
  canRename: false,
  canManageRoles: false,
  members: [
    {
      name: "Jordan Park",
      initials: "JP",
      tint: "jade",
      role: "owner",
      slug: "jordan",
    },
    {
      name: "Noah Reyes",
      initials: "NR",
      tint: "plum",
      role: "admin",
      slug: "noah-reyes",
    },
    {
      name: "Priya Shah",
      initials: "PS",
      tint: "jade",
      role: "member",
      slug: "priya-shah",
    },
  ],
  messages: demoThread(
    [
      {
        id: "demo-msg-volunteers-001",
        from: "them",
        text: "created the group",
        kind: "system",
        systemEvent: { type: "group_created", actorName: "Jordan Park" },
        at: daysAgoAt(13, 9, 0),
        ...jordan,
      },
      {
        id: "demo-msg-volunteers-002",
        from: "them",
        text: "added Tiago Costa",
        kind: "system",
        systemEvent: {
          type: "member_added",
          actorName: "Jordan Park",
          targetName: "Tiago Costa",
        },
        at: daysAgoAt(13, 9, 1),
        ...jordan,
      },
      {
        id: "demo-msg-volunteers-003",
        from: "them",
        text: "Shift sign-ups for the march are open until Friday.",
        at: daysAgoAt(13, 9, 5),
        ...jordan,
      },
      {
        id: "demo-msg-volunteers-004",
        from: "them",
        text: "Tiago, you're on the water station at Marquês de Pombal.",
        at: daysAgoAt(12, 16, 0),
        ...noah,
      },
      {
        id: "demo-msg-volunteers-005",
        from: "me",
        text: "Perfect, see you there.",
        at: daysAgoAt(12, 16, 20),
      },
      {
        id: "demo-msg-volunteers-006",
        from: "them",
        text: "Thank you all, the march was wonderful! Tidying up the group now that the shifts are done.",
        at: daysAgoAt(4, 20, 0),
        ...jordan,
      },
      {
        id: "demo-msg-volunteers-007",
        from: "them",
        text: "removed Tiago Costa",
        kind: "system",
        systemEvent: {
          type: "member_removed",
          actorName: "Jordan Park",
          targetName: "Tiago Costa",
        },
        at: daysAgoAt(4, 20, 1),
        ...jordan,
      },
    ],
    PAST_MEMBER,
  ),
});
