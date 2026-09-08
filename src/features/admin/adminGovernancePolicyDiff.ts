import type { TFunction } from "../../shared/i18n/types";
import {
  POLICY_SECTION_IDS,
  type PolicyDraft,
  type PolicySectionId,
} from "./adminGovernancePolicyDraft";
import { trendTakesCount } from "./adminGovernanceHealthFields.utils";
import type {
  AuthoredTextDTO,
  CouncilSeatDTO,
  DecisionDTO,
  HealthStatDTO,
  ModerationStepDTO,
  PrincipleDTO,
} from "./api/adminGovernanceOverview.api";

/**
 * The difference between the draft and what members can read right now,
 * described in the words the admin console uses rather than in field names.
 *
 * This is what the "Review changes" sheet shows and what the sticky bar counts,
 * from one function, so the number on the bar and the list in the sheet can
 * never disagree.
 */

/** One field's before/after, or a whole row appearing or disappearing. */
export interface PolicyDiffEntry {
  /** e.g. "Row 2 · Figure", already assembled and translated. */
  label: string;
  /** `null` when the row is new: there was nothing before it. */
  before: string | null;
  /** `null` when the row was removed. */
  after: string | null;
}

export interface PolicyDiffGroup {
  sectionId: PolicySectionId;
  /** The section's plain name, with no markup, for a list heading. */
  title: string;
  entries: PolicyDiffEntry[];
}

/** One comparable field of one row: what it is called, and what it says. */
interface RowField {
  label: string;
  value: string;
}

function authoredFields(
  translate: TFunction,
  label: string,
  text: AuthoredTextDTO | undefined,
): RowField[] {
  return [
    {
      label: translate("admin:governance.overview.edit.textEn", { label }),
      value: text?.en ?? "",
    },
    {
      label: translate("admin:governance.overview.edit.textPt", { label }),
      value: text?.pt ?? "",
    },
  ];
}

function healthFields(translate: TFunction, row: HealthStatDTO): RowField[] {
  const fields: RowField[] = [
    {
      label: translate("admin:governance.policy.field.stat"),
      value: translate(`admin:governance.overview.health.stat.${row.key}`),
    },
    {
      label: translate("admin:governance.overview.health.field.value"),
      value: row.n,
    },
    {
      label: translate("admin:governance.overview.health.field.trend"),
      value: translate(
        `admin:governance.overview.health.trend.${row.trendKey}`,
      ),
    },
  ];
  if (trendTakesCount(row.trendKey)) {
    fields.push({
      label: translate("admin:governance.overview.health.field.trendCount"),
      value: row.trendCount == null ? "" : String(row.trendCount),
    });
  }
  fields.push({
    label: translate("admin:governance.overview.health.field.up"),
    value: translate(
      row.up
        ? "admin:governance.overview.health.field.upOn"
        : "admin:governance.overview.health.field.upOff",
    ),
  });
  return fields;
}

function moderationFields(
  translate: TFunction,
  row: ModerationStepDTO,
): RowField[] {
  return [
    {
      label: translate("admin:governance.policy.field.step"),
      value: translate(`admin:governance.overview.moderation.step.${row.key}`),
    },
  ];
}

function councilFields(translate: TFunction, row: CouncilSeatDTO): RowField[] {
  const roleLabel = translate("admin:governance.overview.council.field.role");
  return [
    {
      label: translate("admin:governance.overview.council.field.member"),
      // The person, when the seat has one it can resolve. A seat whose holder
      // no longer resolves shows the id it stores, so a diff that removes them
      // still says which row moved rather than reading as an empty change.
      value: row.member
        ? `${row.member.firstName} ${row.member.lastName}`.trim()
        : row.memberId ||
          translate("admin:governance.overview.council.newSeat"),
    },
    ...(row.roleKey
      ? [
          {
            label: roleLabel,
            value: translate(
              `admin:governance.overview.council.role.${row.roleKey}`,
            ),
          },
        ]
      : authoredFields(translate, roleLabel, row.role)),
    {
      label: translate("admin:governance.overview.council.field.tint"),
      value: translate(`admin:governance.overview.council.tint.${row.tint}`),
    },
  ];
}

function principleFields(translate: TFunction, row: PrincipleDTO): RowField[] {
  const iconField: RowField = {
    label: translate("admin:governance.overview.principles.field.icon"),
    value: translate(`admin:governance.overview.principles.icon.${row.icon}`),
  };
  if (row.key) {
    return [
      {
        label: translate("admin:governance.policy.field.entry"),
        value: translate(`admin:governance.overview.principles.key.${row.key}`),
      },
      iconField,
    ];
  }
  return [
    ...authoredFields(
      translate,
      translate("admin:governance.overview.principles.field.titleText"),
      row.title,
    ),
    ...authoredFields(
      translate,
      translate("admin:governance.overview.principles.field.bodyText"),
      row.text,
    ),
    iconField,
  ];
}

function decisionFields(translate: TFunction, row: DecisionDTO): RowField[] {
  if (row.key) {
    return [
      {
        label: translate("admin:governance.policy.field.entry"),
        value: translate(`admin:governance.overview.decisions.key.${row.key}`),
      },
    ];
  }
  return [
    ...authoredFields(
      translate,
      translate("admin:governance.overview.decisions.field.lead"),
      row.lead,
    ),
    ...authoredFields(
      translate,
      translate("admin:governance.overview.decisions.field.body"),
      row.body,
    ),
  ];
}

/** Every comparable field of one row, in the order they read on screen. */
function describeRow(
  translate: TFunction,
  sectionId: PolicySectionId,
  row: unknown,
): RowField[] {
  if (sectionId === "health")
    return healthFields(translate, row as HealthStatDTO);
  if (sectionId === "moderationSteps") {
    return moderationFields(translate, row as ModerationStepDTO);
  }
  if (sectionId === "council")
    return councilFields(translate, row as CouncilSeatDTO);
  if (sectionId === "principles") {
    return principleFields(translate, row as PrincipleDTO);
  }
  return decisionFields(translate, row as DecisionDTO);
}

/** A row named by its first field, so a diff line says which row it is. */
function summariseRow(fields: RowField[], emptyText: string): string {
  return fields.find((field) => field.value.trim())?.value.trim() ?? emptyText;
}

function diffSection(
  translate: TFunction,
  sectionId: PolicySectionId,
  publishedRows: unknown[],
  draftRows: unknown[],
): PolicyDiffEntry[] {
  const entries: PolicyDiffEntry[] = [];
  const emptyText = translate("admin:governance.policy.diff.empty");

  for (
    let index = 0;
    index < Math.max(publishedRows.length, draftRows.length);
    index += 1
  ) {
    const rowLabel = translate("admin:governance.policy.diff.row", {
      index: index + 1,
    });
    const publishedRow = publishedRows[index];
    const draftRow = draftRows[index];

    if (publishedRow === undefined) {
      entries.push({
        label: rowLabel,
        before: null,
        after: summariseRow(
          describeRow(translate, sectionId, draftRow),
          emptyText,
        ),
      });
      continue;
    }
    if (draftRow === undefined) {
      entries.push({
        label: rowLabel,
        before: summariseRow(
          describeRow(translate, sectionId, publishedRow),
          emptyText,
        ),
        after: null,
      });
      continue;
    }

    const publishedFields = describeRow(translate, sectionId, publishedRow);
    const draftFields = describeRow(translate, sectionId, draftRow);
    // A seeded row swapped for an authored one (or a trend line that gains a
    // number) changes which fields exist, so pair them by label rather than by
    // position, and treat a field that only one side has as a change.
    const labels = [
      ...new Set([
        ...publishedFields.map((field) => field.label),
        ...draftFields.map((field) => field.label),
      ]),
    ];
    for (const label of labels) {
      const before =
        publishedFields.find((field) => field.label === label)?.value ?? "";
      const after =
        draftFields.find((field) => field.label === label)?.value ?? "";
      if (before === after) continue;
      entries.push({
        label: `${rowLabel} · ${label}`,
        before: before.trim() || emptyText,
        after: after.trim() || emptyText,
      });
    }
  }
  return entries;
}

export function buildPolicyDiff(
  translate: TFunction,
  published: PolicyDraft,
  draft: PolicyDraft,
): PolicyDiffGroup[] {
  const groups: PolicyDiffGroup[] = [];
  for (const sectionId of POLICY_SECTION_IDS) {
    const entries = diffSection(
      translate,
      sectionId,
      published[sectionId],
      draft[sectionId],
    );
    if (entries.length === 0) continue;
    groups.push({
      sectionId,
      title: translate(`admin:governance.policy.section.${sectionId}`),
      entries,
    });
  }
  return groups;
}

export function countPolicyDiff(groups: PolicyDiffGroup[]): number {
  return groups.reduce((total, group) => total + group.entries.length, 0);
}
