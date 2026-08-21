import { Link } from "react-router-dom";
import { Tag, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CARD_TAG_DISPLAY_CAP,
  COMMUNITY_TAG_LABEL_KEY,
} from "../communities/communityTags.data";
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
      {community.tags && community.tags.length > 0 && (
        <TagRow>
          {community.tags.slice(0, CARD_TAG_DISPLAY_CAP).map((tagId) => (
            <Tag key={tagId}>
              {COMMUNITY_TAG_LABEL_KEY[tagId]
                ? t(COMMUNITY_TAG_LABEL_KEY[tagId])
                : tagId}
            </Tag>
          ))}
        </TagRow>
      )}
      <div className={styles.count}>{community.countLabel}</div>
    </Link>
  );
}
