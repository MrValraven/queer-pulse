import type { RefObject } from "react";
import type {
  JoinInvolvement,
  JoinRefusalPanelKind,
} from "./api/communityJoin.api";
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
  headingRef,
  refusalPanel,
  onClose,
  isIntroStep,
  isRulesStep,
  isAboutStep,
  isDone,
  isDoneAsRequest,
  isHeldForReview,
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
  parentSlug,
  involvement,
  setInvolvement,
  aboutText,
  setAboutText,
  isSubmitting,
  errorMessage,
  onAboutSubmit,
}: {
  /** Handed to whichever heading is on screen, so `JoinModal` can move focus
   *  to it when the step or the refusal changes. */
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** Every refusal but `"rulesChanged"` (that kind is handled inline by
   *  `useJoinModalSubmit`, which sends the applicant back to the rules step,
   *  so it never reaches this panel). */
  refusalPanel: JoinRefusalPanelKind | null;
  onClose: () => void;
  isIntroStep: boolean;
  isRulesStep: boolean;
  isAboutStep: boolean;
  isDone: boolean;
  /** The done step reads as a request: a gated tier, or an instant join the
   *  server held for review (ENG-428). */
  isDoneAsRequest: boolean;
  /** An instant join the server held for review: the done step says a
   *  moderator looks first. */
  isHeldForReview: boolean;
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
   *  forwarded to `JoinRulesStep` and to the refusal panel (a parent pause, or
   *  "join the parent first"). */
  parentName?: string;
  /** The parent's slug, so "join the parent first" links to it. */
  parentSlug?: string;
  involvement: JoinInvolvement;
  setInvolvement: (involvement: JoinInvolvement) => void;
  aboutText: string;
  setAboutText: (aboutText: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onAboutSubmit: () => void;
}) {
  if (refusalPanel) {
    return (
      <JoinRefusalPanel
        headingRef={headingRef}
        refusal={refusalPanel}
        slug={community.slug}
        communityName={community.name}
        parentName={parentName}
        parentSlug={parentSlug}
        onClose={onClose}
      />
    );
  }
  return (
    <>
      {isIntroStep && (
        <JoinStepIntro
          headingRef={headingRef}
          community={community}
          isRequest={isRequest}
          isInvite={isInvite}
          isInvited={isInvited}
          onNext={onIntroNext}
        />
      )}

      {isRulesStep && (
        <JoinRulesStep
          headingRef={headingRef}
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
          headingRef={headingRef}
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
          headingRef={headingRef}
          community={community}
          isRequest={isDoneAsRequest}
          isHeldForReview={isHeldForReview}
          onClose={onClose}
        />
      )}
    </>
  );
}
