import styles from "./ListBusinessPage.module.css";

/**
 * Scroll to a listing form field by its anchor id, flash it, and move focus
 * to its first control. Selectors match native inputs plus the button groups
 * used for radio/chip choices. Shared by the "what's still needed" chips and
 * the live preview's "add cover photo" button.
 */
export function jumpToListingField(
  anchor: string,
  prefersReducedMotion = false,
): void {
  const element = document.getElementById(anchor);
  if (!element) return;
  element.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "center",
  });
  const focusable = element.querySelector<HTMLElement>(
    'input:not([type="hidden"]), select, textarea, [role="radio"], button',
  );
  // Let the smooth scroll settle before pulling focus (which would otherwise
  // yank the viewport back).
  window.setTimeout(() => focusable?.focus({ preventScroll: true }), 340);
  const flash = styles.fieldFlash;
  if (flash) {
    // Restart the flash even if the same field is targeted twice in a row.
    element.classList.remove(flash);
    void element.offsetWidth;
    element.classList.add(flash);
    window.setTimeout(() => element.classList.remove(flash), 1400);
  }
}
