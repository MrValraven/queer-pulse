import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { PROFILE_NAV } from "./editProfileNav.data";

/** Sticky header offset so a scrolled-to section clears the AppNav. */
const SCROLL_OFFSET = 100;

/**
 * Scroll-spy shared by the profile editor's two navigations — the desktop
 * vertical sidebar and the mobile horizontal strip. Both read one source of
 * truth so the highlighted section never disagrees between them. Each nav item's
 * `id` matches the `id` on a section rendered by EditProfileSections.
 */
export function useProfileScrollSpy() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(PROFILE_NAV[0]!.id);

  useEffect(() => {
    function onScroll() {
      let current = PROFILE_NAV[0]!.id;
      for (const item of PROFILE_NAV) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top - SCROLL_OFFSET <= 1)
          current = item.id;
      }
      setActive(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      setActive(id);
      const top =
        el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  return { active, goTo };
}
