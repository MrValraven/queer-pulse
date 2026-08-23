import { useState } from "react";
import { ModalSheet } from "../../shared/components/ui";
import { reasonFor } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccessTier } from "./membership.types";
import {
  joinRefusalFor,
  type JoinCommunityPayload,
  type JoinInvolvement,
  type JoinRefusal,
} from "./api/communityJoin.api";
import { useCommunityRules } from "./api/useCommunityJoin";
import { JoinStepAbout, JoinStepDone, JoinStepIntro } from "./JoinModalSteps";
import { JoinRulesStep } from "./JoinRulesStep";
import { JoinRefusalPanel } from "./JoinRefusalPanel";
import styles from "./JoinModal.module.css";

export interface JoinModalCommunity {
  name: string;
  typeLabel: string;
  count: string;
  description: string;
  tags?: string[];
  /** Needed to read the community's house rules and their current version.
   *  Optional only because a card view-model can lack one; a community without
   *  a slug simply shows no rules step (and could not be joined either). */
  slug?: string;
}

export function JoinModal({
  community,
  tier = "public",
  onClose,
  onJoined,
  onRequested,
}: {
  community: JoinModalCommunity;
  tier?: AccessTier;
  onClose: () => void;
  /** Instant (public-tier) join. May return a promise: the modal waits for it
   *  and only shows the welcome step once it resolves. */
  onJoined?: (payload: JoinCommunityPayload) => void | Promise<unknown>;
  /** Request-to-join for the gated tiers, same promise contract as `onJoined`. */
  onRequested?: (payload: JoinCommunityPayload) => void | Promise<unknown>;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [involvement, setInvolvement] = useState<JoinInvolvement>("active");
  const [aboutText, setAboutText] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isRulesUpdated, setIsRulesUpdated] = useState(false);
  const [refusal, setRefusal] = useState<JoinRefusal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const rulesState = useCommunityRules(community.slug);

  // `invite` gets the same pending-request treatment as `request`/`private`:
  // the backend has no invite-code concept, so an invite-tier join is just a
  // request an owner/mod reviews (see `communities.service.ts#join`). `isInvite`
  // stays separate purely so the intro step can name the invite context in its
  // eyebrow/hint copy.
  const isRequest =
    tier === "request" || tier === "private" || tier === "invite";
  const isInvite = tier === "invite";

  // The rules step only exists for a community that HAS rules, so a space with
  // no covenant keeps the two-step wizard it always had.
  const hasRules = rulesState.hasRules;
  const RULES_STEP = 2;
  const aboutStep = hasRules ? 3 : 2;
  const total = hasRules ? 3 : 2;
  const done = step > total;
  const fill = done ? 100 : (step / total) * 100;
  // `rulesChanged` is recovered in place (below) and never parked in state, so
  // anything left here is one of the two refusals that replace the whole form.
  const refusalPanel =
    refusal && refusal.kind !== "rulesChanged" ? refusal : null;

  // The welcome/request-received step belongs on the far side of the network
  // call: a frozen space, an already-pending request or a lost connection all
  // fail here, and the applicant needs to see that rather than a "You're in"
  // for a membership they never got. The form stays put with the reason on it.
  const submit = async () => {
    if (isSubmitting) return;
    const trimmedNote = aboutText.trim();
    const payload: JoinCommunityPayload = {
      // The note is now purely the applicant's own words. The involvement
      // answer travels in its own field, which is what the mod queue reads.
      ...(trimmedNote ? { note: trimmedNote.slice(0, 1000) } : {}),
      involvement,
      ...(hasRules ? { acceptedRulesVersion: rulesState.rulesVersion } : {}),
    };
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await (isRequest ? onRequested?.(payload) : onJoined?.(payload));
      setStep(total + 1);
    } catch (error) {
      const refused = joinRefusalFor(error);
      if (refused?.kind === "rulesChanged") {
        // The rules moved while this modal was open. Re-read them, drop the
        // stale acknowledgement, and put the applicant back on the step with
        // the new text: a generic error toast would leave them retrying a
        // join that can only fail again.
        rulesState.refetch();
        setIsAcknowledged(false);
        setIsRulesUpdated(true);
        setStep(RULES_STEP);
      } else if (refused) {
        setRefusal(refused);
      } else {
        setErrorMessage(
          reasonFor(error) ?? t("communities:join.about.errorFallback"),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("communities:join.ariaLabel", { name: community.name })}
    >
      {!done && !refusalPanel && (
        <div className={styles.progress}>
          <div className={styles.bar}>
            <div
              className={styles.fill}
              style={{ transform: `scaleX(${fill / 100})` }}
            />
          </div>
          <div className={styles.progressLabel}>
            {t("communities:join.progress", { step, total })}
          </div>
        </div>
      )}

      {refusalPanel ? (
        <JoinRefusalPanel refusal={refusalPanel} onClose={onClose} />
      ) : (
        <>
          {step === 1 && (
            <JoinStepIntro
              community={community}
              isRequest={isRequest}
              isInvite={isInvite}
              onNext={() => setStep(2)}
            />
          )}

          {hasRules && step === RULES_STEP && (
            <JoinRulesStep
              name={community.name}
              rules={rulesState.rules}
              isUpdated={isRulesUpdated}
              isAcknowledged={isAcknowledged}
              setIsAcknowledged={setIsAcknowledged}
              onContinue={() => setStep(aboutStep)}
            />
          )}

          {step === aboutStep && (
            <JoinStepAbout
              isRequest={isRequest}
              involvement={involvement}
              setInvolvement={setInvolvement}
              aboutText={aboutText}
              setAboutText={setAboutText}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
              onSubmit={() => void submit()}
            />
          )}

          {done && (
            <JoinStepDone
              community={community}
              isRequest={isRequest}
              onClose={onClose}
            />
          )}
        </>
      )}
    </ModalSheet>
  );
}
