import { AnimatePresence } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioMyClaimView } from "./api/studioSafety.adapters";
import type { StudioClaimStatus } from "./api/studioSafety.types";
import { useWithdrawStudioClaim } from "./api/useStudioClaims";
import { StudioClaimStatusChip } from "./StudioClaimStatusChip";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { StudioMyClaimReplyForm } from "./StudioMyClaimReplyForm";
import { StudioSafetyHelpLinks } from "./StudioSafetyHelpLinks";
import css from "./StudioClaimPages.module.css";

const DATE_FORMAT = {
  day: "numeric",
  month: "short",
  year: "numeric",
} as const;

/** Decisions that went against the claim: the claimant's way on is their
 *  rights and our team. */
const CLOSED_WITHOUT_CLAIMANT: ReadonlySet<StudioClaimStatus> = new Set([
  "declined",
  "rejected",
]);

/** The outcome line's key. A counter-notice reads differently once the
 *  claimant has used their one reply. */
function outcomeKeyOf(claim: StudioMyClaimView): string {
  if (claim.status === "countered" && claim.claimantReply !== null)
    return "studio:claims.mine.outcome.counteredReplied";
  return `studio:claims.mine.outcome.${claim.status}`;
}

function Quote({ labelKey, text }: { labelKey: string; text: string | null }) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={text !== null}>
      <p className={css.label}>{t(labelKey)}</p>
      <blockquote className={css.quote}>{text}</blockquote>
    </Collapse>
  );
}

/** One of the member's claims: the track, the status, what they sent, the
 *  artist's counter-notice, their reply, our team's note, Reply (once) and
 *  Withdraw claim. A notice's `?claim=` link focuses its card. */
export function StudioMyClaimCard({
  claim,
  isFocused,
}: {
  claim: StudioMyClaimView;
  isFocused: boolean;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const withdraw = useWithdrawStudioClaim();
  const [isConfirming, setIsConfirming] = useState(false);
  const dateOf = (iso: string) => format.date(new Date(iso), DATE_FORMAT);
  useEffect(() => {
    if (!isFocused) return;
    headingRef.current?.scrollIntoView({ block: "center" });
    headingRef.current?.focus({ preventScroll: true });
  }, [isFocused]);

  function confirmWithdraw() {
    if (withdraw.isPending) return;
    withdraw.mutate(
      { claim },
      {
        onSuccess: () => {
          setIsConfirming(false);
          showToast(t("studio:claims.mine.withdrawnToast"), "success");
        },
        onError: (error) => {
          setIsConfirming(false);
          showToast(t(studioErrorMessageKeyOf(error)), "error");
        },
      },
    );
  }

  return (
    <article className={css.card} aria-labelledby={headingId}>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={css.cardTitle}
      >
        {/* The release: a track page answers 410 while a claim holds it. */}
        {claim.track.releaseHref === null ? (
          claim.track.title
        ) : (
          <Link to={claim.track.releaseHref}>{claim.track.title}</Link>
        )}
      </h2>
      <p className={css.who}>
        {claim.track.releaseTitle === null
          ? claim.track.artistName
          : `${claim.track.artistName} · ${claim.track.releaseTitle}`}
      </p>
      <div className={css.statusLine}>
        <StudioClaimStatusChip status={claim.status} viewpoint="claimant" />
        <span className={css.meta}>
          {t("studio:claims.mine.filedOn", {
            date: dateOf(claim.createdAt),
          })}
        </span>
        {claim.decidedAt ? (
          <span className={css.meta}>
            {t("studio:claims.mine.decidedOn", {
              date: dateOf(claim.decidedAt),
            })}
          </span>
        ) : null}
      </div>
      {/* What the status means for the claimant, and what happens next. */}
      <p className={css.outcome}>{t(outcomeKeyOf(claim))}</p>
      <Quote
        labelKey="studio:claims.form.originalWork.label"
        text={claim.originalWork}
      />
      <Quote labelKey="studio:claims.form.details.label" text={claim.details} />
      <Quote
        labelKey="studio:claims.mine.counterHeading"
        text={claim.counterNote}
      />
      <Quote
        labelKey="studio:claims.mine.yourReplyHeading"
        text={claim.claimantReply}
      />
      <Quote
        labelKey="studio:claims.mine.staffNoteHeading"
        text={claim.staffNote}
      />
      <Collapse isOpen={CLOSED_WITHOUT_CLAIMANT.has(claim.status)}>
        <StudioSafetyHelpLinks />
      </Collapse>
      <StudioMyClaimReplyForm claim={claim} />
      <Collapse isOpen={claim.canWithdraw}>
        <div className={css.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsConfirming(true)}
          >
            {t("studio:claims.mine.withdrawCta")}
          </Button>
        </div>
      </Collapse>
      <AnimatePresence>
        {isConfirming && (
          <ConfirmDialog
            open
            onClose={() => {
              if (!withdraw.isPending) setIsConfirming(false);
            }}
            onConfirm={confirmWithdraw}
            loading={withdraw.isPending}
            tone="destructive"
            title={t("studio:claims.mine.withdrawConfirm")}
            description={t("studio:claims.mine.withdrawBody")}
            confirmLabel={t("studio:claims.mine.withdrawCta")}
          />
        )}
      </AnimatePresence>
    </article>
  );
}
