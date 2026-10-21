import { useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { StudioLyricShareDialog } from "./StudioLyricShareDialog";
import {
  StudioLyricShareHostContext,
  type StudioLyricShareHostValue,
  type StudioLyricShareRequest,
} from "./studioLyricShareHostContext";

/**
 * Holds the "Share lyric" sheet for the lyrics under it (Now playing's
 * lyrics pane, the track page's lyrics card). Mount it above the part that
 * remounts per track: the sheet and its chat picker then stay open when
 * playback moves on. On close, focus goes back to the line that opened it
 * when the sheet's own hand-back found nothing to return to.
 */
export function StudioLyricShareHost({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<StudioLyricShareRequest | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const value = useMemo<StudioLyricShareHostValue>(
    () => ({
      sharedTarget: request?.target ?? null,
      openLyricShare: (nextRequest) => {
        returnFocusRef.current = nextRequest.returnFocusElement;
        setRequest(nextRequest);
      },
    }),
    [request],
  );
  const onExitComplete = () => {
    const element = returnFocusRef.current;
    returnFocusRef.current = null;
    const active = document.activeElement;
    const isFocusLost =
      active === null || active === document.body || !active.isConnected;
    if (isFocusLost && element?.isConnected) element.focus();
  };
  return (
    <StudioLyricShareHostContext.Provider value={value}>
      {children}
      <AnimatePresence onExitComplete={onExitComplete}>
        {request && (
          <StudioLyricShareDialog
            key={`${request.target.id}:${request.target.lineIndex}`}
            target={request.target}
            title={request.title}
            onClose={() => setRequest(null)}
          />
        )}
      </AnimatePresence>
    </StudioLyricShareHostContext.Provider>
  );
}
