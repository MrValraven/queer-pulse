import { useEffect, useRef, useState } from "react";
import { ModalSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AccessTier } from "./membership.types";
import type {
  JoinCommunityPayload,
  JoinInvolvement,
} from "./api/communityJoin.api";
import { useCommunityRules } from "./api/useCommunityJoin";
import { JoinModalStepView } from "./JoinModalStepView";
import { useJoinModalSubmit } from "./useJoinModalSubmit";
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
  isInvited = false,
  parentName,
  parentSlug,
  onClose,
  onJoined,
  onRequested,
}: {
  community: JoinModalCommunity;
  tier?: AccessTier;
  /** PRD-140: the viewer holds a standing invitation to this community, so the
   *  gated tiers admit them straight to the roster with no request to
   *  review. The wizard words itself as joining, because that is what
   *  happens. */
  isInvited?: boolean;
  /** Set when `community` is a space (subcommunity): the parent's name,
   *  passed through to `JoinRulesStep` so the rules step can note that the
   *  applicant already agreed to the parent's rules. */
  parentName?: string;
  /** The parent's slug when `community` is a space, so "join the parent
   *  first" can link straight to the parent. Left out on the parent's own
   *  page, where that refusal says to join right here and closes back onto
   *  the page. */
  parentSlug?: string;
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
  const rulesState = useCommunityRules(community.slug);

  // The gated tiers open a request an owner/mod reviews. The one exception is
  // an invitation holder (PRD-140): `POST /join` spends their invitation and
  // puts them on the roster in the same call, whatever the tier, so the wizard
  // must not promise them a review that will never happen. `isInvite` stays
  // separate purely so the intro step can name the invite context in its
  // eyebrow/hint copy.
  const isRequest =
    !isInvited &&
    (tier === "request" || tier === "private" || tier === "invite");
  const isInvite = tier === "invite";

  // The rules step only exists for a community that HAS rules, so a space with
  // no covenant keeps the two-step wizard it always had.
  const hasRules = rulesState.hasRules;
  const RULES_STEP = 2;
  const aboutStep = hasRules ? 3 : 2;
  const total = hasRules ? 3 : 2;
  const done = step > total;
  const fill = done ? 100 : (step / total) * 100;
  const isIntroStep = step === 1;
  const isRulesStep = hasRules && step === RULES_STEP;
  const isAboutStep = step === aboutStep;

  const {
    submit,
    isSubmitting,
    errorMessage,
    refusal,
    isDoneAsRequest,
    isHeldForReview,
  } = useJoinModalSubmit({
    isRequest,
    total,
    rulesState,
    onJoined,
    onRequested,
    setStep,
    setIsAcknowledged,
    setIsRulesUpdated,
    rulesStep: RULES_STEP,
  });
  // `refusal` is a `JoinRefusalPanelKind`: `rulesChanged` is recovered in
  // place by the hook and never parked in state, so any refusal here replaces
  // the whole form with its panel.

  // The button a member pressed unmounts with its step, so focus moves to the
  // heading of whatever replaced it: a focused heading is announced, which
  // covers a refusal panel as well as a step. The view the sheet opened on
  // keeps the sheet's own initial focus, which is why the first view is
  // remembered and skipped (a StrictMode re-run sees the same view).
  const headingRef = useRef<HTMLHeadingElement>(null);
  const viewKey = refusal ? `refusal:${refusal.kind}` : `step:${step}`;
  const shownViewKeyRef = useRef(viewKey);
  useEffect(() => {
    if (shownViewKeyRef.current === viewKey) return;
    shownViewKeyRef.current = viewKey;
    headingRef.current?.focus();
  }, [viewKey]);

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("communities:join.ariaLabel", { name: community.name })}
    >
      {!done && !refusal && (
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

      <JoinModalStepView
        headingRef={headingRef}
        refusalPanel={refusal}
        onClose={onClose}
        isIntroStep={isIntroStep}
        isRulesStep={isRulesStep}
        isAboutStep={isAboutStep}
        isDone={done}
        isDoneAsRequest={isDoneAsRequest}
        isHeldForReview={isHeldForReview}
        community={community}
        isRequest={isRequest}
        isInvite={isInvite}
        isInvited={isInvited}
        onIntroNext={() => setStep(2)}
        rules={rulesState.rules}
        isRulesUpdated={isRulesUpdated}
        isAcknowledged={isAcknowledged}
        setIsAcknowledged={setIsAcknowledged}
        onRulesContinue={() => setStep(aboutStep)}
        parentName={parentName}
        parentSlug={parentSlug}
        involvement={involvement}
        setInvolvement={setInvolvement}
        aboutText={aboutText}
        setAboutText={setAboutText}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onAboutSubmit={() => void submit({ aboutText, involvement })}
      />
    </ModalSheet>
  );
}
