import { useState } from "react";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileNetwork } from "./api/useProfileNetwork";
import type {
  NetworkGroup,
  NetworkGroupKey,
} from "./api/profileNetwork.types";
import { NETWORK_GROUP_META } from "./profileNetwork.data";
import { NetworkListModal } from "./NetworkListModal";
import styles from "./ProfileNetworkStats.module.css";

/**
 * One network chip: the group's icon + its true count, wrapped in a keyboard-
 * accessible `Tooltip` that names the group. The chip is a button — clicking it
 * opens the full-list `NetworkListModal` for that group. The count is the
 * headline, so it reads the server-true `group.total` (see `useProfileNetwork`),
 * not just the loaded page length.
 */
function NetworkStatChip({
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
    <Tooltip label={title}>
      <button
        type="button"
        className={styles.chip}
        // The visible tooltip names the group; the button's own accessible name
        // must carry the group AND the count (it's the action's headline).
        aria-label={t("members:network.viewAllAria", {
          count: group.total,
          group: title,
        })}
        onClick={() => onOpen(group.key)}
      >
        <Icon aria-hidden className={styles.chipIcon} />
        <span className={styles.chipCount}>{group.total}</span>
      </button>
    </Tooltip>
  );
}

/**
 * The compact "Your network" chip row in the profile hero — a private,
 * owner-only summary of the three trust groups (Connected / You vouched for /
 * Vouched for you) as icon + count chips. Each chip opens the full people list
 * in `NetworkListModal`. Chips whose count is 0 are skipped; if all three are 0
 * (or the data is still loading) the row renders nothing, matching how the
 * sibling hero meta stays quiet until it has something to show.
 *
 * Owner-only: the caller gates this on the same self/not-previewing signal the
 * old below-hero section used, so it never shows on another member's profile.
 */
export function ProfileNetworkStats({ ownerSlug }: { ownerSlug: string }) {
  const { groups, loading } = useProfileNetwork(ownerSlug);
  const [openGroupKey, setOpenGroupKey] = useState<NetworkGroupKey | null>(null);

  const populatedGroups = groups.filter((group) => group.total > 0);

  // Render nothing while loading or when there's no network to show — the row
  // should never flash an empty shell.
  if (loading || populatedGroups.length === 0) return null;

  const openGroup =
    openGroupKey === null
      ? null
      : (groups.find((group) => group.key === openGroupKey) ?? null);

  return (
    <div className={styles.chips}>
      {populatedGroups.map((group) => (
        <NetworkStatChip
          key={group.key}
          group={group}
          onOpen={setOpenGroupKey}
        />
      ))}
      {openGroup && (
        <NetworkListModal
          group={openGroup}
          onClose={() => setOpenGroupKey(null)}
        />
      )}
    </div>
  );
}
