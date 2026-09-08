import type { Dispatch, SetStateAction } from "react";
import type { PolicySectionId } from "./adminGovernancePolicyDraft";
import type { AdminOverviewSectionMeta } from "./api/adminGovernanceOverview.api";

/**
 * The bits every Policy-tab section editor shares.
 *
 * They live here rather than beside a component so each component file exports
 * only components (react-refresh), matching `adminGovernanceHealthFields.utils`
 * and `overviewEditorRow.utils` alongside them.
 */

/** The DOM id of a section card, used by the rail's jump links, the scroll spy
 *  and the preview, so all three address the same element. */
export function policySectionElementId(sectionId: PolicySectionId): string {
  return `policy-section-${sectionId}`;
}

/** True when this row differs from the one members can read at that position. */
export function isPolicyRowChanged(
  row: unknown,
  publishedRow: unknown,
): boolean {
  return JSON.stringify(row) !== JSON.stringify(publishedRow ?? null);
}

/** What every section editor is handed: its slice of the page-level draft, the
 *  published rows to diff against, and where it sits in the page. */
export interface PolicyEditorProps<Row> {
  rows: Row[];
  /** The same section as members can read it right now. */
  publishedRows: Row[];
  setRows: Dispatch<SetStateAction<Row[]>>;
  meta: AdminOverviewSectionMeta;
  isActive: boolean;
  isChanged: boolean;
}
