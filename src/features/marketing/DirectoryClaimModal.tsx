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
import { useClaimListing } from "./api/useClaimListing";
import styles from "./DirectoryClaimModal.module.css";

const NOTE_MAX_LENGTH = 2000;

/**
 * "Claim this listing" — for a member who actually runs a business already
 * listed here (by someone else, or by no one). Files through
 * `useClaimListing` (`POST /listings/:ref/claim`) into the moderator review
 * queue; a human reviews and, on approval, reassigns ownership — there's no
 * automatic identity check, so the confirmation is honest about that ("sent
 * for review", never "you now own this").
 */
export function DirectoryClaimModal({
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
  const claim = useClaimListing(listingRef);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (claim.isPending) return;
    const trimmedNote = note.trim();
    claim.mutate(
      { note: trimmedNote || undefined },
      {
        onSuccess: () => setDone(true),
        onError: () =>
          showToast(t("marketing:directory.detail.claim.errorToast"), "error"),
      },
    );
  };

  if (done) {
    return (
      <ModalSheet
        onClose={onClose}
        success
        ariaLabel={t("marketing:directory.detail.claim.successAriaLabel")}
      >
        <SuccessPanel
          title={t("marketing:directory.detail.claim.successTitle")}
          em={t("marketing:directory.detail.claim.successEm")}
          onClose={onClose}
          closeLabel={t("marketing:directory.detail.claim.doneCta")}
        >
          {t("marketing:directory.detail.claim.successBody", {
            name: placeName,
          })}
        </SuccessPanel>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("marketing:directory.detail.claim.ariaLabel", {
        name: placeName,
      })}
    >
      <div className={styles.eyebrow}>
        {t("marketing:directory.detail.claim.eyebrow")}
      </div>
      <h3 className={styles.title}>
        <Translation
          i18nKey="marketing:directory.detail.claim.title"
          components={{ em: <em /> }}
          values={{ name: placeName }}
        />
      </h3>
      <p className={styles.sub}>{t("marketing:directory.detail.claim.sub")}</p>

      <FormField
        label={t("marketing:directory.detail.claim.noteLabel")}
        labelAside={
          <span className={styles.counter}>
            {note.length}/{NOTE_MAX_LENGTH}
          </span>
        }
      >
        <textarea
          rows={5}
          value={note}
          maxLength={NOTE_MAX_LENGTH}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("marketing:directory.detail.claim.notePlaceholder")}
        />
      </FormField>

      <p className={styles.note}>{t("marketing:directory.detail.claim.note")}</p>

      <div className={styles.foot}>
        <Button variant="ghost" onClick={onClose}>
          {t("marketing:directory.detail.claim.cancel")}
        </Button>
        <Button variant="primary" onClick={submit} disabled={claim.isPending}>
          {claim.isPending ? (
            <Sending label={t("marketing:directory.detail.claim.submitting")} />
          ) : (
            t("marketing:directory.detail.claim.submit")
          )}
        </Button>
      </div>
    </ModalSheet>
  );
}
