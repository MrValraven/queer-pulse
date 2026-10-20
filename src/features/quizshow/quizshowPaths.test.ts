import { describe, expect, it } from "vitest";
import { gatheringPath } from "../gatherings/gatheringPaths";
import {
  isJoinCodeShaped,
  normaliseJoinCode,
  quizshowPlayPath,
  quizshowRemotePath,
  quizshowScreenPath,
} from "./quizshowPaths";
import { isQuizshowVisible } from "./quizshowLaunch";

describe("quizshow paths", () => {
  it("hangs the screen and the remote under the event's own path", () => {
    expect(quizshowScreenPath("pride-brunch-jun")).toBe(
      `${gatheringPath("pride-brunch-jun")}/quizshow/screen`,
    );
    expect(quizshowRemotePath("pride-brunch-jun")).toBe(
      `${gatheringPath("pride-brunch-jun")}/quizshow/remote`,
    );
  });
  it("builds the play paths with and without a code", () => {
    expect(quizshowPlayPath()).toBe("/play");
    expect(quizshowPlayPath("QZ7KP4")).toBe("/play/QZ7KP4");
  });
  it("reads a typed code the way the server does", () => {
    expect(normaliseJoinCode(" qz7-kp 4 ")).toBe("QZ7KP4");
    expect(isJoinCodeShaped("qz7 kp4")).toBe(true);
    expect(isJoinCodeShaped("QZ7KPO")).toBe(false);
  });
  it("shows Pulse Live in demo and in dev, and hides it in a live build until launch", () => {
    expect(isQuizshowVisible({ isDemoMode: true, isDevBuild: false })).toBe(
      true,
    );
    expect(isQuizshowVisible({ isDemoMode: false, isDevBuild: true })).toBe(
      true,
    );
    expect(isQuizshowVisible({ isDemoMode: false, isDevBuild: false })).toBe(
      false,
    );
  });
});
