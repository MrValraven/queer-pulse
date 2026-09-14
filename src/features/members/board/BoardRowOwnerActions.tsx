import { useState } from "react";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useToast } from "../../../shared/components/feedback/useToast";
import { ApiError } from "../../../shared/api/client";
import { useCloseBoardItem } from "../api/useCloseBoardItem";
import { useRenewBoardItem } from "../api/useRenewBoardItem";
import { BOARD_RENEW_LIMIT } from "./boardLifespan";
import type { BoardItem } from "../data/members";
import type { BoardLifespan } from "./boardLifespan";
import styles from "./BoardSection.module.css";

/**
 * The owner's side of a board row: renew (or repost, once the post has
 * lapsed) and mark found, each with its own inline confirm.
 *
 * Renew and repost are the same mutation, and the backend measures a fresh
 * window from now either way, so the label alone tells them apart, from
 * `lifespan.isExpired`. `BOARD_RENEW_LIMIT` is mirrored here only to hide the
 * button once a post has used up its renewals; the server is the one that
 * actually enforces the cap, and a race that gets past this client-side hide
 * still lands as the same narrowed 409 `handleRenew` catches below.
 */
export function BoardRowOwnerActions({
  item,
  lifespan,
  onClosed,
  onRenewed,
}: {
  item: BoardItem;
  lifespan: BoardLifespan;
  onClosed: (closed: { closedNote?: string; closedAt?: string }) => void;
  onRenewed: (renewed: { expiresAt: string; renewCount: number }) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const closeBoardItem = useCloseBoardItem();
  const renewBoardItem = useRenewBoardItem();
  const [confirmingFound, setConfirmingFound] = useState(false);
  const [foundNote, setFoundNote] = useState("");

  const renewsLeft = BOARD_RENEW_LIMIT - (item.renewCount ?? 0);

  async function handleConfirmFound() {
    try {
      const result = await closeBoardItem.mutateAsync({
        slug: item.slug,
        note: foundNote.trim() || undefined,
      });
      onClosed({ closedNote: result.closedNote, closedAt: result.closedAt });
      setConfirmingFound(false);
    } catch {
      showToast(t("shared:social.genericError"), "error");
    }
  }

  async function handleRenew() {
    try {
      const result = await renewBoardItem.mutateAsync({
        slug: item.slug,
        kind: item.kind,
        renewCount: item.renewCount ?? 0,
      });
      onRenewed({
        expiresAt: result.expiresAt,
        renewCount: result.renewCount,
      });
      showToast(
        t("members:content.board.renewSuccess", {
          count: lifespan.windowDays,
        }),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        showToast(t("members:content.board.renewLimitReached"), "error");
        return;
      }
      showToast(t("shared:social.genericError"), "error");
    }
  }

  if (confirmingFound) {
    return (
      <div
        className={styles.respondConfirm}
        role="alertdialog"
        aria-label={t("members:profile.board.markFoundCta")}
      >
        <input
          className={styles.respondNoteInput}
          type="text"
          value={foundNote}
          maxLength={140}
          placeholder={t("members:profile.board.foundNotePlaceholder")}
          aria-label={t("members:profile.board.foundNoteLabel")}
          onChange={(event) => setFoundNote(event.target.value)}
        />
        <div className={styles.respondConfirmActions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingFound(false)}
          >
            {t("members:profile.board.markFoundCancel")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={closeBoardItem.isPending}
            onClick={() => void handleConfirmFound()}
          >
            {t("members:profile.board.markFoundConfirm")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      {renewsLeft > 0 && (
        <Button
          variant="primary"
          size="sm"
          disabled={renewBoardItem.isPending}
          onClick={() => void handleRenew()}
        >
          {lifespan.isExpired
            ? t("members:content.board.repostCta")
            : t("members:content.board.renewCta", {
                count: lifespan.windowDays,
              })}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmingFound(true)}
      >
        {t("members:profile.board.markFoundCta")}
      </Button>
    </div>
  );
}
