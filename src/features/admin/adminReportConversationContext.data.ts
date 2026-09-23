import type {
  ConversationContextMessageDTO,
  ReportConversationContextDTO,
  SentAsIdentityDTO,
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
  /** Business mailboxes, design section 9 (I2): the identity this line was
   *  sent as. Absent (null) for every line in the personal-DM fixture below;
   *  the sent-as-identity fixture further down is the one that sets it. */
  sentAsIdentity?: SentAsIdentityDTO;
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
    sentAsIdentity: line.sentAsIdentity ?? null,
    kind: line.kind ?? "user",
    body: line.isDeletedWithoutBody ? null : line.body,
    attachment: null,
    sentAt,
    editedAt: line.isEdited ? sentAt : null,
    isDeleted: Boolean(line.isDeletedWithoutBody),
    isReportedMessage: false,
  };
}

/**
 * Business mailboxes, design section 9 (I2 fix): the reportId
 * `OTHER_REPORTS` uses for the sent-as-identity demo case
 * (`adminModeration.data.ts`). Kept as its own short fixture: `sentAsIdentity`
 * only makes sense next to a staffed mailbox's reply, and folding one into the
 * personal-DM fixture above would misstate that harassment scenario between
 * two members.
 */
export const SENT_AS_IDENTITY_DEMO_REPORT_ID = "r-msg-sent-as-identity";

/** The demo mailbox identity the fixture's reported reply went out as.
 *  Reused by `adminModeration.data.ts` so the drawer's inline line and the
 *  conversation viewer's per-message tag agree on the same business. */
export const DEMO_SENT_AS_CAFE_LISBOA: SentAsIdentityDTO = {
  identityId: "demo-identity-cafe-lisboa",
  kind: "listing",
  displayName: "Café Lisboa",
  handle: "cafe-lisboa",
};

const SENT_AS_CUSTOMER: DemoSender = {
  senderId: "demo-member-sofia",
  senderDisplayName: "Sofia M.",
  senderSlug: "sofia-m",
};
const SENT_AS_STAFF: DemoSender = {
  senderId: "demo-member-nightowl",
  senderDisplayName: "Rui C.",
  senderSlug: "nightowl",
};

const SENT_AS_IDENTITY_LINES: DemoLine[] = [
  {
    sender: SENT_AS_CUSTOMER,
    body: "hi, do you do refunds if the pastries arrive stale?",
  },
  {
    sender: SENT_AS_STAFF,
    body: "we don't do refunds, read the listing next time",
    sentAsIdentity: DEMO_SENT_AS_CAFE_LISBOA,
  },
  { sender: SENT_AS_CUSTOMER, body: "that's a pretty rude way to say it" },
];

function demoSentAsIdentityConversationContext(
  reportId: string,
): ReportConversationContextDTO {
  const messages = SENT_AS_IDENTITY_LINES.map((line, index) =>
    demoMessage(index, line),
  );
  const reported = messages[1];
  if (reported) reported.isReportedMessage = true;
  return {
    reportId,
    conversationId: "demo-conversation-sent-as-identity",
    reportedMessageId: (reported ?? messages[0])?.id ?? "",
    hasEarlierMessages: false,
    hasLaterMessages: false,
    messages,
  };
}

export function demoReportConversationContext(
  reportId: string,
): ReportConversationContextDTO {
  if (reportId === SENT_AS_IDENTITY_DEMO_REPORT_ID) {
    return demoSentAsIdentityConversationContext(reportId);
  }
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
