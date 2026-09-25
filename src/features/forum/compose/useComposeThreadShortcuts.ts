import { useEffect } from "react";
import { hasOpenModal } from "../../../shared/components/ui/modalStack";

// ── The three page-level keys ───────────────────────────────────────────────
// ⌘↵ publishes, `?` opens the reference, Escape leaves. Everything else the
// reference lists (⌘B / ⌘I, `@` / `#`, ← / →, Tab) belongs to the control it
// happens inside and is handled there — a page-level listener claiming them
// would fire while the member was typing about a keyboard.
//
// Bound to the document rather than to the card, because ⌘↵ has to work from
// the title, the body, a tag box and a poll row alike, and a member who has
// clicked nothing yet still expects Escape to work.

/** Is the member typing right now? `?` is a character in a sentence far more
 *  often than it is a request for help, so it is the one shortcut that stands
 *  down inside a field. */
function isTypingIn(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export interface ComposeThreadShortcutsOptions {
  /** True while an overlay owns the keyboard. Every overlay brings its own
   *  Escape (`useDismiss`), so the page stands down entirely rather than
   *  closing two things with one press. */
  isSuspended: boolean;
  onPublish: () => void;
  onOpenShortcuts: () => void;
  onCancel: () => void;
}

export function useComposeThreadShortcuts({
  isSuspended,
  onPublish,
  onOpenShortcuts,
  onCancel,
}: ComposeThreadShortcutsOptions) {
  useEffect(() => {
    if (isSuspended) return;
    function onKeyDown(event: KeyboardEvent) {
      // A sheet or dialog is on the modal stack, including one still fading
      // out (the success panel stays mounted through its exit, and the rail
      // sheet through its slide). Its own Escape answers; the page waits.
      if (hasOpenModal()) return;
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        onPublish();
        return;
      }
      // A layer inside the page already answered this press (the publish
      // menu closing on Escape), so it is spent. Checked after ⌘↵ on purpose:
      // the title and tag boxes claim every Enter, and ⌘↵ still publishes
      // from both.
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key === "?" && !isTypingIn(event.target)) {
        event.preventDefault();
        onOpenShortcuts();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSuspended, onPublish, onOpenShortcuts, onCancel]);
}
