import { useId } from "react";
import { FiAlertTriangle, FiCheck, FiCheckCircle } from "react-icons/fi";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StaffRosterSummary,
  StaffTier,
  StaffTierFilter,
} from "./adminStaffRoster.utils";
import styles from "./AdminStaffPage.module.css";

interface TierTile {
  tier: StaffTier;
  count: number;
  labelKey: string;
  hintKey: string;
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
    },
    {
      tier: "moderator",
      count: summary.moderatorCount,
      labelKey: "admin:staff.summary.moderators",
      hintKey: "admin:staff.summary.moderatorsHint",
    },
    {
      tier: "member",
      count: summary.grantHolderCount,
      labelKey: "admin:staff.summary.grantHolders",
      hintKey: "admin:staff.summary.grantHoldersHint",
    },
  ];
  const hasUncovered = summary.uncoveredGrantCount > 0;
  const headingId = useId();

  return (
    <section className={styles.summary} aria-labelledby={headingId}>
      <h2 id={headingId} className="visuallyHidden">
        {t("admin:staff.summary.heading")}
      </h2>
      {tierTiles.map((tile) => {
        const isPressed = activeTier === tile.tier;
        return (
          <button
            key={tile.tier}
            type="button"
            className={styles.tile}
            aria-pressed={isPressed}
            onClick={() => onPickTier(tile.tier)}
          >
            <span className={styles.tileTop}>
              <span className={styles.tileLabel}>{t(tile.labelKey)}</span>
              {isPressed && (
                <span className={styles.tileCheck} aria-hidden>
                  <FiCheck />
                </span>
              )}
            </span>
            <RollingNumber
              className={styles.tileValue}
              value={String(tile.count)}
              numericValue={tile.count}
            />
            <span className={styles.tileHint}>{t(tile.hintKey)}</span>
          </button>
        );
      })}
      <button
        type="button"
        className={`${styles.tile} ${hasUncovered ? styles.tileWarn : styles.tileCalm}`}
        onClick={onShowUncovered}
      >
        <span className={styles.tileTop}>
          <span className={styles.tileLabel}>
            {t("admin:staff.summary.uncovered")}
          </span>
        </span>
        <RollingNumber
          className={styles.tileValue}
          value={String(summary.uncoveredGrantCount)}
          numericValue={summary.uncoveredGrantCount}
        />
        <span className={styles.tileHint}>
          {hasUncovered ? (
            <FiAlertTriangle aria-hidden className={styles.tileHintIcon} />
          ) : (
            <FiCheckCircle aria-hidden className={styles.tileHintIcon} />
          )}
          {hasUncovered
            ? t("admin:staff.summary.uncoveredHint")
            : t("admin:staff.summary.uncoveredHintNone")}
        </span>
      </button>
    </section>
  );
}
