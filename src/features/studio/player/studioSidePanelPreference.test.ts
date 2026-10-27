import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE,
  parseStudioSidePanelPreference,
  useStudioSidePanelPreference,
  writeStudioSidePanelPreference,
} from "./studioSidePanelPreference";

describe("studioSidePanelPreference", () => {
  it("falls back to Now playing, open, for a member who never chose", () =>
    expect(parseStudioSidePanelPreference(null)).toEqual({
      isOpen: true,
      view: "nowPlaying",
    }));

  it("reads a saved closed queue choice", () =>
    expect(
      parseStudioSidePanelPreference('{"isOpen":false,"view":"queue"}'),
    ).toEqual({ isOpen: false, view: "queue" }));

  it("falls back on malformed or unknown values", () => {
    expect(parseStudioSidePanelPreference("{oops")).toEqual(
      DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE,
    );
    expect(
      parseStudioSidePanelPreference('{"isOpen":"yes","view":"lyrics"}'),
    ).toEqual(DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE);
  });

  it("keeps the choice for the visit when storage refuses the write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    writeStudioSidePanelPreference({ isOpen: false, view: "queue" });
    const { result } = renderHook(() => useStudioSidePanelPreference());
    expect(result.current).toEqual({ isOpen: false, view: "queue" });
  });
});
