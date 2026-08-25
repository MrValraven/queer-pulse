import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useLocalStorage } from "../../hooks";
import { ADMIN_NAV_SECTIONS } from "./adminNav.data";

/** Persisted open/closed state, keyed by section id. */
const OPEN_SECTIONS_KEY = "qp.adminNav.open";

type OpenSections = Record<string, boolean>;

function isOpenSections(value: unknown): value is OpenSections {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((open) => typeof open === "boolean")
  );
}

/** True when `pathname` is this destination or something nested beneath it. */
function matchesPath(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * Which admin rail sections are open, and how to toggle them.
 *
 * The stored map holds only the sections the admin has explicitly toggled;
 * anything absent falls back to the section's own `defaultOpen`. That way a
 * section added later still opens (or stays shut) as intended for admins who
 * already have a map in localStorage.
 */
export function useAdminNavSections() {
  const { pathname } = useLocation();
  const [openSections, setOpenSections] = useLocalStorage<OpenSections>(
    OPEN_SECTIONS_KEY,
    {},
    isOpenSections,
  );

  // The section holding the current page. Longest match wins so a nested route
  // can't be claimed by a shorter sibling prefix.
  const activeSectionId = useMemo(() => {
    let bestId: string | undefined;
    let bestLength = 0;
    for (const section of ADMIN_NAV_SECTIONS) {
      for (const item of section.items) {
        if (matchesPath(pathname, item.to) && item.to.length > bestLength) {
          bestId = section.id;
          bestLength = item.to.length;
        }
      }
    }
    return bestId;
  }, [pathname]);

  // Landing on a page inside a closed section opens it, so deep-linking never
  // leaves the admin looking at a link they cannot see. This writes a real
  // override rather than forcing the section open on every render, so it can be
  // collapsed again straight afterwards.
  useEffect(() => {
    if (!activeSectionId) return;
    setOpenSections((current) =>
      current[activeSectionId]
        ? current
        : { ...current, [activeSectionId]: true },
    );
  }, [activeSectionId, setOpenSections]);

  const isSectionOpen = useCallback(
    (id: string, defaultOpen?: boolean) => openSections[id] ?? !!defaultOpen,
    [openSections],
  );

  // Whether the section holding the current page is showing its links. The nav's
  // scroll correction keys off this, so it can pull a freshly revealed active
  // link into view without reacting to unrelated sections opening.
  const activeSection = ADMIN_NAV_SECTIONS.find(
    (section) => section.id === activeSectionId,
  );
  const isActiveSectionOpen = activeSection
    ? isSectionOpen(activeSection.id, activeSection.defaultOpen)
    : false;

  const toggleSection = useCallback(
    (id: string, defaultOpen?: boolean) =>
      setOpenSections((current) => ({
        ...current,
        [id]: !(current[id] ?? !!defaultOpen),
      })),
    [setOpenSections],
  );

  return { isSectionOpen, toggleSection, isActiveSectionOpen, pathname };
}
