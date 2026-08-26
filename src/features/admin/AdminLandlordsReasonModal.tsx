import { useState } from "react";
import { Button, type ButtonVariant } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import styles from "./AdminLandlordsPage.module.css";

/**
 * The four moments on this console where a member is owed words.
 *
 * Three of them require the reason: the backend refuses a hold-back, a removal
 * or a declined introduction without one, because each is an answer to work a
 * member did and the reason is the whole message they receive. Accepting an
 * introduction leaves it optional, where it becomes the "here is what happens
 * next" line instead.
 */
export type LandlordReasonKind =
  "holdBack" | "remove" | "introAccept" | "introDecline";

const REASON_REQUIRED: Record<LandlordReasonKind, boolean> = {
  holdBack: true,
  remove: true,
  introAccept: false,
  introDecline: true,
};

const CONFIRM_VARIANT: Record<LandlordReasonKind, ButtonVariant> = {
  holdBack: "ghost",
  remove: "danger",
  introAccept: "jade",
  introDecline: "danger",
};

/**
 * One dialog for every decision on this page that carries words back to a
 * member. The prompt names the person who reads it, so writing the reason
 * reads as the normal path rather than a form field in the way.
 */
export function AdminLandlordReasonModal({
  kind,
  subject,
  isPending,
  onSubmit,
  onClose,
}: {
  kind: LandlordReasonKind;
  /** What the decision is about: the entry's name, or the member's request. */
  subject: string;
  isPending: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();
  const isRequired = REASON_REQUIRED[kind];
  const isValid = isRequired ? trimmedReason.length >= 4 : true;

  return (
    <AdminModal
      eyebrow={t(`admin:landlords.reason.eyebrow.${kind}`)}
      title={t(`admin:landlords.reason.title.${kind}`)}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant={CONFIRM_VARIANT[kind]}
            size="md"
            disabled={!isValid || isPending}
            onClick={() => onSubmit(trimmedReason)}
          >
            {t(`admin:landlords.reason.confirm.${kind}`)}
          </Button>
        </>
      }
    >
      <p className={styles.reasonSubject}>{subject}</p>
      <label className={styles.reasonLabel} htmlFor="landlord-decision-reason">
        {t(
          isRequired
            ? "admin:landlords.reason.label"
            : "admin:landlords.reason.labelOptional",
        )}
      </label>
      <textarea
        id="landlord-decision-reason"
        className={styles.reasonInput}
        value={reason}
        maxLength={1000}
        rows={5}
        onChange={(event) => setReason(event.target.value)}
        placeholder={t(`admin:landlords.reason.placeholder.${kind}`)}
        aria-describedby="landlord-decision-reason-hint"
      />
      <p id="landlord-decision-reason-hint" className={styles.reasonHint}>
        {t("admin:landlords.reason.hint")}
      </p>
    </AdminModal>
  );
}
