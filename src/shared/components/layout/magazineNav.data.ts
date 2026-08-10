import { FiList, FiInbox, FiCalendar } from "react-icons/fi";
import type { IconType } from "react-icons";
import { routes } from "../../../app/routeMap";

export interface MagazineNavItem {
  /** Catalog key for the visible label — resolve with `t()`. */
  labelKey: string;
  to: string;
  icon: IconType;
  end?: boolean;
  /** Only true for the "Issue" item: `to` still carries the raw `:number`
   *  route param and must be resolved against the current issue's number
   *  before rendering (see `MagazineSidebar`). Falls back to
   *  `MAGAZINE_ISSUE_FALLBACK_ROUTE` when there is no current issue yet. */
  needsCurrentIssueNumber?: boolean;
}

/**
 * The magazine editor rail's real destinations. The design source ("QueerPulse
 * Magazine Desk" left rail) also lists "Pieces" and "Contributors" — dropped
 * here because neither page exists in this build; only Desk, Pitches and
 * Issue are real, navigable surfaces.
 */
export const MAGAZINE_NAV: MagazineNavItem[] = [
  {
    labelKey: "magazine:deskShell.nav.desk",
    to: routes.magazineEditor,
    icon: FiList,
    // `/magazine/editor` is a path prefix of every other editor route
    // (piece record, issue production, write, deck editor) — `end` keeps
    // "Desk" from lighting up while on those sub-surfaces.
    end: true,
  },
  {
    labelKey: "magazine:deskShell.nav.pitches",
    to: routes.pitchTracker,
    icon: FiInbox,
    end: true,
  },
  {
    labelKey: "magazine:deskShell.nav.issue",
    to: routes.magazineIssueProd,
    icon: FiCalendar,
    end: true,
    needsCurrentIssueNumber: true,
  },
];

/**
 * Fallback destination for the "Issue" nav item when no current issue exists
 * yet to fill `:number` — the only other real, param-free "issue" route in
 * the app (the public back-issues archive).
 */
export const MAGAZINE_ISSUE_FALLBACK_ROUTE = routes.issues;
