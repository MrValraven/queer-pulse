import { useEffect, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { handleFormatError, normalizeHandle } from "../../../shared/handles";
import {
  checkHandle,
  type HandleCheck,
  type HandleReason,
} from "./handles.api";
// `handles.data` (and its heavy `MEMBERS` dependency) is the demo-only mock
// registry — pulled in via dynamic import inside the demo branch below so it
// stays out of the live bundle.

export type HandleStatus = "idle" | "checking" | "available" | "unavailable";

export interface HandleAvailability {
  status: HandleStatus;
  reason: HandleReason;
}

interface Options {
  /** The member's own existing username/handle — never "taken against self". */
  currentName?: string;
}

const IDLE: HandleAvailability = { status: "idle", reason: null };

function toAvailability(check: HandleCheck): HandleAvailability {
  return {
    status: check.available ? "available" : "unavailable",
    reason: check.reason,
  };
}

/**
 * Dual-mode, debounced availability for a handle across the whole namespace.
 *
 * Runs the instant local format/reserved check first (no network), and only
 * reaches the registry (`GET /handles/check`, or the demo taken-set) when the
 * format is clean. A handle equal to `currentName` reads as available — you can
 * always keep your own. The remote check is debounced ~350ms so keystrokes
 * don't each fire a request.
 */
export function useHandleAvailability(
  name: string,
  opts?: Options,
): HandleAvailability {
  const { demoMode } = useDemoMode();
  const normalized = normalizeHandle(name);
  const normalizedCurrent = opts?.currentName
    ? normalizeHandle(opts.currentName)
    : undefined;

  const isEmpty = normalized.length === 0;
  const isSelf = !isEmpty && normalized === normalizedCurrent;
  const formatError = isEmpty || isSelf ? null : handleFormatError(normalized);
  const needsRemote = !isEmpty && !isSelf && formatError === null;

  // The latest resolved remote check, tagged with the name it was for, so a
  // stale result for an earlier keystroke is ignored (we show "checking" until
  // the tag matches the current input).
  const [remote, setRemote] = useState<{
    name: string;
    result: HandleAvailability;
  } | null>(null);

  useEffect(() => {
    if (!needsRemote) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          let check: HandleCheck;
          if (demoMode) {
            const { checkHandleDemo } = await import("./handles.data");
            check = checkHandleDemo(normalized);
          } else {
            check = await checkHandle(normalized);
          }
          if (!cancelled) {
            setRemote({ name: normalized, result: toAvailability(check) });
          }
        } catch {
          // Network hiccup: treat as unavailable so save stays blocked rather
          // than letting a possibly-taken handle through.
          if (!cancelled) {
            setRemote({
              name: normalized,
              result: { status: "unavailable", reason: "taken" },
            });
          }
        }
      })();
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [needsRemote, normalized, demoMode]);

  if (isEmpty) return IDLE;
  if (isSelf) return { status: "available", reason: null };
  if (formatError) return { status: "unavailable", reason: formatError };
  if (remote?.name === normalized) return remote.result;
  return { status: "checking", reason: null };
}
