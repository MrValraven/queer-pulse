import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Badge, type BadgeTone } from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import type {
  ListingClaimStatus,
  MyListingClaimDTO,
} from "../api/listingClaims.api";
import styles from "./ListingClaims.module.css";

/** Tone per status. The tone is decoration: every card also spells the status
 *  out in words, so nothing here is carried by colour alone. */
const STATUS_TONE: Record<ListingClaimStatus, BadgeTone> = {
  pending: "amber",
  approved: "jade",
  declined: "ghost",
};

/**
 * One ownership claim, as the person who filed it sees it: which listing, where
 * the review stands, when it was filed, how long it has been waiting, and the
 * date a decision was promised by.
 *
 * Every number on the card is the server's. `ageDays`, `expectedDecisionBy` and
 * `reviewTurnaroundDays` all arrive on the DTO derived from the claim's own
 * filing date, so the wait shown here and the wait the claim form promised are
 * the same wait by construction.
 */
export function ListingClaimCard({ claim }: { claim: MyListingClaimDTO }) {
  const { t } = useTranslation();
  const format = useFormat();
  const isPending = claim.status === "pending";
  const decisionDue = claim.expectedDecisionBy
    ? new Date(claim.expectedDecisionBy)
    : null;
  // Overdue from the server's own two numbers rather than the browser clock:
  // `ageDays` is already the whole days this claim has waited, measured against
  // the same turnaround the promise was made from. Reading the local clock here
  // would put the verdict at the mercy of a skewed device, and it is an impure
  // call in render besides.
  const isPastDecisionDate = claim.ageDays > claim.reviewTurnaroundDays;

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <h2 className={styles.cardTitle}>{claim.listingName}</h2>
        <Badge tone={STATUS_TONE[claim.status]} dot>
          {t(`marketing:directory.myClaims.status.${claim.status}`)}
        </Badge>
      </div>

      <p className={styles.meta}>
        {t("marketing:directory.myClaims.reference", {
          reference: claim.listingRef,
        })}
        {" · "}
        {t("marketing:directory.myClaims.filedOn", {
          date: format.date(new Date(claim.createdAt)),
        })}
      </p>

      {isPending ? (
        <div className={styles.statusLines}>
          <p className={styles.statusLine}>
            {t("marketing:directory.myClaims.waiting", {
              count: claim.ageDays,
            })}
          </p>
          <p className={styles.statusLine}>
            {t("marketing:directory.myClaims.turnaround", {
              count: claim.reviewTurnaroundDays,
            })}
          </p>
          {decisionDue && (
            <p className={styles.statusLine}>
              {t(
                isPastDecisionDate
                  ? "marketing:directory.myClaims.decisionOverdue"
                  : "marketing:directory.myClaims.decisionDue",
                { date: format.date(decisionDue) },
              )}
            </p>
          )}
        </div>
      ) : (
        <div className={styles.statusLines}>
          {claim.reviewedAt && (
            <p className={styles.statusLine}>
              {t("marketing:directory.myClaims.reviewedOn", {
                date: format.date(new Date(claim.reviewedAt)),
              })}
            </p>
          )}
          <p className={styles.statusLine}>
            {t(`marketing:directory.myClaims.outcome.${claim.status}`)}
          </p>
        </div>
      )}

      {claim.note && (
        <div className={styles.note}>
          <h3 className={styles.noteLabel}>
            {t("marketing:directory.myClaims.noteLabel")}
          </h3>
          <p className={styles.noteBody}>{claim.note}</p>
        </div>
      )}

      <div className={styles.cardActions}>
        {/* The claim's own `listingSlug`, so this lands on exactly the listing
            that was claimed. `listingRef` addresses the ownership routes and
            the public detail page answers only to the slug, which is why the
            DTO carries both. */}
        <Link
          className={styles.cardLink}
          to={`${routes.directory}/${claim.listingSlug}`}
        >
          {t("marketing:directory.myClaims.viewListing", {
            name: claim.listingName,
          })}
          <FiArrowRight aria-hidden />
        </Link>
        {claim.status === "approved" && (
          <Link
            className={styles.cardLink}
            to={routes.listBusinessEdit.replace(":ref", claim.listingRef)}
          >
            {t("marketing:directory.myClaims.editListing", {
              name: claim.listingName,
            })}
            <FiArrowRight aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}
