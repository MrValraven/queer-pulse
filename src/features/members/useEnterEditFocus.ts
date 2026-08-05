import { useEffect, type RefObject } from "react";

/**
 * Enter-edit focus: when the read-only hero swaps out for an editor, land focus
 * on the first editable field (or the Links field when entered via "edit
 * links"), so keyboard users don't drop to <body>. Shared by the desktop and
 * mobile editors.
 */
export function useEnterEditFocus(
  focusLinks: boolean,
  heroRef: RefObject<HTMLElement | null>,
  linksRef: RefObject<HTMLDivElement | null>,
  reduced: boolean,
): void {
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (focusLinks) {
        const linksField = linksRef.current;
        if (!linksField) return;
        linksField.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "center",
        });
        linksField.querySelector<HTMLElement>("select, input, button")?.focus();
        return;
      }
      const fields = heroRef.current?.querySelectorAll<HTMLElement>(
        'input:not([type="file"]), select, textarea',
      );
      const firstVisibleField = fields
        ? Array.from(fields).find((field) => field.offsetParent !== null)
        : undefined;
      firstVisibleField?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [focusLinks, heroRef, linksRef, reduced]);
}
