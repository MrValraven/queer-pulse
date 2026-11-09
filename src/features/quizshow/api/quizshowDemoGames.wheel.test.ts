import { beforeEach, describe, expect, it } from "vitest";
import { wheelSliceRoundIndexes } from "../quizshowWheel";
import { demoGameQuizFor, demoListGames } from "./quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "./quizshowDemoGames.data";
import { resetQuizshowDemoStore } from "./quizshowDemoStore";

describe("quizshow demo wheel game", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("seeds the wheel night from the Lisbon template", () => {
    const listed = demoListGames().games.find(
      (game) => game.id === QUIZSHOW_DEMO_GAME_IDS.wheelNight,
    );
    expect(listed).toMatchObject({
      title: "Spin the wheel night",
      roundCount: 4,
      questionCount: 23,
      isAdultsOnly: false,
    });
  });

  it("plays a pick-a-round wheel over four slices", () => {
    const { rounds } = demoGameQuizFor(QUIZSHOW_DEMO_GAME_IDS.wheelNight);
    expect(rounds[0]?.kind).toBe("wheel");
    expect(wheelSliceRoundIndexes(rounds, 0)).toEqual([1, 2, 3, 4]);
    expect(rounds.map((round) => round.settings.wheelBonus)).toEqual([
      0, 0, 500, 0, 500,
    ]);
  });
});
