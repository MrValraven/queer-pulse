import { useId, type RefObject } from "react";
import { FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./ListingDeleteFlow.module.css";

/**
 * The flow's footer. Cancel on the first step, Back after it; Continue until
 * the last step, where the primary becomes the danger "Delete permanently".
 * While the primary is disabled, `hint` says why, in visible text the button
 * also references through `aria-describedby`.
 *
 * While the delete is in flight, Delete is `aria-disabled` and keeps its real
 * `disabled` off: a focused button that turns `disabled` drops focus to
 * <body>, and from there Tab can leave the dialog. The flow's submit guard
 * ignores the extra clicks.
 */
export function ListingDeleteFlowFooter({
  isFirstStep,
  isLastStep,
  isStepSatisfied,
  isPending,
  hint,
  deleteButtonRef,
  onCancel,
  onBack,
  onContinue,
  onDelete,
}: {
  isFirstStep: boolean;
  isLastStep: boolean;
  isStepSatisfied: boolean;
  isPending: boolean;
  /** Why the primary is disabled; omitted when nothing is missing. */
  hint?: string;
  /** Lets the flow return focus to Delete after a failed attempt. */
  deleteButtonRef: RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
  onBack: () => void;
  onContinue: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const shouldShowHint = Boolean(hint) && !isStepSatisfied;
  const describedBy = shouldShowHint ? hintId : undefined;

  return (
    <>
      {shouldShowHint && (
        <p id={hintId} className={styles.footHint}>
          {hint}
        </p>
      )}
      {isFirstStep ? (
        <Button variant="ghost" onClick={onCancel} disabled={isPending}>
          {t("marketing:listBusiness.deleteFlow.actions.cancel")}
        </Button>
      ) : (
        <Button variant="ghost" onClick={onBack} disabled={isPending}>
          <FiArrowLeft aria-hidden />
          {t("marketing:listBusiness.deleteFlow.actions.back")}
        </Button>
      )}
      {isLastStep ? (
        <Button
          ref={deleteButtonRef}
          variant="danger"
          className={styles.footPrimary}
          onClick={onDelete}
          disabled={!isPending && !isStepSatisfied}
          aria-disabled={isPending ? "true" : undefined}
          aria-describedby={describedBy}
        >
          <FiTrash2 aria-hidden />
          {isPending
            ? t("marketing:listBusiness.deleteFlow.actions.deleting")
            : t("marketing:listBusiness.deleteFlow.actions.delete")}
        </Button>
      ) : (
        <Button
          className={styles.footPrimary}
          onClick={onContinue}
          disabled={!isStepSatisfied}
          aria-describedby={describedBy}
        >
          {t("marketing:listBusiness.deleteFlow.actions.continue")}
        </Button>
      )}
    </>
  );
}
