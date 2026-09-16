// src/features/messages/demoLongThread.data.ts
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import type { GifAttachment } from "../../shared/api/gifs";
import type { Conversation } from "./data";
import {
  daysAgoAt,
  demoConversation,
  demoThread,
  minutesAgo,
  type DemoMessageSeed,
} from "./demoTimeline.data";

/** The demo DM long enough (48 messages over three days, the last 9 unread)
 *  to exercise the unread divider, the unread landing and the jump-to-latest
 *  pill. E2E specs open it by this id. */
export const DEMO_LONG_THREAD_CONVERSATION_ID = "maria";

/** How many of the thread's trailing messages the viewer has not read. */
export const DEMO_LONG_THREAD_UNREAD_COUNT = 9;

/** The same photo the Arroios flatshare listing uses in the housing demo. */
const bedroomPhoto: GifAttachment = {
  url: "https://images.unsplash.com/photo-1543709525-e8764409abff?q=80&w=800&auto=format&fit=crop",
  previewUrl:
    "https://images.unsplash.com/photo-1543709525-e8764409abff?q=80&w=800&auto=format&fit=crop",
  width: 800,
  height: 533,
  provider: "upload",
  caption: "The bedroom, morning light",
};

/** A lease PDF. The file name is display-only; the link points at the one
 *  real PDF the app ships so the download card never 404s in demo. */
const leaseDocument: DocumentAttachment = {
  url: "/press/queerpulse-brand-reference.pdf",
  fileName: "Arroios-flatshare-lease.pdf",
  byteSize: 184_320,
  contentType: "application/pdf",
  provider: "upload",
  caption: "Current lease, clause 7 is the one about new tenants",
};

function mariaLine(
  sequence: number,
  from: "me" | "them",
  text: string,
  at: string,
  extra: Partial<DemoMessageSeed> = {},
): DemoMessageSeed {
  const id = `demo-msg-maria-${String(sequence).padStart(3, "0")}`;
  return { id, from, text, at, ...extra };
}

const lastLine =
  "Thank you for doing all of this, truly. Inês says she owes you a pastel de nata.";

export const mariaConversation: Conversation = demoConversation({
  id: DEMO_LONG_THREAD_CONVERSATION_ID,
  slug: "maria",
  initials: "MF",
  tint: "jade",
  name: "Maria Ferreira",
  pronouns: "she/her",
  connectedSinceAt: "2026-04-10T12:00:00.000Z",
  preview: lastLine,
  unread: true,
  unreadCount: DEMO_LONG_THREAD_UNREAD_COUNT,
  favorite: true,
  // Read up to the viewer's own last message, so the divider lands on the
  // first of Maria's nine newer lines through the live watermark path.
  myLastReadAt: minutesAgo(55),
  otherLastReadAt: minutesAgo(40),
  messages: demoThread([
    mariaLine(
      1,
      "me",
      "Hi Maria, thanks again for making time. Is now still a good moment to go through the healthcare list?",
      daysAgoAt(2, 10, 2),
    ),
    mariaLine(
      2,
      "them",
      "Yes! I have a coffee and an hour. Where do you want to start?",
      daysAgoAt(2, 10, 15),
    ),
    mariaLine(
      3,
      "me",
      "Finding a GP who won't turn every appointment into a lecture.",
      daysAgoAt(2, 10, 17),
    ),
    mariaLine(
      4,
      "them",
      "Then start with your family health unit in Arroios. Ask for Dr. Joana Brito, she has done the trans health training.",
      daysAgoAt(2, 10, 20),
    ),
    mariaLine(
      5,
      "them",
      "Bring your SNS number and say you want to register as a new user. If they say the list is full, ask to join the waiting list anyway.",
      daysAgoAt(2, 10, 21),
    ),
    mariaLine(
      6,
      "me",
      "Noted. What about endocrinology? The referral part confuses me.",
      daysAgoAt(2, 10, 25),
    ),
    mariaLine(
      7,
      "them",
      "The GP refers you to the hospital's gender identity consultation. The first wait can be a few months, which is why the GP step matters so much.",
      daysAgoAt(2, 10, 31),
    ),
    mariaLine(
      8,
      "them",
      "In the meantime the peer circle at Casa Aberta is a lovely place to hear how others handled the wait.",
      daysAgoAt(2, 10, 32),
    ),
    mariaLine(
      9,
      "me",
      "That's really reassuring, thank you.",
      daysAgoAt(2, 10, 40),
      {
        reactions: [{ key: "love", count: 1, mine: false }],
      },
    ),
    mariaLine(
      10,
      "them",
      "Of course. If anyone asks for a document you don't have, message me before you give up.",
      daysAgoAt(2, 10, 44),
    ),
    mariaLine(
      11,
      "me",
      "Will do. One more: do you know any queer-friendly psychologists who take the SNS referral?",
      daysAgoAt(2, 11, 2),
    ),
    mariaLine(
      12,
      "them",
      "Two names, both in Lisbon. I'll send them tonight once I've checked they're still taking people.",
      daysAgoAt(2, 11, 10),
    ),
    mariaLine(
      13,
      "them",
      "Checked! Marta Salgueiro at the health centre near Campo Pequeno has space from next month.",
      daysAgoAt(2, 20, 5),
    ),
    mariaLine(
      14,
      "them",
      "The other one has a waiting list until spring, so Rita is your best bet.",
      daysAgoAt(2, 20, 6),
    ),
    mariaLine(15, "me", "Amazing, I'll call on Monday.", daysAgoAt(2, 20, 20)),
    mariaLine(
      16,
      "them",
      "Different topic: my friend Inês is moving to Lisbon in October and needs a flatshare. Didn't you mention a spare bedroom in Arroios?",
      daysAgoAt(1, 9, 12),
    ),
    mariaLine(
      17,
      "me",
      "Yes! My flatmate is moving to Porto, so her bedroom frees up at the end of September.",
      daysAgoAt(1, 9, 30),
    ),
    mariaLine(
      18,
      "me",
      "We're a calm, queer household. Lots of plants and a shared dinner on Sundays.",
      daysAgoAt(1, 9, 31),
    ),
    mariaLine(
      19,
      "them",
      "That sounds perfect for her. Is the landlord okay with a new name on the lease?",
      daysAgoAt(1, 9, 40),
    ),
    mariaLine(
      20,
      "me",
      "He was fine last time. Here's what he sent me.",
      daysAgoAt(1, 9, 44),
    ),
    mariaLine(
      21,
      "me",
      "The bedroom is available from 1 October. Rent is €750 including bills, one month deposit, minimum stay 12 months. Pets by arrangement.",
      daysAgoAt(1, 9, 46),
      { forwarded: true },
    ),
    mariaLine(
      22,
      "them",
      "Clear and fair. Can you send me a photo of the bedroom?",
      daysAgoAt(1, 9, 58),
    ),
    mariaLine(23, "me", "Photo", daysAgoAt(1, 10, 3), {
      kind: "image",
      attachment: bedroomPhoto,
    }),
    mariaLine(
      24,
      "them",
      "Oh, that light! Inês will love it.",
      daysAgoAt(1, 10, 10),
      {
        replyTo: {
          id: "demo-msg-maria-023",
          snippet: "The bedroom, morning light",
          senderName: "Tiago Costa",
          deleted: false,
          kind: "image",
          thumbnailUrl: bedroomPhoto.previewUrl,
        },
      },
    ),
    mariaLine(
      25,
      "them",
      "Does it get noisy at night? She works early shifts at the hospital.",
      daysAgoAt(1, 10, 11),
    ),
    mariaLine(
      26,
      "me",
      "It faces the back courtyard, so it's the quietest one in the flat.",
      daysAgoAt(1, 10, 20),
    ),
    mariaLine(27, "me", "Document", daysAgoAt(1, 14, 30), {
      kind: "document",
      attachment: leaseDocument,
    }),
    mariaLine(
      28,
      "them",
      "Thanks! I'll read it tonight with Inês.",
      daysAgoAt(1, 14, 52),
    ),
    mariaLine(
      29,
      "them",
      "Read it. Clause 7 says any new tenant needs the landlord's written consent. Is that usually quick?",
      daysAgoAt(1, 21, 5),
    ),
    mariaLine(
      30,
      "me",
      "Usually a day or two by email. I'll ask him first thing tomorrow.",
      daysAgoAt(1, 21, 20),
    ),
    mariaLine(
      31,
      "me",
      "Emailed the landlord this morning, he's reading it now.",
      minutesAgo(118),
    ),
    mariaLine(
      32,
      "them",
      "Brilliant, thank you for doing that.",
      minutesAgo(110),
    ),
    mariaLine(
      33,
      "them",
      "Inês asked if she can visit on Saturday afternoon?",
      minutesAgo(109),
    ),
    mariaLine(34, "me", "Saturday works. Around 3pm?", minutesAgo(100)),
    mariaLine(
      35,
      "them",
      "3pm is great. I'll come too if that's okay, I want to see this famous courtyard.",
      minutesAgo(96),
    ),
    mariaLine(36, "me", "Please do! I'll bake something.", minutesAgo(90)),
    mariaLine(37, "them", "Now I'm definitely coming.", minutesAgo(85), {
      reactions: [{ key: "laugh", count: 1, mine: true }],
    }),
    mariaLine(
      38,
      "me",
      "Landlord replied: he's happy to add Inês, he just needs a copy of her ID and a payslip.",
      minutesAgo(70),
    ),
    mariaLine(
      39,
      "me",
      "I told him she starts at the hospital in October, so the payslip comes later. He said a work contract is fine.",
      minutesAgo(58),
    ),
    mariaLine(40, "them", "That's such good news!", minutesAgo(40)),
    mariaLine(
      41,
      "them",
      "I just called Inês, she's so relieved.",
      minutesAgo(39),
    ),
    mariaLine(
      42,
      "them",
      "She'll send the work contract and her ID tonight.",
      minutesAgo(38),
    ),
    mariaLine(
      43,
      "them",
      "Should she send them to you or straight to the landlord?",
      minutesAgo(30),
    ),
    mariaLine(
      44,
      "them",
      "Also, does she need a NIF before signing? She's still waiting on hers.",
      minutesAgo(22),
    ),
    mariaLine(
      45,
      "them",
      "I told her yes, but now I'm doubting myself.",
      minutesAgo(21),
    ),
    mariaLine(
      46,
      "them",
      "Found it: the landlord can add the NIF to the contract later, she just needs it before the first rent receipt.",
      minutesAgo(12),
    ),
    mariaLine(
      47,
      "them",
      "So we're all set for Saturday at 3pm.",
      minutesAgo(5),
    ),
    mariaLine(48, "them", lastLine, minutesAgo(2)),
  ]),
});
