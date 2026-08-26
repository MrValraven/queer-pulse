import { useId, useState } from "react";
import {
  Button,
  FormField,
  Modal,
  RadioCardGroup,
  SuccessPanel,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SAFE_SPACE_FLAG_REASON_OPTIONS } from "./safeSpaceFlag.data";
import { useFlagSafeSpace } from "./api/useSafeSpaceFlag";
import type { SafeSpaceFlagReason } from "./api/safeSpaceGovernance.api";
import styles from "./SafeSpaceFlagModal.module.css";

const DETAIL_MAX_LENGTH = 2000;

/**
 * Raise something about a badged safe space.
 *
 * Two promises this screen has to keep, both of them the reason a member will
 * use it at all. The venue is never told who raised it, and the confirmation
 * says exactly what happens next without inventing a step the software does
 * not take. QueerPulse sends no email, so the answer arrives in the app.
 */
export function SafeSpaceFlagModal({
  slug,
  spaceName,
  flagThreshold,
  onClose,
}: {
  slug: string;
  spaceName: string;
  /** The published "three flags open a review" number, from the badge state
   *  payload so the copy never hardcodes the promise a second time. */
  flagThreshold?: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const flag = useFlagSafeSpace();
  const [reasonCode, setReasonCode] = useState<SafeSpaceFlagReason | "">("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [wasAlreadyFlagged, setWasAlreadyFlagged] = useState(false);
  const reasonLabelId = useId();

  function submit() {
    if (!reasonCode) return;
    flag.mutate(
      { slug, reasonCode, detail: detail.trim() || undefined },
      {
        onSuccess: (result) => {
          setWasAlreadyFlagged(result.wasAlreadyFlagged);
          setIsDone(true);
        },
      },
    );
  }

  if (isDone) {
    return (
      <Modal title={t("safety:flag.done.title")} onClose={onClose}>
        <SuccessPanel
          title={
            wasAlreadyFlagged
              ? t("safety:flag.done.alreadyTitle")
              : t("safety:flag.done.panelTitle")
          }
          em={
            wasAlreadyFlagged
              ? t("safety:flag.done.alreadyEm")
              : t("safety:flag.done.panelEm")
          }
          onClose={onClose}
          closeLabel={t("safety:flag.done.closeCta")}
          steps={[
            t("safety:flag.done.step.read"),
            t("safety:flag.done.step.anonymous", { name: spaceName }),
            t("safety:flag.done.step.threshold", {
              count: flagThreshold ?? 3,
            }),
          ]}
        >
          {t("safety:flag.done.body")}
        </SuccessPanel>
      </Modal>
    );
  }

  return (
    <Modal
      title={t("safety:flag.modal.title", { name: spaceName })}
      sub={t("safety:flag.modal.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("safety:flag.modal.cancelCta")}
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            disabled={!reasonCode || flag.isPending}
          >
            {flag.isPending
              ? t("safety:flag.modal.sendingCta")
              : t("safety:flag.modal.sendCta")}
          </Button>
        </>
      }
    >
      <p className={styles.privacyNote}>{t("safety:flag.modal.privacy")}</p>

      <div className={styles.field}>
        <div className={styles.label} id={reasonLabelId}>
          {t("safety:flag.modal.reasonLabel")}
        </div>
        <RadioCardGroup
          value={reasonCode}
          onChange={setReasonCode}
          ariaLabel={t("safety:flag.modal.reasonLabel")}
          ariaLabelledBy={reasonLabelId}
          className={styles.reasonGrid}
          optionClassName={styles.reasonCard}
          checkedClassName={styles.reasonCardOn}
          options={SAFE_SPACE_FLAG_REASON_OPTIONS.map((option) => ({
            id: option.code,
            render: (
              <>
                <b className={styles.reasonTitle}>{t(option.labelKey)}</b>
                <span className={styles.reasonDesc}>
                  {t(option.descriptionKey)}
                </span>
              </>
            ),
          }))}
        />
      </div>

      <FormField
        label={t("safety:flag.modal.detailLabel")}
        helper={t("safety:flag.modal.detailHelper")}
      >
        <textarea
          className={styles.textarea}
          rows={4}
          maxLength={DETAIL_MAX_LENGTH}
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          placeholder={t("safety:flag.modal.detailPlaceholder")}
        />
      </FormField>

      {flag.isError && (
        <p className={styles.error} role="alert">
          {t("safety:flag.errorToast")}
        </p>
      )}
    </Modal>
  );
}
