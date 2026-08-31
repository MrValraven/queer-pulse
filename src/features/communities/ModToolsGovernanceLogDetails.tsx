import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { CommunityGovernanceLogDetailsDTO } from "./api/communityGovernanceLog.api";
import {
  GOVERNANCE_FIELD_LABEL_KEYS,
  GOVERNANCE_ROLE_LABEL_KEYS,
  humanizeGovernanceKey,
} from "./communityGovernanceLog.data";
import styles from "./ModToolsGovernanceLog.module.css";

/** One rendered detail line: a label and an already-resolved value string. */
interface DetailLine {
  key: string;
  label: string;
  value: string;
}

/**
 * Turn one allowlisted detail value into something a moderator reads. Booleans
 * arrive as real booleans, a cleared field as `null` or `""`, and the list
 * fields (rules, tags, features) as arrays. Never hand anyone a bare `true`.
 */
function formatDetailValue(value: unknown, t: TFunction): string {
  if (value === null || value === undefined) {
    return t("communities:detail.modtools.history.value.notSet");
  }
  if (typeof value === "boolean") {
    return value
      ? t("communities:detail.modtools.history.value.on")
      : t("communities:detail.modtools.history.value.off");
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    return value.trim() === ""
      ? t("communities:detail.modtools.history.value.empty")
      : value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return t("communities:detail.modtools.history.value.empty");
    }
    return value.map((item) => formatDetailValue(item, t)).join(", ");
  }
  return JSON.stringify(value);
}

function roleLabel(value: string | undefined, t: TFunction): string {
  if (!value) return t("communities:detail.modtools.history.value.notSet");
  const roleKey = GOVERNANCE_ROLE_LABEL_KEYS[value];
  return roleKey ? t(roleKey) : humanizeGovernanceKey(value);
}

function fieldLabel(field: string, t: TFunction): string {
  const fieldKey = GOVERNANCE_FIELD_LABEL_KEYS[field];
  return fieldKey ? t(fieldKey) : humanizeGovernanceKey(field);
}

/** `{ from, to }` as one phrase, so a change reads as a sentence rather than
 *  as two orphaned values. */
function fromToValue(from: unknown, to: unknown, t: TFunction): string {
  return t("communities:detail.modtools.history.value.fromTo", {
    from: formatDetailValue(from, t),
    to: formatDetailValue(to, t),
  });
}

/**
 * Every detail line for one entry, in reading order: the role move, the note a
 * moderator wrote, the reason recorded, the ban's original date, the card it
 * touched, then the field-by-field settings diff.
 *
 * `isSelfRemoval` is deliberately absent here: the row says it in the summary
 * sentence, because "they left" and "they were removed" are different events
 * and a moderator reading the trail should never have to reach a detail line
 * to tell them apart.
 */
function detailLines(
  details: CommunityGovernanceLogDetailsDTO,
  t: TFunction,
  formatDate: (iso: string) => string,
): DetailLine[] {
  const lines: DetailLine[] = [];

  if (details.fromRole !== undefined || details.toRole !== undefined) {
    lines.push({
      key: "role",
      label: t("communities:detail.modtools.history.detail.role"),
      value: t("communities:detail.modtools.history.value.fromTo", {
        from: roleLabel(details.fromRole, t),
        to: roleLabel(details.toRole, t),
      }),
    });
  }

  if (details.note) {
    lines.push({
      key: "note",
      label: t("communities:detail.modtools.history.detail.note"),
      value: details.note,
    });
  }

  if (details.reason) {
    lines.push({
      key: "reason",
      label: t("communities:detail.modtools.history.detail.reason"),
      value: details.reason,
    });
  }

  if (details.bannedAt) {
    lines.push({
      key: "bannedAt",
      label: t("communities:detail.modtools.history.detail.bannedAt"),
      value: formatDate(details.bannedAt),
    });
  }

  if (details.cardSerial) {
    lines.push({
      key: "cardSerial",
      label: t("communities:detail.modtools.history.detail.cardSerial"),
      value: details.cardSerial,
    });
  }

  for (const change of details.changedSettings ?? []) {
    lines.push({
      key: `change:${change.field}`,
      label: fieldLabel(change.field, t),
      value: fromToValue(change.from, change.to, t),
    });
  }

  return lines;
}

/**
 * The legible rendering of one entry's allowlisted `details`. Renders nothing
 * when there is nothing to say beyond the action itself, which is every
 * platform action (the server sends those with an empty `details` on purpose)
 * and most lifecycle entries.
 */
export function ModToolsGovernanceLogDetails({
  details,
}: {
  details: CommunityGovernanceLogDetailsDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const lines = detailLines(details, t, (iso) => fmt.date(new Date(iso)));
  if (lines.length === 0) return null;

  return (
    <dl className={styles.details}>
      {lines.map((line) => (
        <div key={line.key} className={styles.detailRow}>
          <dt className={styles.detailLabel}>{line.label}</dt>
          <dd className={styles.detailValue}>{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}
