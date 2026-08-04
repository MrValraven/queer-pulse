import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface Frame {
  id: string;
  fullHeight: boolean;
}
interface ShellFrameApi {
  frames: Frame[];
  push: (frame: Frame) => void;
  remove: (id: string) => void;
}

const ShellFrameContext = createContext<ShellFrameApi | null>(null);

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

function useShellFrameApi(): ShellFrameApi {
  const api = useContext(ShellFrameContext);
  if (!api) throw new Error("useShellFrame must be used within ShellFrameProvider");
  return api;
}

/** Register the calling shell for its mounted lifetime. */
export function useRegisterShellFrame(opts?: { fullHeight?: boolean }): void {
  const id = useId();
  const fullHeight = opts?.fullHeight ?? false;
  const { push, remove } = useShellFrameApi();
  useEffect(() => {
    push({ id, fullHeight });
    return () => remove(id);
  }, [id, fullHeight, push, remove]);
}

/** Read whether any standard frame is active and the top frame's fullHeight. */
export function useShellFrame(): { active: boolean; fullHeight: boolean } {
  const { frames } = useShellFrameApi();
  const top = frames[frames.length - 1];
  return { active: frames.length > 0, fullHeight: top?.fullHeight ?? false };
}
