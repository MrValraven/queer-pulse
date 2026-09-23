import { useTranslation } from "../../shared/i18n/useTranslation";
import { MessageMeta, type MetaStatus } from "./MessageSendStatus";
import type { BubbleLabelIds } from "./bubbleLabelIds";
import type { ChatMessage } from "./data";
import { isStickerAttachment } from "../../shared/api/stickerAttachment";
import styles from "./MessagesPage.module.css";
import type { ReactNode } from "react";

/** The rendered size in the thread. Deliberately smaller than the 512px
 *  source: a sticker reads as a gesture, and at full size it would dominate
 *  the log. Set as real attributes so the row reserves its box before the
 *  image loads and the thread never reflows underneath a reader. */
const STICKER_DISPLAY_SIZE = 128;

/**
 * A sticker renders bare: no bubble background, no padding, no tail, which is
 * what makes it read as a sticker rather than a photo in a bubble. The meta
 * row sits below rather than floating, for the same reason the image branch
 * places it there: there is no coloured bubble to tuck it into.
 *
 * There is no caption. `attachment.label` is the sticker's name and is used
 * as alt text only, so a screen reader says "Bi reverse sticker" instead of
 * announcing nothing.
 */
export function StickerBubble({
  message,
  isSent,
  metaStatus,
  labelIds,
  forwardedNode,
  replyQuoteNode,
}: {
  message: ChatMessage;
  isSent: boolean;
  metaStatus: MetaStatus;
  labelIds: BubbleLabelIds;
  forwardedNode: ReactNode;
  replyQuoteNode: ReactNode;
}) {
  const { t } = useTranslation();
  const attachment =
    message.attachment && isStickerAttachment(message.attachment)
      ? message.attachment
      : null;
  if (!attachment) return null;
  return (
    <>
      {forwardedNode}
      {replyQuoteNode}
      <img
        id={labelIds.content}
        className={styles.stickerImage}
        src={attachment.url}
        alt={t("messages:sticker.imageAlt", { label: attachment.label })}
        width={STICKER_DISPLAY_SIZE}
        height={STICKER_DISPLAY_SIZE}
        loading="lazy"
        draggable={false}
      />
      <MessageMeta
        time={message.time}
        isSent={isSent}
        metaStatus={metaStatus}
        floating={false}
      />
    </>
  );
}
