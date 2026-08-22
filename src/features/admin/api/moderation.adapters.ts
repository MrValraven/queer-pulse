import { REASON_LABEL_KEYS } from "../../safety/reportReasons";
import type { TFunction } from "../../../shared/i18n/types";
import type {
  PriorReports,
  ReportDetail,
  ReporterCredibility,
  ReportChip,
} from "../adminModeration.data";
import type {
  AppealView,
  ModReportView,
  ResolvedItemView,
} from "../moderationAge";
import { ANONYMOUS_REPORTER } from "../moderationReporter";
import type { AdminTone } from "../ui";
import { reasonCategoryKey } from "./moderationCategories";
import type {
  AppealDTO,
  ModActionCode,
  ModReportDTO,
  ModSeverity,
  ResolutionNotifiedParty,
} from "./moderation.api";

/**
 * DTO → existing view-model adapters (spec 04). The moderation UI is built
 * against the rich `ModReport`/`Appeal` shapes in `adminModeration.data.ts`; the
 * backend speaks the leaner DTOs. These map one to the other so live data slots
 * into the same components the mock seed drives. Used in live mode only — demo
 * mode returns the mock arrays directly.
 *
 * i18n (FE-ADM-26): these are LIVE-path adapters, so the "demo fixtures may
 * stay English" exemption does not apply. Every phrase this code authors or
 * classifies (reason label, triage category, "X notified", "Resolved by …")
 * resolves through `t()` against a catalog key. Text the BACKEND supplies —
 * `resolution.outcomeLabel`, an appeal's `original.*` block, a report detail's
 * excerpt/thread/people — passes through untouched: it is fetched content, not
 * client chrome. The caller gets `t` from `useTranslation()` and puts the
 * active `language` in its react-query key so a switch re-derives these rows.
 */

const RISK: Record<ModSeverity, { tone: AdminTone; key: string }> = {
  emergency: { tone: "danger", key: "admin:moderation.risk.atRisk" },
  high: { tone: "coral", key: "admin:moderation.risk.high" },
  medium: { tone: "amber", key: "admin:moderation.risk.medium" },
  low: { tone: "jade", key: "admin:moderation.risk.low" },
};

const CHIP_TONE: Record<ModSeverity, AdminTone> = {
  emergency: "danger",
  high: "coral",
  medium: "amber",
  low: "jade",
};

/**
 * Compact "26m" / "3h" / "2d" age string from an ISO timestamp.
 *
 * Legacy fallback only (FE-ADM-26): it is frozen at adapt time, so queue rows
 * carry the raw `createdAt` through to the component, which formats it with
 * `Intl` per locale at render time (`moderationAge.ts`). This only fills the
 * required `age` field on the view model, which `ageLabelOf` never reads for a
 * live row — the resolved tab's "Closed …" line now works the same way, off
 * `closedAt`.
 */
function ageOf(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "just now";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${Math.max(m, 1)}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function priorLine(count: number): PriorReports | undefined {
  if (count <= 0) return undefined;
  return { kind: "count", count };
}

/** ADM-22: the reporter-side mirror of `priorLine` — `undefined` for an
 *  anonymous/erased reporter (no identity to attach a track record to),
 *  `{ kind: "new" }` for a first-time reporter (0 prior resolved reports),
 *  and the raw filed/dismissed pair otherwise. */
function reporterCredibilityFrom(
  reporter: ModReportDTO["reporter"],
): ReporterCredibility | undefined {
  if (reporter.anonymous) return undefined;
  if (reporter.priorReports <= 0) return { kind: "new" };
  return {
    kind: "history",
    filed: reporter.priorReports,
    dismissed: reporter.priorDismissed,
  };
}

export function modReportDtoToView(
  dto: ModReportDTO,
  t: TFunction,
): ModReportView {
  const severity = dto.severity;
  const categoryKey = reasonCategoryKey(dto.reasonCode);
  const reasonLabel = t(REASON_LABEL_KEYS[dto.reasonCode]);
  const chips: ReportChip[] = [
    { tone: CHIP_TONE[dto.severity], labelKey: categoryKey },
  ];
  const view: ModReportView = {
    id: dto.id,
    subjectType: dto.subjectType,
    subjectId: dto.subjectId,
    severity,
    category: t(categoryKey),
    chips,
    title: reasonLabel,
    preview: dto.detail?.excerpt ?? reasonLabel,
    // ANONYMOUS_REPORTER is a canonical sentinel, never display text: the
    // drawer compares `reporterName` against it to decide the "?" avatar, and
    // the demo seed stores the same literal. Both render sites translate it.
    reporterName: dto.reporter.anonymous
      ? ANONYMOUS_REPORTER
      : dto.reporter.name,
    reportedName: dto.reported.handle,
    community: dto.community ?? undefined,
    // Raw timestamp for the localized age (FE-ADM-26/29); `age` is the frozen
    // English fallback the demo seed also ships.
    createdAt: dto.createdAt,
    age: ageOf(dto.createdAt),
    risk: RISK[dto.severity],
    slaDueAt: dto.slaDueAt,
    assignedModeratorId: dto.assignedModeratorId ?? null,
    assignedModeratorName: dto.assignedModeratorName,
  };
  const prior = priorLine(dto.reported.priorReports);
  if (prior) view.priorReports = prior;
  const reporterCredibility = reporterCredibilityFrom(dto.reporter);
  if (reporterCredibility) view.reporterCredibility = reporterCredibility;

  const detail = modReportDetailFrom(dto);
  if (detail) view.detail = detail;
  return view;
}

/**
 * The rich drawer context (reported content, thread, people) off one DTO.
 *
 * Split out of `modReportDtoToView` because it needs no `t`: every field here
 * is backend-fetched content, so the drawer-detail hooks can map it without
 * threading a translate function. `p.role` is matched case-insensitively
 * against the backend's own English role word to pick an avatar tone — that is
 * a comparison against a canonical server value, so it must not be localized.
 */
export function modReportDetailFrom(
  dto: ModReportDTO,
): ReportDetail | undefined {
  if (!dto.detail) return undefined;
  const detail: ReportDetail = {
    contentAuthor: dto.detail.contentAuthor,
    excerpt: dto.detail.excerpt,
    redactionNote: dto.detail.redactionNote,
    thread: dto.detail.thread.map((message) => ({
      author: message.author,
      initials: message.initials,
      tone: "plum",
      time: message.time,
      body: message.body,
      flagged: message.flagged,
    })),
    people: dto.detail.people.map((person) => ({
      role: person.role,
      name: person.name,
      initials: (person.name[0] ?? "?").toUpperCase(),
      tone: person.role.toLowerCase().includes("report") ? "coral" : "plum",
      meta: person.meta,
      anon:
        person.handle == null && person.role.toLowerCase().includes("reporter"),
    })),
  };
  // Listing-dispute enrichment (listing subjects only) — hand-mapped by the
  // backend onto the detail; pass it straight through when present.
  if (dto.detail.disputeReason) detail.disputeReason = dto.detail.disputeReason;
  if (dto.detail.listingEvidence) {
    detail.listingEvidence = dto.detail.listingEvidence;
  }
  if (dto.detail.contactEmail) detail.contactEmail = dto.detail.contactEmail;
  return detail;
}

export function appealDtoToView(dto: AppealDTO): AppealView {
  const severity = dto.severity;
  return {
    id: dto.id,
    reportId: dto.reportId || undefined,
    severity,
    chips: [
      {
        tone: CHIP_TONE[dto.severity],
        labelKey: "admin:moderation.chip.appeal",
      },
    ],
    title: dto.original.action,
    preview: dto.argument.slice(0, 140),
    appealBy: dto.appellant.handle,
    pronoun: dto.appellant.pronoun ?? "",
    initials: (dto.appellant.handle.replace(/^@/, "")[0] ?? "?").toUpperCase(),
    tone: "coral",
    community: dto.community ?? undefined,
    createdAt: dto.createdAt,
    age: ageOf(dto.createdAt),
    status: { tone: "amber", key: "admin:moderation.status.awaiting" },
    original: {
      action: dto.original.action,
      by: dto.original.by,
      when: dto.original.when,
      reason: dto.original.reason,
      category: "coral",
    },
    argument: dto.argument,
    supporters: [],
  };
}

/** Outcome-badge tone by action severity: destructive → danger, moderate →
 *  coral, light-touch → jade. Mirrors the mock seed's `outcomeTone` intent. */
const OUTCOME_TONE: Record<ModActionCode, "danger" | "coral" | "jade"> = {
  ban: "danger",
  remove_content: "danger",
  suspend: "danger",
  restrict: "coral",
  warn: "coral",
  hide_content: "coral",
  escalate: "coral",
  dismiss: "jade",
  shield: "jade",
};

/** "X notified" lines under a resolved row. Chrome this code composes from a
 *  stable party code, so each one is a catalog key (FE-ADM-26). */
const NOTIFIED_KEY: Record<ResolutionNotifiedParty, string> = {
  member: "admin:moderation.notified.member",
  reporter: "admin:moderation.notified.reporter",
  affected: "admin:moderation.notified.affected",
};

/** Live rows render their "Closed …" line off `closedAt` via `closedLabelOf`,
 *  so the adapter leaves the demo seed's pre-baked `closed` string empty. */
const NO_PREBAKED_CLOSED_LABEL = "";

export function resolvedDtoToView(
  dto: ModReportDTO,
  t: TFunction,
): ResolvedItemView {
  const severity = dto.severity;
  const chips: ReportChip[] = [
    { tone: CHIP_TONE[dto.severity], labelKey: "admin:moderation.chip.resolved" },
  ];
  const status = { tone: "jade" as AdminTone, key: "admin:moderation.status.logged" };
  const reasonLabel = t(REASON_LABEL_KEYS[dto.reasonCode]);
  const res = dto.resolution;
  if (!res) {
    // Graceful fallback when the backend omits the resolution block.
    return {
      id: dto.id,
      severity,
      chips,
      outcome: t("admin:moderation.chip.resolved"),
      outcomeTone: "jade",
      title: reasonLabel,
      preview: dto.detail?.excerpt ?? reasonLabel,
      closed: NO_PREBAKED_CLOSED_LABEL,
      closedAt: dto.createdAt,
      notified: [],
      status,
    };
  }
  return {
    id: dto.id,
    severity,
    chips,
    // Backend-supplied outcome text ("Restricted · 7 days"), already resolved
    // server-side — fetched content, so it passes through untranslated.
    outcome: res.outcomeLabel,
    outcomeTone: OUTCOME_TONE[res.action] ?? "jade",
    title: reasonLabel,
    preview: t("admin:moderation.resolved.resolvedBy", {
      name: res.actorName,
      note: res.note,
    }),
    closed: NO_PREBAKED_CLOSED_LABEL,
    closedAt: res.closedAt,
    notified: res.notified.map((party) => t(NOTIFIED_KEY[party])),
    status,
  };
}
