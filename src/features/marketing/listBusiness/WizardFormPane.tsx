import { useRef } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  NEXT_LABEL_KEYS,
  TOTAL_STEPS,
  firstWizardStep,
  type ListingDraft,
} from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneActions, WizardChrome } from "./ListBusinessChrome";
import { StepBasics, StepPath, StepStory } from "./ListBusinessSteps";
import { StepPractical } from "./ListBusinessPracticalStep";
import { StepPhotosYou } from "./ListBusinessPhotosStep";
import { StepReview } from "./ListBusinessReviewStep";
import { ListBusinessPreview } from "./ListBusinessPreview";
import styles from "./ListBusinessPage.module.css";

/** The active "form" phase of the create wizard: step pills, current step pane
 *  (with its back/next footer), and the live preview column. */
export function WizardFormPane({
  form,
  step,
  savedAt,
  userName,
  userInitials,
  draft,
  goToStep,
  onBack,
  onNext,
  submitLabel,
  isJumpAheadEnabled,
  editRef,
  saveNowLabel,
  onSave,
  previewFootnote,
  isNeededBarFocusPending = false,
  onNeededBarFocused,
  duplicateCheckBaselineName,
}: {
  form: ListingForm;
  step: number;
  savedAt: number | null;
  userName: string;
  userInitials: string;
  draft: ListingDraft;
  goToStep: (n: number) => void;
  onBack: () => void;
  onNext: () => void;
  /** The final-step submit button's label, in place of the default "Send it
   *  to the team". Left out, every earlier step's label is unaffected. */
  submitLabel?: string;
  /** Lets a pill ahead of the current step jump too, once every step before
   *  it passes its gate. Left out, only visited pills jump. */
  isJumpAheadEnabled?: boolean;
  /** The ref of the listing being edited. Set, the Path step is gone (no
   *  pill, Back on Basics leaves) and the duplicate-name check skips this
   *  listing. Left out, the wizard is a new submission. */
  editRef?: string;
  /** Set, every step's footer gets a primary save button with this label,
   *  and the final step's button uses it when `submitLabel` is absent. */
  saveNowLabel?: string;
  /** Saves from any step, after checking every step's required fields. */
  onSave: () => void;
  /** Replaces the preview column's footnote. */
  previewFootnote?: string;
  /** Whether the current step's "a few things left" bar should take focus
   *  once it renders. Read only with save-now on, where a save can land the
   *  member on a step with gaps. */
  isNeededBarFocusPending?: boolean;
  /** Called once the bar has taken that focus. */
  onNeededBarFocused?: () => void;
  /** The name the edited listing loaded with. While the name field still
   *  holds it, the Basics duplicate hint stays quiet. Left out, it always
   *  checks. */
  duplicateCheckBaselineName?: string;
}) {
  const { t } = useTranslation();
  // The form column, so the preview can outline where the current field shows.
  const formColumnRef = useRef<HTMLDivElement>(null);
  const isEdit = editRef !== undefined;
  const firstStep = firstWizardStep(isEdit);
  const isFinalStep = step === TOTAL_STEPS - 1;
  const isSaveNowOn = saveNowLabel !== undefined;
  const finalLabel = submitLabel ?? saveNowLabel;
  const nextLabel =
    isFinalStep && finalLabel
      ? finalLabel
      : t(NEXT_LABEL_KEYS[step] ?? "marketing:listBusiness.next.continue");
  // The final save only checks the review step's own gate, so a forward jump
  // must never land past a step with missing required fields. An edit has no
  // Path step, so its gate starts at Basics.
  const canJumpTo = (index: number): boolean =>
    index < step ||
    (isJumpAheadEnabled === true &&
      [...Array(index).keys()]
        .slice(firstStep)
        .every((stepIndex) => form.canAdvance(stepIndex)));

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div ref={formColumnRef}>
          <WizardChrome
            step={step}
            savedAt={savedAt}
            onJump={goToStep}
            canJumpTo={canJumpTo}
            isEdit={isEdit}
          />
          {/* Keyed by step so the pane remounts on navigation, replaying
              the staggered entrance of each .stepBody child. */}
          <div key={step} className={styles.pane}>
            {step === 0 && <StepPath form={form} userName={userName} />}
            {step === 1 && (
              <StepBasics
                form={form}
                editRef={editRef}
                duplicateCheckBaselineName={duplicateCheckBaselineName}
              />
            )}
            {step === 2 && <StepStory form={form} />}
            {step === 3 && <StepPractical form={form} />}
            {step === 4 && <StepPhotosYou form={form} userName={userName} />}
            {step === 5 && (
              <StepReview
                form={form}
                userName={userName}
                userInitials={userInitials}
                onEdit={goToStep}
                isEdit={isEdit}
              />
            )}
            {/* With save-now on, the final step keeps its single button and
                that button runs the all-steps save. */}
            <PaneActions
              onBack={onBack}
              backLabel={
                step === firstStep
                  ? t("marketing:listBusiness.paneActions.cancel")
                  : undefined
              }
              onNext={isFinalStep && isSaveNowOn ? onSave : onNext}
              nextLabel={nextLabel}
              missing={form.missing[step] ?? []}
              saveLabel={isFinalStep ? undefined : saveNowLabel}
              onSave={onSave}
              shouldShowNextArrow={!(isFinalStep && isSaveNowOn)}
              neededBarFocus={
                isSaveNowOn
                  ? {
                      isPending: isNeededBarFocusPending,
                      onFocused: onNeededBarFocused,
                    }
                  : undefined
              }
            />
          </div>
        </div>

        <ListBusinessPreview
          draft={draft}
          userName={userName}
          photoPreviews={form.photoPreviews}
          formColumnRef={formColumnRef}
          onAddPhoto={() => goToStep(4)}
          footnote={previewFootnote}
        />
      </div>
    </div>
  );
}
