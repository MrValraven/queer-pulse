import { useId, type Ref } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GIVING_LIMITS } from "../communities/giving/givingConstants";
import { STUDIO_ERROR_MESSAGE_KEY } from "./studioErrors.data";
import styles from "./StudioGettingPaid.module.css";

/** The empty line and the last-way warning under the rows. The warning
 *  already says the list is empty, so the empty line folds while it shows. */
export function PaymentMethodsNotices({
  isEmpty,
  isLastWayWarned,
  personaName,
}: {
  isEmpty: boolean;
  isLastWayWarned: boolean;
  personaName: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <Collapse isOpen={isEmpty && !isLastWayWarned}>
        <p className={styles.note}>{t("studio:paymentMethods.empty")}</p>
      </Collapse>
      <Collapse isOpen={isLastWayWarned}>
        <p className={styles.warning}>
          {t("studio:paymentMethods.lastMethodWarning", { name: personaName })}
        </p>
      </Collapse>
    </>
  );
}

/** Add, which stays focusable at the cap and says why it waits. */
export function PaymentMethodsAddArea({
  addButtonRef,
  isAtCap,
  isSaving,
  onAdd,
}: {
  addButtonRef: Ref<HTMLButtonElement>;
  isAtCap: boolean;
  isSaving: boolean;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const limitNoteId = useId();
  return (
    <div className={styles.addArea}>
      <Button
        ref={addButtonRef}
        variant="ghost"
        size="sm"
        className={styles.addButton}
        aria-disabled={isAtCap || isSaving || undefined}
        aria-describedby={isAtCap ? limitNoteId : undefined}
        onClick={() => {
          if (!isAtCap && !isSaving) onAdd();
        }}
      >
        <FiPlus aria-hidden />
        {t("studio:paymentMethods.addCta")}
      </Button>
      <Collapse isOpen={isAtCap}>
        <p id={limitNoteId} className={styles.note}>
          {t(STUDIO_ERROR_MESSAGE_KEY.studio_payment_methods_limit, {
            max: GIVING_LIMITS.maxMethods,
          })}
        </p>
      </Collapse>
    </div>
  );
}

/** Save, then the status line and the alert line under it. */
export function PaymentMethodsSaveArea({
  isDisabled,
  isSavedShown,
  failureLine,
  isFailureShown,
  personaName,
}: {
  isDisabled: boolean;
  isSavedShown: boolean;
  failureLine: string | undefined;
  isFailureShown: boolean;
  personaName: string;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.footer}>
        <Button
          type="submit"
          variant="primary"
          className={styles.saveButton}
          aria-disabled={isDisabled || undefined}
        >
          {t("studio:paymentMethods.saveCta")}
        </Button>
      </div>
      <div role="status">
        <Collapse isOpen={isSavedShown}>
          <p className={styles.status}>
            {t("studio:paymentMethods.saved", { name: personaName })}
          </p>
        </Collapse>
      </div>
      <Collapse isOpen={isFailureShown}>
        <p className={styles.alert} role="alert">
          {failureLine}
        </p>
      </Collapse>
    </>
  );
}
