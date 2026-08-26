import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useBanFromEvent } from "./api/useEventBans";
import styles from "./GatheringModals.module.css";

/** Server ceiling on the organiser's private note. */
const MAX_REASON_LENGTH = 500;

/**
 * Bar one member from one gathering (LOC-08).
 *
 * Scoped to this evening and nothing else: it is one host saying "not at my
 * table", and it says nothing about either person anywhere else on the
 * platform. Blocking somebody outright is a separate, mutual thing the member
 * owns, and this modal says so rather than quietly conflating the two.
 *
 * The note is the organisers' own record. It is never sent to the person it is
 * about, and the modal states that plainly, because a host needs to be able to
 * write down what happened without it becoming a message.
 */
export function BarFromGatheringModal({
  slug,
  memberSlug,
  memberName,
  onClose,
}: {
  slug: string;
  memberSlug: string;
  memberName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const banFromEvent = useBanFromEvent(slug);
  const [reason, setReason] = useState("");

  const bar = () => {
    if (banFromEvent.isPending) return;
    banFromEvent.mutate(
      { memberSlug, reason },
      {
        onSuccess: () => {
          showToast(
            t("gatherings:manage.bans.barredToast", { name: memberName }),
            "info",
          );
          onClose();
        },
        onError: () =>
          showToast(t("gatherings:manage.bans.errorToast"), "error"),
      },
    );
  };

  return (
    <Modal
      eyebrow={t("gatherings:manage.bans.eyebrow")}
      title={t("gatherings:manage.bans.title", { name: memberName })}
      sub={t("gatherings:manage.bans.sub")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="primary"
            onClick={bar}
            disabled={banFromEvent.isPending}
          >
            {banFromEvent.isPending
              ? t("gatherings:manage.bans.barringCta")
              : t("gatherings:manage.bans.barCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        <p className={styles.note}>{t("gatherings:manage.bans.explainer")}</p>
        <FormField
          label={t("gatherings:manage.bans.reasonLabel")}
          helper={t("gatherings:manage.bans.reasonHelper")}
        >
          <textarea
            value={reason}
            rows={3}
            maxLength={MAX_REASON_LENGTH}
            placeholder={t("gatherings:manage.bans.reasonPlaceholder")}
            onChange={(event) => setReason(event.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  );
}
