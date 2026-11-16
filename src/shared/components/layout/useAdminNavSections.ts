import { useCallback, useEffect, useMemo, useState } from "react";
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

/** The path part of a nav item's `to`: the text before any `?`. */
export function navItemPathOf(to: string): string {
  const queryStart = to.indexOf("?");
  return queryStart === -1 ? to : to.slice(0, queryStart);
}

/** True when `pathname` is this destination or something nested beneath it.
 *  Only the path part of `to` counts, so an item that opens a filtered view
 *  still claims every page under its path. */
export function matchesPath(pathname: string, to: string): boolean {
  const itemPath = navItemPathOf(to);
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
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
        const itemPathLength = navItemPathOf(item.to).length;
        if (matchesPath(pathname, item.to) && itemPathLength > bestLength) {
          bestId = section.id;
          bestLength = itemPathLength;
        }
      }
    }
    return bestId;
  }, [pathname]);

  // Landing on a page inside a closed section opens it, so deep-linking never
  // leaves the admin looking at a link they cannot see. This writes a real
  // override once per landing, so the section can be collapsed again straight
  // afterwards.
  useEffect(() => {
    if (!activeSectionId) return;
    setOpenSections((current) =>
      current[activeSectionId]
        ? current
        : { ...current, [activeSectionId]: true },
    );
  }, [activeSectionId, setOpenSections]);

  // Until the admin toggles a section on this page, the one holding the page
  // renders open from the first paint, before the override above lands, so
  // the active link is there at once with no slide-open after it.
  const [toggledOnPath, setToggledOnPath] = useState<string>();
  const forcedOpenId = toggledOnPath === pathname ? undefined : activeSectionId;

  const isSectionOpen = useCallback(
    (id: string, defaultOpen?: boolean) =>
      id === forcedOpenId || (openSections[id] ?? !!defaultOpen),
    [openSections, forcedOpenId],
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
    (id: string, defaultOpen?: boolean) => {
      setToggledOnPath(pathname);
      setOpenSections((current) => ({
        ...current,
        [id]: !(current[id] ?? !!defaultOpen),
      }));
    },
    [setOpenSections, pathname],
  );

  return { isSectionOpen, toggleSection, isActiveSectionOpen, pathname };
}
