import { createContext, useContext } from "react";
import type { Workshop } from "../../features/economy/workshops.data";
import type { WorkshopDraft } from "../../features/economy/addWorkshop.build";
import type { WorkshopRsvpStore } from "../../features/economy/api/workshopRsvp.hooks";

// ── The session-overlay context, split out of useWorkshops.ts ──────────────
// `WorkshopsProvider` (always mounted at the app root — see App.tsx's
// `DataProviders`) only needs this Context object + its type, never the
// catalogue hook below. `useWorkshops.ts`'s `useWorkshops()` catalogue hook
// imports `WORKSHOPS` (the workshops fixture data) at module scope for its
// demo-mode total — harmless for the many already-lazy economy pages that call
// it, but importing ANYTHING from that module (even just the Context) would
// pull that whole module, `WORKSHOPS` included, into whatever chunk imports
// it. Since `WorkshopsProvider` is entry-chunk-reachable, that used to mean
// the workshops fixture rode along in the entry chunk. Keeping the Context
// here, with no `WORKSHOPS` import, is what keeps it out.

/** The session overlay: workshops listed, edited or deleted in this browser
 *  session, plus the mutators. Deliberately carries NO catalogue and no query
 *  state — those come from `useWorkshops()` in `useWorkshops.ts`. */
export interface WorkshopsContextValue {
  /** Workshops listed in this session, newest first. */
  added: Workshop[];
  /** Session-local edits, by workshop id. */
  edited: Record<string, Workshop>;
  /** Ids deleted in this session. */
  removed: string[];
  /**
   * List a workshop from the form draft. Resolves the created workshop, or
   * `null` when the write failed — callers must not show a success panel on
   * `null`.
   */
  addWorkshop: (draft: WorkshopDraft) => Promise<Workshop | null>;
  /**
   * Edit a workshop you host. Resolves the updated workshop, or `null` when the
   * write failed — callers must not show a success state on `null`.
   */
  updateWorkshop: (id: string, draft: WorkshopDraft) => Promise<Workshop | null>;
  /** Delete a workshop you host. Resolves false when the write failed. */
  deleteWorkshop: (id: string) => Promise<boolean>;
}

/** Overlay + bookings: everything a component can do without reading the
 *  catalogue, and therefore without triggering GET /workshops. */
export type WorkshopsActions = WorkshopsContextValue & WorkshopRsvpStore;

export const WorkshopsContext = createContext<WorkshopsActions | null>(null);

/**
 * The session overlay and mutators, with NO catalogue subscription — so calling
 * this never triggers GET /workshops. Use it from anything that acts on a
 * workshop (RSVP, edit, delete) rather than rendering the catalogue.
 */
export function useWorkshopsActions(): WorkshopsActions {
  const ctx = useContext(WorkshopsContext);
  if (!ctx) {
    throw new Error("useWorkshops must be used within WorkshopsProvider");
  }
  return ctx;
}
