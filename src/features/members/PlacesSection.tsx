import { useState } from "react";
import { FiArrowRight, FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useDirectoryListings } from "../marketing/listBusiness/api/useDirectoryListings";
import { routes } from "../../app/routeMap";
import { Button, EmptyState } from "../../shared/components/ui";
import {
  initials,
  type ListingStatus,
} from "../marketing/listBusiness/listBusiness.data";
import { useMemberListings } from "./api/useMemberListings";
import {
  mergePlaces,
  registryPlacesForMember,
  type MemberPlace,
} from "./places.data";
import { QuickEditListingModal } from "./QuickEditListingModal";
import styles from "./PlacesSection.module.css";

/** Status-chip catalog key per listing status — a small, platform-defined
 *  vocabulary (chrome), resolved through `t()`. Only shown to the owner. */
const STATUS_LABEL_KEY: Record<ListingStatus, string> = {
  review: "members:places.status.review",
  question: "members:places.status.question",
  live: "members:places.status.live",
};

function PlacesCard({
  place,
  isSelf,
  onRemove,
}: {
  place: MemberPlace;
  isSelf: boolean;
  /** Owner-only delete; absent when the caller can't manage this listing
   *  (visitor view, demo mode, or a registry place with no ref). */
  onRemove?: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const isLive = place.status === "live";
  // A live listing addresses its own ref for edit/delete; both need the same
  // owner + live-mode + real-ref gate, so compute it once.
  const canManage = isSelf && Boolean(place.ref) && !demoMode;
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [quickEditing, setQuickEditing] = useState(false);

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.av}>{initials(place.name)}</span>
        <div>
          <div className={styles.name}>{place.name}</div>
          <div className={styles.meta}>
            <FiMapPin size={12} aria-hidden /> {place.meta}
          </div>
        </div>
        {isSelf && (
          <span
            className={[
              styles.status,
              isLive ? styles.statusLive : styles.statusReview,
            ].join(" ")}
          >
            {!isLive && <FiClock size={11} aria-hidden />}
            {t(STATUS_LABEL_KEY[place.status])}
          </span>
        )}
      </div>
      {place.blurb && <p className={styles.blurb}>{place.blurb}</p>}
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
        <div className={styles.foot}>
          {isSelf && place.ref && (
            <span className={styles.ref}>
              {t("members:places.refLabel", { ref: place.ref })}
            </span>
          )}
          <div className={styles.footActions}>
            {canManage && place.ref && (
              <button
                type="button"
                className={styles.quickEditBtn}
                onClick={() => setQuickEditing(true)}
              >
                {t("members:places.quickEditCta")}
              </button>
            )}
            {canManage && place.ref && (
              <Link
                to={routes.listBusinessEdit.replace(":ref", place.ref)}
                className={styles.editLink}
              >
                {t("members:places.editCta")}
              </Link>
            )}
            {canManage && onRemove && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => setConfirmingDelete(true)}
              >
                {t("members:places.deleteCta")}
              </button>
            )}
            {isLive ? (
              <Link
                to={`${routes.directory}/${place.slug}`}
                className={styles.viewLink}
              >
                {t("members:places.viewListingCta")}{" "}
                <FiArrowRight aria-hidden />
              </Link>
            ) : (
              <span className={styles.pending}>
                {t("members:places.awaitingReview")}
              </span>
            )}
          </div>
        </div>
      )}
      {quickEditing && canManage && place.ref && (
        <QuickEditListingModal
          editRef={place.ref}
          placeName={place.name}
          onClose={() => setQuickEditing(false)}
        />
      )}
    </article>
  );
}

/** "Places I run" (owner) / "Places {firstName} runs" (visitor) — merges the
 *  static directory registry with this member's session-submitted listings. */
export function PlacesSection({
  memberSlug,
  isSelf,
  firstName,
}: {
  memberSlug: string;
  /** Owner view — adds pending submissions and their status chips/ref line. */
  isSelf: boolean;
  /** For the visitor title ("Places João runs"). */
  firstName: string;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { submitted, withdrawListing } = useDirectoryListings();
  // Visitor source: demo → static registry, live → GET /directory/by-member/:slug.
  const visitorPlaces = useMemberListings(memberSlug);
  // Owner source: this member's own submissions from GET /listings/mine.
  const mine: MemberPlace[] = submitted
    .filter(
      (listing) => listing.submittedBy === memberSlug && listing.linkToProfile,
    )
    .map((listing) => ({
      key: listing.ref,
      name: listing.name,
      slug: listing.slug,
      status: listing.status,
      meta: [listing.cats.join(", "), listing.hood].filter(Boolean).join(" · "),
      blurb: listing.blurb,
      ref: listing.ref,
    }));
  // The static registry is a mock — only a base in demo, never for a real
  // member in live mode (that would leak a demo persona's places).
  const ownerRegistry = demoMode ? registryPlacesForMember(memberSlug) : [];
  const places = isSelf
    ? mergePlaces(ownerRegistry, mine, true)
    : visitorPlaces;

  // Visitors see nothing rather than an empty shell; the owner gets a prompt.
  if (places.length === 0 && !isSelf) return null;

  if (places.length === 0) {
    return (
      <section id="places" className={`${styles.section} wrap`}>
        <EmptyState
          title={t("members:places.empty.title")}
          description={t("members:places.empty.description")}
          action={{
            label: t("members:places.empty.action"),
            to: routes.listBusiness,
          }}
        />
      </section>
    );
  }

  return (
    <section id="places" className={`${styles.section} wrap`}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          {isSelf ? (
            <Translation
              i18nKey="members:places.selfTitle"
              components={{ em: <em /> }}
            />
          ) : (
            <Translation
              i18nKey="members:places.visitorTitle"
              values={{ firstName }}
              components={{ em: <em /> }}
            />
          )}
        </h2>
        {isSelf && (
          <p className={styles.sub}>{t("members:places.selfSubtitle")}</p>
        )}
      </div>
      <div className={styles.grid}>
        {places.map((place) => (
          <PlacesCard
            key={place.key}
            place={place}
            isSelf={isSelf}
            onRemove={
              isSelf && place.ref && !demoMode
                ? () => {
                    withdrawListing(place.ref as string);
                    showToast(t("members:places.deleted"), "info");
                  }
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
