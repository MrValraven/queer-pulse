import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import {
  GOVERNANCE_FIELD_KEYS,
  GOVERNANCE_ROLE_KEYS,
  HANDLED_METADATA_KEYS,
  humanizeMetadataKey,
} from "./adminCommunityGovernanceLog.data";
import styles from "./AdminCommunityGovernanceLog.module.css";

/** One rendered metadata line: a label and an already-resolved value string. */
interface MetadataLine {
  key: string;
  label: string;
  value: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Turn one raw metadata value into something a human reads. Booleans arrive as
 * real booleans, a cleared field as `null` or `""`, array fields (rules, tags,
 * features) as arrays. Never hand an admin a bare `true` or `null`.
 */
function formatMetadataValue(value: unknown, t: TFunction): string {
  if (value === null || value === undefined) {
    return t("admin:communities.governanceLog.meta.notSet");
  }
  if (typeof value === "boolean") {
    return value
      ? t("admin:communities.governanceLog.meta.on")
      : t("admin:communities.governanceLog.meta.off");
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    return value.trim() === ""
      ? t("admin:communities.governanceLog.meta.empty")
      : value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return t("admin:communities.governanceLog.meta.empty");
    }
    return value.map((item) => formatMetadataValue(item, t)).join(", ");
  }
  return JSON.stringify(value);
}

function roleLabel(value: unknown, t: TFunction): string {
  if (typeof value !== "string") return formatMetadataValue(value, t);
  const roleKey = GOVERNANCE_ROLE_KEYS[value];
  return roleKey ? t(`admin:${roleKey}`) : humanizeMetadataKey(value);
}

function fieldLabel(field: string, t: TFunction): string {
  const fieldKey = GOVERNANCE_FIELD_KEYS[field];
  return fieldKey ? t(`admin:${fieldKey}`) : humanizeMetadataKey(field);
}

/** `{ from, to }` rendered as one readable phrase, so the change reads as a
 *  sentence rather than as two orphaned values. */
function fromToValue(from: unknown, to: unknown, t: TFunction): string {
  return t("admin:communities.governanceLog.meta.fromTo", {
    from: formatMetadataValue(from, t),
    to: formatMetadataValue(to, t),
  });
}

/**
 * Every metadata line for one entry, in reading order: the role move, the
 * recorded reason, the field-by-field settings diff, then anything the
 * frontend has no dedicated line for yet (a new server-written key), so a
 * future addition surfaces humanized instead of vanishing.
 *
 * `adminOverride` is deliberately absent — the row renders it as a chip, since
 * platform staff overriding a community's own owner is the single fact an
 * admin scanning this trail most needs to spot.
 */
function metadataLines(
  metadata: Record<string, unknown>,
  t: TFunction,
): MetadataLine[] {
  const lines: MetadataLine[] = [];

  if ("fromRole" in metadata || "toRole" in metadata) {
    lines.push({
      key: "role",
      label: t("admin:communities.governanceLog.meta.roleLabel"),
      value: t("admin:communities.governanceLog.meta.fromTo", {
        from: roleLabel(metadata.fromRole, t),
        to: roleLabel(metadata.toRole, t),
      }),
    });
  }

  if (typeof metadata.reason === "string" && metadata.reason.trim() !== "") {
    lines.push({
      key: "reason",
      label: t("admin:communities.governanceLog.meta.reasonLabel"),
      value: metadata.reason,
    });
  }

  if (isRecord(metadata.changes)) {
    for (const [field, change] of Object.entries(metadata.changes)) {
      lines.push({
        key: `change:${field}`,
        label: fieldLabel(field, t),
        value: isRecord(change)
          ? fromToValue(change.from, change.to, t)
          : formatMetadataValue(change, t),
      });
    }
  }

  for (const [key, value] of Object.entries(metadata)) {
    if (HANDLED_METADATA_KEYS.has(key)) continue;
    lines.push({
      key: `other:${key}`,
      label: humanizeMetadataKey(key),
      value: formatMetadataValue(value, t),
    });
  }

  return lines;
}

/** The legible rendering of one entry's free-form `metadata`. Renders nothing
 *  when there is nothing to say beyond the action itself. */
export function AdminCommunityGovernanceLogMeta({
  metadata,
}: {
  metadata: Record<string, unknown> | null;
}) {
  const { t } = useTranslation();
  if (!metadata) return null;

  const lines = metadataLines(metadata, t);
  if (lines.length === 0) return null;

  return (
    <dl className={styles.meta}>
      {lines.map((line) => (
        <div key={line.key} className={styles.metaRow}>
          <dt className={styles.metaLabel}>{line.label}</dt>
          <dd className={styles.metaValue}>{line.value}</dd>
        </div>
      ))}
    </dl>
  );
}
