import { FiKey, FiShield, FiUserCheck, FiUserMinus } from "react-icons/fi";
import type { IconType } from "react-icons";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminStat, AdminStatTiles } from "./ui";
import type {
  StaffRosterSummary,
  StaffTier,
  StaffTierFilter,
} from "./adminStaffRoster.utils";

interface TierTile {
  tier: StaffTier;
  count: number;
  labelKey: string;
  hintKey: string;
  icon: IconType;
}

/**
 * Four stat tiles across the top. The three tier tiles double as shortcuts
 * for the roster's tier filter (pressed while it is applied); the uncovered
 * tile reads as a warning while any grant has no active holder, and takes the
 * admin to the coverage panel that names them.
 */
export function AdminStaffSummary({
  summary,
  activeTier,
  onPickTier,
  onShowUncovered,
}: {
  summary: StaffRosterSummary;
  activeTier: StaffTierFilter;
  onPickTier: (tier: StaffTier) => void;
  onShowUncovered: () => void;
}) {
  const { t } = useTranslation();
  const tierTiles: TierTile[] = [
    {
      tier: "admin",
      count: summary.adminCount,
      labelKey: "admin:staff.summary.admins",
      hintKey: "admin:staff.summary.adminsHint",
      icon: FiShield,
    },
    {
      tier: "moderator",
      count: summary.moderatorCount,
      labelKey: "admin:staff.summary.moderators",
      hintKey: "admin:staff.summary.moderatorsHint",
      icon: FiUserCheck,
    },
    {
      tier: "member",
      count: summary.grantHolderCount,
      labelKey: "admin:staff.summary.grantHolders",
      hintKey: "admin:staff.summary.grantHoldersHint",
      icon: FiKey,
    },
  ];
  const hasUncovered = summary.uncoveredGrantCount > 0;

  return (
    <AdminStatTiles label={t("admin:staff.summary.heading")}>
      {tierTiles.map((tile) => (
        <AdminStat
          key={tile.tier}
          icon={tile.icon}
          label={t(tile.labelKey)}
          value={
            <RollingNumber
              value={String(tile.count)}
              numericValue={tile.count}
            />
          }
          hint={t(tile.hintKey)}
          isPressed={activeTier === tile.tier}
          onClick={() => onPickTier(tile.tier)}
        />
      ))}
      <AdminStat
        icon={FiUserMinus}
        label={t("admin:staff.summary.uncovered")}
        value={
          <RollingNumber
            value={String(summary.uncoveredGrantCount)}
            numericValue={summary.uncoveredGrantCount}
          />
        }
        tone={hasUncovered ? "warn" : "default"}
        delta={
          hasUncovered
            ? { tone: "warn", text: t("admin:staff.summary.uncoveredHint") }
            : undefined
        }
        hint={
          hasUncovered ? undefined : t("admin:staff.summary.uncoveredHintNone")
        }
        onClick={onShowUncovered}
      />
    </AdminStatTiles>
  );
}
