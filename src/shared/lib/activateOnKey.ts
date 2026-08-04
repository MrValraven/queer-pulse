import { type KeyboardEvent } from "react";

/**
 * Keyboard-activation guard for a `<span role="button" tabIndex={0}>` (the repo
 * pattern for a clickable inside a router `<Link>`, where a nested `<button>` is
 * disallowed). Runs `action` and calls `preventDefault()` when the pressed key is
 * Enter or Space, mirroring how a native button activates — so the span is
 * operable by keyboard, not just pointer.
 *
 * De-duplicates the inline `event.key === "Enter" || event.key === " "` guard
 * that was re-inlined ~8x across `features/economy`.
 *
 * Import by relative path (e.g.
 * `import { activateOnKey } from "../../shared/lib/activateOnKey"`).
 */
export function activateOnKey(event: KeyboardEvent, action: () => void): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
}
