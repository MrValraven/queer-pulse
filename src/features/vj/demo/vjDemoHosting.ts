// Who hosts the demo VJ server: the tab holding the Web Lock (plan gap 3).

import { VJ_DEMO_SERVER_LOCK_NAME, VJ_DEMO_SILENCE_MS } from "../vj.constants";
import { openVjDemoChannel, type VjDemoChannel } from "./vjDemoChannel";

export interface VjDemoLockSeam {
  /** Asks for the hosting lock; `onGranted` runs once it is held. Returns release. */
  request(onGranted: () => void): () => void;
}

function webLockSeam(locks: LockManager): VjDemoLockSeam {
  return {
    request(onGranted) {
      const controller = new AbortController();
      let isReleased = false;
      let releaseHeldLock: (() => void) | null = null;
      let releaseFallback: (() => void) | null = null;
      locks
        .request(
          VJ_DEMO_SERVER_LOCK_NAME,
          { signal: controller.signal },
          () => {
            if (isReleased) return undefined;
            onGranted();
            // Held until release resolves this promise.
            return new Promise<void>((resolve) => {
              releaseHeldLock = resolve;
            });
          },
        )
        .catch(() => {
          // Our own abort on release needs nothing more. Any other refusal
          // (a sandboxed frame, a lock manager error) falls back to the
          // heartbeat election, so this tab can still host.
          if (isReleased) return;
          releaseFallback = silenceSeam(openVjDemoChannel).request(onGranted);
        });
      return () => {
        if (isReleased) return;
        isReleased = true;
        controller.abort();
        releaseHeldLock?.();
        releaseFallback?.();
      };
    },
  };
}

/**
 * Without Web Locks: hosts after VJ_DEMO_SILENCE_MS in which no tab's
 * demo:heartbeat was heard on the channel. Two tabs can win at once; the
 * servers then settle it themselves (startVjDemoServer's onYield).
 */
function silenceSeam(openChannel: () => VjDemoChannel): VjDemoLockSeam {
  return {
    request(onGranted) {
      const channel = openChannel();
      let lastHeartbeatAt = Date.now();
      let isReleased = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const unsubscribe = channel.subscribe((message) => {
        if (message.name === "demo:heartbeat") lastHeartbeatAt = Date.now();
      });
      const stopListening = () => {
        unsubscribe();
        channel.close();
        if (timer !== null) clearTimeout(timer);
        timer = null;
      };
      const check = () => {
        timer = null;
        if (isReleased) return;
        const quietFor = Date.now() - lastHeartbeatAt;
        if (quietFor >= VJ_DEMO_SILENCE_MS) {
          stopListening();
          onGranted();
          return;
        }
        timer = setTimeout(check, VJ_DEMO_SILENCE_MS - quietFor);
      };
      timer = setTimeout(check, VJ_DEMO_SILENCE_MS);
      return () => {
        if (isReleased) return;
        isReleased = true;
        stopListening();
      };
    },
  };
}

export function defaultVjDemoLock(): VjDemoLockSeam {
  const locks =
    typeof navigator === "undefined"
      ? undefined
      : (navigator.locks as LockManager | undefined);
  return locks === undefined
    ? silenceSeam(openVjDemoChannel)
    : webLockSeam(locks);
}
