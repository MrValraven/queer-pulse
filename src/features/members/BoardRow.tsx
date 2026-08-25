import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, KindChip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatRelative } from "../../shared/lib/date";
import { routes } from "../../app/routeMap";
import { useCloseBoardItem } from "./api/useCloseBoardItem";
import type { BoardItem } from "./data/members";
import styles from "./ProfilePage.module.css";

/** Once fewer than this many days remain before `expiresAt`, the row shows an
 *  "expires soon" nudge instead of the plain posted-ago line. */
const EXPIRY_WARNING_DAYS = 7;

/** Whole days remaining until `iso`, rounded up (so "expires later today"
 *  still reads as 1, not 0). `null` for an unparseable/absent timestamp. */
function daysUntil(iso: string | undefined): number | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
}

/** One barter-board card: the looking/offering chip + title (linking to the
 *  full barter board), a posted-ago / expiry-warning meta line, and — for the
 *  owner's own open posts only — a "Mark as found" action with a tiny inline
 *  confirm (mirrors `PlacesSection`'s delete-with-confirm). Split out of
 *  `BoardSection` because the close flow needs its own local state
 *  (confirm-armed, the optional note, the optimistic closed override) per
 *  row, not per section. */
export function BoardRow({
  item,
  /** Only the profile owner can close their own board post. */
  isSelf,
}: {
  item: BoardItem;
  isSelf: boolean;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const closeBoardItem = useCloseBoardItem();
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState("");
  // Optimistic local override once the close mutation succeeds — the profile
  // query invalidation this hook fires keeps the source of truth in sync for
  // the NEXT fetch, but this row updates immediately without waiting on it
  // (and is the only way demo mode, which never persists, reflects the close
  // at all). See `useCloseBoardItem`'s doc comment.
  const [closedOverride, setClosedOverride] = useState<{
    closedNote?: string;
    closedAt?: string;
  } | null>(null);

  const isClosed = item.status === "closed" || closedOverride !== null;
  const closedNote = closedOverride?.closedNote ?? item.closedNote;
  const daysLeft = isClosed ? null : daysUntil(item.expiresAt);
  const showExpiryWarning =
    daysLeft !== null && daysLeft <= EXPIRY_WARNING_DAYS;

  async function handleConfirmClose() {
    const result = await closeBoardItem.mutateAsync({
      slug: item.slug,
      note: note.trim() || undefined,
    });
    setClosedOverride({
      closedNote: result.closedNote,
      closedAt: result.closedAt,
    });
    setConfirming(false);
  }

  return (
    <article className={`${styles.ask} ${isClosed ? styles.askDone : ""}`}>
      <Link to={`${routes.offer}#${item.slug}`} className={styles.askTitleLink}>
        <KindChip kind={item.kind}>
          {item.kind === "looking"
            ? t("members:content.board.looking")
            : t("members:content.board.offering")}
        </KindChip>
        <h3 className={isClosed ? styles.askTitleDone : undefined}>
          {item.title}
        </h3>
      </Link>
      <div className={styles.askMeta}>
        {isClosed ? (
          <span>
            {closedNote
              ? t("members:profile.board.foundItWithNote", {
                  note: closedNote,
                })
              : t("members:profile.board.foundIt")}
          </span>
        ) : (
          <>
            {item.createdAt && (
              <span>
                {t("members:profile.board.postedAgo", {
                  time: formatRelative(item.createdAt, formatters),
                })}
              </span>
            )}
            {showExpiryWarning && (
              <span className={styles.askWarn}>
                {t("members:profile.board.expiresWarning", {
                  count: Math.max(0, daysLeft ?? 0),
                })}
              </span>
            )}
          </>
        )}
      </div>
      {isSelf &&
        !isClosed &&
        (confirming ? (
          <div
            className={styles.askConfirm}
            role="alertdialog"
            aria-label={t("members:profile.board.markFoundCta")}
          >
            <input
              className={styles.askNoteInput}
              type="text"
              value={note}
              maxLength={140}
              placeholder={t("members:profile.board.foundNotePlaceholder")}
              aria-label={t("members:profile.board.foundNoteLabel")}
              onChange={(event) => setNote(event.target.value)}
            />
            <div className={styles.askConfirmActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                {t("members:profile.board.markFoundCancel")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={closeBoardItem.isPending}
                onClick={() => void handleConfirmClose()}
              >
                {t("members:profile.board.markFoundConfirm")}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className={styles.askMarkFound}
            onClick={() => setConfirming(true)}
          >
            {t("members:profile.board.markFoundCta")}
          </Button>
        ))}
    </article>
  );
}
