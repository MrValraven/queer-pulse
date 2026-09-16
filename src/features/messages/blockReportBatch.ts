// src/features/messages/blockReportBatch.ts
import { ApiError } from "../../shared/api/client";
import type { CreateReportInput, ReportDTO } from "../safety/api/reports.api";
import { asReasonCode } from "../safety/api/useReportReasons";

/** At most this many report filings in flight at once — small concurrency
 *  rather than one at a time (filing them one by one would keep a member
 *  waiting on the step for no reason), and small enough to stay well inside
 *  the report endpoint's own burst throttle (10/60s). */
const CONCURRENCY = 3;

export interface BlockReportBatchResult {
  succeeded: number;
  /** Rejected for a reason OTHER than the shared throttle (a genuine
   *  validation failure, say), distinct from `skipped` below. */
  failed: number;
  /** Never attempted because the batch stopped early after the shared
   *  report-filing throttle refused one of the earlier requests. These can
   *  still be reported once the throttle window clears, individually or by
   *  reopening this step. */
  skipped: number;
}

function isThrottled(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429;
}

/**
 * PRD-362: files one `message` report per id in `messageIds`, all under the
 * same reason + anonymity choice from the "report before you block" step.
 * `messageIds` is expected to already respect the caller's own selection cap
 * (`MAX_REPORTABLE_MESSAGES`, see `useBlockReportableMessages`) so a full
 * selection stays well inside the report endpoint's 10/60s burst throttle.
 *
 * A rejection that IS the throttle (429) stops the whole batch rather than
 * letting every other worker burn its own attempt against the same 60-second
 * window for no reason: those messages come back as `skipped`, not `failed`,
 * so the caller can tell the member honestly "these landed, the rest can be
 * reported again shortly" instead of implying they were refused outright. A
 * rejection that is NOT the throttle (a genuine validation failure) is
 * counted as `failed` and the rest keep going, since one message's own
 * rejection shouldn't cost the others.
 */
export async function fileBlockReportBatch(
  createReport: (input: CreateReportInput) => Promise<ReportDTO>,
  messageIds: string[],
  reasonCode: string,
  anonymous: boolean,
): Promise<BlockReportBatchResult> {
  let nextIndex = 0;
  let succeeded = 0;
  let failed = 0;
  let stoppedByThrottle = false;

  async function worker() {
    while (!stoppedByThrottle && nextIndex < messageIds.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const messageId = messageIds[currentIndex]!;
      try {
        await createReport({
          subjectType: "message",
          subjectId: messageId,
          reasonCode: asReasonCode(reasonCode),
          anonymous,
        });
        succeeded += 1;
      } catch (error) {
        if (isThrottled(error)) {
          stoppedByThrottle = true;
          return;
        }
        failed += 1;
      }
    }
  }

  const workerCount = Math.min(CONCURRENCY, messageIds.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  const skipped = messageIds.length - succeeded - failed;
  return { succeeded, failed, skipped };
}
