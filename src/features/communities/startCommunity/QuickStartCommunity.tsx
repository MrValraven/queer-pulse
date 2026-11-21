import { FadeIn } from "../../../shared/components/ui";
import { CreatorDraftConflictStrip } from "../../creatorDrafts/CreatorDraftConflictStrip";
import { CreatorDraftNotice } from "../../creatorDrafts/CreatorDraftNotice";
import { CreatorDraftSaveLine } from "../../creatorDrafts/CreatorDraftSaveLine";
import type { QuickStep } from "./quickStartCommunity.model";
import type { CommunityForm } from "./useCommunityForm";
import type { StartCommunityAutosave } from "./useStartCommunityDraft";
import { QuickStartFooter, QuickStartHeader } from "./QuickStartChrome";
import { QuickStepName, QuickStepWho } from "./QuickStartBasics";
import { QuickStepOpen } from "./QuickStartOpen";
import pageStyles from "./StartCommunityPage.module.css";
import styles from "./QuickStartCommunity.module.css";

export interface QuickStartCommunityProps {
  quickStep: QuickStep;
  form: CommunityForm;
  /** `quickMissingByStep(form.draft)[quickStep]`, as catalog keys. */
  missing: string[];
  handleError: string | null;
  onHandleChange: () => void;
  onBack: () => void;
  onNext: () => void;
  draftStatus: StartCommunityAutosave["status"];
  conflict: StartCommunityAutosave["conflict"];
  isConflictBusy: boolean;
  onLoadNewer: () => void;
  onKeepThisVersion: () => void;
}

/** The phone's three-step way to open a community, on the same form and draft as the wizard. */
export function QuickStartCommunity({
  quickStep,
  form,
  missing,
  handleError,
  onHandleChange,
  onBack,
  onNext,
  draftStatus,
  conflict,
  isConflictBusy,
  onLoadNewer,
  onKeepThisVersion,
}: QuickStartCommunityProps) {
  return (
    <div className={styles.quick}>
      <CreatorDraftConflictStrip
        isOpen={conflict !== null}
        isBusy={isConflictBusy}
        isServerDraftGone={conflict?.revision === null}
        onLoadNewer={onLoadNewer}
        onKeepThisVersion={onKeepThisVersion}
      />
      <QuickStartHeader quickStep={quickStep} />
      <FadeIn key={quickStep} className={styles.stepBody}>
        {quickStep === 1 && <QuickStepName form={form} />}
        {quickStep === 2 && <QuickStepWho form={form} />}
        {quickStep === 3 && (
          <QuickStepOpen
            form={form}
            handleError={handleError}
            onHandleChange={onHandleChange}
          />
        )}
      </FadeIn>
      <div className={[pageStyles.draftStatus, styles.draftStatus].join(" ")}>
        <CreatorDraftSaveLine status={draftStatus} />
        <CreatorDraftNotice messageKey="communities:creatorDraftNote.body" />
      </div>
      <QuickStartFooter
        quickStep={quickStep}
        missing={missing}
        onBack={onBack}
        onNext={onNext}
      />
    </div>
  );
}
