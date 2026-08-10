import { useState } from "react";
import { Avatar, Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { cx } from "../../../shared/lib/cx";
import { initialsFromName } from "../../../shared/lib/initials";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PieceRecordView } from "../data/pieceRecord.data";
import styles from "./pieceTabs.module.css";

export interface AfterTabProps {
  record: PieceRecordView;
  /** Fired from a letter's run-in-letters toggle, with the flag's next value
   *  (the opposite of what's currently set) — toggles the existing letter's
   *  `runInLetters` flag, it never creates a duplicate letter. "Send to
   *  author" has no backing messaging thread yet (Wave F), so it's a toast. */
  onToggleRunInLetters: (letterId: string, runInLetters: boolean) => void;
  onAddCorrection: (text: string) => void;
}

/**
 * The Brief/Care/Money/History/After record view — After tab. Reader letters
 * and published corrections ONLY — the design prototype's reads/finish-rate/
 * saves/shares metrics tile is deliberately dropped here (no-analytics rule).
 */
export function AfterTab({ record, onToggleRunInLetters, onAddCorrection }: AfterTabProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [correctionText, setCorrectionText] = useState("");

  function handlePublishCorrection() {
    const trimmedText = correctionText.trim();
    if (!trimmedText) return;
    onAddCorrection(trimmedText);
    setCorrectionText("");
  }

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <h3>{t("magazine:piece.after.lettersHeading")}</h3>
        {record.letters.length === 0 ? (
          <span className={styles.tiny}>{t("magazine:piece.after.noLettersYet")}</span>
        ) : (
          record.letters.map((letter) => (
            <div key={letter.id} className={styles.letter}>
              <div className={styles.letterHead}>
                <Avatar
                  initials={initialsFromName(letter.who, "?")}
                  tint="coral"
                  size={28}
                  name={letter.who}
                />
                <b>{letter.who}</b>
                <span className={cx(styles.tiny, styles.spacer)}>
                  {letter.createdAt}
                </span>
              </div>
              <p>{letter.body}</p>
              <div className={styles.row}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => showToast(t("magazine:piece.after.sendToAuthorToast"))}
                >
                  {t("magazine:piece.after.sendToAuthor")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleRunInLetters(letter.id, !letter.runInLetters)}
                >
                  {letter.runInLetters
                    ? t("magazine:piece.after.removeFromLetters")
                    : t("magazine:piece.after.runInLetters")}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:piece.after.correctionsHeading")}</h3>
        {record.corrections.length > 0 && (
          <div className={styles.stack}>
            {record.corrections.map((correction) => (
              <div key={correction.id} className={styles.letter}>
                <p>{correction.text}</p>
                <span className={styles.tiny}>
                  {correction.publishedOn
                    ? t("magazine:piece.after.correctionPublished", {
                        date: correction.publishedOn,
                      })
                    : t("magazine:piece.after.correctionFiled", {
                        date: correction.createdAt,
                      })}
                </span>
              </div>
            ))}
          </div>
        )}
        <span className={styles.tiny}>{t("magazine:piece.after.correctionsFooter")}</span>
        <div className={styles.field}>
          <textarea
            aria-label={t("magazine:piece.after.correctionAriaLabel")}
            placeholder={t("magazine:piece.after.correctionPlaceholder")}
            value={correctionText}
            onChange={(event) => setCorrectionText(event.target.value)}
          />
        </div>
        <div className={styles.row}>
          <Button size="sm" onClick={handlePublishCorrection}>
            {t("magazine:piece.after.publishCorrection")}
          </Button>
          <Button size="sm" variant="ghost">
            {t("magazine:piece.after.notifyPeopleNamed")}
          </Button>
        </div>
      </div>
    </div>
  );
}
