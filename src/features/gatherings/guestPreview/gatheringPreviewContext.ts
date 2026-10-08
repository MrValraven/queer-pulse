import { createContext, useContext } from "react";
import type { GuestPreviewRole } from "./guestPreview";

export interface GatheringPreview {
  /** The perspective being previewed, or null on the real page. */
  viewAs: GuestPreviewRole | null;
  /** What a guest action does in preview: says so, and nothing else. */
  runGuestAction: () => void;
}

const NOT_PREVIEWING: GatheringPreview = {
  viewAs: null,
  runGuestAction: () => undefined,
};

export const GatheringPreviewContext =
  createContext<GatheringPreview>(NOT_PREVIEWING);

export function useGatheringPreview(): GatheringPreview {
  return useContext(GatheringPreviewContext);
}
