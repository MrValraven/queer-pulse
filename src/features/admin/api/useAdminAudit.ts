import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { formatRelative } from "../../../shared/lib/date";
import type { AdminTone } from "../ui";
import {
  ACTION_TONE,
  type AuditEntry,
  type AuditFilterState,
  type AuditType,
} from "../adminGovernance.data";
import { getAdminAudit, type AuditFeedRowDTO } from "./adminAudit.api";

/** One audit-log row, shape-unified across demo (rich mock copy) and live
 *  (backend action code resolved through i18n) so the audit tab's components
 *  never branch on `demoMode` themselves. */
export interface AuditRowView {
  id: string;
  moderatorId: string | null;
  moderatorName: string;
  moderatorInitials: string;
  moderatorTone: "plum" | "coral" | "jade" | "violet" | "amber" | "anon";
  actionCode: string;
  actionLabel: string;
  actionTone: AdminTone;
  subject: string;
  reason: string;
  when: string;
}

export interface AdminAuditResult {
  items: AuditRowView[];
  total: number;
  moderators: { id: string; name: string }[];
  pageCount: number;
  loading: boolean;
}

type RawAuditFeed =
  | { kind: "demo"; rows: AuditEntry[]; total: number; moderators: { id: string; name: string }[] }
  | { kind: "live"; rows: AuditFeedRowDTO[]; total: number; moderators: { id: string; name: string }[] };

async function buildDemoAuditFeed(
  filters: AuditFilterState,
  page: number,
  pageSize: number,
): Promise<RawAuditFeed> {
  const { AUDIT_ENTRIES, AUDIT_MODERATORS } = await import(
    "../adminGovernance.mock"
  );
  const query = filters.query.trim().toLowerCase();
  const filtered = AUDIT_ENTRIES.filter((entry) => {
    if (filters.moderator !== "all" && entry.moderatorName !== filters.moderator)
      return false;
    if (filters.action !== "all" && entry.type !== filters.action) return false;
    if (filters.range !== "all" && entry.range !== filters.range) return false;
    if (query && !`${entry.reason} ${entry.subject}`.toLowerCase().includes(query))
      return false;
    return true;
  });
  const start = (page - 1) * pageSize;
  const pagedEntries = filtered.slice(start, start + pageSize);
  return {
    kind: "demo",
    rows: pagedEntries,
    total: filtered.length,
    moderators: AUDIT_MODERATORS.map((name) => ({ id: name, name })),
  };
}

async function fetchLiveAuditFeed(
  filters: AuditFilterState,
  page: number,
  pageSize: number,
): Promise<RawAuditFeed> {
  const response = await getAdminAudit({
    moderator: filters.moderator === "all" ? undefined : filters.moderator,
    action: filters.action === "all" ? undefined : filters.action,
    range: filters.range === "all" ? undefined : filters.range,
    q: filters.query.trim() || undefined,
    page,
    pageSize,
  });
  return {
    kind: "live",
    rows: response.items,
    total: response.total,
    moderators: response.moderators,
  };
}

/** First letter of each of the first two whitespace-split words, uppercased;
 *  falls back to the first two characters for a single-word name. */
function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const firstWord = words[0];
  if (!firstWord) return "";
  const secondWord = words[1];
  if (words.length === 1 || !secondWord) return firstWord.slice(0, 2).toUpperCase();
  return (firstWord.charAt(0) + secondWord.charAt(0)).toUpperCase();
}

const TONE_CYCLE = ["plum", "coral", "jade", "violet", "amber"] as const;

/** Deterministic tone from an id/name — same input always renders the same
 *  avatar colour, without the backend needing to send one. */
function toneFromId(
  id: string | null,
): (typeof TONE_CYCLE)[number] {
  if (!id) return "plum";
  let sum = 0;
  for (let index = 0; index < id.length; index += 1) sum += id.charCodeAt(index);
  return TONE_CYCLE[sum % TONE_CYCLE.length] ?? "plum";
}

function mapDemoRow(row: AuditEntry): AuditRowView {
  return {
    id: row.id,
    moderatorId: row.moderatorName,
    moderatorName: row.moderatorName,
    moderatorInitials: row.moderatorInitials,
    moderatorTone: row.moderatorTone,
    actionCode: row.type,
    actionLabel: row.action,
    actionTone: row.actionTone,
    subject: row.subject,
    reason: row.reason,
    when: row.when,
  };
}

function mapLiveRow(
  row: AuditFeedRowDTO,
  t: TFunction,
  fmt: Formatters,
): AuditRowView {
  return {
    id: row.id,
    moderatorId: row.actorId,
    moderatorName: row.actorName,
    moderatorInitials: initialsFromName(row.actorName),
    moderatorTone: toneFromId(row.actorId),
    actionCode: row.action,
    actionLabel: t(`admin:governance.audit.actionType.${row.action}`),
    actionTone: ACTION_TONE[row.action as AuditType] ?? "plum",
    subject: row.subject,
    reason: row.note ?? row.reasonCode ?? "",
    when: formatRelative(row.at, fmt),
  };
}

/**
 * Data source for the admin governance Audit tab. Demo mode filters/paginates
 * the colocated `AUDIT_ENTRIES` mock in-memory (dynamically imported so it
 * never ships in the live bundle); live mode calls `GET /mod/audit` with the
 * same filters as server-side query params. Both branches converge on
 * `AuditRowView` so the tab, filters, and modal never branch on `demoMode`.
 */
export function useAdminAudit(
  filters: AuditFilterState,
  page: number,
  pageSize?: number,
): AdminAuditResult {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const fmt = useFormat();
  const effectivePageSize = pageSize ?? 8;

  const query = useQuery<RawAuditFeed>({
    queryKey: ["admin-audit", demoMode, filters, page, effectivePageSize],
    queryFn: () =>
      demoMode
        ? buildDemoAuditFeed(filters, page, effectivePageSize)
        : fetchLiveAuditFeed(filters, page, effectivePageSize),
  });

  if (!query.data) {
    return {
      items: [],
      total: 0,
      moderators: [],
      pageCount: 1,
      loading: query.isPending,
    };
  }

  const items =
    query.data.kind === "demo"
      ? query.data.rows.map(mapDemoRow)
      : query.data.rows.map((row) => mapLiveRow(row, t, fmt));

  return {
    items,
    total: query.data.total,
    moderators: query.data.moderators,
    pageCount: Math.max(1, Math.ceil(query.data.total / effectivePageSize)),
    loading: false,
  };
}
