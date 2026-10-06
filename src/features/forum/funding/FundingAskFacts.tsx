import { useEffect, useRef } from "react";
import {
  FiCheckCircle,
  FiEdit2,
  FiExternalLink,
  FiRotateCcw,
} from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { Button } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Thread } from "../forum.data";
import {
  BENEFICIARY_LABEL_KEYS,
  LISBON_TIME_ZONE,
  PURPOSE_LABEL_KEYS,
} from "./funding.data";
import type { ForumFundingView, FundingEndReason } from "./funding.types";
import { formatEuros } from "./fundingFormat";
import { isFundingAuthor } from "./fundingPermissions";
import { FactRow } from "./FundingFactRow";
import { FundingAskEndControls } from "./FundingAskEndControls";
import { FundingSafetyStrip } from "./FundingSafetyStrip";
import { useAskSentBack } from "./useAskSentBack";
import { useEndFundingAsk } from "./useEndFundingAsk";
import styles from "./FundingFacts.module.css";

export interface FundingAskFactsProps {
  thread: Thread;
  funding: ForumFundingView;
  onEditDetails?: () => void;
}

export function FundingAskFacts({
  thread,
  funding,
  onEditDetails,
}: FundingAskFactsProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const end = useEndFundingAsk(thread.slug);
  const isSentBack = useAskSentBack(thread.slug, funding.askState);
  const isEnded = end.demoEndedReason !== null || funding.askState === "ended";
  const endedReason = end.demoEndedReason ?? funding.endedReason;
  const isActive = !isEnded && funding.askState === "active";
  const isAwaitingReview = !isEnded && funding.askState === "pending";
  const isAuthor = isFundingAuthor(thread, demoMode);
  const eyebrow = t("forum:funding.ask.heading");
  const endedNoteRef = useRef<HTMLParagraphElement>(null);
  const wasEndedRef = useRef(isEnded);

  // The end buttons unmount once the ask has ended, so focus moves to the
  // ended note instead of falling back to the page.
  useEffect(() => {
    if (isEnded && !wasEndedRef.current) endedNoteRef.current?.focus();
    wasEndedRef.current = isEnded;
  }, [isEnded]);

  const endAsk = (reason: FundingEndReason) =>
    end.endAsk(reason, {
      onSuccess: () =>
        showToast(
          t(
            reason === "goal_reached"
              ? "forum:funding.ask.goalToast"
              : "forum:funding.ask.closedToast",
          ),
          "success",
        ),
      onError: () => showToast(t("forum:funding.ask.endFailed"), "error"),
    });

  return (
    <section className={styles.panel} aria-label={eyebrow}>
      <p className={styles.eyebrow} aria-hidden="true">
        {eyebrow}
      </p>
      {isSentBack && isAuthor && (
        <p className={styles.notice} role="status">
          <FiRotateCcw aria-hidden />
          {t("forum:funding.ask.sentBack")}
        </p>
      )}
      <dl className={styles.facts}>
        {funding.goalAmount !== null && (
          <FactRow label={t("forum:funding.ask.goal")}>
            {formatEuros(fmt, funding.goalAmount)}
          </FactRow>
        )}
        {funding.askPurpose && (
          <FactRow label={t("forum:funding.ask.purpose")}>
            {t(PURPOSE_LABEL_KEYS[funding.askPurpose])}
          </FactRow>
        )}
        {funding.beneficiary && (
          <FactRow label={t("forum:funding.compose.beneficiary")}>
            {t(BENEFICIARY_LABEL_KEYS[funding.beneficiary])}
          </FactRow>
        )}
        {funding.endsAt && (
          <FactRow label={t("forum:funding.ask.endsOn")}>
            {fmt.date(new Date(funding.endsAt), {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: LISBON_TIME_ZONE,
            })}
          </FactRow>
        )}
      </dl>
      {/* Once it has ended there is nothing left to donate to. */}
      {!isEnded && (
        <FundingSafetyStrip
          host={funding.linkHost}
          approvedAt={funding.approvedAt}
        />
      )}
      {isEnded && (
        <p className={styles.ended} ref={endedNoteRef} tabIndex={-1}>
          <FiCheckCircle aria-hidden className={styles.endedIcon} />
          {t(
            endedReason === "goal_reached"
              ? "forum:funding.ask.endedGoal"
              : "forum:funding.ask.ended",
          )}
        </p>
      )}
      <div className={styles.actions}>
        {isActive && (
          <Button
            href={funding.linkUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            variant="primary"
            aria-label={t("forum:funding.ask.donateAria", {
              host: funding.linkHost,
            })}
          >
            {t("forum:funding.ask.donate", { host: funding.linkHost })}
            <FiExternalLink aria-hidden />
          </Button>
        )}
        {/* A moderator corrects details from here; the author does it from
            their own row below. */}
        {onEditDetails && !isEnded && !isAuthor && (
          <EditDetailsButton onClick={onEditDetails} />
        )}
      </div>
      {/* A waiting fundraiser can be closed too, so the one-at-a-time limit
          always has a way out. */}
      {(isActive || isAwaitingReview) && isAuthor && (
        <div className={styles.authorRow}>
          <p className={styles.authorLabel}>
            {t("forum:funding.ask.authorControls")}
          </p>
          <div className={styles.actions}>
            <FundingAskEndControls
              onEnd={endAsk}
              isPending={end.isPending}
              canMarkGoalReached={isActive}
            />
            {onEditDetails && <EditDetailsButton onClick={onEditDetails} />}
          </div>
        </div>
      )}
    </section>
  );
}

function EditDetailsButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <FiEdit2 aria-hidden />
      {t("forum:funding.facts.editDetails")}
    </Button>
  );
}
