import { useCallback, useEffect, useState } from "react";
import {
  VJ_REMOTE_OVERLAY_LINES_MAX,
  VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY,
} from "../vj.constants";

/** The saved lines, or an empty list when storage is blocked or holds something else. */
function readStoredLines(): string[] {
  try {
    const raw = window.localStorage.getItem(
      VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY,
    );
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((line): line is string => typeof line === "string")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, VJ_REMOTE_OVERLAY_LINES_MAX);
  } catch {
    return [];
  }
}

/** Saves the lines; blocked storage keeps them for this page load only. */
function writeStoredLines(lines: readonly string[]): void {
  try {
    if (lines.length === 0) {
      window.localStorage.removeItem(VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      VJ_REMOTE_OVERLAY_LINES_STORAGE_KEY,
      JSON.stringify(lines),
    );
  } catch {
    // Private mode or a full quota: the lines stay in memory.
  }
}

/** The line moved to the front, any older copy dropped, at most the max kept. */
export function withRecentOverlayLine(
  lines: readonly string[],
  text: string,
): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) return [...lines];
  return [trimmed, ...lines.filter((line) => line !== trimmed)].slice(
    0,
    VJ_REMOTE_OVERLAY_LINES_MAX,
  );
}

/**
 * The remote's recent overlay lines (contract 8.5): trimmed, newest first, a
 * repeat moves to the front, at most 10. They stay on this phone and nothing
 * logs them.
 */
export function useVjRecentOverlayLines(): {
  lines: readonly string[];
  remember: (text: string) => void;
  clear: () => void;
} {
  const [lines, setLines] = useState<readonly string[]>(readStoredLines);

  // Storage follows the list after each change, outside the state updater.
  useEffect(() => {
    writeStoredLines(lines);
  }, [lines]);

  const remember = useCallback((text: string) => {
    setLines((current) => withRecentOverlayLine(current, text));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
  }, []);

  return { lines, remember, clear };
}
