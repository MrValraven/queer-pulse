import { AnimatePresence } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioMyClaimView } from "./api/studioSafety.adapters";
import { useWithdrawStudioClaim } from "./api/useStudioClaims";
import { StudioClaimStatusChip } from "./StudioClaimStatusChip";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { StudioMyClaimReplyForm } from "./StudioMyClaimReplyForm";
import css from "./StudioClaimPages.module.css";

const DATE_FORMAT = {
  day: "numeric",
  month: "short",
  year: "numeric",
} as const;

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
            date: format.date(new Date(claim.createdAt), DATE_FORMAT),
          })}
        </span>
      </div>
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
