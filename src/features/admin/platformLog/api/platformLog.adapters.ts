import type { IconType } from "react-icons";
import {
  FiCheckSquare,
  FiKey,
  FiShield,
  FiSliders,
  FiUsers,
} from "react-icons/fi";
import type { Formatters } from "../../../../shared/i18n/format";
import type {
  TFunction,
  TranslateOptions,
} from "../../../../shared/i18n/types";
import { formatRelative } from "../../../../shared/lib/date";
import { settingLabel } from "../../settingLabel";
import type {
  PlatformLogCategory,
  PlatformLogEntryDTO,
  PlatformLogPartyDTO,
} from "./platformLog.api";

export type PlatformLogTone = "coral" | "plum" | "amber" | "jade" | "violet";

const CATEGORY_DISPLAY: Record<
  PlatformLogCategory,
  { tone: PlatformLogTone; icon: IconType }
> = {
  moderation: { tone: "coral", icon: FiShield },
  staff: { tone: "plum", icon: FiKey },
  governance: { tone: "amber", icon: FiSliders },
  reviews: { tone: "jade", icon: FiCheckSquare },
  members: { tone: "violet", icon: FiUsers },
};

export interface PlatformLogPartyView {
  userId: string | null;
  label: string;
  isFilterable: boolean;
}

export interface PlatformLogSubjectView {
  label: string;
  to: string | null;
  /** The generic "View" label stands in for a subject with no name. */
  isFallback: boolean;
}

export interface PlatformLogRowView {
  id: string;
  category: PlatformLogCategory;
  tone: PlatformLogTone;
  icon: IconType;
  actor: PlatformLogPartyView;
  verb: string;
  target: PlatformLogPartyView | null;
  subject: PlatformLogSubjectView | null;
  note: string | null;
  occurredAt: string;
  relativeTime: string;
  /** The time of day alone, for rows under an older day heading. */
  clockTime: string;
  exactTime: string;
  dayKey: string;
}

export interface PlatformLogDayGroup {
  dayKey: string;
  rows: PlatformLogRowView[];
}

/** The real `t` echoes a missing key, with or without its namespace. */
function translateIfPresent(
  t: TFunction,
  key: string,
  options?: TranslateOptions,
): string | null {
  const translated = t(key, options);
  const keyWithoutNamespace = key.slice(key.indexOf(":") + 1);
  return translated === key || translated === keyWithoutNamespace
    ? null
    : translated;
}

function partyView(
  party: PlatformLogPartyDTO,
  t: TFunction,
): PlatformLogPartyView {
  switch (party.kind) {
    case "anonymous":
      return {
        userId: null,
        label: t("admin:platformLog.party.anonymous"),
        isFilterable: false,
      };
    case "erased":
      return {
        userId: null,
        label: t("admin:platformLog.party.erased"),
        isFilterable: false,
      };
    case "system":
      return {
        userId: null,
        label: party.name || t("admin:platformLog.party.system"),
        isFilterable: false,
      };
    default:
      return {
        userId: party.userId,
        label: party.name || t("admin:platformLog.party.erased"),
        isFilterable: party.userId !== null,
      };
  }
}

function verbParams(
  entry: PlatformLogEntryDTO,
  t: TFunction,
): TranslateOptions {
  const section = entry.params.section;
  if (entry.kind === "governance.section_changed" && section) {
    const sectionLabel = translateIfPresent(
      t,
      `admin:platformLog.governanceSection.${section}`,
    );
    return { ...entry.params, section: sectionLabel ?? section };
  }
  return entry.params;
}

function verbFor(entry: PlatformLogEntryDTO, t: TFunction): string {
  const isEmergencyReport =
    entry.kind === "member.report_filed" &&
    entry.params.severity === "emergency";
  const kind = isEmergencyReport ? "member.report_filed_emergency" : entry.kind;
  const params = verbParams(entry, t);
  if (entry.target) {
    return (
      translateIfPresent(t, `admin:platformLog.kind.${kind}.target`, params) ??
      t(`admin:platformLog.kind.generic.${entry.category}.target`)
    );
  }
  return (
    translateIfPresent(t, `admin:platformLog.kind.${kind}`, params) ??
    t(`admin:platformLog.kind.generic.${entry.category}`)
  );
}

function subjectView(
  entry: PlatformLogEntryDTO,
  t: TFunction,
): PlatformLogSubjectView | null {
  if (!entry.subject) return null;
  const { route } = entry.subject;
  const settingKey = entry.params.settingKey;
  const label =
    entry.kind === "settings.changed" && settingKey
      ? settingLabel(settingKey, t)
      : entry.subject.label;
  if (!label && !route) return null;
  if (!label) {
    return {
      label: t("admin:platformLog.subject.view"),
      to: route,
      isFallback: true,
    };
  }
  return { label, to: route, isFallback: false };
}

export function localDayKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toPlatformLogRow(
  entry: PlatformLogEntryDTO,
  t: TFunction,
  fmt: Formatters,
): PlatformLogRowView {
  const occurred = new Date(entry.occurredAt);
  const display = CATEGORY_DISPLAY[entry.category];
  return {
    id: entry.id,
    category: entry.category,
    tone: display.tone,
    icon: display.icon,
    actor: partyView(entry.actor, t),
    verb: verbFor(entry, t),
    target: entry.target ? partyView(entry.target, t) : null,
    subject: subjectView(entry, t),
    note: entry.note,
    occurredAt: entry.occurredAt,
    relativeTime: formatRelative(entry.occurredAt, fmt),
    clockTime: fmt.time(occurred),
    exactTime: `${fmt.date(occurred)} ${fmt.time(occurred)}`,
    dayKey: localDayKey(occurred),
  };
}

/** Consecutive rows sharing a local day; the input is already newest first. */
export function groupByDay(
  rows: readonly PlatformLogRowView[],
): PlatformLogDayGroup[] {
  const groups: PlatformLogDayGroup[] = [];
  for (const row of rows) {
    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.dayKey === row.dayKey) {
      currentGroup.rows.push(row);
    } else {
      groups.push({ dayKey: row.dayKey, rows: [row] });
    }
  }
  return groups;
}

export function dayLabel(
  dayKey: string,
  now: Date,
  t: TFunction,
  fmt: Formatters,
): string {
  if (dayKey === localDayKey(now)) return t("admin:platformLog.day.today");
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );
  if (dayKey === localDayKey(yesterday))
    return t("admin:platformLog.day.yesterday");
  const [year = 1970, month = 1, day = 1] = dayKey.split("-").map(Number);
  return fmt.date(new Date(year, month - 1, day));
}

/** The filtered member's display name, read from any loaded row. */
export function findMemberLabel(
  rows: readonly PlatformLogRowView[],
  userId: string,
): string | null {
  for (const row of rows) {
    if (row.actor.userId === userId) return row.actor.label;
    if (row.target?.userId === userId) return row.target.label;
  }
  return null;
}
