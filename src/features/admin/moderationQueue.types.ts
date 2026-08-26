import type { ModActionCode } from "./api/moderation.api";
import type { ReasonCode, ReportSubjectType } from "../safety/reportReasons";
import type { Severity } from "./adminModeration.data";

/**
 * `ratification` is TS-12's tab: the permanent bans one moderator asked for and
 * no second moderator has confirmed yet. It sits alongside the queue rather
 * than inside the open tab because nothing on it is a report, and the action it
 * takes is a signature on someone else's decision.
 *
 * `health` is TS-04's tab: moderator workload and SLA health across every
 * queue, including the four that are not this console's. It sits here because
 * `/admin/moderation` is one of the surfaces `authGate.ts` opens to the
 * moderator tier, and the workload reading is for the people carrying the
 * work. It reads; it never acts on a row.
 */
export type TabId = "open" | "appeals" | "resolved" | "ratification" | "health";

/**
 * The appeals queue's two tabs (TS-11). They used to be one undifferentiated
 * list, newest first, with decided appeals mixed in among the awaiting ones,
 * which put the appeal closest to breaching the published 7-day window at the
 * bottom.
 */
export type AppealTabId = "awaiting" | "decided";
/**
 * `overdue` and `surge` are TS-06's two triage filters. `overdue` is "the
 * response window has already closed"; `surge` narrows to the subjects several
 * different people are reporting at once. Both are forwarded to the server so
 * they narrow the WHOLE queue rather than whatever landed on page one.
 */
export type FilterId = "all" | "emergencies" | "mine" | "overdue" | "surge";

/**
 * TS-06: one `(subjectType, subjectId)` pile, as the queue renders it.
 *
 * Thirty people reporting one member inside ten minutes used to be thirty
 * independent rows with thirty SLA clocks, which read as thirty times the
 * urgency and hid the one fact that decides what to do:
 * `distinctReporterCount`. One person filing five times is a different event
 * from five people filing once, and only the second is a pile-on.
 *
 * Live rows get this from the server, counted over every open report about the
 * subject. Demo mode derives it from the seed (`clustersFromRows`), where
 * "distinct reporter" can only be the reporter's display name.
 */
export interface ModReportCluster {
  subjectType: ReportSubjectType;
  subjectId: string;
  openCount: number;
  distinctReporterCount: number;
  overdueCount: number;
  highestSeverity: Severity;
  firstReportedAt: string;
  lastReportedAt: string;
  /** Meets the same thresholds that freeze a community: a signal to read the
   *  pile as one event, never a verdict about who is in the wrong. */
  isSurge: boolean;
  /** Every open report id in the pile, so the whole thing can be selected and
   *  actioned in one bulk call. Capped server-side at the bulk limit. */
  reportIds: string[];
}

/**
 * Demo-mode surge thresholds, mirroring the server's (`SURGE_MIN_OPEN_REPORTS`
 * / `SURGE_MIN_DISTINCT_REPORTERS` in `moderation.service.ts`, which are in
 * turn the auto-freeze thresholds). Live rows never use these: the server has
 * already decided `isSurge` over the full report set, which the client cannot
 * see. They exist so the demo seed produces the same reading as production.
 */
export const SURGE_MIN_REPORTS = 5;
export const SURGE_MIN_REPORTERS = 3;

/** Stable key for one cluster, and for the row that belongs to it. A subject
 *  id is unique inside its own type but not across types, so both halves are
 *  needed. */
export function clusterKeyOf(subject: {
  subjectType: ReportSubjectType;
  subjectId: string;
}): string {
  return `${subject.subjectType}:${subject.subjectId}`;
}

/** The queue's community filter: a community slug, or `ALL_COMMUNITIES` for
 *  "don't narrow by community" (TS-14). A slug is never this literal, so the
 *  two can't collide. */
export const ALL_COMMUNITIES = "all";
export type CommunityFilterId = string;

/**
 * Drawer action id (MOD_ACTIONS) → server action code (spec 04 action set).
 *
 * `shield` was removed with the server code (TS-02): it resolved reports and
 * did nothing to anyone. Its drawer tile has to go with it — see the note in
 * `adminModeration.data.ts`'s `MOD_ACTIONS`.
 */
export const ACTION_CODE: Record<string, ModActionCode> = {
  hide: "hide_content",
  remove: "remove_content",
  warn: "warn",
  restrict: "restrict",
  ban: "ban",
  dismiss: "dismiss",
  escalate: "escalate",
};

/** Canonical toast-verb id — never displayed directly. Resolve its label via
 *  `t(`admin:moderation.queue.verb.${verb}`)`. */
export type ResolveVerb = "resolved" | "escalated" | "actioned";

export interface ResolveOpts {
  /** Toast verb id, e.g. "resolved" / "actioned" / "escalated". */
  verb?: ResolveVerb;
  /** MOD_ACTIONS id chosen in the drawer (mapped to a server action code). */
  action?: string;
  reasonCode?: ReasonCode;
  /** The member-facing note — the reason the member reads. */
  note?: string;
  /** e.g. "7d" — required by the backend for `restrict` (always time-boxed). */
  duration?: string;
}

/** Canonical bulk-verb id — never displayed directly. Resolve its label via
 *  `t(`admin:moderation.queue.bulkVerb.${verb}`)`. */
export type BulkVerb =
  | "dismissed"
  | "removedAsSpam"
  | "escalated"
  | "warned"
  | "suspended"
  | "banned";

// Slightly longer than the action-toast's 5200ms undo window (ToastProvider),
// so the moderator has the full toast lifetime to click Undo before it sends.
export const UNDO_COMMIT_MS = 5600;
