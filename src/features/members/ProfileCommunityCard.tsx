import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ROLE_LABEL_KEY, type FeaturedCommunityRef } from "./profileCommunities.types";
import styles from "./ProfileCommunityCard.module.css";

/** Compact card for a community the member features on their profile. */
export function ProfileCommunityCard({
  community,
}: {
  community: FeaturedCommunityRef;
}) {
  const { t } = useTranslation();
  return (
    <Link to={`/community/${community.slug}`} className={styles.card}>
      <div className={styles.top}>
        <span className={styles.type}>{community.typeLabel}</span>
        <span className={styles.role}>{t(ROLE_LABEL_KEY[community.role])}</span>
      </div>
      <div className={styles.name}>{community.name}</div>
      <p className={styles.tagline}>{community.tagline}</p>
      <div className={styles.count}>{community.countLabel}</div>
    </Link>
  );
}
