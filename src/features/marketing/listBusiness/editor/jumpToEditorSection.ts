/**
 * Scroll one editor section into view and hand it the keyboard.
 *
 * Focus is moved only after the scroll has had time to settle: focusing a
 * section mid-scroll yanks the viewport back to where the jump started, which
 * reads as the link having failed.
 */
export function jumpToEditorSection(
  sectionId: string,
  prefersReducedMotion: boolean,
): void {
  const section = document.getElementById(sectionId);
  if (!section) return;
  section.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
  window.setTimeout(() => section.focus({ preventScroll: true }), 340);
}
