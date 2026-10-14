import { describe, expect, it, vi } from "vitest";
import {
  isRemotePlaybackSupported,
  promptRemotePicker,
  watchRemotePlayback,
} from "./studioRemotePlayback";

function remoteElement() {
  let availabilityCallback: ((isAvailable: boolean) => void) | null = null;
  const remote = Object.assign(new EventTarget(), {
    state: "disconnected",
    watchAvailability: vi.fn((callback: (isAvailable: boolean) => void) => {
      availabilityCallback = callback;
      return Promise.resolve(1);
    }),
    cancelWatchAvailability: vi.fn(() => Promise.resolve()),
    prompt: vi.fn(() => Promise.resolve()),
  });
  const element = Object.assign(new EventTarget(), { remote });
  return {
    element: element as unknown as HTMLAudioElement,
    remote,
    report: (isAvailable: boolean) => availabilityCallback?.(isAvailable),
  };
}

describe("remote playback", () => {
  it("reports a reachable device and a connection", async () => {
    const first = remoteElement();
    const onChange = vi.fn();
    watchRemotePlayback([first.element], onChange);
    await Promise.resolve();
    first.report(true);
    expect(onChange).toHaveBeenLastCalledWith({
      isAvailable: true,
      isConnected: false,
    });
    first.remote.state = "connected";
    first.remote.dispatchEvent(new Event("connect"));
    expect(onChange).toHaveBeenLastCalledWith({
      isAvailable: true,
      isConnected: true,
    });
  });

  it("reads Safari's AirPlay availability event", () => {
    const element = new EventTarget() as unknown as HTMLAudioElement;
    const onChange = vi.fn();
    watchRemotePlayback([element], onChange);
    const event = Object.assign(
      new Event("webkitplaybacktargetavailabilitychanged"),
      { availability: "available" },
    );
    element.dispatchEvent(event);
    expect(onChange).toHaveBeenLastCalledWith({
      isAvailable: true,
      isConnected: false,
    });
  });

  it("opens the AirPlay picker where it exists, else the browser picker", () => {
    const picker = vi.fn();
    const airplay = Object.assign(new EventTarget(), {
      webkitShowPlaybackTargetPicker: picker,
    }) as unknown as HTMLAudioElement;
    promptRemotePicker(airplay);
    expect(picker).toHaveBeenCalled();
    const cast = remoteElement();
    promptRemotePicker(cast.element);
    expect(cast.remote.prompt).toHaveBeenCalled();
  });

  it("knows when the browser offers neither", () => {
    expect(
      isRemotePlaybackSupported(
        new EventTarget() as unknown as HTMLAudioElement,
      ),
    ).toBe(false);
    expect(isRemotePlaybackSupported(remoteElement().element)).toBe(true);
  });
});
