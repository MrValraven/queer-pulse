import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { memberRefToPerson } from "../../shared/api/refs";
import { AdminChip, AdminAvatar, type AdminTone, type AvatarTone } from "./ui";
import { useReviewListingClaim } from "./api/useReviewListingClaim";
import type {
  ListingClaimDTO,
  ListingClaimStatus,
} from "./api/listingClaims.api";
import styles from "./EditSuggestions.module.css";

const STATUS_TONE: Record<ListingClaimStatus, AdminTone> = {
  pending: "amber",
  approved: "jade",
  declined: "ghost",
};

export function ListingClaimRows({
  claims,
  onResolved,
}: {
  claims: ListingClaimDTO[];
  onResolved: (id: string, status: ListingClaimStatus) => void;
}) {
  const { t } = useTranslation();
  if (claims.length === 0) {
    return <p className={styles.emptyLine}>{t("admin:listingClaims.empty")}</p>;
  }
  return (
    <ul className={styles.rows}>
      {claims.map((claim, index) => (
        <FadeIn key={claim.id} delay={Math.min(index, 8) * 50} as="li">
          <ListingClaimRow claim={claim} onResolved={onResolved} />
        </FadeIn>
      ))}
    </ul>
  );
}

function ListingClaimRow({
  claim,
  onResolved,
}: {
  claim: ListingClaimDTO;
  onResolved: (id: string, status: ListingClaimStatus) => void;
}) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const review = useReviewListingClaim();
  const claimant = memberRefToPerson(claim.claimant);

  function decide(decision: "approved" | "declined") {
    review.mutate(
      { claim, decision },
      {
        onSuccess: () => {
          onResolved(claim.id, decision);
          showToast(
            t(`admin:listingClaims.toast.${decision}`, {
              name: claim.listingName,
            }),
            "success",
          );
        },
      },
    );
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{claim.listingName}</span>
          <AdminChip tone={STATUS_TONE[claim.status]} dot>
            {t(`admin:listingClaims.status.${claim.status}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {claim.listingRef} · {formatDate(claim.createdAt, language)}
        </div>
        {claim.note && <p className={styles.rowMessage}>{claim.note}</p>}
        <div className={styles.rowSubmitter}>
          <AdminAvatar
            initials={claimant?.initials ?? "?"}
            tone={(claimant?.tint as AvatarTone | undefined) ?? "anon"}
            size="sm"
            src={claimant?.avatarUrl ?? undefined}
          />
          <span>
            {t("admin:listingClaims.claimedBy", {
              name: claimant?.name ?? t("admin:listingClaims.unknownClaimant"),
            })}
          </span>
        </div>
      </div>
      {claim.status === "pending" && (
        <div className={styles.rowActions}>
          <Button
            variant="jade"
            size="md"
            onClick={() => decide("approved")}
            disabled={review.isPending}
          >
            {t("admin:listingClaims.approveCta")}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => decide("declined")}
            disabled={review.isPending}
          >
            {t("admin:listingClaims.declineCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
