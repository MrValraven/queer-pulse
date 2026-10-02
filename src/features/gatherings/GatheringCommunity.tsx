import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { communityPath } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import { useVisibleGatheringCommunity } from "./useVisibleGatheringCommunity";
import styles from "./GatheringPage.module.css";

/**
 * "With <community>" in the hero's meta line, next to "Hosted by". Renders
 * nothing when the gathering has no community, or when this viewer may not
 * see it named (see `useVisibleGatheringCommunity`).
 */
export function GatheringHeroCommunity({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const community = useVisibleGatheringCommunity(gathering);
  if (!community) return null;
  return (
    <span className={styles.metaItem}>
      <span className={styles.metaDot} />
      <span>
        {t("gatherings:common.hostedWith")}{" "}
        <Link className={styles.metaLink} to={communityPath(community.slug)}>
          {community.name}
        </Link>
      </span>
    </span>
  );
}

/**
 * The sidebar's "Hosted with" block, under the host. Same visibility rule as
 * the hero line, so the two never disagree.
 */
export function GatheringCommunityCard({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const community = useVisibleGatheringCommunity(gathering);
  if (!community) return null;
  return (
    <>
      <div className={styles.sh}>
        {t("gatherings:gathering.hostedWithHeading")}
      </div>
      <div className={styles.hostRow}>
        <span className={styles.communityIcon} aria-hidden>
          <FiUsers />
        </span>
        <div>
          <div className={styles.hostName}>
            <Link
              className={styles.communityName}
              to={communityPath(community.slug)}
            >
              {community.name}
            </Link>
          </div>
          <div className={styles.hostRole}>
            {t("gatherings:gathering.hostedWithRole")}
          </div>
        </div>
      </div>
    </>
  );
}
