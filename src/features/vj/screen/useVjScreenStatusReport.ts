/**
 * Tells the stage what this screen holds (contract 2.2, 6.6): one
 * `screen:status` right after every (re)connect, then at most one per
 * VJ_STATUS_REPORT_INTERVAL_MS, trailing, and only when something changed.
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  VjScreenClipStatus,
  VjScreenPreload,
} from "../../../shared/contracts/vj";
import type { VjStageController } from "../live/useVjStage";

export const VJ_STATUS_REPORT_INTERVAL_MS = 500;

export interface VjScreenStatusReportInput {
  stage: Pick<VjStageController, "sendStatus" | "isConnected">;
  isFullscreen: boolean;
  packId: string | null;
  statuses: readonly VjScreenClipStatus[];
}

interface VjStatusReport {
  isFullscreen: boolean;
  preload: VjScreenPreload;
}

interface VjSentReport {
  signature: string;
  sentAt: number;
}

export function useVjScreenStatusReport(
  input: VjScreenStatusReportInput,
): void {
  const { isFullscreen, packId, statuses } = input;
  const { sendStatus, isConnected } = input.stage;

  const report = useMemo<VjStatusReport>(
    () => ({
      isFullscreen,
      preload: { packId, clips: statuses.map((status) => ({ ...status })) },
    }),
    [isFullscreen, packId, statuses],
  );
  // Used for comparison only; it reaches no log.
  const signature = useMemo(() => JSON.stringify(report), [report]);

  const latestRef = useRef({ report, signature, sendStatus });
  const lastSentRef = useRef<VjSentReport | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latestRef.current = { report, signature, sendStatus };
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const sendLatest = useCallback(() => {
    const latest = latestRef.current;
    latest.sendStatus(latest.report);
    lastSentRef.current = { signature: latest.signature, sentAt: Date.now() };
  }, []);

  useEffect(() => {
    clearTimer();
    if (!isConnected) {
      lastSentRef.current = null;
      return;
    }
    sendLatest();
  }, [isConnected, clearTimer, sendLatest]);

  useEffect(() => {
    if (!isConnected) return;
    const lastSent = lastSentRef.current;
    if (lastSent === null || lastSent.signature === signature) return;
    // A trailing send is already waiting; it reads the latest report.
    if (timerRef.current !== null) return;
    const waitMs = Math.max(
      0,
      lastSent.sentAt + VJ_STATUS_REPORT_INTERVAL_MS - Date.now(),
    );
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (latestRef.current.signature === lastSentRef.current?.signature) {
        return;
      }
      sendLatest();
    }, waitMs);
  }, [isConnected, signature, sendLatest]);

  useEffect(() => clearTimer, [clearTimer]);
}
