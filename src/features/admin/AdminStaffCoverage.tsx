import { useId, type RefObject } from "react";
import { Collapse } from "../../shared/components/ui/Collapse";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar, AdminPanel, AdminStat, AdminStatTiles } from "./ui";
import { useDemoPortrait } from "./useDemoPortrait";
import type { StaffRoleId } from "./staffRoles.registry";
import {
  staffFullName,
  staffInitials,
  type StaffGrantCoverage,
} from "./adminStaffRoster.utils";
import styles from "./AdminStaffCoverage.module.css";

/** How many faces a coverage tile shows before it folds the rest into "+N". */
const MAX_STACKED_AVATARS = 4;

/**
 * One pressable stat tile per staff grant, in registry order: how many people
 * hold it today, what it covers and who they are. A grant with no active
 * holder is called out in amber, since work in that domain has nobody to pick
 * it up. Each tile toggles the roster's grant filter. The tiles fold away by
 * default: the header's summary line says how many grants need a holder, and
 * the roster stays above the fold.
 */
export function AdminStaffCoverage({
  coverage,
  activeGrant,
  onToggleGrant,
  headingRef,
  isOpen,
  onToggleOpen,
  uncoveredCount,
}: {
  coverage: StaffGrantCoverage[];
  activeGrant: StaffRoleId | null;
  onToggleGrant: (grant: StaffRoleId) => void;
  /** The uncovered summary tile scrolls to this heading and focuses it. */
  headingRef: RefObject<HTMLHeadingElement | null>;
  isOpen: boolean;
  onToggleOpen: () => void;
  uncoveredCount: number;
}) {
  const { t } = useTranslation();
  const tilesId = useId();

  return (
    <AdminPanel
      titleRef={headingRef}
      isTitleFocusable
      className={[styles.panel, !isOpen && styles.isClosed]
        .filter(Boolean)
        .join(" ")}
      title={t("admin:staff.coverage.heading")}
      description={
        uncoveredCount > 0
          ? t("admin:staff.coverage.summary", {
              covered: coverage.length - uncoveredCount,
              total: coverage.length,
              count: uncoveredCount,
            })
          : t("admin:staff.summary.uncoveredHintNone")
      }
      actions={
        <Button
          variant="quiet"
          size="sm"
          aria-expanded={isOpen}
          aria-controls={tilesId}
          onClick={onToggleOpen}
        >
          {isOpen
            ? t("admin:staff.coverage.hide")
            : t("admin:staff.coverage.show", { total: coverage.length })}
        </Button>
      }
      padding="flush"
      bodyClassName={styles.body}
    >
      <Collapse isOpen={isOpen}>
        <div id={tilesId} className={styles.tiles}>
          <AdminStatTiles label={t("admin:staff.coverage.heading")}>
            {coverage.map((entry) => (
              <CoverageTile
                key={entry.role.id}
                entry={entry}
                isActive={activeGrant === entry.role.id}
                onToggle={() => onToggleGrant(entry.role.id)}
              />
            ))}
          </AdminStatTiles>
        </div>
      </Collapse>
    </AdminPanel>
  );
}

function CoverageHint({ entry }: { entry: StaffGrantCoverage }) {
  const { t } = useTranslation();
  const demoPortrait = useDemoPortrait();
  const stackedHolders = entry.activeHolders.slice(0, MAX_STACKED_AVATARS);
  const overflowCount = entry.activeHolders.length - stackedHolders.length;

  return (
    <>
      <span className={styles.description}>{t(entry.role.descriptionKey)}</span>
      {entry.inactiveHolderCount > 0 && (
        <span className={styles.inactive}>
          {t("admin:staff.coverage.inactive", {
            count: entry.inactiveHolderCount,
          })}
        </span>
      )}
      {stackedHolders.length > 0 && (
        <span className={styles.stack} aria-hidden>
          {stackedHolders.map((holder) => (
            <AdminAvatar
              key={holder.id}
              className={styles.stackAvatar}
              size="sm"
              tone="jade"
              initials={staffInitials(holder)}
              alt=""
              src={holder.avatarUrl ?? demoPortrait(staffFullName(holder))}
            />
          ))}
          {overflowCount > 0 && (
            <span className={styles.stackMore}>
              {t("admin:staff.coverage.more", { count: overflowCount })}
            </span>
          )}
        </span>
      )}
    </>
  );
}

function CoverageTile({
  entry,
  isActive,
  onToggle,
}: {
  entry: StaffGrantCoverage;
  isActive: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const holderCount = entry.activeHolders.length;
  const isUncovered = holderCount === 0;

  return (
    <AdminStat
      label={t(entry.role.labelKey)}
      value={t("admin:staff.coverage.holders", { count: holderCount })}
      tone={isUncovered ? "warn" : "default"}
      delta={
        isUncovered
          ? { tone: "warn", text: t("admin:staff.coverage.nobody") }
          : undefined
      }
      hint={<CoverageHint entry={entry} />}
      isPressed={isActive}
      onClick={onToggle}
    />
  );
}
