import { useState } from "react";
import { FiArrowRight, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { LocalBusinessCardBody } from "../marketing/LocalBusinessCardBody";
import type { ListingStatus } from "../marketing/listBusiness/listBusiness.data";
import type { MemberPlace } from "./places.data";
import { QuickEditListingModal } from "./QuickEditListingModal";
import dir from "../marketing/DirectoryPage.module.css";
import styles from "./PlacesSection.module.css";

/** Status-chip catalog key per listing status — a small, platform-defined
 *  vocabulary (chrome), resolved through `t()`. Only shown to the owner. */
const STATUS_LABEL_KEY: Record<ListingStatus, string> = {
  review: "members:places.status.review",
  question: "members:places.status.question",
  live: "members:places.status.live",
};

/**
 * One place on the owner's own profile — the directory grid card (same
 * `LocalBusinessCardBody`, same `DirectoryPage.module.css` skin) with the
 * owner's chrome swapped in: the LIVE / IN REVIEW chip takes the bookmark's
 * corner, the empty rating and the "run by" avatar drop out (a submitted
 * listing has no reviews, and the host is the profile you're already on), and
 * a second footer row carries the management actions.
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
  /** Owner + live-mode + real-ref gate — edit and delete address the ref. */
  canManage: boolean;
  /** Owner-only delete; absent when the caller can't manage this listing. */
  onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const { place, ref, status } = entry;
  const isLive = status === "live";
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [quickEditing, setQuickEditing] = useState(false);

  const body = (
    <LocalBusinessCardBody
      place={place}
      // Submitted listings carry no reviews, so the block would read as five
      // empty stars; a demo registry place with real reviews still shows them.
      showRating={place.rating.count > 0}
      showHost={false}
      topRight={
        <span
          className={[
            styles.status,
            isLive ? styles.statusLive : styles.statusReview,
          ].join(" ")}
        >
          {!isLive && <FiClock size={11} aria-hidden />}
          {t(STATUS_LABEL_KEY[status])}
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

      {confirmingDelete && canManage && onRemove ? (
        <div
          className={styles.confirm}
          role="alertdialog"
          aria-label={t("members:places.deleteCta")}
        >
          <p className={styles.confirmText}>
            <Translation
              i18nKey="members:places.deleteConfirm"
              components={{ b: <b /> }}
              values={{ name: place.name }}
            />
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
              {t("members:places.deleteCancel")}
            </Button>
            <Button variant="primary" onClick={onRemove}>
              {t("members:places.deleteYes")}
            </Button>
          </div>
        </div>
      ) : (
        (ref || canManage) && (
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
                    onClick={() => setConfirmingDelete(true)}
                  >
                    {t("members:places.deleteCta")}
                  </button>
                )}
              </div>
            )}
          </div>
        )
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
