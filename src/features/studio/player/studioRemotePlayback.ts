import type { StudioRemoteState } from "./studioPlayerContext";

/** Remote playback through the browser only (spec 4.5): the Remote Playback
 *  API (Cast in Chrome, AirPlay in Safari) and Safari's AirPlay picker. No
 *  third-party script. */
export const REMOTE_IDLE: StudioRemoteState = {
  isAvailable: false,
  isConnected: false,
};

interface WebkitMediaElement {
  webkitShowPlaybackTargetPicker?: () => void;
  webkitCurrentPlaybackTargetIsWireless?: boolean;
}

export interface StudioRemoteWatcher {
  state: () => StudioRemoteState;
  dispose: () => void;
}

// jsdom and older browsers have no `remote`, though the DOM types promise it.
const remoteOf = (element: HTMLAudioElement): RemotePlayback | null =>
  (element as { remote?: RemotePlayback }).remote ?? null;

const isConnected = (element: HTMLAudioElement): boolean =>
  remoteOf(element)?.state === "connected" ||
  (element as WebkitMediaElement).webkitCurrentPlaybackTargetIsWireless ===
    true;

export function isRemotePlaybackSupported(element: HTMLAudioElement): boolean {
  return (
    remoteOf(element) !== null ||
    typeof (element as WebkitMediaElement).webkitShowPlaybackTargetPicker ===
      "function"
  );
}

export function watchRemotePlayback(
  elements: readonly HTMLAudioElement[],
  onChange: (state: StudioRemoteState) => void,
): StudioRemoteWatcher {
  const detach = new AbortController();
  const availability = new Map<HTMLAudioElement, boolean>();
  const watches: { remote: RemotePlayback; watchId: number }[] = [];
  let current = REMOTE_IDLE;
  const update = () => {
    const next = {
      isAvailable: [...availability.values()].some(Boolean),
      isConnected: elements.some(isConnected),
    };
    if (
      next.isAvailable === current.isAvailable &&
      next.isConnected === current.isConnected
    )
      return;
    current = next;
    onChange(next);
  };
  for (const element of elements) {
    const remote = remoteOf(element);
    if (remote) {
      remote
        .watchAvailability((isAvailable) => {
          availability.set(element, isAvailable);
          update();
        })
        .then(
          (watchId) => {
            if (detach.signal.aborted)
              void remote
                .cancelWatchAvailability(watchId)
                .catch(() => undefined);
            else watches.push({ remote, watchId });
          },
          () => {
            // NotSupportedError: this element reports no devices.
          },
        );
      for (const type of ["connecting", "connect", "disconnect"])
        remote.addEventListener(type, update, { signal: detach.signal });
    }
    element.addEventListener(
      "webkitplaybacktargetavailabilitychanged",
      (event) => {
        availability.set(
          element,
          (event as Event & { availability?: string }).availability ===
            "available",
        );
        update();
      },
      { signal: detach.signal },
    );
    element.addEventListener(
      "webkitcurrentplaybacktargetiswirelesschanged",
      update,
      { signal: detach.signal },
    );
  }
  return {
    state: () => current,
    dispose: () => {
      detach.abort();
      for (const { remote, watchId } of watches)
        void remote.cancelWatchAvailability(watchId).catch(() => undefined);
    },
  };
}

/** Safari's AirPlay picker where it exists, else the browser's own picker.
 *  A dismissed picker or no device is quiet. */
export function promptRemotePicker(element: HTMLAudioElement): void {
  const webkitElement = element as WebkitMediaElement;
  if (typeof webkitElement.webkitShowPlaybackTargetPicker === "function") {
    webkitElement.webkitShowPlaybackTargetPicker();
    return;
  }
  void remoteOf(element)
    ?.prompt()
    .catch(() => undefined);
}
