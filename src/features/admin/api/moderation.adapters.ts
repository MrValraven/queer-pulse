import { REASON_LABELS, type ReasonCode } from "../../safety/reportReasons";
import type {
  Appeal,
  ModReport,
  PriorReports,
  ReportChip,
  Severity,
} from "../adminModeration.data";
import type { AdminTone } from "../ui";
import type { AppealDTO, ModReportDTO, ModSeverity } from "./moderation.api";

/**
 * DTO → existing view-model adapters (spec 04). The moderation UI is built
 * against the rich `ModReport`/`Appeal` shapes in `adminModeration.data.ts`; the
 * backend speaks the leaner DTOs. These map one to the other so live data slots
 * into the same components the mock seed drives. Used in live mode only — demo
 * mode returns the mock arrays directly.
 */

const RISK: Record<ModSeverity, { tone: AdminTone; key: string }> = {
  emergency: { tone: "danger", key: "admin:moderation.risk.atRisk" },
  high: { tone: "coral", key: "admin:moderation.risk.high" },
  medium: { tone: "amber", key: "admin:moderation.risk.medium" },
  low: { tone: "jade", key: "admin:moderation.risk.low" },
};

/**
 * Short square-category label per reason code. Kept as plain English to mirror
 * the mock seed's `category` field, which the demo UI does not render (see
 * `ModReport.category`). The rendered chip uses `CATEGORY_KEY` instead.
 */
const CATEGORY: Partial<Record<ReasonCode, string>> = {
  outing: "Emergency",
  doxxing: "Emergency",
  harassment: "Harassment",
  hate_speech: "Hate speech",
  unwanted_contact: "Harassment",
  impersonation: "Impersonation",
  discrimination: "Discrimination",
  spam: "Spam",
  off_topic: "Off-topic",
  venue_safety: "Venue",
  venue_staff: "Venue",
  venue_accessibility: "Venue",
  other: "Other",
};

/** Catalog key per reason code, for the category chip shown on the card. */
const CATEGORY_KEY: Partial<Record<ReasonCode, string>> = {
  outing: "admin:moderation.category.emergency",
  doxxing: "admin:moderation.category.emergency",
  harassment: "admin:moderation.category.harassment",
  hate_speech: "admin:moderation.category.hateSpeech",
  unwanted_contact: "admin:moderation.category.harassment",
  impersonation: "admin:moderation.category.impersonation",
  discrimination: "admin:moderation.category.discrimination",
  spam: "admin:moderation.category.spam",
  off_topic: "admin:moderation.category.offTopic",
  venue_safety: "admin:moderation.category.venue",
  venue_staff: "admin:moderation.category.venue",
  venue_accessibility: "admin:moderation.category.venue",
  other: "admin:moderation.category.other",
};

const CHIP_TONE: Record<ModSeverity, AdminTone> = {
  emergency: "danger",
  high: "coral",
  medium: "amber",
  low: "jade",
};

/** Compact "26m" / "3h" / "2d" age string from an ISO timestamp. */
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

export function modReportDtoToView(dto: ModReportDTO): ModReport {
  const severity = dto.severity as Severity;
  const category = CATEGORY[dto.reasonCode] ?? "Report";
  const chips: ReportChip[] = [
    {
      tone: CHIP_TONE[dto.severity],
      labelKey:
        CATEGORY_KEY[dto.reasonCode] ?? "admin:moderation.category.report",
    },
  ];
  const view: ModReport = {
    id: dto.id,
    severity,
    category,
    chips,
    title: REASON_LABELS[dto.reasonCode],
    preview: dto.detail?.excerpt ?? REASON_LABELS[dto.reasonCode],
    reporterName: dto.reporter.anonymous ? "anonymous" : dto.reporter.name,
    reportedName: dto.reported.handle,
    community: dto.community ?? undefined,
    age: ageOf(dto.createdAt),
    risk: RISK[dto.severity],
  };
  const prior = priorLine(dto.reported.priorReports);
  if (prior) view.priorReports = prior;

  if (dto.detail) {
    view.detail = {
      contentAuthor: dto.detail.contentAuthor,
      excerpt: dto.detail.excerpt,
      redactionNote: dto.detail.redactionNote,
      thread: dto.detail.thread.map((m) => ({
        author: m.author,
        initials: m.initials,
        tone: "plum",
        time: m.time,
        body: m.body,
        flagged: m.flagged,
      })),
      people: dto.detail.people.map((p) => ({
        role: p.role,
        name: p.name,
        initials: (p.name[0] ?? "?").toUpperCase(),
        tone: p.role.toLowerCase().includes("report") ? "coral" : "plum",
        meta: p.meta,
        anon: p.handle == null && p.role.toLowerCase().includes("reporter"),
      })),
    };
  }
  return view;
}

export function appealDtoToView(dto: AppealDTO): Appeal {
  const severity = dto.severity as Severity;
  return {
    id: dto.id,
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
    age: ageOf(dto.createdAt),
    status: { tone: "amber", key: "admin:moderation.status.awaiting" },
    original: {
      action: dto.original.action,
      by: dto.original.by,
      when: dto.original.when,
      reason: dto.original.reason,
      cat: "coral",
    },
    argument: dto.argument,
    supporters: [],
  };
}
