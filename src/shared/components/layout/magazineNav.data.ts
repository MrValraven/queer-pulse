import { FiList, FiCalendar, FiArchive } from "react-icons/fi";
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
 * Magazine Desk" left rail) also lists "Pieces" and "Contributors", dropped
 * here because neither page exists in this build; only Desk, Issue and the
 * archive are real, navigable surfaces.
 *
 * "Pitches" was dropped for the same reason, and PRD-125 is why it had to go.
 * It pointed at `routes.pitchTracker`, which is the MEMBER's own submission
 * tracker: a different surface, in `AppShell` rather than the desk shell, for
 * a different audience. While that route was staff-gated the mistake was
 * invisible; opening it to every member (which is correct, since the endpoint
 * behind it only ever required an active member) made it a rail item that
 * silently threw an editor out of the desk. It also collided by name with the
 * account menu's own "Pitches" entry, so the same word meant two surfaces.
 *
 * The editor's real pitch inbox is `PitchInbox`, rendered INLINE on the desk
 * itself (`desk/DeskView.tsx`), so it has no route to point at and nothing is
 * lost: "Desk" already lands on the page the inbox lives on. Do not re-add a
 * "Pitches" entry here unless the inbox first becomes an addressable surface.
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
    labelKey: "magazine:deskShell.nav.issue",
    to: routes.magazineIssueProd,
    icon: FiCalendar,
    end: true,
    needsCurrentIssueNumber: true,
  },
  // CON-16 — the archive's own surface: where a published piece is archived,
  // superseded or put back under review, and where a promised re-review comes
  // due. Every other desk destination runs a piece towards publication.
  {
    labelKey: "magazine:deskShell.nav.lifecycle",
    to: routes.magazineLifecycle,
    icon: FiArchive,
    end: true,
  },
];

/**
 * Fallback destination for the "Issue" nav item when no current issue exists
 * yet to fill `:number` — the only other real, param-free "issue" route in
 * the app (the public back-issues archive).
 */
export const MAGAZINE_ISSUE_FALLBACK_ROUTE = routes.issues;
