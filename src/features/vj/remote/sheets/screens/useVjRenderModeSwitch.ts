import { useEffect, useRef, useState } from "react";
import type {
  VjRenderMode,
  VjScreenStatus,
} from "../../../../../shared/contracts/vj";
import type { VjRenderModeOutcome } from "../../../live/vjStageCommands";
import type { VjRun } from "../../useVjCommandRunner";
import {
  VJ_RENDER_MODE_SETTLE_MAX_MS,
  isVjRenderModeSettled,
  vjShowRenderModeOf,
} from "./vjRenderMode";

/** One switch on its way: the mode sent and whether its ack has landed. */
interface VjRenderModeRequest {
  attemptId: number;
  mode: VjRenderMode;
  isAcked: boolean;
}

export interface VjRenderModeSwitchInput {
  screens: readonly VjScreenStatus[];
  run: VjRun;
  isBlocked: boolean;
  onOutcome: (outcome: VjRenderModeOutcome) => void;
}

export interface VjRenderModeSwitch {
  /** The requested mode while a switch is in flight, else what the screens report. */
  isOn: boolean;
  isPending: boolean;
  pendingMode: VjRenderMode | null;
  /** No-op while blocked or pending. */
  requestMode: (mode: VjRenderMode) => Promise<void>;
}

/**
 * The show-wide simple renderer switch. Pending starts on send; a failed
 * outcome clears it at once; an ok outcome clears it once every connected
 * screen's health report agrees with the sent mode (checked during render),
 * or VJ_RENDER_MODE_SETTLE_MAX_MS after the ack, whichever comes first. A
 * disconnected screen never counts, so it never holds the switch.
 */
export function useVjRenderModeSwitch({
  screens,
  run,
  isBlocked,
  onOutcome,
}: VjRenderModeSwitchInput): VjRenderModeSwitch {
  const [request, setRequest] = useState<VjRenderModeRequest | null>(null);
  const attemptCountRef = useRef(0);

  const isSettled =
    request !== null &&
    request.isAcked &&
    isVjRenderModeSettled(screens, request.mode);
  if (isSettled) setRequest(null);
  const activeRequest = isSettled ? null : request;

  const ackedAttemptId =
    activeRequest !== null && activeRequest.isAcked
      ? activeRequest.attemptId
      : null;
  useEffect(() => {
    if (ackedAttemptId === null) return;
    const timeoutId = window.setTimeout(() => {
      setRequest((current) =>
        current?.attemptId === ackedAttemptId ? null : current,
      );
    }, VJ_RENDER_MODE_SETTLE_MAX_MS);
    return () => window.clearTimeout(timeoutId);
  }, [ackedAttemptId]);

  const isPending = activeRequest !== null;
  const pendingMode = activeRequest?.mode ?? null;
  const shownMode = pendingMode ?? vjShowRenderModeOf(screens);

  const requestMode = async (mode: VjRenderMode) => {
    if (isBlocked || isPending) return;
    attemptCountRef.current += 1;
    const attemptId = attemptCountRef.current;
    setRequest({ attemptId, mode, isAcked: false });
    const outcome = await run("setRenderMode", mode);
    setRequest((current) => {
      if (current?.attemptId !== attemptId) return current;
      return outcome.ok ? { ...current, isAcked: true } : null;
    });
    onOutcome(outcome);
  };

  return {
    isOn: shownMode === "simple",
    isPending,
    pendingMode,
    requestMode,
  };
}
