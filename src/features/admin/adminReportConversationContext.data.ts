import type {
  ConversationContextMessageDTO,
  ReportConversationContextDTO,
} from "./api/moderation.api";

/**
 * Demo fixture for the staff conversation viewer (PRD-360), used by
 * `useReportConversationContext` in demo mode only. Demo content, so it stays
 * English like the rest of the moderation seed.
 *
 * It exercises every state the viewer renders: the reported message (an
 * unsent photo kept under the evidence hold), another deleted message with no
 * body, an edited message, a system line, and a sender who has since erased
 * their account.
 */

interface DemoSender {
  senderId: string | null;
  senderDisplayName: string | null;
  senderSlug: string | null;
}

const REPORTER: DemoSender = {
  senderId: "demo-member-ana",
  senderDisplayName: "Ana L.",
  senderSlug: "ana-l",
};
const REPORTED: DemoSender = {
  senderId: "demo-member-nightowl",
  senderDisplayName: "Rui C.",
  senderSlug: "nightowl",
};
const FORMER_MEMBER: DemoSender = {
  senderId: null,
  senderDisplayName: null,
  senderSlug: null,
};

interface DemoLine {
  sender: DemoSender;
  body: string;
  kind?: ConversationContextMessageDTO["kind"];
  isEdited?: boolean;
  isDeletedWithoutBody?: boolean;
}

const EARLIER_LINES: DemoLine[] = [
  { sender: REPORTER, body: "hey, are you still coming to the book swap?" },
  { sender: REPORTED, body: "maybe. who else is going" },
  {
    sender: REPORTED,
    body: "Rui C. joined the book swap group",
    kind: "system",
  },
  { sender: REPORTER, body: "a few people from the trans support group" },
  { sender: REPORTED, body: "send me their names" },
  { sender: REPORTER, body: "I'd rather not share who's coming, sorry" },
  { sender: REPORTED, body: "why so secretive? I just want to know" },
  { sender: REPORTER, body: "they can tell you themselves if they want to" },
  { sender: REPORTED, body: "fine. I'll find out anyway", isEdited: true },
  { sender: FORMER_MEMBER, body: "ana is right, leave it" },
];

const LATER_LINES: DemoLine[] = [
  { sender: REPORTER, body: "why did you send that" },
  { sender: REPORTER, body: "I told you I wasn't interested" },
  { sender: REPORTED, body: "relax it was a joke" },
  { sender: REPORTER, body: "you deleted it but I already saw it" },
  { sender: REPORTED, body: "prove it", isDeletedWithoutBody: true },
  { sender: REPORTER, body: "please stop messaging me" },
  { sender: REPORTED, body: "you're overreacting" },
  { sender: REPORTER, body: "I'm reporting this" },
  { sender: REPORTED, body: "go ahead" },
  { sender: REPORTER, body: "blocking you now" },
];

function demoMessage(
  position: number,
  line: DemoLine,
): ConversationContextMessageDTO {
  // Two minutes apart, the whole window ending a couple of hours ago.
  const sentAt = new Date(
    Date.now() - (200 - position * 2) * 60_000,
  ).toISOString();
  return {
    id: `demo-context-message-${position}`,
    ...line.sender,
    kind: line.kind ?? "user",
    body: line.isDeletedWithoutBody ? null : line.body,
    attachment: null,
    sentAt,
    editedAt: line.isEdited ? sentAt : null,
    isDeleted: Boolean(line.isDeletedWithoutBody),
    isReportedMessage: false,
  };
}

export function demoReportConversationContext(
  reportId: string,
): ReportConversationContextDTO {
  // Each line set runs twice: twenty messages either side of the reported one.
  const earlier = [...EARLIER_LINES, ...EARLIER_LINES].map((line, index) =>
    demoMessage(index, line),
  );
  const reported: ConversationContextMessageDTO = {
    ...demoMessage(20, { sender: REPORTED, body: "Photo" }),
    kind: "image",
    attachment: { fileName: null, mimeType: "image/jpeg", sizeBytes: null },
    isDeleted: true,
    isReportedMessage: true,
  };
  const later = [...LATER_LINES, ...LATER_LINES].map((line, index) =>
    demoMessage(21 + index, line),
  );

  return {
    reportId,
    conversationId: "demo-conversation",
    reportedMessageId: reported.id,
    hasEarlierMessages: true,
    hasLaterMessages: false,
    messages: [...earlier, reported, ...later],
  };
}
