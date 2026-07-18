import { prefersReducedMotionNow } from "../hooks/usePrefersReducedMotion";

/**
 * Focus management for failed form submission (production-readiness spec 14).
 *
 * When a submit is rejected, a sighted user sees red text appear. A screen-reader
 * or keyboard user gets nothing: focus stays on the submit button, the page may
 * not even scroll, and the only signal that anything happened is an error message
 * somewhere they aren't. Moving focus to the first invalid control fixes that in
 * one move — it announces the field, its label, and (via `aria-describedby`) the
 * error text, and it puts the caret where the fix has to be typed.
 *
 * The contract is `aria-invalid="true"`, which is exactly what `FormField`
 * injects onto its native child when it is given an `error` prop. So any form
 * built out of `FormField` is already wired for this and needs no new props —
 * pass the form element and the right thing happens. Controls outside a
 * `FormField` that set `aria-invalid` themselves are picked up identically.
 */

/** Focusable form controls we're willing to move focus to. */
const FOCUSABLE =
  'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])';

export interface FocusFirstErrorOptions {
  /**
   * Scroll the control into view as well as focusing it. Default true. Focus
   * alone scrolls in most browsers, but not predictably enough under a sticky
   * Navbar, so we always drive the scroll ourselves.
   */
  scroll?: boolean;
  /**
   * Override the reduced-motion decision. Defaults to reading the user's OS
   * setting and the in-app toggle. Mostly here so tests don't need to stub
   * matchMedia.
   */
  reducedMotion?: boolean;
}

/**
 * Whether an element can actually take focus right now. `aria-invalid` may sit
 * on something unfocusable (a wrapper, a fieldset, a listbox div), and focusing
 * a `disabled` or `hidden` control silently does nothing — which would look
 * exactly like the bug we're fixing.
 */
function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.hasAttribute("disabled")) return false;
  if (el.getAttribute("aria-hidden") === "true") return false;
  // `hidden`, `display:none` and `visibility:hidden` all zero out offsetParent —
  // except for `position: fixed`, which we allow through via the rect check.
  if (el.hidden) return false;
  if (!el.offsetParent && el.getBoundingClientRect().height === 0) {
    // jsdom has no layout engine, so every element reports 0×0 and no
    // offsetParent. Treat "no layout information at all" as focusable rather
    // than filtering the whole document out under test.
    const hasLayout =
      typeof el.getClientRects === "function" && el.getClientRects().length > 0;
    if (hasLayout) return false;
  }
  return el.matches(FOCUSABLE) || el.tabIndex >= 0;
}

/**
 * The first control marked invalid within `root`, in document order — i.e. the
 * first one the user reads, not the first one the validator happened to check.
 *
 * If the invalid element can't take focus itself, its first focusable descendant
 * is used, so a composite control (`role="group"`, a custom combobox) that flags
 * itself invalid on a wrapper still lands focus somewhere useful.
 */
export function findFirstInvalidControl(
  root: ParentNode | null | undefined,
): HTMLElement | null {
  if (!root) return null;
  const invalid = root.querySelectorAll('[aria-invalid="true"]');
  for (const el of invalid) {
    if (isFocusable(el)) return el;
    const inner = el.querySelector(FOCUSABLE);
    if (inner && isFocusable(inner)) return inner;
  }
  return null;
}

/**
 * Move focus to the first invalid control inside `root` and scroll it into view.
 * Returns true if something was focused, so a caller can fall back (e.g. focus a
 * summary banner) when a submit failed for a reason no single field owns.
 *
 * NOTE ON TIMING: call this *after* the render that adds `aria-invalid`, not in
 * the same tick as the `setState` that causes it — otherwise the attributes
 * aren't in the DOM yet and this finds nothing. `focusFirstErrorAfterRender`
 * exists precisely so call sites don't have to think about that.
 */
export function focusFirstError(
  root: ParentNode | null | undefined,
  { scroll = true, reducedMotion }: FocusFirstErrorOptions = {},
): boolean {
  const target = findFirstInvalidControl(root);
  if (!target) return false;

  // Focus without the browser's own scroll, then scroll deliberately: the
  // default jumps the field to the very top edge, where a sticky Navbar can sit
  // right on top of it.
  target.focus({ preventScroll: true });

  if (scroll && typeof target.scrollIntoView === "function") {
    const reduce = reducedMotion ?? prefersReducedMotionNow();
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  }
  return true;
}

/**
 * `focusFirstError`, deferred to the next animation frame.
 *
 * The normal call site is a submit handler that first calls `setState` to reveal
 * the errors. React commits that update after the handler returns, so reading the
 * DOM synchronously would race the render. One frame is enough — and using rAF
 * rather than `setTimeout(0)` also means the scroll starts on a frame boundary.
 *
 * Returns a cancel function for the rare caller that unmounts in between.
 */
export function focusFirstErrorAfterRender(
  root: ParentNode | null | undefined,
  options?: FocusFirstErrorOptions,
): () => void {
  if (typeof requestAnimationFrame !== "function") {
    focusFirstError(root, options);
    return () => {};
  }
  const id = requestAnimationFrame(() => focusFirstError(root, options));
  return () => cancelAnimationFrame(id);
}
