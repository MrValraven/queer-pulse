import { AnimatePresence } from "motion/react";
import { useId, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioAdminClaimView } from "./api/studioSafety.adapters";
import type { StudioClaimDecision } from "./api/studioSafety.api";
import { STUDIO_CLAIM_LIMITS } from "./api/studioSafety.types";
import {
  useStudioAcceptedClaims,
  useStudioClaimDecision,
  useStudioReviewClaims,
} from "./api/useStudioClaimReview";
import { claimStatusLabelKeyFor } from "./studioClaimStatus.data";
import { StudioReviewClaimCard } from "./StudioReviewClaimCard";
import {
  StudioReviewDialog,
  type StudioReviewDialogRequest,
} from "./StudioReviewDialog";
import {
  isReviewSettledElsewhere,
  reviewErrorKeyOf,
} from "./StudioReviewErrors";
import { StudioReviewList } from "./StudioReviewList";
import { useReviewQueueOrder } from "./StudioReviewQueue";
import { StudioReviewQueueBar } from "./StudioReviewQueueBar";
import { useReviewFocus } from "./useReviewFocus";
import css from "./StudioFlagReview.module.css";

const claimKey = (claim: StudioAdminClaimView) => claim.id;

const CLAIM_QUEUE_FIELDS = {
  createdAtOf: (claim: StudioAdminClaimView) => claim.createdAt,
  filterValueOf: (claim: StudioAdminClaimView) => claim.status,
};

const DECISION_REQUEST: Record<
  StudioClaimDecision,
  Omit<StudioReviewDialogRequest, "releaseTitle"> & { successKey: string }
> = {
  accept: {
    titleKey: "studio:flagReviewLive.claims.dialog.acceptTitle",
    bodyKey: "studio:flagReviewLive.claims.dialog.acceptBody",
    confirmKey: "studio:flagReviewLive.claims.accept",
    textLabelKey: null,
    textMaxLength: 0,
    tone: "destructive",
    successKey: "studio:flagReviewLive.claims.toast.accepted",
  },
  decline: {
    titleKey: "studio:flagReviewLive.claims.dialog.declineTitle",
    bodyKey: "studio:flagReviewLive.claims.dialog.declineBody",
    confirmKey: "studio:flagReviewLive.claims.decline",
    textLabelKey: "studio:flagReviewLive.claims.declineNoteLabel",
    textMaxLength: STUDIO_CLAIM_LIMITS.staffNoteMax,
    tone: "default",
    successKey: "studio:flagReviewLive.claims.toast.declined",
  },
  uphold: {
    titleKey: "studio:flagReviewLive.claims.dialog.upholdTitle",
    bodyKey: "studio:flagReviewLive.claims.dialog.upholdBody",
    confirmKey: "studio:flagReviewLive.claims.uphold",
    textLabelKey: "studio:flagReviewLive.claims.noteLabel",
    textMaxLength: STUDIO_CLAIM_LIMITS.staffNoteMax,
    tone: "destructive",
    successKey: "studio:flagReviewLive.claims.toast.upheld",
  },
  reject: {
    titleKey: "studio:flagReviewLive.claims.dialog.rejectTitle",
    bodyKey: "studio:flagReviewLive.claims.dialog.rejectBody",
    confirmKey: "studio:flagReviewLive.claims.reject",
    textLabelKey: "studio:flagReviewLive.claims.noteLabel",
    textMaxLength: STUDIO_CLAIM_LIMITS.staffNoteMax,
    tone: "positive",
    successKey: "studio:flagReviewLive.claims.toast.rejected",
  },
};

/** The Claims tab: the work queue, oldest first, then the accepted claims
 *  waiting for the artist, which staff can still uphold or reject. Accept
 *  takes the track offline; decline, uphold and reject need a note both
 *  sides read. */
export function StudioReviewClaimsPanel({
  tabButtonId,
}: {
  tabButtonId: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const acceptedHeadingId = useId();
  const list = useStudioReviewClaims();
  const acceptedList = useStudioAcceptedClaims();
  const queueOrder = useReviewQueueOrder(list.items, CLAIM_QUEUE_FIELDS);
  const queueFocus = useReviewFocus(
    queueOrder.visibleItems,
    claimKey,
    tabButtonId,
  );
  const acceptedFocus = useReviewFocus(
    acceptedList.items,
    claimKey,
    tabButtonId,
  );
  // Each list moves focus within itself once a card leaves it.
  const focusFor = (claim: StudioAdminClaimView) =>
    claim.status === "accepted" ? acceptedFocus : queueFocus;
  const decision = useStudioClaimDecision();
  const [pending, setPending] = useState<{
    claim: StudioAdminClaimView;
    decision: StudioClaimDecision;
  } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const request = pending ? DECISION_REQUEST[pending.decision] : null;

  function confirm(text: string) {
    if (!pending || !request || decision.isPending) return;
    if (request.textLabelKey !== null && text.length === 0) return;
    const { claim } = pending;
    const focus = focusFor(claim);
    setErrorKey(null);
    focus.markLeaving(claim.id);
    decision.mutate(
      { claimId: claim.id, decision: pending.decision, note: text || null },
      {
        onSuccess: () => {
          setPending(null);
          showToast(
            t(request.successKey, { title: claim.track.title }),
            "success",
          );
        },
        onError: (error) => {
          const messageKey = reviewErrorKeyOf(error);
          // A claim decided elsewhere leaves on the re-read; any other
          // failure keeps the dialog and the note, with the reason inside.
          if (isReviewSettledElsewhere(error)) setPending(null);
          else {
            focus.clearLeaving();
            setErrorKey(messageKey);
          }
          showToast(t(messageKey), "error");
        },
      },
    );
  }

  const renderCard = (claim: StudioAdminClaimView) => (
    <StudioReviewClaimCard
      claim={claim}
      titleRef={focusFor(claim).registerTitle(claim.id)}
      onDecide={(nextDecision) => {
        setErrorKey(null);
        setPending({ claim, decision: nextDecision });
      }}
    />
  );

  return (
    <>
      <StudioReviewList
        list={list}
        items={queueOrder.visibleItems}
        toolbar={
          <StudioReviewQueueBar
            order={queueOrder}
            totalCount={list.items.length}
            filterLabelOf={(status) =>
              t(
                claimStatusLabelKeyFor(
                  status as StudioAdminClaimView["status"],
                  "staff",
                ),
              )
            }
            filterGroupLabelKey="studio:flagReviewLive.queue.filterStatus"
          />
        }
        getKey={claimKey}
        emptyTitleKey="studio:flagReviewLive.claims.emptyTitle"
        emptyBodyKey="studio:flagReviewLive.claims.emptyBody"
        renderCard={renderCard}
      />
      <section aria-labelledby={acceptedHeadingId}>
        <h3 id={acceptedHeadingId} className={css.sectionHeading}>
          {t("studio:flagReviewLive.claims.acceptedHeading")}
        </h3>
        <StudioReviewList
          list={acceptedList}
          getKey={claimKey}
          emptyTitleKey="studio:flagReviewLive.claims.acceptedEmptyTitle"
          emptyBodyKey="studio:flagReviewLive.claims.acceptedEmptyBody"
          renderCard={renderCard}
        />
      </section>
      <AnimatePresence>
        {pending && request && (
          <StudioReviewDialog
            key={`${pending.claim.id}-${pending.decision}`}
            request={{ ...request, releaseTitle: pending.claim.track.title }}
            isPending={decision.isPending}
            errorKey={errorKey}
            onConfirm={confirm}
            onClose={() => {
              if (!decision.isPending) setPending(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
