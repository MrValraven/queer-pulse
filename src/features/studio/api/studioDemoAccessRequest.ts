/** Demo only: with `?studioAccess=off` the Studio page offers "Request Studio
 *  access". The demo has no server, so the request lives in this module. It
 *  resets on a reload, the way a demo session does. */
export interface DemoStudioAccessRequest {
  hasPendingRequest: boolean;
  wantsToRelease: boolean;
}

const NO_REQUEST: DemoStudioAccessRequest = {
  hasPendingRequest: false,
  wantsToRelease: false,
};

let current: DemoStudioAccessRequest = NO_REQUEST;
const listeners = new Set<() => void>();

/** The same object until the request changes, so it is a stable snapshot for
 *  `useSyncExternalStore`. */
export function readDemoStudioAccessRequest(): DemoStudioAccessRequest {
  return current;
}

export function subscribeDemoStudioAccessRequest(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** A request puts the member on the list; null cancels it. */
export function setDemoStudioAccessRequest(
  next: { wantsToRelease: boolean } | null,
): void {
  current = next
    ? { hasPendingRequest: true, wantsToRelease: next.wantsToRelease }
    : NO_REQUEST;
  for (const listener of listeners) listener();
}

export function resetDemoStudioAccessRequestForTests(): void {
  current = NO_REQUEST;
  listeners.clear();
}
