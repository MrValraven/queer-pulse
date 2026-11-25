import { describe, expect, it } from "vitest";
import { gatheringPath } from "../gatherings/gatheringPaths";
import {
  isJoinCodeShaped,
  QUIZSHOW_GAME_PRINT_ROUTE,
  QUIZSHOW_HELPER_PAIR_ROUTE,
  QUIZSHOW_HELPER_REMOTE_ROUTE,
  QUIZSHOW_PRINT_ROUTE,
  QUIZSHOW_TV_ROUTE,
  STUDIO_FOCUS_PARAMS,
  quizshowEditPath,
  quizshowGamePath,
  quizshowGameRemotePath,
  quizshowGameScreenPath,
  quizshowHelperPairPath,
  quizshowHelperRemotePath,
  quizshowHostProfilePath,
  normaliseJoinCode,
  quizshowPlayPath,
  quizshowPrintPath,
  quizshowRemotePath,
  quizshowScreenPath,
  quizshowStudioFocusPath,
  quizshowTvPath,
} from "./quizshowPaths";
import { eventScope, gameScope } from "./quizshowScope";
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
  it("builds game screen and remote paths under /play/games", () => {
    expect(quizshowGameScreenPath("g1")).toBe("/play/games/g1/screen");
    expect(quizshowGameRemotePath("g1")).toBe("/play/games/g1/remote");
    expect(quizshowGamePath("g1")).toBe("/play/games/g1");
    expect(quizshowGamePath("g1", { shouldOpenSources: true })).toBe(
      "/play/games/g1?start=copy",
    );
  });
  it("puts the TV and the helper remote under /play", () => {
    expect(QUIZSHOW_TV_ROUTE).toBe("/play/tv");
    expect(QUIZSHOW_HELPER_PAIR_ROUTE).toBe("/play/remote");
    expect(QUIZSHOW_HELPER_REMOTE_ROUTE).toBe("/play/remote/:sessionId");
    expect(quizshowTvPath()).toBe("/play/tv");
    expect(quizshowHelperPairPath()).toBe("/play/remote");
    expect(
      quizshowHelperRemotePath("5f0c9a7e-1d2b-4c3a-9e8f-0a1b2c3d4e5f"),
    ).toBe("/play/remote/5f0c9a7e-1d2b-4c3a-9e8f-0a1b2c3d4e5f");
  });
  it("builds both print sheets for an event and for a game", () => {
    expect(QUIZSHOW_PRINT_ROUTE).toBe("/gatherings/:slug/quizshow/print");
    expect(QUIZSHOW_GAME_PRINT_ROUTE).toBe("/play/games/:gameId/print");
    expect(quizshowPrintPath(eventScope("pride-brunch-jun"), "host")).toBe(
      `${gatheringPath("pride-brunch-jun")}/quizshow/print?sheet=host`,
    );
    expect(quizshowPrintPath(gameScope("g1"), "answers")).toBe(
      "/play/games/g1/print?sheet=answers",
    );
  });
  it("opens the studio on one question with the round and question params", () => {
    expect(quizshowStudioFocusPath(eventScope("pride-brunch-jun"), 2, 4)).toBe(
      `${quizshowEditPath("pride-brunch-jun")}?round=2&question=4`,
    );
    expect(quizshowStudioFocusPath(gameScope("g1"), 0, 0)).toBe(
      "/play/games/g1?round=0&question=0",
    );
  });
  it("adds the question's prompt in both languages so the studio can check it is the same question", () => {
    const path = quizshowStudioFocusPath(gameScope("g1"), 1, 2, {
      en: "Who marched first?",
      pt: "",
    });
    const searchParams = new URL(path, "https://example.test").searchParams;
    expect(searchParams.get(STUDIO_FOCUS_PARAMS.round)).toBe("1");
    expect(searchParams.get(STUDIO_FOCUS_PARAMS.question)).toBe("2");
    expect(searchParams.get(STUDIO_FOCUS_PARAMS.promptEn)).toBe(
      "Who marched first?",
    );
    expect(searchParams.get(STUDIO_FOCUS_PARAMS.promptPt)).toBe("");
  });
  it("links a host to their member page", () => {
    expect(quizshowHostProfilePath("rui")).toBe("/members/rui");
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
  it("shows Pulse Live in a live build to a member holding the early-access grant", () => {
    expect(
      isQuizshowVisible({
        isDemoMode: false,
        isDevBuild: false,
        hasEarlyAccess: true,
      }),
    ).toBe(true);
    expect(
      isQuizshowVisible({
        isDemoMode: false,
        isDevBuild: false,
        hasEarlyAccess: false,
      }),
    ).toBe(false);
  });
});
