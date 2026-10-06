import { useId, type RefObject } from "react";
import { FiAlertCircle, FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar } from "./ui";
import { useDemoPortrait } from "./useDemoPortrait";
import type { StaffRoleId } from "./staffRoles.registry";
import {
  staffFullName,
  staffInitials,
  type StaffGrantCoverage,
} from "./adminStaffRoster.utils";
import styles from "./AdminStaffCoverage.module.css";

/** How many faces a coverage card shows before it folds the rest into "+N". */
const MAX_STACKED_AVATARS = 4;

/**
 * One card per staff grant, in registry order: what the grant covers and who
 * holds it today. A grant with no active holder is called out in amber,
 * since work in that domain has nobody to pick it up. Each card toggles the
 * roster's grant filter.
 */
export function AdminStaffCoverage({
  coverage,
  activeGrant,
  onToggleGrant,
  headingRef,
}: {
  coverage: StaffGrantCoverage[];
  activeGrant: StaffRoleId | null;
  onToggleGrant: (grant: StaffRoleId) => void;
  /** The uncovered summary tile scrolls to this heading and focuses it. */
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.panelHead}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={styles.panelTitle}
        >
          {t("admin:staff.coverage.heading")}
        </h2>
        <p className={styles.panelSub}>{t("admin:staff.coverage.sub")}</p>
      </div>
      <ul className={styles.grid}>
        {coverage.map((entry) => (
          <li key={entry.role.id} className={styles.gridItem}>
            <CoverageCard
              entry={entry}
              isActive={activeGrant === entry.role.id}
              onToggle={() => onToggleGrant(entry.role.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CoverageCard({
  entry,
  isActive,
  onToggle,
}: {
  entry: StaffGrantCoverage;
  isActive: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const demoPortrait = useDemoPortrait();
  const holderCount = entry.activeHolders.length;
  const isUncovered = holderCount === 0;
  const stackedHolders = entry.activeHolders.slice(0, MAX_STACKED_AVATARS);
  const overflowCount = holderCount - stackedHolders.length;

  return (
    <button
      type="button"
      className={[
        styles.card,
        isUncovered && styles.cardUncovered,
        isActive && styles.cardActive,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={isActive}
      onClick={onToggle}
    >
      <span className={styles.cardTop}>
        <span className={styles.cardTitle}>{t(entry.role.labelKey)}</span>
        {isActive && (
          <span className={styles.cardCheck} aria-hidden>
            <FiCheck />
          </span>
        )}
      </span>
      <span className={styles.cardDesc}>{t(entry.role.descriptionKey)}</span>
      {entry.inactiveHolderCount > 0 && (
        <span className={styles.inactive}>
          {t("admin:staff.coverage.inactive", {
            count: entry.inactiveHolderCount,
          })}
        </span>
      )}
      <span className={styles.cardFoot}>
        {isUncovered ? (
          <span className={styles.nobody}>
            <FiAlertCircle aria-hidden className={styles.nobodyIcon} />
            {t("admin:staff.coverage.nobody")}
          </span>
        ) : (
          <>
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
            <span className={styles.count}>
              {t("admin:staff.coverage.holders", { count: holderCount })}
            </span>
          </>
        )}
      </span>
    </button>
  );
}
