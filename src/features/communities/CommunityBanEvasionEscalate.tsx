import { useId, useState } from "react";
import { FiSend } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MAX_BAN_EVASION_ESCALATION_NOTE_LENGTH } from "./api/communityBanEvasion.api";
import styles from "./CommunityBanEvasionFlag.module.css";

/**
 * The note a moderator sends with an escalation, in place under the flag (the
 * same shape as the decline step next door, so a moderator never loses sight of
 * the applicant they are answering).
 *
 * The note is OPTIONAL and the copy says so. "Please check this one" is a
 * complete request, and making the cheap thing expensive would push a moderator
 * towards declining somebody instead of asking.
 *
 * The note is read by platform staff, so the hint says that plainly rather than
 * leaving a moderator to guess whether the applicant sees it. (They do not.)
 */
export function CommunityBanEvasionEscalate({
  isPending,
  onSend,
  onCancel,
}: {
  isPending: boolean;
  onSend: (note: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");
  const noteId = useId();
  const hintId = useId();

  return (
    <div className={styles.compose}>
      <label className={styles.composeLabel} htmlFor={noteId}>
        {t("communities:detail.modtools.joinRequests.banEvasion.note.label")}
      </label>
      <p className={styles.composeHint} id={hintId}>
        {t("communities:detail.modtools.joinRequests.banEvasion.note.hint")}
      </p>
      <textarea
        id={noteId}
        className={styles.noteField}
        rows={3}
        maxLength={MAX_BAN_EVASION_ESCALATION_NOTE_LENGTH}
        aria-describedby={hintId}
        placeholder={t(
          "communities:detail.modtools.joinRequests.banEvasion.note.placeholder",
        )}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className={styles.composeActions}>
        <Button
          variant="primary"
          size="sm"
          disabled={isPending}
          onClick={() => onSend(note)}
        >
          <FiSend aria-hidden />{" "}
          {isPending
            ? t("communities:common.loading")
            : t(
                "communities:detail.modtools.joinRequests.banEvasion.note.sendCta",
              )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={onCancel}
        >
          {t(
            "communities:detail.modtools.joinRequests.banEvasion.note.cancelCta",
          )}
        </Button>
      </div>
    </div>
  );
}
