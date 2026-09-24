import { useEffect, useId, useRef, useState } from "react";
import {
  LISTING_DELETE_STEPS,
  type ListingDeleteFlowVariant,
} from "./listingDeleteFlow.data";
import { isListingDeleteStepSatisfied } from "./listingDeleteFlow.logic";

/**
 * The step machine behind `ListingDeleteFlow`: which step is showing, what the
 * person has entered (kept across Back), whether the current step lets them go
 * on, and the awaited delete with its pending and failed states.
 */
export function useListingDeleteFlow({
  listingName,
  variant,
  onConfirmDelete,
}: {
  listingName: string;
  variant: ListingDeleteFlowVariant;
  onConfirmDelete: (reason: string | undefined) => Promise<void>;
}) {
  const steps = LISTING_DELETE_STEPS[variant];
  const [stepIndex, setStepIndex] = useState(0);
  const [acknowledgedIds, setAcknowledgedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [reason, setReason] = useState("");
  const [typedName, setTypedName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [hasDeleteFailed, setHasDeleteFailed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  // The "Step 2 of 4" line lives in Modal's eyebrow; each step heading points
  // at it with aria-describedby, so the count is read when focus lands there.
  const stepCountId = useId();
  const isMountedRef = useRef(true);
  // A second click can land before the disabled state renders; this keeps a
  // hard delete from ever being sent twice.
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Runs after Modal's own initial focus (child effects run first), so the
  // dialog opens on step 1's heading and every step change lands on the new one.
  useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex]);

  const currentStep = steps[stepIndex] ?? "losses";
  const isLastStep = stepIndex === steps.length - 1;
  const isCurrentStepSatisfied = isListingDeleteStepSatisfied(
    currentStep,
    variant,
    { acknowledgedIds, reason, typedName },
    listingName,
  );

  const toggleAcknowledgement = (
    acknowledgementId: string,
    isChecked: boolean,
  ) => {
    setAcknowledgedIds((previousIds) => {
      const nextIds = new Set(previousIds);
      if (isChecked) nextIds.add(acknowledgementId);
      else nextIds.delete(acknowledgementId);
      return nextIds;
    });
  };

  const goToNextStep = () => {
    if (!isCurrentStepSatisfied || isLastStep) return;
    setStepIndex((previousIndex) => previousIndex + 1);
  };

  const goToPreviousStep = () => {
    if (isPending) return;
    // Leaving the last step retires its failure alert, so coming back to it
    // does not mount and announce the old error again.
    setHasDeleteFailed(false);
    setStepIndex((previousIndex) => Math.max(0, previousIndex - 1));
  };

  const confirmDelete = async () => {
    if (isSubmittingRef.current || !isLastStep || !isCurrentStepSatisfied) {
      return;
    }
    isSubmittingRef.current = true;
    setIsPending(true);
    setHasDeleteFailed(false);
    try {
      await onConfirmDelete(
        variant === "moderator" ? reason.trim() : undefined,
      );
      // Success: the caller unmounts the flow. Staying pending until then
      // keeps Delete, Back and Cancel disabled for the last few frames.
    } catch {
      isSubmittingRef.current = false;
      if (!isMountedRef.current) return;
      setIsPending(false);
      setHasDeleteFailed(true);
      // Delete stays focusable while pending (it is only aria-disabled), so
      // this puts focus back on it if anything moved it in the meantime.
      deleteButtonRef.current?.focus();
    }
  };

  return {
    steps,
    stepIndex,
    currentStep,
    isLastStep,
    isCurrentStepSatisfied,
    headingRef,
    deleteButtonRef,
    stepCountId,
    acknowledgedIds,
    toggleAcknowledgement,
    reason,
    setReason,
    typedName,
    setTypedName,
    isPending,
    hasDeleteFailed,
    goToNextStep,
    goToPreviousStep,
    confirmDelete,
  };
}
