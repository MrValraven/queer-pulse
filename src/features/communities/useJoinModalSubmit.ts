import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  joinOutcomeOf,
  joinRefusalFor,
  type JoinCommunityPayload,
  type JoinInvolvement,
  type JoinRefusalPanelKind,
} from "./api/communityJoin.api";
import type { CommunityRulesState } from "./api/useCommunityJoin";

/** What the applicant filled in on the wizard's last step. */
export interface JoinModalAnswers {
  aboutText: string;
  involvement: JoinInvolvement;
}

export interface UseJoinModalSubmitOptions {
  /** The wizard opens a request (gated tier, no invitation) in place of an
   *  instant join. */
  isRequest: boolean;
  /** How many form steps the wizard has; the done step is `total + 1`. */
  total: number;
  rulesState: CommunityRulesState;
  onJoined?: (payload: JoinCommunityPayload) => void | Promise<unknown>;
  onRequested?: (payload: JoinCommunityPayload) => void | Promise<unknown>;
  setStep: (step: number) => void;
  setIsAcknowledged: (isAcknowledged: boolean) => void;
  setIsRulesUpdated: (isRulesUpdated: boolean) => void;
  /** The step the rules live on, where a "rules changed" refusal returns. */
  rulesStep: number;
}

export interface JoinModalSubmit {
  submit: (answers: JoinModalAnswers) => Promise<void>;
  isSubmitting: boolean;
  /** The translated fallback line for a failure that carries no known code. */
  errorMessage: string | null;
  /** A coded answer that replaces the whole form with the refusal panel. */
  refusal: JoinRefusalPanelKind | null;
  /** The done step reads as a request. The server's answer decides it: a
   *  request-tier wizard answered `joined` (an invitation the server spent)
   *  reads as a welcome, and an instant join answered `requested` reads as a
   *  request. With no outcome to read (demo resolves `null`), the tier
   *  decides. */
  isDoneAsRequest: boolean;
  /** An instant join the server held for review (ENG-428, second vouch). The
   *  member pressed Join, so the done step says a moderator looks first. */
  isHeldForReview: boolean;
}

/**
 * `JoinModal`'s network half: builds the join payload, awaits the caller's
 * `onJoined`/`onRequested`, and sorts every answer into the one place the
 * wizard shows it.
 *
 * The welcome/request-received step belongs on the far side of the network
 * call: a paused community, an already-pending request or a lost connection
 * all fail here, and the applicant needs to see that in place of a "You're in"
 * for a membership they never got.
 *
 * Every failure renders from a catalog key (DES-407). A coded refusal gets its
 * panel; anything uncoded gets the translated fallback line. The server's own
 * message is English prose written for developers, so the wizard reads only
 * the code.
 */
export function useJoinModalSubmit({
  isRequest,
  total,
  rulesState,
  onJoined,
  onRequested,
  setStep,
  setIsAcknowledged,
  setIsRulesUpdated,
  rulesStep,
}: UseJoinModalSubmitOptions): JoinModalSubmit {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<JoinRefusalPanelKind | null>(null);
  const [resolvedOutcome, setResolvedOutcome] = useState<
    "joined" | "requested" | null
  >(null);

  const submit = async ({ aboutText, involvement }: JoinModalAnswers) => {
    if (isSubmitting) return;
    const trimmedNote = aboutText.trim();
    const payload: JoinCommunityPayload = {
      // The note is purely the applicant's own words. The involvement answer
      // travels in its own field, which is what the mod queue reads.
      ...(trimmedNote ? { note: trimmedNote.slice(0, 1000) } : {}),
      involvement,
      ...(rulesState.hasRules
        ? { acceptedRulesVersion: rulesState.rulesVersion }
        : {}),
    };
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await (isRequest
        ? onRequested?.(payload)
        : onJoined?.(payload));
      // PRD-141. The `invite` tier answers an uninvited caller with a
      // SUCCESSFUL 201 carrying `outcome: "invite_required"`, so this refusal
      // never reaches the `catch` below and `joinRefusalFor` can never see it.
      const outcome = joinOutcomeOf(result);
      if (outcome === "invite_required") {
        setRefusal({ kind: "inviteRequired" });
        return;
      }
      // The done step follows the server's answer. A request-tier wizard can
      // be answered `joined` (the server spent the caller's invitation), and
      // an open community can hold a join for review (ENG-428: a second
      // vouch, or a match with somebody this community banned) and answer
      // `requested`.
      setResolvedOutcome(outcome);
      setStep(total + 1);
    } catch (error) {
      const refused = joinRefusalFor(error);
      if (!refused) {
        setErrorMessage(t("communities:join.about.errorFallback"));
      } else if (refused.kind === "rulesChanged") {
        // The rules moved while this modal was open. Re-read them, drop the
        // stale acknowledgement, and put the applicant back on the step with
        // the new text: a generic error would leave them retrying a join that
        // can only fail again.
        rulesState.refetch();
        setIsAcknowledged(false);
        setIsRulesUpdated(true);
        setStep(rulesStep);
      } else {
        setRefusal(refused);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDoneAsRequest = resolvedOutcome
    ? resolvedOutcome === "requested"
    : isRequest;
  const isHeldForReview = !isRequest && resolvedOutcome === "requested";

  return {
    submit,
    isSubmitting,
    errorMessage,
    refusal,
    isDoneAsRequest,
    isHeldForReview,
  };
}
