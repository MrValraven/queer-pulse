import { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileNetwork } from "./api/useProfileNetwork";
import type {
  NetworkGroup,
  NetworkGroupKey,
} from "./api/profileNetwork.types";
import { NETWORK_GROUP_META } from "./profileNetwork.data";
import { NetworkListModal } from "./NetworkListModal";
import { ProfileTrustModal } from "./ProfileTrustModal";
import styles from "./ProfileNetworkStats.module.css";

/**
 * One network stat: the group's true count and its name, both always
 * visible (a hover-only tooltip can't reach touch devices, and an icon alone
 * is ambiguous at a glance). The block is a button — clicking it opens the
 * full-list `NetworkListModal` for that group.
 */
function NetworkStatBlock({
  group,
  onOpen,
}: {
  group: NetworkGroup;
  onOpen: (key: NetworkGroupKey) => void;
}) {
  const { t } = useTranslation();
  const meta = NETWORK_GROUP_META[group.key];
  const Icon = meta.icon;
  const title = t(meta.titleKey);

  return (
    <button
      type="button"
      className={styles.stat}
      aria-label={t("members:network.viewAllAria", {
        count: group.total,
        group: title,
      })}
      onClick={() => onOpen(group.key)}
    >
      <span className={styles.statValue}>{group.total}</span>
      <span className={styles.statLabel}>
        <Icon aria-hidden className={styles.statIcon} />
        {title}
      </span>
    </button>
  );
}

/**
 * The profile rail's "trust & network" zone, owner-only: the three network
 * groups (Connected / You vouched for / Vouched for you) as always-labeled
 * stat blocks, each opening its full people list in `NetworkListModal`, plus
 * an info-icon trigger for `ProfileTrustModal`. This replaces the
 * old icon-only chip row *and* the separate `ProfileTrustSignals` vouch-count
 * line for a real self — that line duplicated the "Vouched for you" count
 * here once the two counts were reconciled (see `useProfileNetwork`'s
 * `receivedPeople`), so a visiting `ProfileRail` renders `ProfileTrustSignals`
 * instead of this component, and a real self renders this instead of that.
 *
 * A count of 0 is shown, not hidden — honesty over a tidier-looking row, the
 * same reasoning `ProfileTrustSignals` used for "0 vouches".
 */
export function ProfileNetworkStats({ ownerSlug }: { ownerSlug: string }) {
  const { t } = useTranslation();
  const { groups, loading } = useProfileNetwork(ownerSlug);
  const [openGroupKey, setOpenGroupKey] = useState<NetworkGroupKey | null>(
    null,
  );
  const [explainerOpen, setExplainerOpen] = useState(false);

  // Render nothing while loading — the row should never flash an empty shell.
  if (loading) return null;

  const openGroup =
    openGroupKey === null
      ? null
      : (groups.find((group) => group.key === openGroupKey) ?? null);

  return (
    <div className={styles.zone}>
      <div className={styles.zoneHead}>
        <span className={styles.zoneTitle}>
          {t("members:profile.trust.modalTitle")}
        </span>
        <Tooltip label={t("members:profile.trust.modalTitle")}>
          <button
            type="button"
            className={styles.explain}
            aria-label={t("members:profile.trust.modalTitle")}
            onClick={() => setExplainerOpen(true)}
          >
            <FiInfo aria-hidden />
          </button>
        </Tooltip>
      </div>
      <div className={styles.stats}>
        {groups.map((group) => (
          <NetworkStatBlock
            key={group.key}
            group={group}
            onOpen={setOpenGroupKey}
          />
        ))}
      </div>
      {openGroup && (
        <NetworkListModal
          group={openGroup}
          onClose={() => setOpenGroupKey(null)}
        />
      )}
      {explainerOpen && (
        <ProfileTrustModal onClose={() => setExplainerOpen(false)} />
      )}
    </div>
  );
}
