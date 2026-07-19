import { FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryListings } from "../marketing/listBusiness/api/useDirectoryListings";
import { routes } from "../../app/routeMap";
import { EmptyState } from "../../shared/components/ui";
import {
  initials,
  type ListingStatus,
} from "../marketing/listBusiness/listBusiness.data";
import {
  mergePlaces,
  registryPlacesForMember,
  type MemberPlace,
} from "./places.data";
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
}: {
  place: MemberPlace;
  isSelf: boolean;
}) {
  const { t } = useTranslation();
  const isLive = place.status === "live";

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
      <div className={styles.foot}>
        {isSelf && place.ref && (
          <span className={styles.ref}>
            {t("members:places.refLabel", { ref: place.ref })}
          </span>
        )}
        {isLive ? (
          <Link
            to={`${routes.directory}/${place.slug}`}
            className={styles.viewLink}
          >
            {t("members:places.viewListingCta")}
          </Link>
        ) : (
          <span className={styles.pending}>
            {t("members:places.awaitingReview")}
          </span>
        )}
      </div>
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
  const { submitted } = useDirectoryListings();
  const registry = registryPlacesForMember(memberSlug);
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
  const places = mergePlaces(registry, mine, isSelf);

  // Visitors see nothing rather than an empty shell; the owner gets a prompt.
  if (places.length === 0 && !isSelf) return null;

  if (places.length === 0) {
    return (
      <section className={`${styles.section} wrap`}>
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
    <section className={`${styles.section} wrap`}>
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
          <PlacesCard key={place.key} place={place} isSelf={isSelf} />
        ))}
      </div>
    </section>
  );
}
