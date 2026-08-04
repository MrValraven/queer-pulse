import { useTranslation } from "../../../shared/i18n/useTranslation";
import { NEXT_LABEL_KEYS, type ListingDraft } from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { PaneActions, WizardChrome } from "./ListBusinessChrome";
import { StepBasics, StepPath, StepStory } from "./ListBusinessSteps";
import { StepPractical } from "./ListBusinessPracticalStep";
import { StepPhotosYou } from "./ListBusinessPhotosStep";
import { StepReview } from "./ListBusinessReviewStep";
import { ListBusinessPreview } from "./ListBusinessPreview";
import styles from "./ListBusinessPage.module.css";

/** The active "form" phase of the wizard: step pills, current step pane
 *  (with its back/next footer), and the live preview column. */
export function WizardFormPane({
  mode,
  form,
  step,
  savedAt,
  userName,
  userInitials,
  draft,
  goToStep,
  onBack,
  onNext,
  uploadPhoto,
}: {
  mode: "create" | "edit";
  form: ListingForm;
  step: number;
  savedAt: number | null;
  userName: string;
  userInitials: string;
  draft: ListingDraft;
  goToStep: (n: number) => void;
  onBack: () => void;
  onNext: () => void;
  uploadPhoto: (file: File) => Promise<{ key: string; previewUrl: string }>;
}) {
  const { t } = useTranslation();
  const isEdit = mode === "edit";
  const nextLabel =
    step === 5 && isEdit
      ? t("marketing:listBusiness.edit.saveCta")
      : t(NEXT_LABEL_KEYS[step] ?? "marketing:listBusiness.next.continue");

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div>
          <WizardChrome
            step={step}
            savedAt={savedAt}
            isEdit={isEdit}
            onJump={goToStep}
          />
          {/* Keyed by step so the pane remounts on navigation, replaying
              the staggered entrance of each .stepBody child. */}
          <div key={step} className={styles.pane}>
            {/* StepPath (the type/path choice) is create-only — an edit
                seeds straight past it and never renders it again. */}
            {!isEdit && step === 0 && <StepPath form={form} userName={userName} />}
            {step === 1 && <StepBasics form={form} />}
            {step === 2 && <StepStory form={form} />}
            {step === 3 && <StepPractical form={form} />}
            {step === 4 && (
              <StepPhotosYou form={form} userName={userName} uploadPhoto={uploadPhoto} />
            )}
            {step === 5 && (
              <StepReview
                form={form}
                userName={userName}
                userInitials={userInitials}
                onEdit={goToStep}
              />
            )}
            <PaneActions
              onBack={onBack}
              hideBack={isEdit && step === 1}
              backLabel={
                step === 0
                  ? t("marketing:listBusiness.paneActions.cancel")
                  : undefined
              }
              onNext={onNext}
              nextLabel={nextLabel}
              nextArrow={!(step === 5 && isEdit)}
              missing={form.missing[step] ?? []}
            />
          </div>
        </div>

        <ListBusinessPreview
          draft={draft}
          userName={userName}
          photoPreviews={form.photoPreviews}
        />
      </div>
    </div>
  );
}
