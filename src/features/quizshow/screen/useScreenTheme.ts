import { useCallback, useState } from "react";
import { primeMessageChime } from "../../../shared/lib/messageChime";

export type QuizshowScreenTheme = "dark" | "light";

const THEME_STORAGE_KEY = "quizshow:screenTheme";
const MUTED_STORAGE_KEY = "quizshow:screenMuted";

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
}

/** The presenter's own theme: dark unless this browser picked light before. */
export function useScreenTheme(): {
  theme: QuizshowScreenTheme;
  toggleTheme: () => void;
} {
  const [theme, setTheme] = useState<QuizshowScreenTheme>(() =>
    readStored(THEME_STORAGE_KEY) === "light" ? "light" : "dark",
  );
  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      writeStored(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);
  return { theme, toggleTheme };
}

/**
 * The presenter's local sound switch. Every page load starts muted (the stored
 * choice is written for the record and never read back on load), so the
 * "Turn sounds on" click is always the gesture that unlocks audio. It stays on
 * this screen and never sends a frame.
 */
export function useScreenLocalMute(): {
  isLocallyMuted: boolean;
  toggleLocalMute: () => void;
} {
  const [isLocallyMuted, setIsLocallyMuted] = useState(true);
  const toggleLocalMute = useCallback(() => {
    const isNextMuted = !isLocallyMuted;
    if (!isNextMuted) primeMessageChime();
    writeStored(MUTED_STORAGE_KEY, isNextMuted ? "true" : "false");
    setIsLocallyMuted(isNextMuted);
  }, [isLocallyMuted]);
  return { isLocallyMuted, toggleLocalMute };
}
