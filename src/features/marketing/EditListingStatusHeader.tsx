import { FiClock, FiShield } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingStatus } from "./listBusiness/listBusiness.data";
import styles from "./EditListingStatusHeader.module.css";

/** Status-chip catalog key per listing status. Deliberately the SAME keys the
 *  owner's place card on /account/profile renders (see `OwnedPlaceCard`), so
 *  the two owner-facing surfaces always speak one status vocabulary. */
const STATUS_LABEL_KEY: Record<ListingStatus, string> = {
  review: "members:places.status.review",
  question: "members:places.status.question",
  live: "members:places.status.live",
};

/** What saving actually does, per status. An approved listing stays live
 *  through owner edits, so none of these promises a fresh review. */
const STATUS_BODY_KEY: Record<ListingStatus, string> = {
  review: "marketing:listBusiness.edit.status.reviewBody",
  question: "marketing:listBusiness.edit.status.questionBody",
  live: "marketing:listBusiness.edit.status.liveBody",
};

/**
 * The edit view's status header: where this listing stands right now (live, in
 * review, or waiting on a moderator's question) and what pressing save will do
 * to it. Create mode never renders this: a listing that does not exist yet has
 * no status.
 */
export function EditListingStatusHeader({ status }: { status: ListingStatus }) {
  const { t } = useTranslation();
  const isLive = status === "live";

  return (
    <div className={styles.header}>
      <span
        className={[
          styles.chip,
          isLive ? styles.chipLive : styles.chipReview,
        ].join(" ")}
      >
        {!isLive && <FiClock size={11} aria-hidden />}
        {t(STATUS_LABEL_KEY[status])}
      </span>
      <p className={styles.body}>{t(STATUS_BODY_KEY[status])}</p>
    </div>
  );
}

/**
 * Disclosure for the three fields a moderator's "verified queer-owned"
 * confirmation is pinned to: the business name, the owned/friendly badge, and
 * whether the listing links to the owner's profile. Changing any of them
 * clears that badge until a moderator confirms the business again, because the
 * badge was a confirmation about one specific business identity.
 *
 * Rendered only for a listing that actually carries the badge today: for
 * everyone else there is nothing to lose and nothing to warn about.
 */
export function VerifiedBadgeEditNotice() {
  const { t } = useTranslation();

  return (
    <div className={styles.badgeNotice}>
      <FiShield size={15} aria-hidden />
      <p className={styles.badgeNoticeText}>
        <span className={styles.badgeNoticeTitle}>
          {t("marketing:listBusiness.edit.verifiedBadge.title")}
        </span>
        {t("marketing:listBusiness.edit.verifiedBadge.body")}
      </p>
    </div>
  );
}
