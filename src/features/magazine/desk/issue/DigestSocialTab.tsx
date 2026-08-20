import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, ImageSlot } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatDate } from "../../../../shared/lib/date";
import type { IssueDigestItemDto } from "../../api/issueProduction.api";
import type { PieceListItemDto } from "../../api/pieces.api";
import styles from "./issueTabs.module.css";

export interface DigestSocialTabProps {
  digest: IssueDigestItemDto[];
  pieces: PieceListItemDto[];
  /** CNT-6 "Schedule with issue" toggle + send watermark. */
  digestSendOnPublish: boolean;
  digestSentAt: string | null;
  onSaveDigest: (nextDigest: IssueDigestItemDto[]) => void;
  onToggleSendOnPublish: (next: boolean) => void;
  /** POST /magazine/admin/issues/:number/digest/test-send — resolves or
   *  rejects; this tab owns the success/failure toast (see `handleSendTest`). */
  onSendTest: () => Promise<void>;
  sendTestPending: boolean;
}

/**
 * Issue production — Digest & social tab. The members' digest card lists
 * every curated piece in email order (a checkbox to include/exclude it, its
 * blurb, and an inline editor); the social-out card turns the same curated
 * set into one card per piece for posting elsewhere. Every curation edit is
 * an immutable rewrite of the `digest` array handed back through
 * `onSaveDigest`. "Send me a test" (CNT-6) fires a real one-off email to the
 * caller's own inbox; "Schedule with the issue" toggles
 * `digestSendOnPublish`, which the real ship action (`shipIssue`) reads to
 * decide whether to mail every confirmed subscriber the moment the issue
 * actually publishes — this module has no cron, so shipping IS the scheduled
 * moment. Once `digestSentAt` is set the toggle locks, since the send has
 * already happened. This tab holds no other server state of its own.
 */
export function DigestSocialTab({
  digest,
  pieces,
  digestSendOnPublish,
  digestSentAt,
  onSaveDigest,
  onToggleSendOnPublish,
  onSendTest,
  sendTestPending,
}: DigestSocialTabProps) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [editingPieceId, setEditingPieceId] = useState<string | null>(null);
  const [draftBlurb, setDraftBlurb] = useState("");

  async function handleSendTest() {
    try {
      await onSendTest();
      showToast(t("magazine:issue.digest.sendTestToast"), "success");
    } catch {
      showToast(t("magazine:issue.digest.sendTestError"), "error");
    }
  }

  function findPieceTitle(pieceId: string): string {
    return pieces.find((piece) => piece.id === pieceId)?.title ?? pieceId;
  }

  function toggleOn(pieceId: string) {
    onSaveDigest(
      digest.map((item) => (item.pieceId === pieceId ? { ...item, on: !item.on } : item)),
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
      digest.map((item) => (item.pieceId === pieceId ? { ...item, blurb: trimmedBlurb } : item)),
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
                aria-label={t("magazine:issue.digest.includeAria", { title: pieceTitle })}
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
                      aria-label={t("magazine:issue.digest.editBlurbAria", { title: pieceTitle })}
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
                  <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
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
            onClick={() => void handleSendTest()}
            disabled={sendTestPending}
            aria-busy={sendTestPending}
          >
            {t("magazine:issue.digest.sendTest")}
          </Button>
          <Button
            size="sm"
            variant={digestSendOnPublish ? "plum" : "ghost"}
            onClick={() => {
              const next = !digestSendOnPublish;
              onToggleSendOnPublish(next);
              showToast(
                t(
                  next
                    ? "magazine:issue.digest.scheduleToast"
                    : "magazine:issue.digest.scheduleOffToast",
                ),
                "success",
              );
            }}
            disabled={digestSentAt !== null}
          >
            {digestSendOnPublish
              ? t("magazine:issue.digest.scheduledWithIssue")
              : t("magazine:issue.digest.scheduleWithIssue")}
          </Button>
        </div>
        {digestSentAt && (
          <p className={styles.hint}>
            {t("magazine:issue.digest.alreadySent", { date: formatDate(digestSentAt) })}
          </p>
        )}
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:issue.digest.socialHeading")}</h3>
        <div className={styles.socialrow}>
          {digest.map((item) => {
            const pieceTitle = findPieceTitle(item.pieceId);
            return (
              <div key={item.pieceId} className={styles.socialcard}>
                <ImageSlot alt={pieceTitle} placeholder={pieceTitle} tint="plum" height={110} />
                <b>{pieceTitle}</b>
                <p>{item.blurb}</p>
              </div>
            );
          })}
        </div>
        <p className={styles.hint}>{t("magazine:issue.digest.socialAltHint")}</p>
      </div>
    </div>
  );
}
