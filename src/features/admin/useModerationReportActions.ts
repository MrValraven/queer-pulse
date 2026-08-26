import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { ToastContextValue } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";
import { withRowsRestored, type RemovalHandle } from "./moderationUndo";
import type { ModReportView } from "./moderationAge";
import {
  useModAction,
  useModBulkAction,
  type ModBulkVars,
} from "./api/useModAction";
import {
  summarizeBulkFailures,
  useEnforcementRefusal,
} from "./api/enforcementTargetError";
import type { ModActionCode } from "./api/moderation.api";
import {
  ACTION_CODE,
  type BulkVerb,
  type ResolveOpts,
} from "./moderationQueue.types";

export interface UseModerationReportActionsParams {
  picked: Set<string>;
  setOpen: Dispatch<SetStateAction<ModReportView[]>>;
  removeReports: (ids: string[]) => RemovalHandle<ModReportView>;
  undoToast: (message: string, restore: () => void, restored: string) => void;
  pendingOpenRemoval: MutableRefObject<Set<string>>;
  scheduleCommit: (commit: () => void) => number;
  cancelCommit: (handle: number) => void;
  refetch: () => unknown;
  t: TFunction;
  showToast: ToastContextValue["showToast"];
}

/**
 * The open queue's two report-level actions: resolving a single report from
 * the drawer, and applying one action to every picked report from the bulk
 * bar. Split out of `useModerationQueueActions` — both share the same
 * deferred-commit Undo shape (audit P1-1) and are the queue's biggest single
 * source of lines, so they're colocated here rather than with the row state
 * they act on.
 */
export function useModerationReportActions({
  picked,
  setOpen,
  removeReports,
  undoToast,
  pendingOpenRemoval,
  scheduleCommit,
  cancelCommit,
  refetch,
  t,
  showToast,
}: UseModerationReportActionsParams) {
  const modAction = useModAction();
  const modBulk = useModBulkAction();
  // Turns a typed enforcement refusal into the sentence a moderator reads. A
  // genuine outage keeps the caller's own generic copy.
  const describeRefusal = useEnforcementRefusal();

  const resolveReport = (id: string, opts: ResolveOpts = {}) => {
    const verb = opts.verb ?? "resolved";
    const removal = removeReports([id]);
    // Mark the row pending-removed so a background refetch during the undo
    // window can't resurrect it (query-mirror guard).
    pendingOpenRemoval.current.add(id);
    // Defer the real PATCH until the undo window closes. The backend writes the
    // audit entry + notifies the reported member (mod_action) and reporter
    // (report_outcome), so it must not fire while Undo is still on offer. Demo:
    // the mutation is a network no-op, so this stays a pure local flow.
    const handle = scheduleCommit(() =>
      modAction.mutate(
        {
          id,
          action: ACTION_CODE[opts.action ?? "dismiss"] ?? "dismiss",
          reasonCode: opts.reasonCode ?? "other",
          note: opts.note ?? "",
          duration: opts.duration,
        },
        {
          // Committed: the server now agrees the row is gone (a resolved report
          // never returns on the open tab), so stop shielding its id.
          onSuccess: () => pendingOpenRemoval.current.delete(id),
          // Failed: the row is still open server-side. Drop the shield and
          // refetch so server truth rolls the row back into view.
          //
          // The optimistic toast above has already told this moderator the
          // action landed, so this is a CORRECTION and has to say what really
          // happened. A refused enforcement (no account behind the content,
          // two possible authors, the house or a staff account) is a decision
          // the backend made on purpose, and calling it "couldn't reach the
          // safety service" was false twice over: the service answered, and it
          // answered deliberately. Deterministic, so no retry is offered: the
          // same request would be refused the same way.
          onError: (error) => {
            pendingOpenRemoval.current.delete(id);
            showToast(
              describeRefusal(
                error,
                t("admin:moderation.queue.serviceErrorToast"),
              ),
              "error",
            );
            void refetch();
          },
        },
      ),
    );
    undoToast(
      t("admin:moderation.queue.actionToast", {
        verb: t(`admin:moderation.queue.verb.${verb}`),
      }),
      // Undo restores BY ID into the CURRENT queue and cancels only this
      // action's own timers and shield (FE-ADM-15) — a report actioned later in
      // the same undo window keeps its removal and its pending commit.
      () => {
        cancelCommit(handle);
        removal.cancel();
        pendingOpenRemoval.current.delete(id);
        setOpen((queue) => withRowsRestored(queue, removal.removed));
      },
      t("admin:moderation.queue.restoredToast"),
    );
  };

  /**
   * Apply one action to every picked report. `decision` carries the reason code
   * and the exact member-facing note for the sanctioning actions (ban / warn /
   * remove-content / suspend), collected by `BulkActionModal` before this runs.
   * Dismiss and escalate need neither, so they still fire straight from the
   * bulk bar and fall back to the unspecified reason code.
   */
  const bulkAct = (
    verb: BulkVerb,
    action: ModActionCode = "dismiss",
    decision?: { reasonCode?: string; note?: string; duration?: string },
  ) => {
    const ids = [...picked];
    if (ids.length === 0) return;
    const removal = removeReports(ids);
    // Shield every removed id from a background refetch (query-mirror guard).
    ids.forEach((id) => pendingOpenRemoval.current.add(id));
    // Deferred, like resolveReport — a bulk PATCH also notifies members, so it
    // waits out the undo window and is cancelled outright if Undo is clicked.
    const handle = scheduleCommit(() =>
      modBulk.mutate(
        {
          ids,
          action,
          reasonCode: (decision?.reasonCode ??
            "other") as ModBulkVars["reasonCode"],
          note: decision?.note,
          duration: decision?.duration,
        },
        {
          // Continue-on-error (P0-16): the backend never throws for a partial
          // batch, so a failure here means EVERY report failed rather than
          // being thrown outright — `data.failed` is how a partial batch
          // surfaces. Either way, only `data.updated` actually resolved
          // server-side, so the failed ids must come back into view rather
          // than staying optimistically removed.
          onSuccess: (data) => {
            ids.forEach((id) => pendingOpenRemoval.current.delete(id));
            if (data.failed.length > 0) {
              // Shown exactly as the server sent them. A bulk `failed[]` entry
              // carries the message string and nothing else, so the typed
              // `code`/`target` the single-report path reads is unavailable
              // here. See `summarizeBulkFailures` for why text-matching them
              // back into a case is off the table.
              const reasons = summarizeBulkFailures(data.failed);
              showToast(
                t("admin:moderation.queue.bulkPartialToast", {
                  succeededCount: data.updated.length,
                  failedCount: data.failed.length,
                  reasons,
                }),
                "error",
              );
              void refetch();
            }
          },
          // Reached when the whole request throws rather than partitioning,
          // so the same correction applies: say what the backend actually
          // refused, offer no retry, and let the refetch bring every
          // optimistically removed row back.
          onError: (error) => {
            ids.forEach((id) => pendingOpenRemoval.current.delete(id));
            showToast(
              describeRefusal(
                error,
                t("admin:moderation.queue.serviceErrorToast"),
              ),
              "error",
            );
            void refetch();
          },
        },
      ),
    );
    undoToast(
      t("admin:moderation.queue.bulkToast", {
        count: ids.length,
        verb: t(`admin:moderation.queue.bulkVerb.${verb}`),
      }),
      // Same by-id restore as `resolveReport` (FE-ADM-15): only this batch's
      // rows come back, only this batch's shields are dropped.
      () => {
        cancelCommit(handle);
        removal.cancel();
        ids.forEach((id) => pendingOpenRemoval.current.delete(id));
        setOpen((queue) => withRowsRestored(queue, removal.removed));
      },
      t("admin:moderation.queue.bulkRestoredToast"),
    );
  };

  return { resolveReport, bulkAct };
}
