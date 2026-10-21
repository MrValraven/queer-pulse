import { createContext, useContext } from "react";
import type { StudioLinkTarget } from "./studioLinkTarget";

/** One ask to share a lyric line (PRD-13). */
export interface StudioLyricShareRequest {
  target: StudioLinkTarget;
  /** The track's title, for the share sheet and the picker. */
  title: string;
  /** Where focus goes back when the sheet closes, if it is still there. */
  returnFocusElement: HTMLElement | null;
}

export interface StudioLyricShareHostValue {
  /** The lyric being shared while the sheet is open, else null. */
  sharedTarget: StudioLinkTarget | null;
  openLyricShare: (request: StudioLyricShareRequest) => void;
}

/** Set by `StudioLyricShareHost`. The sheet lives in the host, above the
 *  lyrics a track change remounts, so a half-written send outlasts the
 *  next track. Without a host the lines offer no share. */
export const StudioLyricShareHostContext =
  createContext<StudioLyricShareHostValue | null>(null);

export function useStudioLyricShareHost(): StudioLyricShareHostValue | null {
  return useContext(StudioLyricShareHostContext);
}
