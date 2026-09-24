import { Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  LISTING_DELETE_STEP_HINT_KEYS,
  type ListingDeleteFlowVariant,
} from "./listingDeleteFlow.data";
import { ListingDeleteAcknowledgeStep } from "./ListingDeleteAcknowledgeStep";
import { ListingDeleteConfirmNameStep } from "./ListingDeleteConfirmNameStep";
import { ListingDeleteFlowFooter } from "./ListingDeleteFlowFooter";
import { ListingDeleteLossesStep } from "./ListingDeleteLossesStep";
import { ListingDeleteReasonStep } from "./ListingDeleteReasonStep";
import { useListingDeleteFlow } from "./useListingDeleteFlow";

export type { ListingDeleteFlowVariant } from "./listingDeleteFlow.data";

/** While a delete is in flight the dialog cannot be dismissed. */
function ignoreCloseWhilePending() {}

/**
 * The heavy, strictly sequential "delete this directory listing" confirmation
 * shared by the owner (listing editor, profile places grid) and moderators
 * (admin listings queue). Both backend deletes are hard deletes, so the flow
 * spells out what goes, asks for three acknowledgements, asks the moderator
 * for the reason the owner receives, and only then unlocks Delete behind the
 * exact listing name.
 *
 * Built on the shared `Modal`, which portals, traps focus and restores it on
 * close (the moderator opens this from inside a drawer). Mount it only while
 * open; the caller unmounts it after `onConfirmDelete` resolves. A rejection
 * keeps it open on the last step with an inline error so the person can retry.
 * Going Back keeps every tick, the reason and the typed name.
 */
export function ListingDeleteFlow({
  listingName,
  variant,
  onConfirmDelete,
  onClose,
  gentlerOptions,
}: {
  listingName: string;
  variant: ListingDeleteFlowVariant;
  /** Resolves when the server confirmed the delete; REJECTS on failure (the
   *  flow then stays open on the last step with an inline error). `reason` is
   *  the trimmed, non-empty moderator reason in the moderator variant and
   *  `undefined` in the owner variant. The CALLER closes/unmounts the flow
   *  after success (navigate, toast, etc). */
  onConfirmDelete: (reason: string | undefined) => Promise<void>;
  onClose: () => void;
  /** Owner variant only. Omit to hide the two gentler exits. The flow calls
   *  onClose() first, then the chosen callback. */
  gentlerOptions?: {
    onHideInstead: () => void;
    onMarkClosedInstead: () => void;
  };
}) {
  const { t } = useTranslation();
  const flow = useListingDeleteFlow({ listingName, variant, onConfirmDelete });
  const hintKey = LISTING_DELETE_STEP_HINT_KEYS[flow.currentStep];

  const gentlerExits =
    variant === "owner" && gentlerOptions
      ? {
          onHideInstead: () => {
            onClose();
            gentlerOptions.onHideInstead();
          },
          onMarkClosedInstead: () => {
            onClose();
            gentlerOptions.onMarkClosedInstead();
          },
        }
      : undefined;

  return (
    <Modal
      title={t("marketing:listBusiness.deleteFlow.title", {
        name: listingName.trim(),
      })}
      eyebrow={
        <span id={flow.stepCountId}>
          {t("marketing:listBusiness.deleteFlow.stepOf", {
            step: flow.stepIndex + 1,
            total: flow.steps.length,
          })}
        </span>
      }
      onClose={flow.isPending ? ignoreCloseWhilePending : onClose}
      footer={
        <ListingDeleteFlowFooter
          isFirstStep={flow.stepIndex === 0}
          isLastStep={flow.isLastStep}
          isStepSatisfied={flow.isCurrentStepSatisfied}
          isPending={flow.isPending}
          hint={hintKey ? t(hintKey) : undefined}
          deleteButtonRef={flow.deleteButtonRef}
          onCancel={onClose}
          onBack={flow.goToPreviousStep}
          onContinue={flow.goToNextStep}
          onDelete={() => void flow.confirmDelete()}
        />
      }
    >
      {flow.currentStep === "losses" && (
        <ListingDeleteLossesStep
          variant={variant}
          headingRef={flow.headingRef}
          stepCountId={flow.stepCountId}
          gentlerOptions={gentlerExits}
        />
      )}
      {flow.currentStep === "acknowledge" && (
        <ListingDeleteAcknowledgeStep
          variant={variant}
          headingRef={flow.headingRef}
          stepCountId={flow.stepCountId}
          acknowledgedIds={flow.acknowledgedIds}
          onToggle={flow.toggleAcknowledgement}
        />
      )}
      {flow.currentStep === "reason" && (
        <ListingDeleteReasonStep
          headingRef={flow.headingRef}
          stepCountId={flow.stepCountId}
          reason={flow.reason}
          onReasonChange={flow.setReason}
        />
      )}
      {flow.currentStep === "confirmName" && (
        <ListingDeleteConfirmNameStep
          headingRef={flow.headingRef}
          stepCountId={flow.stepCountId}
          listingName={listingName}
          typedName={flow.typedName}
          onTypedNameChange={flow.setTypedName}
          hasDeleteFailed={flow.hasDeleteFailed}
        />
      )}
    </Modal>
  );
}
