// src/features/messages/PlaceShareBubble.tsx
import type { ReactNode } from "react";
import type { ChatPlaceLinkInfo } from "./linkify";
import type { MessageLinkCardState } from "./api/useMessageLinkCard";
import { MessageLinkCard } from "./MessageLinkCard";
import { MessageMeta, type MetaStatus } from "./MessageSendStatus";
import { AttachmentCaption } from "./AttachmentCaption";
import { InboundSafetyCaution } from "./InboundSafetyCaution";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";
import localStyles from "./PlaceShareBubble.module.css";

/**
 * The bubble for a message whose link resolved to a real QueerPulse
 * directory place (`TextBubble`'s `placeLink` early return, MessageBubbleBody
 * .tsx): the place card stands on its own, with no coloured `.bubble` frame
 * around it, since the card already carries its own paper surface, border,
 * radius and shadow (`PlaceLinkCardBody`). The note, if the sender wrote
 * one, sits in a caption bubble directly under the card, exactly the way
 * `ImageOrGifBubble` puts a photo's caption under the photo. A link-only
 * share (no note) renders just the card, no caption bubble at all. Meta
 * (time + status tick) sits below as its own line, never floated onto a
 * bubble surface, again mirroring the photo/document bodies.
 *
 * Split into its own file (rather than inlined in `MessageBubbleBody`, which
 * already holds several other bubble kinds) purely to keep that file from
 * growing past a reasonable size; it owns no state of its own. `TextBubble`
 * resolves the link card and the place-link swap and hands both down.
 */
export function PlaceShareBubble({
  message,
  isSent,
  metaStatus,
  contentLabelId,
  forwardedNode,
  replyQuoteNode,
  linkCard,
  placeLink,
  shouldRenderText,
  showInboundSafetyCaution,
}: {
  message: ChatMessage;
  isSent: boolean;
  metaStatus: MetaStatus;
  contentLabelId: string;
  forwardedNode: ReactNode;
  replyQuoteNode: ReactNode;
  linkCard: MessageLinkCardState;
  placeLink: ChatPlaceLinkInfo;
  /** Whether the sender wrote anything beyond the bare place link: a
   *  link-only share renders no caption bubble at all. */
  shouldRenderText: boolean;
  showInboundSafetyCaution: boolean;
}) {
  return (
    <>
      {forwardedNode}
      {replyQuoteNode}
      <div className={`${styles.attachmentGroup} ${localStyles.group}`}>
        <MessageLinkCard url={placeLink.url} state={linkCard} isSent={isSent} />
        {shouldRenderText ? (
          <AttachmentCaption
            caption={message.text}
            isSent={isSent}
            id={contentLabelId}
            placeLink={placeLink}
          />
        ) : (
          // A link-only share still needs content for the bubble's label to
          // read. The card's own name lives on its own `aria-label` (only
          // announced once a screen-reader user tabs into it), so the hidden
          // fallback mirrors what a link-only OG-preview bubble does.
          <span id={contentLabelId} hidden>
            {message.text}
          </span>
        )}
      </div>
      <MessageMeta
        time={message.time}
        isSent={isSent}
        metaStatus={metaStatus}
        floating={false}
      />
      {showInboundSafetyCaution && <InboundSafetyCaution />}
    </>
  );
}
