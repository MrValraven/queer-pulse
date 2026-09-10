import { useEffect, type RefObject } from "react";

/**
 * Enter-edit focus: when the read-only hero swaps out for an editor, land focus
 * on the first editable field (or the Links field when entered via "edit
 * links"), so keyboard users don't drop to <body>. Shared by the desktop and
 * mobile editors. Never scrolls the page on its own for the ordinary entry —
 * enterEdit has already snapped it to the top.
 */
export function useEnterEditFocus(
  focusLinks: boolean,
  heroRef: RefObject<HTMLElement | null>,
  linksRef: RefObject<HTMLDivElement | null>,
): void {
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (focusLinks) {
        const linksField = linksRef.current;
        if (!linksField) return;
        linksField.scrollIntoView({ behavior: "instant", block: "center" });
        linksField.querySelector<HTMLElement>("select, input, button")?.focus();
        return;
      }
      const fields = heroRef.current?.querySelectorAll<HTMLElement>(
        'input:not([type="file"]), select, textarea',
      );
      const firstVisibleField = fields
        ? Array.from(fields).find((field) => field.offsetParent !== null)
        : undefined;
      // `preventScroll`: a bare focus() scrolls the field into view itself, and
      // the global `html { scroll-behavior: smooth }` (base.css) animates that
      // as a glide that fights the instant jump to the top of the page
      // ProfilePage's enterEdit just made.
      firstVisibleField?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [focusLinks, heroRef, linksRef]);
}
