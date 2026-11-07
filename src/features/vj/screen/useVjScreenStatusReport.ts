/**
 * Tells the stage what this screen holds (contract 3.8, 7.9): one
 * `screen:status` right after every (re)connect; a trailing report at most
 * one per VJ_STATUS_REPORT_INTERVAL_MS when the fullscreen flag, the preload,
 * the next clip or the presence of health or mic changes; and one every
 * VJ_SCREEN_STATUS_REPORT_INTERVAL_MS while health or mic is reported,
 * carrying the latest values. Nothing is sent while detached.
 */
import { useEffect, useMemo, useState } from "react";
import type {
  VjScreenClipStatus,
  VjScreenHealth,
  VjScreenMicReport,
  VjScreenPreload,
  VjScreenStatusPayload,
} from "../../../shared/contracts/vj";
import type { VjStageController } from "../live/useVjStage";
import { VJ_SCREEN_STATUS_REPORT_INTERVAL_MS } from "../vj.constants";
import { vjWireHealthOf, vjWireMicReportOf } from "./vjScreenHealth";

/** Shortest gap between two reports: the v1 bucket of 2 per second. */
export const VJ_STATUS_REPORT_INTERVAL_MS = 500;

export interface VjScreenStatusReportInput {
  /** `serverNow` checks the mic beat against the server clock; `isLead` false nulls the next clip. */
  stage: Pick<VjStageController, "sendStatus" | "isConnected"> &
    Partial<Pick<VjStageController, "serverNow" | "isLead">>;
  isFullscreen: boolean;
  packId: string | null;
  statuses: readonly VjScreenClipStatus[];
  /** Null until the renderer reports health. */
  health?: VjScreenHealth | null;
  /** The lead's shuffle pick for the next advance. */
  nextClipId?: string | null;
  /** Null while the mic is off on this screen. */
  mic?: VjScreenMicReport | null;
}

interface VjLatestReport {
  isConnected: boolean;
  isFullscreen: boolean;
  preload: VjScreenPreload;
  health: VjScreenHealth | null;
  nextClipId: string | null;
  mic: VjScreenMicReport | null;
  /** Health or mic is reported, so the 2 s heartbeat runs. */
  isHeartbeatOn: boolean;
  /** Compared only; it reaches no log. */
  signature: string;
  sendStatus: (status: VjScreenStatusPayload) => void;
  serverNow: (() => number) | null;
}

interface VjSentReport {
  signature: string;
  sentAt: number;
}

interface VjStatusReporter {
  /** Stores the report the next send carries (called from an effect after each render). */
  update: (next: VjLatestReport) => void;
  /** Sends the latest report now (after a connect). */
  sendNow: () => void;
  /** Schedules a trailing report when the signature moved since the last send. */
  noteChange: () => void;
  /** Arms the heartbeat 2 s after the last send, or clears it when it is off. */
  armHeartbeat: () => void;
  /** Clears both timers and forgets the last send (detach and unmount). */
  stop: () => void;
}

/** The wire payload, built at send time so the mic beat meets a fresh clock reading. */
function payloadOf(latest: VjLatestReport): VjScreenStatusPayload {
  const serverNowMs = latest.serverNow === null ? null : latest.serverNow();
  const payload: VjScreenStatusPayload = {
    isFullscreen: latest.isFullscreen,
    preload: latest.preload,
    nextClipId: latest.nextClipId,
    mic:
      latest.mic === null ? null : vjWireMicReportOf(latest.mic, serverNowMs),
  };
  if (latest.health !== null) payload.health = vjWireHealthOf(latest.health);
  return payload;
}

function createVjStatusReporter(): VjStatusReporter {
  let latestReport: VjLatestReport | null = null;
  let lastSent: VjSentReport | null = null;
  let changeTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;

  const clearTimers = () => {
    if (changeTimer !== null) clearTimeout(changeTimer);
    if (heartbeatTimer !== null) clearTimeout(heartbeatTimer);
    changeTimer = null;
    heartbeatTimer = null;
  };

  const armHeartbeat = () => {
    if (heartbeatTimer !== null) clearTimeout(heartbeatTimer);
    heartbeatTimer = null;
    const latest = latestReport;
    if (latest === null || !latest.isConnected || !latest.isHeartbeatOn) {
      return;
    }
    if (lastSent === null) return;
    const waitMs = Math.max(
      0,
      lastSent.sentAt + VJ_SCREEN_STATUS_REPORT_INTERVAL_MS - Date.now(),
    );
    heartbeatTimer = setTimeout(() => {
      heartbeatTimer = null;
      sendNow();
    }, waitMs);
  };

  const sendNow = () => {
    clearTimers();
    const latest = latestReport;
    if (latest === null || !latest.isConnected) return;
    latest.sendStatus(payloadOf(latest));
    lastSent = { signature: latest.signature, sentAt: Date.now() };
    armHeartbeat();
  };

  const noteChange = () => {
    const latest = latestReport;
    if (latest === null || !latest.isConnected || lastSent === null) return;
    if (lastSent.signature === latest.signature) return;
    // A trailing send is already waiting; it reads the latest report.
    if (changeTimer !== null) return;
    const waitMs = Math.max(
      0,
      lastSent.sentAt + VJ_STATUS_REPORT_INTERVAL_MS - Date.now(),
    );
    changeTimer = setTimeout(() => {
      changeTimer = null;
      if (latestReport?.signature === lastSent?.signature) return;
      sendNow();
    }, waitMs);
  };

  const stop = () => {
    clearTimers();
    lastSent = null;
  };

  const update = (next: VjLatestReport) => {
    latestReport = next;
  };

  return { update, sendNow, noteChange, armHeartbeat, stop };
}

export function useVjScreenStatusReport(
  input: VjScreenStatusReportInput,
): void {
  const { isFullscreen, packId, statuses } = input;
  const { sendStatus, isConnected } = input.stage;
  const serverNow = input.stage.serverNow ?? null;
  const health = input.health ?? null;
  const mic = input.mic ?? null;
  const nextClipId =
    input.stage.isLead === false ? null : (input.nextClipId ?? null);
  const isHeartbeatOn = health !== null || mic !== null;

  const preload = useMemo<VjScreenPreload>(
    () => ({ packId, clips: statuses.map((status) => ({ ...status })) }),
    [packId, statuses],
  );
  const hasHealth = health !== null;
  const hasMic = mic !== null;
  const signature = useMemo(
    () =>
      JSON.stringify({ isFullscreen, preload, nextClipId, hasHealth, hasMic }),
    [isFullscreen, preload, nextClipId, hasHealth, hasMic],
  );

  const latest: VjLatestReport = {
    isConnected,
    isFullscreen,
    preload,
    health,
    nextClipId,
    mic,
    isHeartbeatOn,
    signature,
    sendStatus,
    serverNow,
  };
  const [reporter] = useState(createVjStatusReporter);
  // Runs before the effects below in the same commit, so each reads this render.
  useEffect(() => {
    reporter.update(latest);
  });

  useEffect(() => {
    reporter.stop();
    if (isConnected) reporter.sendNow();
  }, [isConnected, reporter]);

  useEffect(() => {
    reporter.noteChange();
  }, [isConnected, signature, reporter]);

  useEffect(() => {
    reporter.armHeartbeat();
  }, [isConnected, isHeartbeatOn, reporter]);

  useEffect(() => () => reporter.stop(), [reporter]);
}
