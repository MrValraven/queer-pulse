import { FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryListings } from "../../app/providers/DirectoryListingsProvider";
import { routes } from "../../app/routeMap";
import {
  initials,
  type ListingStatus,
} from "../marketing/listBusiness/listBusiness.data";
import styles from "./MyPlacesSection.module.css";

/** Status-chip catalog key per listing status — a small, platform-defined
 *  vocabulary (chrome), resolved through `t()`. */
const STATUS_LABEL_KEY: Record<ListingStatus, string> = {
  review: "members:myPlaces.status.review",
  question: "members:myPlaces.status.question",
  live: "members:myPlaces.status.live",
};

/** "Places I run" — member-submitted directory listings, shown on own profile. */
export function MyPlacesSection({ memberSlug }: { memberSlug: string }) {
  const { t } = useTranslation();
  const { submitted } = useDirectoryListings();
  const mine = submitted.filter(
    (l) => l.submittedBy === memberSlug && l.linkToProfile,
  );
  if (!mine.length) return null;

  return (
    <section className={`${styles.section} wrap`}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          <Translation
            i18nKey="members:myPlaces.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.sub}>{t("members:myPlaces.subtitle")}</p>
      </div>
      <div className={styles.grid}>
        {mine.map((l) => {
          const isLive = l.status === "live";
          return (
            <article key={l.ref} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.av}>{initials(l.name)}</span>
                <div>
                  <div className={styles.name}>{l.name}</div>
                  <div className={styles.meta}>
                    <FiMapPin size={12} aria-hidden />{" "}
                    {[l.cats.join(", "), l.hood].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <span
                  className={[
                    styles.status,
                    isLive ? styles.statusLive : styles.statusReview,
                  ].join(" ")}
                >
                  {!isLive && <FiClock size={11} aria-hidden />}
                  {t(STATUS_LABEL_KEY[l.status])}
                </span>
              </div>
              {l.blurb && <p className={styles.blurb}>{l.blurb}</p>}
              <div className={styles.foot}>
                <span className={styles.ref}>
                  {t("members:myPlaces.refLabel", { ref: l.ref })}
                </span>
                {isLive ? (
                  <Link
                    to={`${routes.directory}/${l.slug}`}
                    className={styles.viewLink}
                  >
                    {t("members:myPlaces.viewListingCta")}
                  </Link>
                ) : (
                  <span className={styles.pending}>
                    {t("members:myPlaces.awaitingReview")}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
