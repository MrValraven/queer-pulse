import { useState, type ReactNode, type RefObject } from "react";
import type { IconType } from "react-icons";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { StepUpVerificationModal } from "../../economy/StepUpVerificationModal";
import { gatheringPath } from "../../gatherings/data";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import { useFormat } from "../../../shared/i18n/format";
import {
  useDeclineGoTogetherPair,
  useRevealDemoGoTogetherGroup,
} from "../api/useGoTogetherMutations";
import type { GoTogetherCardDTO } from "../api/goTogether.types";
import { GoTogetherOptInFlow } from "./GoTogetherOptInPanel";
import {
  GO_TOGETHER_CARD_ANCHOR,
  NO_LENS,
  QUIET_STATE_COPY,
  cardErrorKey,
  hasReceivedPairInvite,
  REVEAL_DAY_FORMAT,
  STATE_ICONS,
  type QuietCardState,
} from "./goTogetherCard.data";
import { useFocusCardHeading, useFormOpener } from "./goTogetherCardFocus";
import {
  useLeaveMatching,
  type LeaveMatchingControls,
} from "./useLeaveMatching";
import styles from "./GoTogetherCard.module.css";

/** Icon, title and one line of copy: the top of every panel. A panel with
 *  no icon of its own leans on the card heading's. */
export function PanelHeader({
  icon: Icon,
  title,
  body,
}: {
  icon?: IconType;
  title: ReactNode;
  body?: ReactNode;
}) {
  return (
    <div className={styles.panelHeader}>
      {Icon && (
        <span className={styles.panelIcon}>
          <Icon aria-hidden />
        </span>
      )}
      <div className={styles.panelText}>
        <p className={styles.panelTitle}>{title}</p>
        {body && <p className={styles.panelBody}>{body}</p>}
      </div>
    </div>
  );
}

/** A title and a line of copy with nothing to press. */
export function QuietPanel({ state }: { state: QuietCardState }) {
  const { t } = useTranslation();
  const copy = QUIET_STATE_COPY[state];
  return (
    <PanelHeader
      icon={copy.icon}
      title={t(copy.titleKey)}
      body={t(copy.bodyKey)}
    />
  );
}

/**
 * The questionnaire comes first. The link carries a `return` param so the
 * questionnaire can bring the member back to this card on the gathering.
 */
export function QuestionnaireNeededPanel({
  slug,
  needsRefresh,
}: {
  slug: string;
  needsRefresh: boolean;
}) {
  const { t } = useTranslation();
  const returnPath = `${gatheringPath(slug)}#${GO_TOGETHER_CARD_ANCHOR}`;
  const questionnairePath = `${routes.goTogetherQuestionnaire}?return=${encodeURIComponent(returnPath)}`;
  return (
    <>
      <PanelHeader
        icon={STATE_ICONS.questionnaireNeeded}
        title={t("goTogether:card.title")}
        body={t(
          needsRefresh
            ? "goTogether:card.questionnaire.refreshBody"
            : "goTogether:card.questionnaire.body",
        )}
      />
      <div className={styles.actions}>
        <Button variant="primary" to={questionnairePath}>
          {t(
            needsRefresh
              ? "goTogether:card.questionnaire.refreshCta"
              : "goTogether:card.questionnaire.cta",
          )}
        </Button>
      </div>
    </>
  );
}

/** Not verified yet: open the verification request right here. On success
 *  the card refetches and moves on by itself. */
export function NotVerifiedPanel({ onVerified }: { onVerified: () => void }) {
  const { t } = useTranslation();
  const [isVerifying, setIsVerifying] = useState(false);
  return (
    <>
      <PanelHeader
        icon={STATE_ICONS.notVerified}
        title={t("goTogether:card.ineligible.verifyTitle")}
        body={t("goTogether:card.ineligible.verifyBody")}
      />
      <div className={styles.actions}>
        <Button variant="primary" onClick={() => setIsVerifying(true)}>
          {t("goTogether:card.ineligible.verifyCta")}
        </Button>
      </div>
      {isVerifying && (
        <StepUpVerificationModal
          requiredLevel="phone"
          onVerified={() => {
            setIsVerifying(false);
            onVerified();
          }}
          onClose={() => setIsVerifying(false)}
        />
      )}
    </>
  );
}

/** A failed write's copy, announced as it appears. */
export function ErrorLine({ errorKey }: { errorKey: string | null }) {
  const { t } = useTranslation();
  if (!errorKey) return null;
  return (
    <p className={styles.error} role="alert">
      {t(errorKey)}
    </p>
  );
}

/** Stop looking for a group, beside whatever else the panel offers. */
export function LeaveMatchingButton({
  leaveMatching,
}: {
  leaveMatching: LeaveMatchingControls;
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      onClick={leaveMatching.leave}
      disabled={leaveMatching.isPending}
    >
      {t("goTogether:card.waiting.leave")}
    </Button>
  );
}

/** A friend asked to go together. Accepting opens the host questions and the
 *  lens step for the invitee; declining clears the invite. A member already
 *  waiting for a group also gets Stop looking beside the choice. */
export function PairInvitePanel({
  card,
  slug,
  leaveMatching,
}: {
  card: GoTogetherCardDTO;
  slug: string;
  leaveMatching?: LeaveMatchingControls;
}) {
  const { t } = useTranslation();
  const {
    isOpen: isAccepting,
    openerRef: acceptButtonRef,
    open: openAcceptForm,
    close: closeAcceptForm,
  } = useFormOpener();
  const focusCardHeading = useFocusCardHeading();
  const name = card.pair?.partner.firstName ?? "";
  return (
    <>
      <PanelHeader
        icon={STATE_ICONS.pairInvite}
        title={t("goTogether:card.pairInvite.title", { name })}
        body={t("goTogether:card.pairInvite.body")}
      />
      {isAccepting ? (
        <GoTogetherOptInFlow
          slug={slug}
          variant="acceptPair"
          hostQuestions={card.hostQuestions}
          shouldFocusOnOpen
          confirmLabel={t("goTogether:card.pairInvite.confirm", { name })}
          onCancel={closeAcceptForm}
          onDone={focusCardHeading}
        />
      ) : (
        <PairInviteChoice
          slug={slug}
          acceptButtonRef={acceptButtonRef}
          onAccept={openAcceptForm}
          leaveMatching={leaveMatching}
        />
      )}
    </>
  );
}

/** Accept or Decline. A successful decline swaps the panel, so focus moves
 *  to the card heading. */
function PairInviteChoice({
  slug,
  acceptButtonRef,
  onAccept,
  leaveMatching,
}: {
  slug: string;
  acceptButtonRef: RefObject<HTMLButtonElement | null>;
  onAccept: () => void;
  leaveMatching?: LeaveMatchingControls;
}) {
  const { t } = useTranslation();
  const decline = useDeclineGoTogetherPair(slug);
  const focusCardHeading = useFocusCardHeading();
  return (
    <>
      <ErrorLine
        errorKey={
          cardErrorKey(decline.error) ?? leaveMatching?.errorKey ?? null
        }
      />
      <div className={styles.actions}>
        <Button variant="primary" ref={acceptButtonRef} onClick={onAccept}>
          {t("goTogether:card.pairInvite.accept")}
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            decline.mutate(undefined, { onSuccess: focusCardHeading })
          }
          disabled={decline.isPending}
        >
          {t("goTogether:card.pairInvite.decline")}
        </Button>
        {leaveMatching && <LeaveMatchingButton leaveMatching={leaveMatching} />}
      </div>
    </>
  );
}

/** "Your group lands {day} at {time}", from the cutoff. A cutoff already
 *  past when the panel opened (a late opt-in waits for the next matching
 *  pass) reads "soon". */
function useRevealLine(cutoffAt: string | null): string {
  const { t } = useTranslation();
  const format = useFormat();
  const [openedAtMs] = useState(() => Date.now());
  if (!cutoffAt || Date.parse(cutoffAt) <= openedAtMs)
    return t("goTogether:card.waiting.titleSoon");
  const cutoff = new Date(cutoffAt);
  return t("goTogether:card.waiting.title", {
    day: format.date(cutoff, REVEAL_DAY_FORMAT),
    time: format.time(cutoff),
  });
}

/** The pair line under the reveal time, or nothing when going solo. The
 *  pending line is for the member who sent the invite; an invite they
 *  received shows its own Accept and Decline panel instead. */
function usePairLine(card: GoTogetherCardDTO): string | undefined {
  const { t } = useTranslation();
  if (!card.pair) return undefined;
  const name = card.pair.partner.firstName;
  if (card.pair.status === "accepted")
    return t("goTogether:card.waiting.pairAccepted", { name });
  return card.pair.direction === "sent"
    ? t("goTogether:card.waiting.pairPending", { name })
    : undefined;
}

/** A waiting member reopens the opt-in, starting from their current mode,
 *  friend and lens. Host answers are not on the card, so they answer again. */
function ChangeHowIGoFlow({
  card,
  slug,
  onClose,
}: {
  card: GoTogetherCardDTO;
  slug: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <GoTogetherOptInFlow
      slug={slug}
      variant="optIn"
      hostQuestions={card.hostQuestions}
      initialValues={{
        mode: card.pair ? "pair" : "solo",
        partnerSlug: card.pair?.partner.slug ?? null,
        lens: card.lens ?? NO_LENS,
      }}
      shouldFocusOnOpen
      shouldShowModeTitle
      confirmLabel={t("goTogether:card.waiting.saveChange")}
      onCancel={onClose}
      onDone={onClose}
    />
  );
}

/** Waiting for the cutoff. A pair invite that arrived while waiting takes
 *  over the panel, so the invitee can answer it. */
export function WaitingPanel({
  card,
  slug,
}: {
  card: GoTogetherCardDTO;
  slug: string;
}) {
  return hasReceivedPairInvite(card) ? (
    <WaitingPairInvitePanel card={card} slug={slug} />
  ) : (
    <WaitingForGroupPanel card={card} slug={slug} />
  );
}

/** The pair invite for a member who is already waiting, with Stop looking
 *  kept beside Accept and Decline. */
function WaitingPairInvitePanel({
  card,
  slug,
}: {
  card: GoTogetherCardDTO;
  slug: string;
}) {
  const leaveMatching = useLeaveMatching(slug);
  return (
    <PairInvitePanel card={card} slug={slug} leaveMatching={leaveMatching} />
  );
}

/** Change how you go, or stop looking. Demo mode adds a button that forms
 *  the demo group straight away. */
function WaitingForGroupPanel({
  card,
  slug,
}: {
  card: GoTogetherCardDTO;
  slug: string;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const leaveMatching = useLeaveMatching(slug);
  const {
    isOpen: isChanging,
    openerRef: changeButtonRef,
    open: openChangeForm,
    close: closeChangeForm,
  } = useFormOpener();
  const revealLine = useRevealLine(card.cutoffAt);
  const body = usePairLine(card) ?? t("goTogether:card.waiting.body");

  if (isChanging) {
    return (
      <ChangeHowIGoFlow card={card} slug={slug} onClose={closeChangeForm} />
    );
  }
  return (
    <>
      <PanelHeader icon={STATE_ICONS.waiting} title={revealLine} body={body} />
      <ErrorLine errorKey={leaveMatching.errorKey} />
      <div className={styles.actions}>
        <Button variant="ghost" ref={changeButtonRef} onClick={openChangeForm}>
          {t("goTogether:card.waiting.change")}
        </Button>
        <LeaveMatchingButton leaveMatching={leaveMatching} />
        {demoMode && <DemoRevealButton slug={slug} />}
      </div>
    </>
  );
}

/** Not enough people yet. Matching still runs until the final late-group
 *  pass, so the member can still leave it. Once that pass has run the card
 *  reads `closed`, and this panel's promise goes with it. */
export function UnmatchedPanel({ slug }: { slug: string }) {
  const leaveMatching = useLeaveMatching(slug);
  return (
    <>
      <QuietPanel state="unmatched" />
      <ErrorLine errorKey={leaveMatching.errorKey} />
      <div className={styles.actions}>
        <LeaveMatchingButton leaveMatching={leaveMatching} />
      </div>
    </>
  );
}

/** Demo only: form the demo group now, ahead of the cutoff. */
function DemoRevealButton({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const reveal = useRevealDemoGoTogetherGroup(slug);
  const focusCardHeading = useFocusCardHeading();
  return (
    <Button
      variant="ghost"
      onClick={() => reveal.mutate(undefined, { onSuccess: focusCardHeading })}
      disabled={reveal.isPending}
    >
      {t("goTogether:card.waiting.demoReveal")}
    </Button>
  );
}
