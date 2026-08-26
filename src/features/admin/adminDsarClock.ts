import type { Formatters } from "../../shared/i18n/format";
import type { AdminTone } from "./ui";
import type {
  AdminDsarArticle,
  AdminDsarRequestDTO,
  AdminDsarStatus,
} from "./api/adminDsar.api";

/** Where the "running out" treatment starts: a week of statutory time left. */
export const DSAR_URGENT_DAYS = 7;

/** Chip tone per stored status, so a row's state reads at a glance. */
export const DSAR_STATUS_TONE: Record<AdminDsarStatus, AdminTone> = {
  received: "amber",
  in_review: "violet",
  resolved: "jade",
  rejected: "ghost",
};

/** The i18n subkey naming each GDPR article on screen. */
export const DSAR_ARTICLE_KEY: Record<AdminDsarArticle, string> = {
  15: "access",
  16: "rectification",
  17: "erasure",
  21: "objection",
};

/** A request whose statutory clock is still running. */
export function isDsarOpen(status: AdminDsarStatus): boolean {
  return status === "received" || status === "in_review";
}

/**
 * How the statutory countdown should read and be toned. Colour never carries
 * the meaning alone here: every state below also returns its own wording, so
 * "overdue" is a sentence, not just a red chip.
 */
export interface DsarClockView {
  tone: AdminTone;
  /** The `admin:adminDsar.clock.*` key holding this state's wording. */
  copyKey: string;
  /** Whole days, always positive: the copy supplies the direction. */
  days: number;
}

export function dsarClockView(request: AdminDsarRequestDTO): DsarClockView {
  if (!isDsarOpen(request.status)) {
    return { tone: "ghost", copyKey: "closed", days: 0 };
  }
  if (request.daysRemaining < 0) {
    return {
      tone: "danger",
      copyKey: "overdue",
      days: Math.abs(request.daysRemaining),
    };
  }
  if (request.daysRemaining === 0) {
    return { tone: "danger", copyKey: "dueToday", days: 0 };
  }
  if (request.daysRemaining <= DSAR_URGENT_DAYS) {
    return { tone: "amber", copyKey: "urgent", days: request.daysRemaining };
  }
  return { tone: "jade", copyKey: "remaining", days: request.daysRemaining };
}

/** "12 Aug 2026", locale-aware. Shared by the queue row and its detail pane. */
export function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
