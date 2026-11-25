import { beforeEach, describe, expect, it } from "vitest";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../../quizshow/api/quizshowDemoStore.data";
import {
  demoQuizEventIdOf,
  QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
  QUIZ_WIN_BADGES_DEMO_PRIDE_ID,
  QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
} from "../../quizshow/winBadges/quizWinBadgesDemo.data";
import {
  demoGetQuizBadgeLibrary,
  demoGetQuizEventBadgeSetup,
  resetQuizWinBadgesDemoStore,
} from "../../quizshow/winBadges/quizWinBadgesDemoStore";
import {
  attachableBadges,
  chipOfDefinition,
  draftFromSetup,
  hasRemovedFromPlayedGame,
  hasRemovedFromPlayedGameNumber,
  isDraftChanged,
  knownDefinitionIdsOf,
  saveBodyFromDraft,
} from "./quizEventSetup.model";

// The live demo event: game 1 was played and gives Champion and
// Sharpshooter, game 2 gives Champion, games 3 to 5 give nothing.
const liveSetup = () =>
  demoGetQuizEventBadgeSetup(demoQuizEventIdOf(QUIZSHOW_DEMO_LIVE_SLUG));

beforeEach(() => {
  resetQuizWinBadgesDemoStore();
});

describe("quizEventSetup.model", () => {
  it("seeds all five games from the setup", () => {
    const setup = liveSetup();
    const draft = draftFromSetup(setup);
    expect(draft).toEqual({
      1: [
        QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
        QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
      ],
      2: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID],
      3: [],
      4: [],
      5: [],
    });
    expect(isDraftChanged(draft, setup)).toBe(false);
  });

  it("sends all five games in order", () => {
    const body = saveBodyFromDraft({
      3: [QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID],
      1: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID],
    });
    expect(body).toEqual({
      games: [
        {
          gameNumber: 1,
          badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID],
        },
        { gameNumber: 2, badgeDefinitionIds: [] },
        {
          gameNumber: 3,
          badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID],
        },
        { gameNumber: 4, badgeDefinitionIds: [] },
        { gameNumber: 5, badgeDefinitionIds: [] },
      ],
    });
  });

  it("leaves out a badge neither the setup nor the library knows", () => {
    const setup = liveSetup();
    const library = demoGetQuizBadgeLibrary().items;
    const deletedElsewhereId = "badge-deleted-elsewhere";
    const body = saveBodyFromDraft(
      {
        ...draftFromSetup(setup),
        3: [QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID, deletedElsewhereId],
      },
      knownDefinitionIdsOf(setup, library),
    );
    expect(body.games[2]).toEqual({
      gameNumber: 3,
      badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID],
    });
    expect(body.games[0]).toEqual({
      gameNumber: 1,
      badgeDefinitionIds: [
        QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
        QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
      ],
    });
  });

  it("names the played game that lost a badge", () => {
    const setup = liveSetup();
    const draft = {
      ...draftFromSetup(setup),
      1: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID],
      2: [],
    };
    expect(hasRemovedFromPlayedGameNumber(draft, setup, 1)).toBe(true);
    // Game 2 lost its badge too, and it has not been played yet.
    expect(hasRemovedFromPlayedGameNumber(draft, setup, 2)).toBe(false);
    expect(hasRemovedFromPlayedGameNumber(draft, setup, 3)).toBe(false);
  });

  it("spots a badge removed from a played game", () => {
    const setup = liveSetup();
    const seeded = draftFromSetup(setup);
    const withoutSharpshooterInGameOne = {
      ...seeded,
      1: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID],
    };
    const withoutChampionInGameTwo = { ...seeded, 2: [] };

    expect(hasRemovedFromPlayedGame(seeded, setup)).toBe(false);
    expect(hasRemovedFromPlayedGame(withoutSharpshooterInGameOne, setup)).toBe(
      true,
    );
    // Game 2 has not been played yet, so taking its badge off keeps no wins.
    expect(hasRemovedFromPlayedGame(withoutChampionInGameTwo, setup)).toBe(
      false,
    );
    expect(isDraftChanged(withoutChampionInGameTwo, setup)).toBe(true);
  });

  it("offers only live badges the game lacks", () => {
    const setup = liveSetup();
    const draft = draftFromSetup(setup);
    const library = demoGetQuizBadgeLibrary().items;

    // Game 1 already gives both live badges, and Pride is archived.
    expect(attachableBadges(library, draft, 1)).toEqual([]);
    expect(
      attachableBadges(library, draft, 2).map((definition) => definition.id),
    ).toEqual([QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID]);
    expect(
      attachableBadges(library, draft, 3).map((definition) => definition.id),
    ).toEqual([
      QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
      QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
    ]);
    expect(
      attachableBadges(library, draft, 3).some(
        (definition) => definition.id === QUIZ_WIN_BADGES_DEMO_PRIDE_ID,
      ),
    ).toBe(false);
  });

  it("builds a chip from a library badge", () => {
    const champion = demoGetQuizBadgeLibrary().items.find(
      (definition) => definition.id === QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
    );
    expect(champion).toBeDefined();
    if (!champion) return;
    expect(chipOfDefinition(champion)).toEqual({
      definitionId: QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
      badgeKey: `quiz:${QUIZ_WIN_BADGES_DEMO_CHAMPION_ID}`,
      name: { en: "Quiz Night Champion", pt: "Campeã da noite de quiz" },
      iconKey: "star",
      tint: "plum",
      rarity: "legendary",
      isArchived: false,
    });
  });
});
