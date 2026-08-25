import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ShellFrameContext,
  type Frame,
  type ShellFrameApi,
} from "./shellFrame";

/**
 * Registry that lets the persistent AppChrome know whether the routed page uses
 * the standard site frame (AppShell/PageShell) — and, if so, whether it is a
 * full-height route that should drop the footer. Admin/system/auth pages never
 * register, so AppChrome renders nothing for them and they keep their own chrome.
 *
 * A stack (not a boolean) because AnimatePresence keeps the outgoing page mounted
 * during a transition: two standard frames can be registered at once, and the
 * most-recently-pushed one wins for `fullHeight`.
 */
export function ShellFrameProvider({ children }: { children: ReactNode }) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const push = useCallback((frame: Frame) => {
    setFrames((current) => [...current, frame]);
  }, []);
  const remove = useCallback((id: string) => {
    setFrames((current) => current.filter((frame) => frame.id !== id));
  }, []);
  const api = useMemo<ShellFrameApi>(
    () => ({ frames, push, remove }),
    [frames, push, remove],
  );
  return (
    <ShellFrameContext.Provider value={api}>
      {children}
    </ShellFrameContext.Provider>
  );
}
