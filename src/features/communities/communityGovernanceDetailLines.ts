import type { TFunction } from "../../shared/i18n/types";
import { diffStringLists, isStringList } from "../../shared/lib/stringListDiff";
import type { CommunityGovernanceLogDetailsDTO } from "./api/communityGovernanceLog.api";
import {
  GOVERNANCE_FIELD_LABEL_KEYS,
  GOVERNANCE_ROLE_LABEL_KEYS,
  humanizeGovernanceKey,
} from "./communityGovernanceLog.data";
import {
  GOVERNANCE_BADGE_FIELD_LABEL_KEYS,
  badgeDetailLines,
  badgeSettingValue,
} from "./communityGovernanceBadgeDetails";

/** One rendered detail line: a label and an already-resolved value string. */
export interface DetailLine {
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

function fieldLabel(field: string, t: TFunction, isBadgeEdit: boolean): string {
  const fieldKey = isBadgeEdit
    ? GOVERNANCE_BADGE_FIELD_LABEL_KEYS[field]
    : GOVERNANCE_FIELD_LABEL_KEYS[field];
  return fieldKey ? t(fieldKey) : humanizeGovernanceKey(field);
}

/** `{ from, to }` as one phrase, so a change reads as one sentence. */
function fromToValue(from: unknown, to: unknown, t: TFunction): string {
  return t("communities:detail.modtools.history.value.fromTo", {
    from: formatDetailValue(from, t),
    to: formatDetailValue(to, t),
  });
}

/**
 * A list field (`rules`, `tags`, `features`, `languages`) as what entered and
 * what left, so the whole list is never printed twice.
 *
 * A community holding a dozen shared values used to render an edit as both
 * lists side by side, and the one fact a moderator opened the trail for, which
 * value was added, was the hardest thing in the row to find. A reorder is
 * called out by name: the server diffs arrays by index, so moving one value up
 * writes a real entry with nothing added and nothing removed, and saying
 * nothing there would leave that row unexplained.
 */
function listChangeValue(from: string[], to: string[], t: TFunction): string {
  const { added, removed, isReordered } = diffStringLists(from, to);
  const phrases: string[] = [];
  if (added.length > 0) {
    phrases.push(
      t("communities:detail.modtools.history.value.added", {
        values: added.join("; "),
      }),
    );
  }
  if (removed.length > 0) {
    phrases.push(
      t("communities:detail.modtools.history.value.removed", {
        values: removed.join("; "),
      }),
    );
  }
  if (isReordered) {
    phrases.push(t("communities:detail.modtools.history.value.reordered"));
  }
  return phrases.join(" ");
}

/** How one changed setting reads: list fields as a delta, everything else as
 *  the before and after it has always been. */
function settingChangeValue(from: unknown, to: unknown, t: TFunction): string {
  return isStringList(from) && isStringList(to)
    ? listChangeValue(from, to, t)
    : fromToValue(from, to, t);
}

/**
 * Every detail line for one entry, in reading order: the badge and gift
 * lines, the role move, the note a moderator wrote, the reason recorded, the
 * ban's original date, the card it touched, then the field-by-field settings
 * diff. A gift entry never shows a note line: a gift's private note stays
 * between sender and recipient.
 *
 * `isSelfRemoval` is deliberately absent here: the row says it in the summary
 * sentence, because "they left" and "they were removed" are different events
 * and a moderator reading the trail should never have to reach a detail line
 * to tell them apart.
 */
export function detailLines(
  action: string,
  details: CommunityGovernanceLogDetailsDTO,
  t: TFunction,
  formatDate: (iso: string) => string,
  formatNumber: (value: number) => string,
): DetailLine[] {
  // A badge edit reuses `changedSettings`, so the action says which field
  // labels and value words apply.
  const isBadgeEdit = action === "badge_updated";
  const isGiftAction = action === "gift_sent" || action === "gift_removed";
  const lines: DetailLine[] = badgeDetailLines(details, t, formatNumber);

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

  if (details.note && !isGiftAction) {
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
      label: fieldLabel(change.field, t, isBadgeEdit),
      value: isBadgeEdit
        ? fromToValue(
            badgeSettingValue(change.field, change.from, t),
            badgeSettingValue(change.field, change.to, t),
            t,
          )
        : settingChangeValue(change.from, change.to, t),
    });
  }

  return lines;
}
