import { createContext, useContext, useEffect, useId } from "react";

export interface Frame {
  id: string;
  fullHeight: boolean;
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
