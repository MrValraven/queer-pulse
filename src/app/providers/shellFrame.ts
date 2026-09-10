import { createContext, useContext, useEffect, useId } from "react";

export interface Frame {
  id: string;
  fullHeight: boolean;
  /** Desktop-only: the page draws its own chrome, so AppChrome mounts no top
   * bar and no left rail above the mobile breakpoint. Mobile keeps both. */
  desktopChromeless: boolean;
}
export interface ShellFrameApi {
  frames: Frame[];
  push: (frame: Frame) => void;
  remove: (id: string) => void;
}

export const ShellFrameContext = createContext<ShellFrameApi | null>(null);

function useShellFrameApi(): ShellFrameApi {
  const api = useContext(ShellFrameContext);
  if (!api)
    throw new Error("useShellFrame must be used within ShellFrameProvider");
  return api;
}

/** Register the calling shell for its mounted lifetime. */
export function useRegisterShellFrame(opts?: {
  fullHeight?: boolean;
  desktopChromeless?: boolean;
}): void {
  const id = useId();
  const fullHeight = opts?.fullHeight ?? false;
  const desktopChromeless = opts?.desktopChromeless ?? false;
  const { push, remove } = useShellFrameApi();
  useEffect(() => {
    push({ id, fullHeight, desktopChromeless });
    return () => remove(id);
  }, [id, fullHeight, desktopChromeless, push, remove]);
}

/** Read whether any standard frame is active, plus the top frame's flags. */
export function useShellFrame(): {
  active: boolean;
  fullHeight: boolean;
  desktopChromeless: boolean;
} {
  const { frames } = useShellFrameApi();
  const top = frames[frames.length - 1];
  return {
    active: frames.length > 0,
    fullHeight: top?.fullHeight ?? false,
    desktopChromeless: top?.desktopChromeless ?? false,
  };
}
