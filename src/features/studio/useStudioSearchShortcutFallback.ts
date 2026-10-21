import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { readListeningPreferences } from "./player/studioPlayerPreferences";
import { STUDIO_SEARCH_INPUT_ATTRIBUTE } from "./useStudioSearchShortcut";

/** How long the search page may take to mount its field, ms. */
const FIELD_WAIT_MS = 1500;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/** Focuses the search page's field once it mounts, then stops. */
function focusSearchFieldWhenReady(): void {
  const startedAt = performance.now();
  const tryFocus = () => {
    const input = document.querySelector<HTMLInputElement>(
      `input[${STUDIO_SEARCH_INPUT_ATTRIBUTE}="page"]`,
    );
    if (input) {
      input.focus();
      input.select();
      return;
    }
    if (performance.now() - startedAt < FIELD_WAIT_MS) {
      window.requestAnimationFrame(tryFocus);
    }
  };
  window.requestAnimationFrame(tryFocus);
}

/**
 * The search shortcut on widths with no topbar field (phones and tablets,
 * where Search is a tab). useStudioSearchShortcut focuses a field when one
 * is on screen and marks the key handled; when none is, this opens
 * /studio/search and focuses its field. It mounts after that hook in the
 * shell, so its listener runs last and stands down whenever the key was
 * already handled. Same rules: "/" waits while the member types and follows
 * the "Single-key shortcuts" setting, Cmd+K (Ctrl+K) always works, and an
 * open dialog keeps its focus.
 */
export function useStudioSearchShortcutFallback(): void {
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const isCommandK =
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k";
      const isSlash =
        event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!isCommandK && !isSlash) return;
      if (isSlash && isTypingTarget(event.target)) return;
      if (isSlash && !readListeningPreferences().areSingleKeyShortcutsOn)
        return;
      if (document.querySelector('[aria-modal="true"]')) return;
      event.preventDefault();
      void navigate(routes.studioSearch);
      focusSearchFieldWhenReady();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
