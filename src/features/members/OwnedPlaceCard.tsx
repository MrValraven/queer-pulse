import { useState } from "react";
import { FiArrowRight, FiClock, FiUsers } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { LocalBusinessCardBody } from "../marketing/LocalBusinessCardBody";
import { ListingDeleteFlow } from "../marketing/listBusiness/delete/ListingDeleteFlow";
import type { ListingStatus } from "../marketing/listBusiness/listBusiness.data";
import type { MemberPlace } from "./places.data";
import { QuickEditListingModal } from "./QuickEditListingModal";
import dir from "../marketing/DirectoryPage.module.css";
import styles from "./PlacesSection.module.css";

/** Status-chip catalog key per listing status: a small, platform-defined
 *  vocabulary (chrome), resolved through `t()`. Only shown to the owner. */
const STATUS_LABEL_KEY: Record<ListingStatus, string> = {
  review: "members:places.status.review",
  question: "members:places.status.question",
  live: "members:places.status.live",
};

/**
 * One place on the owner's own profile: the directory grid card (same
 * `LocalBusinessCardBody`, same `DirectoryPage.module.css` skin) with the
 * owner's chrome swapped in: the LIVE / IN REVIEW chip takes the bookmark's
 * corner, the empty rating and the "run by" avatar drop out (a submitted
 * listing has no reviews, and the host is the profile you're already on), and
 * a second footer row carries the management actions.
 *
 * A place this member only CO-MANAGES wears its own chip and is offered no
 * delete: removing a listing stays with the person who owns it. Delete opens
 * the shared `ListingDeleteFlow`, whose gentler exits (hide it, mark it closed)
 * land on the editor's trading section, where both of those controls live.
 *
 * The card is an `<article>` rather than a `<Link>` like the directory card,
 * because it holds real buttons and a button inside a router link is banned.
 * A live listing still gets the whole-card click: only the visual body is
 * link-wrapped (via `display: contents`), leaving the management row outside.
 */
export function OwnedPlaceCard({
  entry,
  canManage,
  onRemove,
}: {
  entry: MemberPlace;
  /** Owner + live-mode + real-ref gate; edit and delete address the ref. */
  canManage: boolean;
  /** Owner-only delete; absent when the caller can't manage this listing.
   *  Resolves once the server confirmed it and rejects on failure, so the
   *  delete flow can keep itself open with its inline error. */
  onRemove?: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { place, ref, status } = entry;
  const isLive = status === "live";
  // Somebody else owns this one. Said on the card rather than only inside the
  // editor, because the grid is where an owner scans what is theirs.
  const isCoManaged = entry.managementRole === "co_manager";
  const [isDeleteFlowOpen, setIsDeleteFlowOpen] = useState(false);
  const [quickEditing, setQuickEditing] = useState(false);
  // Hiding a listing and marking it closed both live beside each other in the
  // editor's trading section, so either gentler exit opens the editor there.
  const openTradingControls = () => {
    if (ref) {
      void navigate(
        `${routes.listBusinessEdit.replace(":ref", ref)}#lb-editor-trading`,
      );
    }
  };

  const body = (
    <LocalBusinessCardBody
      place={place}
      // Submitted listings carry no reviews, so the block would read as five
      // empty stars; a demo registry place with real reviews still shows them.
      showRating={place.rating.count > 0}
      showHost={false}
      topRight={
        <span className={styles.statusStack}>
          {isCoManaged && (
            <span className={`${styles.status} ${styles.statusCoManaged}`}>
              <FiUsers size={11} aria-hidden />
              {t("members:places.coManaging")}
            </span>
          )}
          <span
            className={[
              styles.status,
              isLive ? styles.statusLive : styles.statusReview,
            ].join(" ")}
          >
            {!isLive && <FiClock size={11} aria-hidden />}
            {t(STATUS_LABEL_KEY[status])}
          </span>
        </span>
      }
      visitSlot={
        isLive ? (
          <span className={dir.visit}>
            {t("members:places.viewListingCta")} <FiArrowRight aria-hidden />
          </span>
        ) : (
          <span className={styles.pending}>
            {t("members:places.awaitingReview")}
          </span>
        )
      }
    />
  );

  return (
    <article className={`${dir.card} ${isLive ? "" : styles.staticCard}`}>
      {isLive ? (
        <Link
          to={`${routes.directory}/${place.slug}`}
          className={styles.bodyLink}
        >
          {body}
        </Link>
      ) : (
        body
      )}

      {(ref || canManage) && (
        <div className={styles.ownerBar}>
          {ref && (
            <span className={styles.ref}>
              {t("members:places.refLabel", { ref })}
            </span>
          )}
          {canManage && ref && (
            <div className={styles.ownerActions}>
              <button
                type="button"
                className={styles.quickEditBtn}
                onClick={() => setQuickEditing(true)}
              >
                {t("members:places.quickEditCta")}
              </button>
              <Link
                to={routes.listBusinessEdit.replace(":ref", ref)}
                className={styles.editLink}
              >
                {t("members:places.editCta")}
              </Link>
              {onRemove && (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setIsDeleteFlowOpen(true)}
                >
                  {t("members:places.deleteCta")}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isDeleteFlowOpen && canManage && ref && onRemove && (
        <ListingDeleteFlow
          listingName={place.name}
          variant="owner"
          // A successful delete drops this listing from the grid, which
          // unmounts the card and the flow with it; a rejection propagates so
          // the flow stays open on its last step with the inline error.
          onConfirmDelete={async () => {
            await onRemove();
            setIsDeleteFlowOpen(false);
          }}
          onClose={() => setIsDeleteFlowOpen(false)}
          gentlerOptions={{
            onHideInstead: openTradingControls,
            onMarkClosedInstead: openTradingControls,
          }}
        />
      )}

      {quickEditing && canManage && ref && (
        <QuickEditListingModal
          editRef={ref}
          placeName={place.name}
          onClose={() => setQuickEditing(false)}
        />
      )}
    </article>
  );
}
