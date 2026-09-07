import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { PolicySectionId } from "./adminGovernancePolicyDraft";
import { policySectionElementId } from "./adminGovernancePolicySection.utils";
import type { AdminOverviewSectionMeta } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePolicy.module.css";

/**
 * One section of the Policy tab: a heading that says what members read, the
 * column heads for the rows under it, the rows themselves, and the footer that
 * grows the list.
 *
 * The column heads are the reason the rows can be as terse as they are: a row
 * carries no per-field label of its own at desk width, only values lined up
 * under the heads. Below 860px the heads go and each cell shows its own label
 * instead (see the stylesheet) — a control's `aria-label` is unconditional
 * either way, so neither state depends on the other for its accessible name.
 */
export function AdminGovernanceSectionCard({
  sectionId,
  title,
  sub,
  columns,
  gridColumns,
  meta,
  isActive,
  isChanged,
  hint,
  footer,
  children,
}: {
  sectionId: PolicySectionId;
  title: ReactNode;
  sub: string;
  /** Column head labels, lead column first; the actions column adds itself. */
  columns: string[];
  /** The section's `grid-template-columns`, minus the trailing actions track. */
  gridColumns: string;
  meta: AdminOverviewSectionMeta;
  isActive: boolean;
  isChanged: boolean;
  /** Explains a constraint on the whole section, e.g. where the wording lives. */
  hint?: string;
  /** The "Add a row" controls. */
  footer: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = `${policySectionElementId(sectionId)}-heading`;

  return (
    <section
      id={policySectionElementId(sectionId)}
      data-policy-section={sectionId}
      aria-labelledby={headingId}
      className={[styles.section, isActive && styles.sectionOn]
        .filter(Boolean)
        .join(" ")}
      style={{ "--cols": `${gridColumns} 86px` } as CSSProperties}
    >
      <div className={styles.sectionHead}>
        <h2 id={headingId} className={styles.sectionTitle}>
          {title}
        </h2>
        <p className={styles.sectionSub}>{sub}</p>
        <span
          className={[styles.sectionMeta, isChanged && styles.sectionMetaDirty]
            .filter(Boolean)
            .join(" ")}
        >
          {isChanged
            ? t("admin:governance.policy.section.unsaved")
            : describeLastEdit(t, format, meta)}
        </span>
      </div>

      <div className={styles.columns} aria-hidden>
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
        <span />
      </div>

      {children}

      <div className={styles.sectionFoot}>
        {footer}
        {hint && <p className={styles.sectionHint}>{hint}</p>}
      </div>
    </section>
  );
}

function describeLastEdit(
  t: ReturnType<typeof useTranslation>["t"],
  format: ReturnType<typeof useFormat>,
  meta: AdminOverviewSectionMeta,
): string {
  if (!meta.editedAt || !meta.editor) {
    return t("admin:governance.overview.badge.neverEdited");
  }
  const name = `${meta.editor.firstName} ${meta.editor.lastName}`.trim();
  return t("admin:governance.overview.badge.editedBy", {
    name,
    date: format.date(new Date(meta.editedAt)),
  });
}
