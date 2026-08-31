import { useId, useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityBanRatificationDTO } from "./api/communityBanRatifications.api";
import type { CommunityBanRatifyDecision } from "./ModToolsBanRatificationRow";
import styles from "./ModToolsBanRatifications.module.css";

/** The longest note the server accepts on a decision. */
const NOTE_MAX_LENGTH = 2000;

/**
 * The last step before a second signature makes a community bar permanent, or
 * refuses to (PRD-25).
 *
 * Both paths restate what actually happens, because the two are asymmetric and
 * neither is obvious. Signing removes the end date: the member cannot come
 * back, and lifting the bar later becomes a separate decision. Declining
 * changes nothing about what the member is serving right now, which is the
 * fact a moderator most often expects to be wrong: they are already out, and
 * they stay out until the bar's own end date.
 *
 * The note is optional on both, deliberately. Refusing to keep somebody out
 * for good must never be the harder of the two paths.
 */
export function ModToolsBanRatificationDialog({
  hold,
  decision,
  fallbackDays,
  isPending,
  onClose,
  onConfirm,
}: {
  hold: CommunityBanRatificationDTO;
  decision: CommunityBanRatifyDecision;
  /** What the bar settles at when it is not made permanent, served by the API
   *  so this dialog hard-codes no term. */
  fallbackDays: number;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");
  const noteId = useId();
  const isRatifying = decision === "ratify";
  const memberName = hold.memberName;

  return (
    <Modal
      title={t(
        isRatifying
          ? "communities:detail.modtools.ratifications.confirm.ratifyTitle"
          : "communities:detail.modtools.ratifications.confirm.declineTitle",
        { name: memberName },
      )}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {t("communities:detail.modtools.ratifications.confirm.cancel")}
          </Button>
          <Button
            variant={isRatifying ? "danger" : "primary"}
            disabled={isPending}
            onClick={() => onConfirm(note.trim())}
          >
            {t(
              isRatifying
                ? "communities:detail.modtools.ratifications.ratifyCta"
                : "communities:detail.modtools.ratifications.declineCta",
            )}
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <p className={styles.serving}>
          {t(
            isRatifying
              ? "communities:detail.modtools.ratifications.confirm.ratifyBody"
              : "communities:detail.modtools.ratifications.confirm.declineBody",
            { name: memberName, days: fallbackDays },
          )}
        </p>

        {/* The proposer's own words, quoted in full: this is the case being
            agreed with or refused, and a paraphrase would put our words in
            their mouth. */}
        <blockquote className={styles.quote}>
          {hold.note ?? t("communities:detail.modtools.ratifications.noNote")}
        </blockquote>

        <label className={styles.formLabel} htmlFor={noteId}>
          {t("communities:detail.modtools.ratifications.confirm.noteLabel")}
        </label>
        <textarea
          id={noteId}
          className={styles.textarea}
          value={note}
          maxLength={NOTE_MAX_LENGTH}
          disabled={isPending}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t(
            isRatifying
              ? "communities:detail.modtools.ratifications.confirm.ratifyNotePlaceholder"
              : "communities:detail.modtools.ratifications.confirm.declineNotePlaceholder",
          )}
        />
        <p className={styles.note}>
          {t("communities:detail.modtools.ratifications.confirm.noteHint")}
        </p>
      </div>
    </Modal>
  );
}
