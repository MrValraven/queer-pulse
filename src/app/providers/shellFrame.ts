import { createContext, useContext, useEffect, useId, useState } from "react";

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

/**
 * Keep the chrome the previous page had for as long as the caller is mounted.
 * The route Suspense fallback calls this: the page a member is leaving drops
 * its frame as soon as its plane is removed, and without a stand-in the stack
 * would sit empty until the next chunk loads, so AppChrome would unmount the
 * nav for that whole gap and mount it again when the page arrives.
 *
 * The frame is copied once, at the first render, so the hold never follows
 * the stack it is propping up. When nothing was active (a cold boot, or
 * leaving an admin, system or auth page, which has no nav) it registers
 * nothing, so the fallback never brings in chrome the member did not have.
 * The page that replaces the fallback registers in the same effect flush in
 * which the fallback's hold is removed, so the stack never goes empty there
 * either.
 */
export function useHoldShellFrame(): void {
  const id = useId();
  const currentFrame = useShellFrame();
  const [heldFrame] = useState(() =>
    currentFrame.active
      ? {
          fullHeight: currentFrame.fullHeight,
          chromeless: currentFrame.chromeless,
        }
      : null,
  );
  const { push, remove } = useShellFrameApi();
  useEffect(() => {
    if (!heldFrame) return;
    push({ id, ...heldFrame });
    return () => remove(id);
  }, [id, heldFrame, push, remove]);
}
