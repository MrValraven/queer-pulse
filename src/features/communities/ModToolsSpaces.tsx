import { Link, useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiCompass } from "react-icons/fi";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import { useSubcommunities } from "./api/useSubcommunities";
import { AccessTierBadge } from "./CommunityBadges";
import { CreateSpaceForm } from "./CreateSpaceForm";
import type { LivingCommunity } from "./community.model";
import detail from "./CommunityDetailPage.module.css";
import styles from "./ModToolsPanels.module.css";

/**
 * Moderator console for spaces (subcommunities): the spaces already open
 * under this community, and the form to open another one.
 *
 * Only reachable on a top-level community that may host spaces or still
 * hosts some (`ModToolsTab` enforces this before the pane mounts). The list
 * stays after platform staff turn the switch off, since the spaces themselves
 * stay; the founding form shows only while `living.allowsSubcommunities`.
 */
export function ModToolsSpaces({
  living,
  communityName,
}: {
  living: LivingCommunity;
  /** The community's display name: spaces read as "spaces inside {name}",
   *  and the founding form quotes it in the tier and rules hints. */
  communityName: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spaces, isLoading, isError, refetch } = useSubcommunities(
    living.slug,
    { enabled: true },
  );

  return (
    <div style={{ marginBottom: 32 }}>
      <div className={detail.secLbl}>{t("communities:spaces.mod.label")}</div>
      <p className={styles.intro}>{t("communities:spaces.mod.intro")}</p>

      <div className={styles.resultHead}>
        {t("communities:spaces.mod.list.title")}
      </div>
      {isLoading ? (
        <div aria-busy="true">
          <SkeletonLine height={14} style={{ marginBottom: 10 }} />
          <SkeletonLine height={14} width="70%" />
        </div>
      ) : isError ? (
        <EmptyState
          compact
          icon={<FiAlertTriangle />}
          title={t("communities:detail.modtools.queueError.title")}
          description={t("communities:detail.modtools.queueError.description")}
          action={{
            label: t("communities:detail.modtools.queueError.retry"),
            onClick: refetch,
          }}
        />
      ) : spaces.length === 0 ? (
        <EmptyState
          compact
          icon={<FiCompass />}
          title={t("communities:spaces.mod.list.empty")}
        />
      ) : (
        <ul className={styles.rows}>
          {spaces.map((space) => (
            <li key={space.slug ?? space.name} className={styles.row}>
              <div className={styles.rowMain}>
                {space.slug ? (
                  <Link
                    to={communityPath(space.slug)}
                    className={styles.threadLink}
                  >
                    {space.name}
                  </Link>
                ) : (
                  <span>{space.name}</span>
                )}
                <p className={styles.meta}>{space.count}</p>
              </div>
              {space.accessTier && <AccessTierBadge tier={space.accessTier} />}
            </li>
          ))}
        </ul>
      )}

      {living.allowsSubcommunities && (
        <CreateSpaceForm
          parentSlug={living.slug}
          parentName={communityName}
          parentTier={living.accessTier}
          onCreated={(slug) => void navigate(communityPath(slug))}
        />
      )}
    </div>
  );
}
