import {
  Avatar,
  Badge,
  Button,
  type AvatarTint,
  type BadgeTone,
} from "../../../shared/components/ui";
import { initialsFromName } from "../../../shared/lib/initials";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PieceCareSubject } from "../api/pieces.api";
import styles from "./pieceTabs.module.css";

/** Avatar has no "violet" tint, so a pseudonym subject shares the "plum" tint
 *  used for its consent badge and the content-note tags. */
const CONSENT_AVATAR_TINT: Record<PieceCareSubject["consent"], AvatarTint> = {
  given: "jade",
  pending: "coral",
  pseudonym: "plum",
};

const CONSENT_BADGE_TONE: Record<PieceCareSubject["consent"], BadgeTone> = {
  given: "jade",
  pending: "coral",
  pseudonym: "plum",
};

export interface CareSubjectRowProps {
  subject: PieceCareSubject;
  onToast: (message: string) => void;
}

/** One row in the Care tab's "People in this piece" card — a person named,
 *  quoted, or described in the piece, and where their consent stands. */
export function CareSubjectRow({ subject, onToast }: CareSubjectRowProps) {
  const { t } = useTranslation();
  const consentLabel: Record<PieceCareSubject["consent"], string> = {
    given: t("magazine:piece.care.consentGiven"),
    pending: t("magazine:piece.care.consentPending"),
    pseudonym: t("magazine:piece.care.consentPseudonym"),
  };

  return (
    <div className={styles.subj}>
      <div className={styles.subjHead}>
        <Avatar
          initials={initialsFromName(subject.name)}
          tint={CONSENT_AVATAR_TINT[subject.consent]}
          size={32}
          name={subject.name}
        />
        <b>{subject.name}</b>
        <Badge tone={CONSENT_BADGE_TONE[subject.consent]}>
          {consentLabel[subject.consent]}
        </Badge>
        <span className={[styles.tiny, styles.spacer].join(" ")}>
          {t("magazine:piece.care.rightOfReply", { reply: subject.reply })}
        </span>
      </div>
      <p className={styles.tiny}>{subject.note}</p>
      <div className={styles.chips}>
        <span className={styles.chip} data-active={subject.named || undefined}>
          {t("magazine:piece.care.named")}
        </span>
        <span
          className={styles.chip}
          data-active={subject.out === true || undefined}
        >
          {t("magazine:piece.care.outPublicly")}
        </span>
        <span
          className={styles.chip}
          data-active={subject.reply === "sent" || undefined}
        >
          {t("magazine:piece.care.quotesReadBack")}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            onToast(
              t("magazine:piece.care.consentFormSentToast", {
                name: subject.name,
              }),
            )
          }
        >
          {t("magazine:piece.care.sendConsentForm")}
        </Button>
      </div>
    </div>
  );
}
