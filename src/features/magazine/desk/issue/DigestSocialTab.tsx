import { useState } from "react";
import { FiBellOff, FiCheck, FiExternalLink } from "react-icons/fi";
import { Button, ImageSlot } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { intlLocale } from "../../../../shared/i18n/locale";
import { cx } from "../../../../shared/lib/cx";
import { formatDate } from "../../../../shared/lib/date";
import { routes } from "../../../../app/routeMap";
import type { IssueDigestItemDto } from "../../api/issueProduction.api";
import type { PieceListItemDto } from "../../api/pieces.api";
import { isIssueAnnouncePending } from "./issueAnnounceRule";
import noteStyles from "../pieceTabs.module.css";
import styles from "./issueTabs.module.css";

export interface DigestSocialTabProps {
  digest: IssueDigestItemDto[];
  pieces: PieceListItemDto[];
  /** The issue's public display number, for the "preview the panel" link. */
  issueNumber: string;
  /** "Announce with the issue" toggle + the announcement watermark. */
  digestSendOnPublish: boolean;
  digestSentAt: string | null;
  /** An earlier ship already stamped pieces without ringing the bell
   *  (`hasShippedWithoutAnnouncement`, computed once by the page), so the tab
   *  tells that issue apart from one still waiting for its first ship. */
  hasShippedQuietly?: boolean;
  onSaveDigest: (nextDigest: IssueDigestItemDto[]) => void;
  onToggleSendOnPublish: (next: boolean) => void;
}

/**
 * Issue production — Issue panel & social tab. The issue-panel card lists
 * every curated piece in reading order (a checkbox to include/exclude it, its
 * blurb, and an inline editor); the social-out card turns the same curated
 * set into one card per piece for posting elsewhere. Every curation edit is
 * an immutable rewrite of the `digest` array handed back through
 * `onSaveDigest`.
 *
 * CON-05: this curation used to feed an EMAIL. Shipping queued a members'
 * digest per newsletter subscriber and a cron mailed it. QueerPulse delivers
 * no email, so the send path is gone and the same curated order and blurbs now
 * render on the issue's own public page. "Announce with the issue" toggles
 * `digestSendOnPublish`, which the real ship action reads to decide whether to
 * put ONE in-app notification in every member's bell. It rings only for a
 * ship made from 09:00 Lisbon time on the issue date (PRD-438): there is no
 * scheduled job to ring it later, so while the toggle is on the tab says
 * that rule out loud. Once `digestSentAt` is set the toggle locks, since the
 * announcement has already gone out. This tab holds no other server state of
 * its own.
 */
export function DigestSocialTab({
  digest,
  pieces,
  issueNumber,
  digestSendOnPublish,
  digestSentAt,
  hasShippedQuietly = false,
  onSaveDigest,
  onToggleSendOnPublish,
}: DigestSocialTabProps) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [editingPieceId, setEditingPieceId] = useState<string | null>(null);
  const [draftBlurb, setDraftBlurb] = useState("");
  const isAnnouncePending = isIssueAnnouncePending(
    digestSendOnPublish,
    digestSentAt,
  );
  // A toggle button keeps one label across its pressed states, so the fill
  // and `aria-pressed` carry on/off. After a quiet ship the label narrows to
  // what the toggle can still do: announce a piece going live for the first
  // time.
  const announceToggleLabel = hasShippedQuietly
    ? t("magazine:issue.digest.announceNewPieceLive")
    : t("magazine:issue.digest.announceWithIssue");

  function findPieceTitle(pieceId: string): string {
    return pieces.find((piece) => piece.id === pieceId)?.title ?? pieceId;
  }

  function toggleOn(pieceId: string) {
    onSaveDigest(
      digest.map((item) =>
        item.pieceId === pieceId ? { ...item, on: !item.on } : item,
      ),
    );
  }

  function startEdit(item: IssueDigestItemDto) {
    setEditingPieceId(item.pieceId);
    setDraftBlurb(item.blurb);
  }

  function cancelEdit() {
    setEditingPieceId(null);
    setDraftBlurb("");
  }

  function saveEdit(pieceId: string) {
    const trimmedBlurb = draftBlurb.trim();
    onSaveDigest(
      digest.map((item) =>
        item.pieceId === pieceId ? { ...item, blurb: trimmedBlurb } : item,
      ),
    );
    setEditingPieceId(null);
    setDraftBlurb("");
  }

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <h3>{t("magazine:issue.digest.heading")}</h3>
        <p className={styles.hint}>{t("magazine:issue.digest.hint")}</p>
        {digest.map((item) => {
          const pieceTitle = findPieceTitle(item.pieceId);
          const isEditing = editingPieceId === item.pieceId;
          return (
            <div key={item.pieceId} className={styles.digrow}>
              <button
                type="button"
                role="checkbox"
                aria-checked={item.on}
                aria-label={t("magazine:issue.digest.includeAria", {
                  title: pieceTitle,
                })}
                className={styles.ck}
                onClick={() => toggleOn(item.pieceId)}
              >
                {item.on && <FiCheck aria-hidden />}
              </button>
              <div className={styles.digBody}>
                <h4>{pieceTitle}</h4>
                {isEditing ? (
                  <div className={styles.editField}>
                    <textarea
                      value={draftBlurb}
                      aria-label={t("magazine:issue.digest.editBlurbAria", {
                        title: pieceTitle,
                      })}
                      onChange={(event) => setDraftBlurb(event.target.value)}
                    />
                    <div className={styles.row}>
                      <Button size="sm" onClick={() => saveEdit(item.pieceId)}>
                        {t("magazine:issue.digest.save")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        {t("magazine:issue.digest.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p>{item.blurb}</p>
                )}
              </div>
              {!isEditing && (
                <div className={styles.digActions}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(item)}
                  >
                    {t("magazine:issue.digest.edit")}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        <div className={styles.row}>
          <Button
            size="sm"
            variant="ghost"
            to={`${routes.issue}/${issueNumber}`}
          >
            <FiExternalLink aria-hidden />{" "}
            {t("magazine:issue.digest.previewPanel")}
          </Button>
          <Button
            size="sm"
            variant={digestSendOnPublish ? "plum" : "ghost"}
            className={styles.announceToggle}
            aria-pressed={digestSendOnPublish}
            onClick={() => {
              const next = !digestSendOnPublish;
              onToggleSendOnPublish(next);
              showToast(
                t(
                  next
                    ? "magazine:issue.digest.announceOnToast"
                    : "magazine:issue.digest.announceOffToast",
                ),
                "success",
              );
            }}
            disabled={digestSentAt !== null}
          >
            {announceToggleLabel}
          </Button>
        </div>
        <DigestAnnounceStatus
          isAnnouncePending={isAnnouncePending}
          hasShippedQuietly={hasShippedQuietly}
          digestSentAt={digestSentAt}
        />
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:issue.digest.socialHeading")}</h3>
        <div className={styles.socialrow}>
          {digest.map((item) => {
            const pieceTitle = findPieceTitle(item.pieceId);
            return (
              <div key={item.pieceId} className={styles.socialcard}>
                <ImageSlot
                  alt={pieceTitle}
                  placeholder={pieceTitle}
                  tint="plum"
                  height={110}
                />
                <b>{pieceTitle}</b>
                <p>{item.blurb}</p>
              </div>
            );
          })}
        </div>
        <p className={styles.hint}>
          {t("magazine:issue.digest.socialAltHint")}
        </p>
      </div>
    </div>
  );
}

/**
 * What the announcement will do, under the toggle. After a quiet ship it is a
 * warn note matching `ShipIssueModal`'s, since the next ship can only announce
 * a piece going live for the first time; while the first ship is still ahead
 * it states the 09:00 Lisbon rule; once sent it names the date.
 */
function DigestAnnounceStatus({
  isAnnouncePending,
  hasShippedQuietly,
  digestSentAt,
}: {
  isAnnouncePending: boolean;
  hasShippedQuietly: boolean;
  digestSentAt: string | null;
}) {
  const { t, language } = useTranslation();
  return (
    <>
      {isAnnouncePending && hasShippedQuietly && (
        <div
          className={cx(noteStyles.note, noteStyles.warn, noteStyles.noteStack)}
        >
          <b>
            <FiBellOff aria-hidden />
            {t("magazine:issue.ship.shippedQuietlyLead")}
          </b>
          <span>{t("magazine:issue.ship.shippedQuietlyBody")}</span>
        </div>
      )}
      {isAnnouncePending && !hasShippedQuietly && (
        <p className={styles.hint}>
          {t("magazine:issue.digest.announceRuleHint")}
        </p>
      )}
      {digestSentAt && (
        <p className={styles.hint}>
          {t("magazine:issue.digest.alreadyAnnounced", {
            date: formatDate(digestSentAt, intlLocale(language)),
          })}
        </p>
      )}
    </>
  );
}
