import { Fragment } from "react";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiChevronsLeft,
  FiChevronsRight,
  FiClock,
  FiCompass,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { PolicySectionId } from "./adminGovernancePolicyDraft";
import type { AdminOverviewMeta } from "./api/adminGovernanceOverview.api";
import { POLICY_SECTION_IDS } from "./adminGovernancePolicyDraft";
import styles from "./AdminGovernancePolicy.module.css";

/** The mark each section wears once the rail is folded to icons. The rail's
 * names then live in the tooltip beside them. */
const SECTION_ICONS: Record<PolicySectionId, IconType> = {
  health: FiActivity,
  moderationSteps: FiShield,
  council: FiUsers,
  principles: FiCompass,
  decisions: FiClock,
};

export interface PolicyRailSection {
  id: PolicySectionId;
  rowCount: number;
  isChanged: boolean;
}

/**
 * The section rail: five jump links that double as the draft's status at a
 * glance. A clean section shows how many rows it holds; a section with unsaved
 * rows trades that count for an accent dot, with the word behind it for anyone
 * who cannot see a 7px circle.
 */
export function AdminGovernancePolicyRail({
  sections,
  activeSectionId,
  isCollapsed,
  onToggleCollapse,
  onJump,
  meta,
}: {
  sections: PolicyRailSection[];
  activeSectionId: PolicySectionId;
  /** Folded to icons, so the editors beside it get the width back. */
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onJump: (sectionId: PolicySectionId) => void;
  meta: AdminOverviewMeta;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const lastEdit = mostRecentEdit(meta);
  const toggleLabel = isCollapsed
    ? t("admin:governance.policy.rail.expand")
    : t("admin:governance.policy.rail.collapse");

  return (
    <nav
      className={[styles.rail, isCollapsed && styles.railCollapsed]
        .filter(Boolean)
        .join(" ")}
      aria-label={t("admin:governance.policy.rail.label")}
    >
      <div className={styles.railTop}>
        <h2 className={isCollapsed ? "visuallyHidden" : styles.railHead}>
          {t("admin:governance.policy.rail.head")}
        </h2>
        <button
          type="button"
          className={styles.railToggle}
          onClick={onToggleCollapse}
          aria-label={toggleLabel}
          title={toggleLabel}
        >
          {isCollapsed ? (
            <FiChevronsRight aria-hidden />
          ) : (
            <FiChevronsLeft aria-hidden />
          )}
        </button>
      </div>

      {sections.map((section) => {
        const label = t(`admin:governance.policy.section.${section.id}`);
        const SectionIcon = SECTION_ICONS[section.id];
        const item = (
          <button
            type="button"
            className={[
              styles.railItem,
              isCollapsed && styles.railItemIcon,
              section.id === activeSectionId && styles.railItemOn,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={section.id === activeSectionId ? "true" : undefined}
            onClick={() => onJump(section.id)}
          >
            {isCollapsed && <SectionIcon aria-hidden />}
            <span className={isCollapsed ? "visuallyHidden" : undefined}>
              {label}
            </span>
            {section.isChanged ? (
              <span
                className={
                  isCollapsed ? styles.railCountIcon : styles.railCount
                }
              >
                <span className={styles.railDot} aria-hidden />
                <span className="visuallyHidden">
                  {t("admin:governance.policy.rail.changed")}
                </span>
              </span>
            ) : (
              <span
                className={isCollapsed ? "visuallyHidden" : styles.railCount}
              >
                {t("admin:governance.policy.rail.rowCount", {
                  count: section.rowCount,
                })}
              </span>
            )}
          </button>
        );

        return isCollapsed ? (
          <Tooltip key={section.id} label={label} placement="right">
            {item}
          </Tooltip>
        ) : (
          <Fragment key={section.id}>{item}</Fragment>
        );
      })}
      {!isCollapsed && (
        <div className={styles.railFoot}>
          <b>{t("admin:governance.policy.rail.lastEdit")}</b>
          {lastEdit
            ? t("admin:governance.policy.rail.lastEditValue", {
                name: lastEdit.name,
                date: format.date(new Date(lastEdit.editedAt)),
              })
            : t("admin:governance.overview.badge.neverEdited")}
        </div>
      )}
    </nav>
  );
}

/** The most recent edit across all five sections, for the rail's footer. */
function mostRecentEdit(
  meta: AdminOverviewMeta,
): { name: string; editedAt: string } | null {
  let latest: { name: string; editedAt: string } | null = null;
  for (const sectionId of POLICY_SECTION_IDS) {
    const sectionMeta = meta[sectionId];
    if (!sectionMeta.editedAt || !sectionMeta.editor) continue;
    if (latest && latest.editedAt >= sectionMeta.editedAt) continue;
    latest = {
      name: `${sectionMeta.editor.firstName} ${sectionMeta.editor.lastName}`.trim(),
      editedAt: sectionMeta.editedAt,
    };
  }
  return latest;
}
