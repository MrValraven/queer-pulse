import { FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDirectoryListings } from "../../app/providers/DirectoryListingsProvider";
import { routes } from "../../app/routeMap";
import {
  initials,
  type ListingStatus,
} from "../marketing/listBusiness/listBusiness.data";
import styles from "./MyPlacesSection.module.css";

const STATUS_LABEL: Record<ListingStatus, string> = {
  review: "In review",
  question: "Quick question",
  live: "Live",
};

/** "Places I run" — member-submitted directory listings, shown on own profile. */
export function MyPlacesSection({ memberSlug }: { memberSlug: string }) {
  const { submitted } = useDirectoryListings();
  const mine = submitted.filter(
    (l) => l.submittedBy === memberSlug && l.linkToProfile,
  );
  if (!mine.length) return null;

  return (
    <section className={`${styles.section} wrap`}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          Places I <em>run</em>
        </h2>
        <p className={styles.sub}>
          Listings you've added to the directory. Each is read by the community
          team before it goes live.
        </p>
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
                  {STATUS_LABEL[l.status]}
                </span>
              </div>
              {l.blurb && <p className={styles.blurb}>{l.blurb}</p>}
              <div className={styles.foot}>
                <span className={styles.ref}>Ref · {l.ref}</span>
                {isLive ? (
                  <Link
                    to={`${routes.directory}/${l.slug}`}
                    className={styles.viewLink}
                  >
                    View listing →
                  </Link>
                ) : (
                  <span className={styles.pending}>Awaiting review</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
