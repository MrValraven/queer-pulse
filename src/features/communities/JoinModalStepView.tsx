import type { JoinInvolvement, JoinRefusal } from "./api/communityJoin.api";
import type { JoinModalCommunity } from "./JoinModal";
import { JoinStepAbout, JoinStepDone, JoinStepIntro } from "./JoinModalSteps";
import { JoinRulesStep } from "./JoinRulesStep";
import { JoinRefusalPanel } from "./JoinRefusalPanel";

/**
 * `JoinModal`'s step content: the refusal panel when the wizard was answered
 * with a coded refusal, else whichever of the four steps
 * (intro / rules / about / done) the caller says is active. Split out of
 * `JoinModal` purely to keep that component under the repo's 200-line limit;
 * every "is this the active step" decision stays in `JoinModal` (`step`,
 * `hasRules`, `RULES_STEP`, `aboutStep`, `done`), passed in here already
 * resolved to booleans so this component carries no wizard logic of its own.
 */
export function JoinModalStepView({
  refusalPanel,
  onClose,
  isIntroStep,
  isRulesStep,
  isAboutStep,
  isDone,
  community,
  isRequest,
  isInvite,
  isInvited,
  onIntroNext,
  rules,
  isRulesUpdated,
  isAcknowledged,
  setIsAcknowledged,
  onRulesContinue,
  parentName,
  involvement,
  setInvolvement,
  aboutText,
  setAboutText,
  isSubmitting,
  errorMessage,
  onAboutSubmit,
}: {
  /** Already narrowed by `JoinModal` to exclude `"rulesChanged"` (that kind is
   *  handled inline there, by resending the applicant to the rules step,
   *  so it never reaches this panel): the same narrowing
   *  `JoinRefusalPanel`'s own prop type requires, restated here as a plain
   *  typed prop. */
  refusalPanel: Extract<
    JoinRefusal,
    { kind: "banned" | "reapplyTooSoon" | "inviteRequired" }
  > | null;
  onClose: () => void;
  isIntroStep: boolean;
  isRulesStep: boolean;
  isAboutStep: boolean;
  isDone: boolean;
  community: JoinModalCommunity;
  isRequest: boolean;
  isInvite: boolean;
  isInvited: boolean;
  onIntroNext: () => void;
  rules: string[];
  isRulesUpdated: boolean;
  isAcknowledged: boolean;
  setIsAcknowledged: (isAcknowledged: boolean) => void;
  onRulesContinue: () => void;
  /** Set when `community` is a space (subcommunity): the parent's name,
   *  forwarded straight through to `JoinRulesStep`. */
  parentName?: string;
  involvement: JoinInvolvement;
  setInvolvement: (involvement: JoinInvolvement) => void;
  aboutText: string;
  setAboutText: (aboutText: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onAboutSubmit: () => void;
}) {
  if (refusalPanel) {
    return <JoinRefusalPanel refusal={refusalPanel} onClose={onClose} />;
  }
  return (
    <>
      {isIntroStep && (
        <JoinStepIntro
          community={community}
          isRequest={isRequest}
          isInvite={isInvite}
          isInvited={isInvited}
          onNext={onIntroNext}
        />
      )}

      {isRulesStep && (
        <JoinRulesStep
          name={community.name}
          rules={rules}
          isUpdated={isRulesUpdated}
          isAcknowledged={isAcknowledged}
          setIsAcknowledged={setIsAcknowledged}
          onContinue={onRulesContinue}
          parentName={parentName}
        />
      )}

      {isAboutStep && (
        <JoinStepAbout
          isRequest={isRequest}
          involvement={involvement}
          setInvolvement={setInvolvement}
          aboutText={aboutText}
          setAboutText={setAboutText}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onSubmit={onAboutSubmit}
        />
      )}

      {isDone && (
        <JoinStepDone
          community={community}
          isRequest={isRequest}
          onClose={onClose}
        />
      )}
    </>
  );
}
