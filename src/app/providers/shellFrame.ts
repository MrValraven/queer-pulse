import { createContext, useContext, useEffect, useId } from "react";

export interface Frame {
  id: string;
  fullHeight: boolean;
  /** The page draws its own chrome, so AppChrome shows no top bar on any
   * viewport and no left rail on desktop. The bottom tab bar stays on mobile. */
  chromeless: boolean;
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
  chromeless?: boolean;
}): void {
  const id = useId();
  const fullHeight = opts?.fullHeight ?? false;
  const chromeless = opts?.chromeless ?? false;
  const { push, remove } = useShellFrameApi();
  useEffect(() => {
    push({ id, fullHeight, chromeless });
    return () => remove(id);
  }, [id, fullHeight, chromeless, push, remove]);
}

/** Read whether any standard frame is active, plus the top frame's flags. */
export function useShellFrame(): {
  active: boolean;
  fullHeight: boolean;
  chromeless: boolean;
} {
  const { frames } = useShellFrameApi();
  const top = frames[frames.length - 1];
  return {
    active: frames.length > 0,
    fullHeight: top?.fullHeight ?? false,
    chromeless: top?.chromeless ?? false,
  };
}
