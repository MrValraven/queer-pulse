import { FiChevronRight } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip, type AdminTone } from "./ui";
import type { AdminCommunityAccessTier } from "./api/adminCommunities.api";
import type { Community } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

/** Reuses `communities:badges.tier.*`, the same access-tier copy the
 *  member-facing community badges already show, keeping one shared copy of
 *  the labels for these four values. */
const TIER_LABEL_KEY: Record<AdminCommunityAccessTier, string> = {
  public: "communities:badges.tier.public",
  request: "communities:badges.tier.request",
  invite: "communities:badges.tier.invite",
  private: "communities:badges.tier.private",
};

const TIER_CHIP_TONE: Record<AdminCommunityAccessTier, AdminTone> = {
  public: "jade",
  request: "amber",
  invite: "violet",
  private: "coral",
};

/**
 * The spaces (subcommunities) a top-level community hosts, listed on its
 * admin detail overview. Each row opens that space's own admin detail via
 * `onOpen`, the same way the grid opens a top-level community: a space is
 * just another community underneath, with the same admin surface.
 */
export function AdminCommunitySpaces({
  community,
  onOpen,
}: {
  community: Community;
  onOpen: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const spaces = community.subcommunities ?? [];

  return (
    <div className={styles.pane}>
      <div className={styles.setLabel}>
        {t("admin:communities.detail.spaces.title")}
      </div>
      {spaces.length === 0 ? (
        <p className={styles.setDetail}>
          {t("admin:communities.detail.spaces.empty")}
        </p>
      ) : (
        spaces.map((space) => (
          <button
            key={space.slug}
            type="button"
            className={`${styles.memberRow} ${styles.spaceRowBtn}`}
            onClick={() => onOpen(space.slug)}
          >
            <div className={styles.memberMeta}>
              <div className={styles.memberName}>{space.name}</div>
              <div className={styles.memberDetail}>
                {t("admin:communities.detail.stat.members")}:{" "}
                {fmt.number(space.memberCount)}
              </div>
            </div>
            <AdminChip tone={TIER_CHIP_TONE[space.accessTier]}>
              {t(TIER_LABEL_KEY[space.accessTier])}
            </AdminChip>
            <FiChevronRight aria-hidden className={styles.spaceRowChevron} />
          </button>
        ))
      )}
    </div>
  );
}
