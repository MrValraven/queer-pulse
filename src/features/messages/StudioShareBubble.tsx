import type { ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LazyStudioShareCard } from "../studio/share/LazyStudioShareCard";
import type { StudioLinkTarget } from "../studio/share/studioLinkTarget";
import { studioShareLabelKey } from "../studio/share/studioShareLabel";
import { AttachmentCaption } from "./AttachmentCaption";
import { InboundSafetyCaution } from "./InboundSafetyCaution";
import { MessageMeta, type MetaStatus } from "./MessageSendStatus";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";
import localStyles from "./StudioShareBubble.module.css";

/**
 * The bubble for a message whose text carries a Studio track, release or
 * playlist link (`TextBubble`'s Studio early return, MessageBubbleBody.tsx):
 * the card stands on its own, the note sits in a caption bubble under it, and
 * the URL is never shown, exactly as `PlaceShareBubble` does for a place.
 * Each reader's own Studio reads resolve the card (spec invariant 1).
 */
export function StudioShareBubble({
  message,
  isSent,
  metaStatus,
  contentLabelId,
  forwardedNode,
  replyQuoteNode,
  target,
  caption,
  showInboundSafetyCaution,
}: {
  message: ChatMessage;
  isSent: boolean;
  metaStatus: MetaStatus;
  contentLabelId: string;
  forwardedNode: ReactNode;
  replyQuoteNode: ReactNode;
  target: StudioLinkTarget;
  /** The message text without the Studio link; empty for a link-only share. */
  caption: string;
  showInboundSafetyCaution: boolean;
}) {
  const { t } = useTranslation();
  const kindLabel = t(studioShareLabelKey(target.kind));
  return (
    <>
      {forwardedNode}
      {replyQuoteNode}
      <div className={`${styles.attachmentGroup} ${localStyles.group}`}>
        <LazyStudioShareCard target={target} surface="chat" />
        {/* The bubble's label always names the Studio kind, so a screen
            reader hears what is attached, then the note when there is one. */}
        <span id={contentLabelId} hidden>
          {caption ? `${kindLabel}: ${caption}` : kindLabel}
        </span>
        <AttachmentCaption
          caption={caption}
          isSent={isSent}
          id={`${contentLabelId}-note`}
        />
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
