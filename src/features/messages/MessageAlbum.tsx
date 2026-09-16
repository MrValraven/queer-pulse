// src/features/messages/MessageAlbum.tsx
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BubbleHiddenLabels } from "./MessageBubbleParts";
import { useBubbleLabelIds } from "./bubbleLabelIds";
import { MessageAlbumTile } from "./MessageAlbumTile";
import { MessageMeta, type MetaStatus } from "./MessageSendStatus";
import { ALBUM_VISIBLE_TILES } from "./messageAlbums";
import type { LongPressOrigin } from "./useLongPress";
import type { ChatMessage } from "./data";
import styles from "./MessageAlbum.module.css";

/**
 * Two or more photos sent together, collapsed into one grid (DES-219; the
 * grouping rules live in `groupIntoAlbums`). Two photos sit side by side,
 * three put one wide tile over two squares, and four or more fill a two by
 * two grid whose fourth tile counts the photos that did not fit.
 *
 * It sits inside the run's row, so the virtualizer measures and moves it as
 * one unit, and `findRowIndexForMessage` already resolves any member's id to
 * that row.
 *
 * Named like a bubble: a `role="group"` labelled by the sender, with the
 * album's own "Album, 5 photos" and the last photo's time as the description.
 * Each photo is its own keyboard stop inside it. One meta, taken from the last
 * photo, sits under the grid.
 */
export function MessageAlbum({
  messages,
  isSent,
  senderName,
  metaStatus,
  onOpenActions,
}: {
  messages: ChatMessage[];
  isSent: boolean;
  senderName: string;
  metaStatus: MetaStatus;
  onOpenActions?: (
    message: ChatMessage,
    origin: LongPressOrigin,
    isSent: boolean,
  ) => void;
}) {
  const { t } = useTranslation();
  const labelIds = useBubbleLabelIds();
  const total = messages.length;
  const lastMessage = messages[total - 1]!;
  const visibleMessages = messages.slice(0, ALBUM_VISIBLE_TILES);
  const hiddenCount = total - visibleMessages.length;
  // Photos past the fourth have no tile of their own, so the "+N" tile rings
  // for a jump to any of them.
  const hiddenMessageIds = messages
    .slice(ALBUM_VISIBLE_TILES)
    .flatMap((message) => (message.id ? [message.id] : []));
  const layoutClass =
    total === 2
      ? styles.albumTwo
      : total === 3
        ? styles.albumThree
        : styles.albumGridOfFour;

  return (
    <div
      className={[styles.album, isSent && styles.albumSent]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-roledescription={t("messages:bubble.roleDescription")}
      aria-labelledby={labelIds.sender}
      aria-describedby={`${labelIds.content} ${labelIds.details}`}
    >
      {/* Members never carry marks (they break out of the album), so the
          last photo's details are its time alone. */}
      <BubbleHiddenLabels
        labelIds={labelIds}
        senderName={senderName}
        message={lastMessage}
      />
      <span id={labelIds.content} hidden>
        {t("messages:album.label", { count: total })}
      </span>
      <div className={[styles.albumGrid, layoutClass].join(" ")}>
        {visibleMessages.map((message, position) => (
          <MessageAlbumTile
            key={message.localId ?? message.id ?? `tile-${position}`}
            message={message}
            isSent={isSent}
            senderName={senderName}
            position={position}
            total={total}
            hiddenCount={
              position === visibleMessages.length - 1 ? hiddenCount : 0
            }
            hiddenMessageIds={
              position === visibleMessages.length - 1 ? hiddenMessageIds : []
            }
            onOpenActions={onOpenActions}
          />
        ))}
      </div>
      <MessageMeta
        time={lastMessage.time}
        isSent={isSent}
        metaStatus={metaStatus}
        floating={false}
      />
    </div>
  );
}
