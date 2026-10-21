import { useEffect } from "react";
import { readListeningPreferences } from "./player/studioPlayerPreferences";

/** Marks a Studio search field the shortcut can focus. The search page's
 *  own field ("page") wins over the topbar one ("shell"). */
export const STUDIO_SEARCH_INPUT_ATTRIBUTE = "data-studio-search-input";

const FIELD_PRIORITY = ["page", "shell"] as const;

/** The field's `aria-keyshortcuts`: "/" only while single-key shortcuts
 *  are on. */
export function studioSearchKeyShortcuts(
  areSingleKeyShortcutsOn: boolean,
): string {
  return areSingleKeyShortcutsOn ? "/ Control+K Meta+K" : "Control+K Meta+K";
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function findSearchField(): HTMLInputElement | null {
  for (const field of FIELD_PRIORITY) {
    const input = document.querySelector<HTMLInputElement>(
      `input[${STUDIO_SEARCH_INPUT_ATTRIBUTE}="${field}"]`,
    );
    if (input && !input.closest("[inert]")) return input;
  }
  return null;
}

/**
 * DES-59: "/" and Cmd+K (Ctrl+K off a Mac) focus Studio search from
 * anywhere in Studio, with the typed term selected so a new one replaces
 * it. "/" is a single-key shortcut, so it waits while the member types in
 * a field and follows the "Single-key shortcuts" setting; Cmd+K always
 * works. An open dialog keeps its focus. StudioShell mounts it once for
 * every Studio page; a second mount would stand down, since the first
 * listener to act marks the event handled.
 */
export function useStudioSearchShortcut(): void {
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
      const input = findSearchField();
      if (!input) return;
      event.preventDefault();
      input.focus();
      input.select();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
