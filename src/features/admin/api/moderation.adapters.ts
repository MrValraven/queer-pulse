import { REASON_LABELS, type ReasonCode } from "../../safety/reportReasons";
import type {
  Appeal,
  ModReport,
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

const RISK: Record<ModSeverity, { tone: AdminTone; label: string }> = {
  emergency: { tone: "danger", label: "At risk" },
  high: { tone: "coral", label: "High" },
  medium: { tone: "amber", label: "Medium" },
  low: { tone: "jade", label: "Low" },
};

/** Short square-category label per reason code. */
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

function priorLine(n: number): string | undefined {
  if (n <= 0) return undefined;
  return n === 1 ? "1 prior report" : `${n} prior reports`;
}

export function modReportDtoToView(dto: ModReportDTO): ModReport {
  const severity = dto.severity as Severity;
  const category = CATEGORY[dto.reasonCode] ?? "Report";
  const chips: ReportChip[] = [
    { tone: CHIP_TONE[dto.severity], label: category },
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
    chips: [{ tone: CHIP_TONE[dto.severity], label: "Appeal" }],
    title: dto.original.action,
    preview: dto.argument.slice(0, 140),
    appealBy: dto.appellant.handle,
    pronoun: dto.appellant.pronoun ?? "",
    initials: (dto.appellant.handle.replace(/^@/, "")[0] ?? "?").toUpperCase(),
    tone: "coral",
    community: dto.community ?? undefined,
    age: ageOf(dto.createdAt),
    status: { tone: "amber", label: "Awaiting" },
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
