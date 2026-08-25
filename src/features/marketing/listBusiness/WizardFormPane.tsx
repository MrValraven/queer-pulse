import type { CropRect } from "../../../shared/components/ui/cropGeometry";
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
  uploadPhoto,
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
  uploadPhoto: (
    file: File,
    options?: { crop?: CropRect },
  ) => Promise<{ key: string; previewUrl: string }>;
}) {
  const { t } = useTranslation();
  const nextLabel = t(
    NEXT_LABEL_KEYS[step] ?? "marketing:listBusiness.next.continue",
  );

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div>
          <WizardChrome step={step} savedAt={savedAt} onJump={goToStep} />
          {/* Keyed by step so the pane remounts on navigation, replaying
              the staggered entrance of each .stepBody child. */}
          <div key={step} className={styles.pane}>
            {step === 0 && <StepPath form={form} userName={userName} />}
            {step === 1 && <StepBasics form={form} />}
            {step === 2 && <StepStory form={form} />}
            {step === 3 && <StepPractical form={form} />}
            {step === 4 && (
              <StepPhotosYou
                form={form}
                userName={userName}
                uploadPhoto={uploadPhoto}
              />
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
              backLabel={
                step === 0
                  ? t("marketing:listBusiness.paneActions.cancel")
                  : undefined
              }
              onNext={onNext}
              nextLabel={nextLabel}
              missing={form.missing[step] ?? []}
            />
          </div>
        </div>

        <ListBusinessPreview
          draft={draft}
          userName={userName}
          photoPreviews={form.photoPreviews}
          onAddPhoto={() => goToStep(4)}
        />
      </div>
    </div>
  );
}
