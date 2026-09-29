import { useRef, useState } from "react";
import {
  Button,
  EmptyState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import {
  usePieceMessages,
  type PieceThreadSide,
} from "../api/usePieceMessages";
import {
  PieceThreadComposer,
  type PieceThreadComposerProps,
} from "./PieceThreadComposer";
import { PieceThreadMessage } from "./PieceThreadMessage";
import styles from "./PieceThread.module.css";

export interface PieceThreadProps {
  pieceId: string;
  side: PieceThreadSide;
  /**
   * Condensed mode for a host that scrolls itself (the desk peek): only the
   * newest `latestCount` messages show, with a control that reveals the rest.
   * The list then drops its own scroll box, and its live region, so stepping
   * from piece to piece does not read each thread aloud.
   */
  latestCount?: number;
  /** Passed to the composer's Send button. Defaults to `primary`. */
  sendVariant?: PieceThreadComposerProps["sendVariant"];
  /** Passed to the composer: seeds its draft once on mount. */
  initialDraft?: PieceThreadComposerProps["initialDraft"];
}

/**
 * The editor and writer per-piece message thread (Phase 7 Wave F): ONE shared
 * view for both surfaces, since `PieceMessageDto` is identical either way
 * (`fromMe` is server-computed against whoever is asking; only the base path
 * differs). Reused inside the desk's Chase modal (`side="editor"`), the
 * writer workspace's "Message editor" thread + "From your editor" summary
 * (`side="writer"`), and, condensed through `latestCount`, the desk's piece
 * peek. Posting is a normal send here: Chase has no separate "confirm" step
 * anymore, so sending the message IS the chase (and notifies the other party
 * server-side). The reply box is the shared `PieceThreadComposer`.
 */
export function PieceThread({
  pieceId,
  side,
  latestCount,
  sendVariant,
  initialDraft,
}: PieceThreadProps) {
  const { t } = useTranslation();
  const { messages, isLoading, isError } = usePieceMessages(pieceId, side);
  const [isShowingEarlier, setIsShowingEarlier] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const isCondensed = latestCount !== undefined;
  const earlierCount =
    latestCount !== undefined && !isShowingEarlier
      ? Math.max(messages.length - latestCount, 0)
      : 0;
  const shownMessages =
    earlierCount > 0 ? messages.slice(earlierCount) : messages;

  // The button unmounts once pressed, so focus moves on to the list it
  // opened and keeps the reader in place.
  function handleShowEarlier(): void {
    setIsShowingEarlier(true);
    messagesRef.current?.focus();
  }

  function renderMessages() {
    if (isLoading) {
      return (
        <div className={styles.loading} aria-hidden>
          <SkeletonLine width="70%" height={14} />
          <SkeletonLine width="45%" height={14} />
        </div>
      );
    }
    if (isError) {
      return (
        <p className={styles.tiny}>{t("magazine:pieceThread.errorState")}</p>
      );
    }
    if (messages.length === 0) {
      return isCondensed ? (
        <p className={styles.tiny}>{t("magazine:pieceThread.emptyTitle")}</p>
      ) : (
        <EmptyState
          compact
          title={t("magazine:pieceThread.emptyTitle")}
          description={t("magazine:pieceThread.emptyDescription")}
        />
      );
    }
    return shownMessages.map((message) => (
      <PieceThreadMessage key={message.id} message={message} />
    ));
  }

  return (
    <div className={styles.thread}>
      {earlierCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.showEarlier}
          onClick={handleShowEarlier}
        >
          {t("magazine:pieceThread.showEarlier", { count: earlierCount })}
        </Button>
      )}
      <div
        ref={messagesRef}
        tabIndex={isCondensed ? -1 : undefined}
        className={cx(styles.messages, isCondensed && styles.messagesInline)}
        aria-live={isCondensed ? undefined : "polite"}
      >
        {renderMessages()}
      </div>
      <PieceThreadComposer
        pieceId={pieceId}
        side={side}
        sendVariant={sendVariant}
        initialDraft={initialDraft}
      />
    </div>
  );
}
