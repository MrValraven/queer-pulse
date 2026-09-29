/**
 * The doors a member can write a first message to someone through (PRD-340):
 * reaching out from a profile, the "message someone new" picker, replying to
 * a stranger's inbound request, and a cold enquiry about something the
 * recipient published (a directory listing, a home). Each resolves its OWN
 * copy below, and call sites pass no copy of their own, so the doors keep one
 * wording for the same act.
 */
export type FirstContactDoor =
  "connect" | "messageRequest" | "reply" | "enquiry";

export interface FirstContactDoorCopy {
  statusKey: string;
  introKey?: string;
  /** Replaces `introKey` while the composer's `followUpAwaitsReply` is true:
   *  the rule that this first message stays the only one until they reply. */
  awaitsReplyKey?: string;
  placeholderKey: string;
  ariaKey: string;
  sendCtaKey: string;
}

/** Split out of `FirstContactComposer.tsx` to keep it under the 200-line cap. */
export const DOOR_COPY: Record<FirstContactDoor, FirstContactDoorCopy> = {
  connect: {
    statusKey: "messages:firstContact.notConnectedYet",
    introKey: "messages:firstContact.composeIntro",
    placeholderKey: "messages:firstContact.composePlaceholder",
    ariaKey: "messages:firstContact.composeAria",
    sendCtaKey: "messages:firstContact.sendCta",
  },
  messageRequest: {
    statusKey: "messages:firstContact.notConnectedYet",
    introKey: "messages:firstContact.composeIntro",
    placeholderKey: "messages:firstContact.composePlaceholder",
    ariaKey: "messages:firstContact.composeAria",
    sendCtaKey: "messages:firstContact.sendCta",
  },
  reply: {
    statusKey: "messages:firstContact.replyAccepts",
    placeholderKey: "messages:firstContact.replyPlaceholder",
    ariaKey: "messages:firstContact.replyAria",
    sendCtaKey: "messages:firstContact.replySendCta",
  },
  // A cold enquiry lands with no connection request attached, so there is
  // nothing to accept: the honest rule is the reply gate, stated only when the
  // contact read says it applies.
  enquiry: {
    statusKey: "messages:firstContact.enquiryStatus",
    awaitsReplyKey: "messages:firstContact.enquiryAwaitsReply",
    placeholderKey: "messages:firstContact.enquiryPlaceholder",
    ariaKey: "messages:firstContact.composeAria",
    sendCtaKey: "messages:firstContact.enquirySendCta",
  },
};
