// src/features/messages/useBlockReportableMessages.ts
import { useMemo } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { MessagePage } from "./api/threadCacheTrim";
import { messageDisplayText } from "./api/messages.adapters";

/** One reportable message, ready for the "report before you block" step's
 *  checkbox list. `preview` goes through `messageDisplayText()` so a sticker
 *  (whose server `body` is deliberately blank) shows its label instead of a
 *  blank row a reporting member could not identify. */
export interface ReportableMessageOption {
  id: string;
  preview: string;
  createdAt: string;
}

/** PRD-362: how many of the counterpart's most recent messages the "report
 *  before you block" step offers, newest first. Capped at the report
 *  endpoint's own burst throttle (10 filings per 60 seconds,
 *  `ReportFilingThrottlerGuard`) rather than a round number bigger than it:
 *  offering more than the throttle can actually accept in one go is what let
 *  a full selection burn the window partway through and leave the rest of
 *  the counterpart's messages unreported when the block severed the thread
 *  right after. */
export const MAX_REPORTABLE_MESSAGES = 10;

/**
 * The counterpart's most recent reportable messages already sitting in this
 * conversation's thread cache (`useMessageThread`'s query — see
 * `threadCacheTrim.ts`), read synchronously with no fetch of its own: the
 * conversation is already open, so its history is already loaded.
 *
 * Filters on the server-authoritative `canReport` flag, further excluding an
 * already-tombstoned message even when the server marks it `canReport: true`
 * (the evidence-hold window on a soft-deleted message, PRD-362/F1's own
 * standalone tombstone-report menu item already covers that one message on
 * its own): this list is for picking among messages with real, visible
 * content to show a moderator, and a tombstone's body is wiped, so it would
 * only ever render as a blank checkbox row here. Returns `[]` before the
 * thread has ever been opened (nothing cached yet) rather than fetching a
 * page just for this — the step falls back to "skip straight to block" in
 * that case, which is the honest thing to do when there is nothing on hand
 * to show.
 *
 * Memoized on the cached page data's own reference (react-query keeps that
 * reference stable across a render that doesn't touch this query, and only
 * hands back a new one once the cache actually changes), so an unrelated
 * re-render of the panel this hook lives under never rebuilds the list or
 * hands the caller a new array reference for no reason.
 */
export function useBlockReportableMessages(
  conversationId: string | undefined,
): ReportableMessageOption[] {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const cached = conversationId
    ? queryClient.getQueryData<InfiniteData<MessagePage>>([
        "messages",
        conversationId,
        demoMode,
      ])
    : undefined;

  return useMemo(() => {
    if (!cached) return [];
    const oldestFirst = cached.pages.flatMap((page) => page.items);
    const reportable = oldestFirst.filter(
      (message) => message.canReport && message.deletedAt === null,
    );
    return reportable
      .slice(-MAX_REPORTABLE_MESSAGES)
      .reverse()
      .map((message) => ({
        id: message.id,
        preview: messageDisplayText(message),
        createdAt: message.createdAt,
      }));
  }, [cached]);
}
