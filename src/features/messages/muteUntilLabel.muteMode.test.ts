import { describe, expect, it } from "vitest";
import { resolveMuteState } from "./muteUntilLabel";

/**
 * PRD-349: `resolveMuteState`'s `isMentionsOnly`, a SECOND, independent
 * axis from `isMuted`, so a mentions-only thread reads as a distinct state
 * rather than silently folding into (or being invisible alongside) the
 * plain mute ladder.
 */
describe("resolveMuteState: isMentionsOnly", () => {
  it("is true for a thread in mentions-only mode with no ordinary mute set", () => {
    const state = resolveMuteState({ muteMode: "mentionsOnly" });
    expect(state.isMentionsOnly).toBe(true);
    expect(state.isMuted).toBe(false);
  });

  it("is false for a thread that has never picked mentions-only", () => {
    const state = resolveMuteState({ muteMode: "all" });
    expect(state.isMentionsOnly).toBe(false);
  });

  it("is false when muteMode is entirely absent (an older/undecided row)", () => {
    const state = resolveMuteState({});
    expect(state.isMentionsOnly).toBe(false);
    expect(state.isMuted).toBe(false);
  });

  it("stays true alongside an ordinary forever mute (the two axes coexist)", () => {
    const state = resolveMuteState({ muted: true, muteMode: "mentionsOnly" });
    expect(state.isMentionsOnly).toBe(true);
    expect(state.isMuted).toBe(true);
  });

  it("stays true alongside a still-active timed mute", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    const state = resolveMuteState({
      muted: true,
      mutedUntil: future,
      muteMode: "mentionsOnly",
    });
    expect(state.isMentionsOnly).toBe(true);
    expect(state.isMuted).toBe(true);
    expect(state.mutedUntilTime).toBeDefined();
  });

  it("stays true even once a timed mute has expired (the two axes are independent)", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const state = resolveMuteState({
      muted: true,
      mutedUntil: past,
      muteMode: "mentionsOnly",
    });
    expect(state.isMentionsOnly).toBe(true);
    expect(state.isMuted).toBe(false);
  });
});
