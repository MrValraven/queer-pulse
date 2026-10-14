import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { memberRefToPerson } from "../../shared/api/refs";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { AdminChip, AdminAvatar, type AdminTone, type AvatarTone } from "./ui";
import { QueueOverdueChip } from "./QueueAssignmentControls";
import { useReviewListingClaim } from "./api/useReviewListingClaim";
import { adminListingEditPath } from "./api/adminListingEdit.api";
import { focusListingQueueHeadingAfterRemove } from "./listingQueueFocus";
import type {
  ListingClaimDTO,
  ListingClaimStatus,
} from "./api/listingClaims.api";
import styles from "./ListingClaims.module.css";

const STATUS_TONE: Record<ListingClaimStatus, AdminTone> = {
  pending: "amber",
  approved: "jade",
  declined: "ghost",
};

type ClaimDecision = "approved" | "declined";

/**
 * One ownership claim: the listing it is about, how long it has waited, who
 * filed it and their note, then the two decisions. Approving hands the listing
 * to the claimant, so it asks once more in a dialog naming both; declining
 * goes straight through. Each row owns its own review mutation, so only this
 * row's buttons wait on its request.
 */
export function ListingClaimRow({
  claim,
  onResolved,
}: {
  claim: ListingClaimDTO;
  onResolved: (decidedClaim: ListingClaimDTO) => void;
}) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const review = useReviewListingClaim();
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const rowRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const claimantName =
    memberRefToPerson(claim.claimant)?.name ??
    t("admin:listingClaims.row.formerMember");
  const isPending = claim.status === "pending";

  function decide(decision: ClaimDecision) {
    review.mutate(
      { claim, decision },
      {
        onSuccess: (reviewedClaim) => {
          setIsApproveConfirmOpen(false);
          // The decided row leaves the Pending tab (or loses its buttons on
          // All), so a focused Decline button is on its way out. Let go of it
          // and hand focus to the queue heading once React has committed.
          const activeElement = document.activeElement;
          if (
            activeElement instanceof HTMLElement &&
            rowRef.current?.contains(activeElement)
          ) {
            activeElement.blur();
          }
          onResolved({ ...claim, ...reviewedClaim, status: decision });
          showToast(
            t(`admin:listingClaims.toast.${decision}`, {
              name: claim.listingName,
            }),
            "success",
          );
          focusListingQueueHeadingAfterRemove();
        },
      },
    );
  }

  return (
    <article ref={rowRef} className={styles.row} aria-labelledby={titleId}>
      <div className={styles.rowText}>
        <div className={styles.rowTop}>
          <ClaimListingTitle claim={claim} titleId={titleId} />
          {!isPending && (
            <AdminChip tone={STATUS_TONE[claim.status]} dot>
              {t(`admin:listingClaims.status.${claim.status}`)}
            </AdminChip>
          )}
          {/* The claim's promised decision date is the queue-agnostic `dueAt`
              the OPS-04 clock reads, so this queue escalates on age like every
              other staff queue. Asked only of a row that is still open, per
              `queueClock.ts`: a decided claim's clock has stopped. */}
          <QueueOverdueChip
            dueAt={isPending ? claim.expectedDecisionBy : null}
          />
        </div>
        <ClaimMetaLine claim={claim} language={language} />
        <ClaimantLine claim={claim} claimantName={claimantName} />
        {claim.note && (
          <figure className={styles.note}>
            <figcaption className={styles.noteLabel}>
              {t("admin:listingClaims.row.noteLabel")}
            </figcaption>
            <blockquote className={styles.noteQuote}>{claim.note}</blockquote>
          </figure>
        )}
      </div>
      {isPending && (
        <div className={styles.rowActions}>
          <Button
            variant="jade"
            size="md"
            onClick={() => setIsApproveConfirmOpen(true)}
            disabled={review.isPending}
            aria-label={t("admin:listingClaims.row.approveAria", {
              name: claim.listingName,
            })}
          >
            {t("admin:listingClaims.row.approveCta")}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => decide("declined")}
            disabled={review.isPending}
            aria-label={t("admin:listingClaims.row.declineAria", {
              name: claim.listingName,
            })}
          >
            {t("admin:listingClaims.row.declineCta")}
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        onConfirm={() => decide("approved")}
        tone="positive"
        loading={review.isPending}
        title={t("admin:listingClaims.approveConfirm.title", {
          listing: claim.listingName,
        })}
        description={t("admin:listingClaims.approveConfirm.body", {
          listing: claim.listingName,
          claimant: claimantName,
        })}
        confirmLabel={t("admin:listingClaims.row.approveCta")}
        cancelLabel={t("admin:common.cancel")}
      />
    </article>
  );
}

/** The listing's name. Admins get a link into the listing editor (the edit
 *  route is Admin only, the same gate as `ListingRowEditButton`); everyone
 *  else reads it as plain text. */
function ClaimListingTitle({
  claim,
  titleId,
}: {
  claim: ListingClaimDTO;
  titleId: string;
}) {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  const isAdmin = demoMode || role === "admin";
  return (
    <h3 id={titleId} className={styles.rowTitle}>
      {isAdmin ? (
        <Link
          className={styles.rowTitleLink}
          to={adminListingEditPath(claim.listingRef)}
          aria-label={t("admin:listingClaims.row.openListingAria", {
            name: claim.listingName,
          })}
        >
          {claim.listingName}
        </Link>
      ) : (
        claim.listingName
      )}
    </h3>
  );
}

/** Ref, filing date, and how long the claim has waited. */
function ClaimMetaLine({
  claim,
  language,
}: {
  claim: ListingClaimDTO;
  language: string;
}) {
  const { t } = useTranslation();
  const ageKey =
    claim.status === "pending"
      ? "admin:listingClaims.row.waiting"
      : "admin:listingClaims.row.waited";
  return (
    <p className={styles.rowMeta}>
      <span className={styles.rowRef}>{claim.listingRef}</span>
      {" · "}
      {t("admin:listingClaims.row.filed", {
        date: formatDate(claim.createdAt, language),
      })}
      {claim.ageDays > 0 && (
        <>
          {" · "}
          {t(ageKey, { count: claim.ageDays })}
        </>
      )}
    </p>
  );
}

/** Who filed the claim, linked to their member profile. An erased claimant
 *  keeps a quiet placeholder avatar and is named as a member who has left. */
function ClaimantLine({
  claim,
  claimantName,
}: {
  claim: ListingClaimDTO;
  claimantName: string;
}) {
  const { t } = useTranslation();
  const claimant = memberRefToPerson(claim.claimant);
  return (
    <div className={styles.claimant}>
      <AdminAvatar
        initials={claimant?.initials ?? <FiUser aria-hidden />}
        tone={(claimant?.tint as AvatarTone | undefined) ?? "anon"}
        size="sm"
        src={claimant?.avatarUrl ?? undefined}
      />
      <span>
        {t("admin:listingClaims.row.claimantLabel")}{" "}
        {claimant ? (
          <Link
            className={styles.claimantLink}
            to={`${routes.members}/${claimant.slug}`}
          >
            {claimantName}
          </Link>
        ) : (
          <span className={styles.claimantName}>{claimantName}</span>
        )}
      </span>
    </div>
  );
}
