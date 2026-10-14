import { describe, expect, it } from "vitest";
import { createStudioPlayerTestValue } from "../../../test/studioPlayerTestValue";
import { runPlayerShortcut } from "./studioPlayerShortcutActions";
import { createSurfaceValue } from "./ui/studioPlayerTestHarness";

describe("runPlayerShortcut queue", () => {
  it("opens the queue when Now playing is closed", () => {
    const surface = createSurfaceValue();
    runPlayerShortcut("queue", {
      player: createStudioPlayerTestValue(),
      surface,
      currentTime: 0,
    });
    expect(surface.openQueue).toHaveBeenCalledTimes(1);
    expect(surface.setNowPlayingTab).not.toHaveBeenCalled();
  });

  it("switches Now playing to its Queue tab while it is open", () => {
    const surface = createSurfaceValue({ isNowPlayingOpen: true });
    runPlayerShortcut("queue", {
      player: createStudioPlayerTestValue(),
      surface,
      currentTime: 0,
    });
    expect(surface.setNowPlayingTab).toHaveBeenCalledWith("queue");
    expect(surface.openQueue).not.toHaveBeenCalled();
  });
});
