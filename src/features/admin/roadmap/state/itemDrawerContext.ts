import { createContext } from "react";

/**
 * Which roadmap item's drawer is open, shared by every view that can open
 * one (Board, Timeline, Guides, Capacity, Ideas, Public preview, …) and the
 * drawer itself (`roadmap/drawer/ItemDrawer.tsx`, built in Task C3). A
 * context rather than lifted state because the opener and the drawer are
 * siblings several views apart — threading `openId`/`open`/`close` as props
 * through the tab switch would leak drawer plumbing into every view's prop
 * API for no reason.
 */
export interface ItemDrawerContextValue {
  /** The open item's id, or `null` when the drawer is closed. */
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
}

export const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(
  null,
);
