import type { ModActionCode } from "./api/moderation.api";
import type { ReasonCode } from "../safety/reportReasons";

export type TabId = "open" | "appeals" | "resolved";
export type FilterId = "all" | "emergencies" | "mine";

/** Drawer action id (MOD_ACTIONS) → server action code (spec 04 action set). */
export const ACTION_CODE: Record<string, ModActionCode> = {
  hide: "hide_content",
  remove: "remove_content",
  shield: "shield",
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
