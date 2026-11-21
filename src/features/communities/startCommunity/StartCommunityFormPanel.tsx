import { FiArrowLeft } from "react-icons/fi";
import { FadeIn } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CreatorDraftConflictStrip } from "../../creatorDrafts/CreatorDraftConflictStrip";
import { CreatorDraftNotice } from "../../creatorDrafts/CreatorDraftNotice";
import { CreatorDraftSaveLine } from "../../creatorDrafts/CreatorDraftSaveLine";
import type { CommunityForm } from "./useCommunityForm";
import type { StartCommunityAutosave } from "./useStartCommunityDraft";
import { CONFIRM_STEP, PEOPLE_STEP } from "./useStartCommunityActions";
import {
  FoundingThread,
  PanelActions,
  ChapterHead,
} from "./StartCommunityChrome";
import { StartCommunityPreview } from "./StartCommunityPreview";
import { StepOpening } from "./StartCommunityOpening";
import { StepWhy, StepWho } from "./StartCommunityIdentity";
import { StepSafety } from "./StartCommunityAccess";
import { StepRunning } from "./StartCommunityRunning";
import { StepTone } from "./StartCommunityTone";
import { StepFeeling } from "./StartCommunityFeeling";
import { StepPeople } from "./StartCommunityPeople";
import { StepConfirm } from "./StartCommunityConfirm";
import styles from "./StartCommunityPage.module.css";

const NEXT_LABEL_KEYS = [
  "communities:start.next.begin",
  "communities:start.next.people",
  "communities:start.next.door",
  "communities:start.next.who",
  "communities:start.next.tone",
  "communities:start.next.feeling",
  "communities:start.next.first",
  "communities:start.next.review",
  "communities:start.next.open",
];

/** Which chapter panel is on screen. Split out of `StartCommunityFormPanel` so
 *  that component stays under the repo's 200-line limit. */
function StartCommunityChapter({
  step,
  form,
  isInviteStepAvailable,
  onEdit,
  handleError,
  onHandleChange,
}: {
  step: number;
  form: CommunityForm;
  isInviteStepAvailable: boolean;
  onEdit: (step: number) => void;
  handleError: string | null;
  onHandleChange: () => void;
}) {
  return (
    <>
      {step > 0 && <ChapterHead index={step} />}
      {step === 0 && (
        <>
          <ChapterHead index={0} />
          <StepOpening />
        </>
      )}
      {step === 1 && <StepWhy form={form} />}
      {step === 2 && <StepWho form={form} />}
      {step === 3 && <StepSafety form={form} />}
      {step === 4 && <StepRunning form={form} />}
      {step === 5 && <StepTone form={form} />}
      {step === 6 && <StepFeeling form={form} />}
      {step === PEOPLE_STEP && isInviteStepAvailable && (
        <StepPeople form={form} />
      )}
      {step === CONFIRM_STEP && (
        <StepConfirm
          form={form}
          onEdit={onEdit}
          handleError={handleError}
          onHandleChange={onHandleChange}
        />
      )}
    </>
  );
}

/** The wizard while it is still being filled in: the chapter rail, the current
 *  chapter, its back/next footer, and the sticky live preview. Split out of
 *  `StartCommunityPage` to keep both components under the 200-line limit. */
export function StartCommunityFormPanel({
  step,
  form,
  isInviteStepAvailable,
  isStepSkipped,
  goToStep,
  handleError,
  onHandleChange,
  onBack,
  onNext,
  draftStatus,
  conflict,
  isConflictBusy,
  onLoadNewer,
  onKeepThisVersion,
}: {
  step: number;
  form: CommunityForm;
  isInviteStepAvailable: boolean;
  isStepSkipped: (step: number) => boolean;
  goToStep: (step: number) => void;
  handleError: string | null;
  onHandleChange: () => void;
  onBack: () => void;
  onNext: () => void;
  draftStatus: StartCommunityAutosave["status"];
  conflict: StartCommunityAutosave["conflict"];
  isConflictBusy: boolean;
  onLoadNewer: () => void;
  onKeepThisVersion: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div>
          <CreatorDraftConflictStrip
            isOpen={conflict !== null}
            isBusy={isConflictBusy}
            isServerDraftGone={conflict?.revision === null}
            onLoadNewer={onLoadNewer}
            onKeepThisVersion={onKeepThisVersion}
          />
          <FoundingThread
            step={step}
            onJump={goToStep}
            hiddenStep={isInviteStepAvailable ? undefined : PEOPLE_STEP}
          />
          <FadeIn key={step}>
            <div>
              <StartCommunityChapter
                step={step}
                form={form}
                isInviteStepAvailable={isInviteStepAvailable}
                onEdit={goToStep}
                handleError={handleError}
                onHandleChange={onHandleChange}
              />
              <PanelActions
                onBack={onBack}
                backLabel={
                  step === 0 ? (
                    t("communities:start.cancel")
                  ) : (
                    <>
                      <FiArrowLeft aria-hidden /> {t("communities:start.back")}
                    </>
                  )
                }
                onNext={onNext}
                nextLabel={t(
                  NEXT_LABEL_KEYS[isStepSkipped(step + 1) ? step + 1 : step] ??
                    "communities:start.next.fallback",
                )}
                missing={form.missing[step] ?? []}
                flush={step === 0}
              />
            </div>
          </FadeIn>
          <div className={styles.draftStatus}>
            <CreatorDraftSaveLine status={draftStatus} />
            <CreatorDraftNotice messageKey="communities:creatorDraftNote.body" />
          </div>
        </div>

        <StartCommunityPreview
          draft={form.draft}
          avatarPreviewUrl={form.avatarPreviewUrl}
          coverPreviewUrl={form.coverPreviewUrl}
        />
      </div>
    </div>
  );
}
