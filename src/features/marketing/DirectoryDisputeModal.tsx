import { useState } from "react";
import {
  Button,
  FormField,
  ModalSheet,
  Sending,
  SuccessPanel,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDisputeListing } from "./api/useDisputeListing";
import styles from "./DirectoryDisputeModal.module.css";

const REASON_MAX_LENGTH = 2000;
// Light client-side gate mirroring the backend's `@IsEmail` on the optional
// field — a real check happens server-side; this just stops an obvious typo.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * "Report / dispute this listing" — a self-contained modal letting anyone
 * (including the named business) contest a directory listing: a "friendly"/
 * queer-tagged entry can be added via the suggest path WITHOUT the venue's
 * knowledge, so this is the way to say so. Files through `useDisputeListing`
 * (`POST /listings/:ref/dispute`, the shared moderation pipeline) — a free-text
 * reason plus an optional contact email for a disputer with no reason to be
 * reachable via their member account. Confirms with the plum success panel.
 */
export function DirectoryDisputeModal({
  listingRef,
  placeName,
  onClose,
}: {
  listingRef: string;
  placeName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const dispute = useDisputeListing(listingRef);
  const [reason, setReason] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [done, setDone] = useState(false);

  const trimmedReason = reason.trim();
  const trimmedEmail = contactEmail.trim();
  const emailInvalid = trimmedEmail.length > 0 && !EMAIL_PATTERN.test(trimmedEmail);
  const canSubmit =
    trimmedReason.length > 0 && !emailInvalid && !dispute.isPending;

  const submit = () => {
    if (!canSubmit) return;
    dispute.mutate(
      {
        reason: trimmedReason,
        contactEmail: trimmedEmail || undefined,
      },
      {
        onSuccess: () => setDone(true),
        onError: () =>
          showToast(
            t("marketing:directory.detail.dispute.errorToast"),
            "error",
          ),
      },
    );
  };

  if (done) {
    return (
      <ModalSheet
        onClose={onClose}
        success
        ariaLabel={t("marketing:directory.detail.dispute.successAriaLabel")}
      >
        <SuccessPanel
          title={t("marketing:directory.detail.dispute.successTitle")}
          em={t("marketing:directory.detail.dispute.successEm")}
          onClose={onClose}
          closeLabel={t("marketing:directory.detail.dispute.doneCta")}
        >
          {t("marketing:directory.detail.dispute.successBody", {
            name: placeName,
          })}
        </SuccessPanel>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("marketing:directory.detail.dispute.ariaLabel", {
        name: placeName,
      })}
    >
      <div className={styles.eyebrow}>
        {t("marketing:directory.detail.dispute.eyebrow")}
      </div>
      <h3 className={styles.title}>
        <Translation
          i18nKey="marketing:directory.detail.dispute.title"
          components={{ em: <em /> }}
          values={{ name: placeName }}
        />
      </h3>
      <p className={styles.sub}>{t("marketing:directory.detail.dispute.sub")}</p>

      <FormField
        label={t("marketing:directory.detail.dispute.reasonLabel")}
        required
        labelAside={
          <span className={styles.counter}>
            {reason.length}/{REASON_MAX_LENGTH}
          </span>
        }
      >
        <textarea
          rows={5}
          value={reason}
          maxLength={REASON_MAX_LENGTH}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t(
            "marketing:directory.detail.dispute.reasonPlaceholder",
          )}
        />
      </FormField>

      <FormField
        label={t("marketing:directory.detail.dispute.emailLabel")}
        helper={t("marketing:directory.detail.dispute.emailHelper")}
        error={
          emailInvalid
            ? t("marketing:directory.detail.dispute.emailError")
            : undefined
        }
      >
        <input
          type="email"
          value={contactEmail}
          onChange={(event) => setContactEmail(event.target.value)}
          placeholder={t("marketing:directory.detail.dispute.emailPlaceholder")}
        />
      </FormField>

      <p className={styles.note}>
        {t("marketing:directory.detail.dispute.note")}
      </p>

      <div className={styles.foot}>
        <Button variant="ghost" onClick={onClose}>
          {t("marketing:directory.detail.dispute.cancel")}
        </Button>
        <Button variant="primary" onClick={submit} disabled={!canSubmit}>
          {dispute.isPending ? (
            <Sending label={t("marketing:directory.detail.dispute.submitting")} />
          ) : (
            t("marketing:directory.detail.dispute.submit")
          )}
        </Button>
      </div>
    </ModalSheet>
  );
}
