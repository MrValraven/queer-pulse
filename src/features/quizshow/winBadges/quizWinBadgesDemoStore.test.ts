import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { earnedBadges } from "../../members/badges.data";
import { currentUserSlug } from "../../members/data/members";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS_SLUG,
  QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
} from "../api/quizshowDemoStore.data";
import {
  demoQuizEventIdOf,
  QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
  QUIZ_WIN_BADGES_DEMO_LIVE_KAI_WINNER_ID,
  QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
  QUIZ_WIN_BADGES_DEMO_PRIDE_ID,
  QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
} from "./quizWinBadgesDemo.data";
import {
  demoArchiveQuizBadge,
  demoCreateQuizBadge,
  demoDeleteQuizBadge,
  demoGetQuizBadgeLibrary,
  demoGetQuizEventBadgeSetup,
  demoGetWinBadgesPreview,
  demoPutQuizEventBadgeSetup,
  demoQuizBadgeDtos,
  demoRestoreQuizBadge,
  demoResultsWinBadges,
  demoRevokeQuizGameWin,
  demoSearchQuizEvents,
  demoSetQuizBadgeHidden,
  getQuizWinBadgesDemoVersion,
  resetQuizWinBadgesDemoStore,
  subscribeQuizWinBadgesDemo,
} from "./quizWinBadgesDemoStore";

const LIVE_EVENT_ID = demoQuizEventIdOf(QUIZSHOW_DEMO_LIVE_SLUG);
const RESULTS_EVENT_ID = demoQuizEventIdOf(QUIZSHOW_DEMO_RESULTS_SLUG);
const TEMPLATE_COPY_EVENT_ID = demoQuizEventIdOf(
  QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
);
const CHAMPION_KEY = `quiz:${QUIZ_WIN_BADGES_DEMO_CHAMPION_ID}`;
const SHARPSHOOTER_KEY = `quiz:${QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID}`;
/** A letter outside the basic plane: two UTF-16 units, one code point. */
const ASTRAL_LETTER = String.fromCodePoint(0x1d49c);

/** Runs a store call that must refuse, and hands back the ApiError. */
function refusalOf(call: () => unknown): ApiError {
  try {
    call();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("expected the call to refuse");
}

function refusalDataOf(call: () => unknown): Record<string, unknown> {
  return refusalOf(call).data as Record<string, unknown>;
}

function validBadgeBody(englishName: string) {
  return {
    name: { en: englishName, pt: "   " },
    description: { en: "Answered fastest all night" },
    iconKey: "music",
    tint: "jade",
    rarity: "common",
  };
}

function libraryRowOf(definitionId: string) {
  return demoGetQuizBadgeLibrary().items.find(
    (item) => item.id === definitionId,
  );
}

function ownerBadgeOf(badgeKey: string) {
  return demoQuizBadgeDtos({ isOwnerView: true }).find(
    (badge) => badge.key === badgeKey,
  );
}

function liveGameWinnersOf() {
  return demoGetQuizEventBadgeSetup(LIVE_EVENT_ID).finishedGames[0]?.winners;
}

const SEEDED_LIVE_GAMES = [
  {
    gameNumber: 1,
    badgeDefinitionIds: [
      QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
      QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
    ],
  },
  { gameNumber: 2, badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID] },
];

beforeEach(() => {
  resetQuizWinBadgesDemoStore();
});

describe("quiz badge library in demo", () => {
  it("seeds three badges with the archived one last", () => {
    const { items } = demoGetQuizBadgeLibrary();
    expect(items.map((item) => item.name.en)).toEqual([
      "Quiz Night Champion",
      "Trivia Sharpshooter",
      "Pride Quiz 2026",
    ]);
    expect(items[2]?.isArchived).toBe(true);
    expect(items[0]).toMatchObject({
      holderCount: 1,
      winCount: 2,
      eventCount: 1,
      canDelete: false,
    });
  });

  it("creates a badge under a quiz key and stores a blank Portuguese name as null", () => {
    const created = demoCreateQuizBadge(validBadgeBody("Speed Round Star"));
    expect(created.badgeKey).toBe(`quiz:${created.id}`);
    expect(created.id).toBe("demo-quiz-badge-1");
    expect(created.name.pt).toBeNull();
    expect(created.description.pt).toBeNull();
    expect(created).toMatchObject({
      holderCount: 0,
      winCount: 0,
      eventCount: 0,
      canDelete: true,
      isArchived: false,
    });
    expect(libraryRowOf(created.id)?.name.en).toBe("Speed Round Star");
  });

  it("refuses an English name another badge or a platform badge holds", () => {
    const takenByDefinition = refusalDataOf(() =>
      demoCreateQuizBadge(validBadgeBody("quiz night champion")),
    );
    expect(takenByDefinition).toMatchObject({
      code: "quiz_badge_name_taken",
      language: "en",
    });
    const platformName = earnedBadges[0]?.name ?? "";
    const takenByPlatform = refusalDataOf(() =>
      demoCreateQuizBadge(validBadgeBody(platformName)),
    );
    expect(takenByPlatform).toMatchObject({
      code: "quiz_badge_name_taken",
      language: "en",
    });
  });

  it("refuses the first problem in contract order", () => {
    const refusal = refusalOf(() =>
      demoCreateQuizBadge({ name: { en: "" }, iconKey: "rocket" }),
    );
    expect(refusal.status).toBe(400);
    expect(refusal.data).toMatchObject({
      code: "quiz_badge_name_required",
      language: "en",
    });
  });

  it("names the field that is not text", () => {
    const data = refusalDataOf(() =>
      demoCreateQuizBadge({ ...validBadgeBody("Speed Round Star"), name: "x" }),
    );
    expect(data).toMatchObject({
      code: "quiz_badge_text_invalid",
      field: "name.en",
    });
  });

  it("counts the name in code points", () => {
    const created = demoCreateQuizBadge(
      validBadgeBody(ASTRAL_LETTER.repeat(40)),
    );
    expect(created.name.en).toBe(ASTRAL_LETTER.repeat(40));
    const data = refusalDataOf(() =>
      demoCreateQuizBadge(validBadgeBody(ASTRAL_LETTER.repeat(41))),
    );
    expect(data).toMatchObject({
      code: "quiz_badge_name_too_long",
      language: "en",
      maxLength: 40,
    });
  });

  it("archives and restores, each a no-op when already there", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeQuizWinBadgesDemo(listener);
    const archived = demoArchiveQuizBadge(QUIZ_WIN_BADGES_DEMO_CHAMPION_ID);
    expect(archived.isArchived).toBe(true);
    expect(archived.archivedAt).not.toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);

    const versionAfterArchive = getQuizWinBadgesDemoVersion();
    const archivedAgain = demoArchiveQuizBadge(
      QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
    );
    expect(archivedAgain.archivedAt).toBe(archived.archivedAt);
    expect(getQuizWinBadgesDemoVersion()).toBe(versionAfterArchive);

    const restored = demoRestoreQuizBadge(QUIZ_WIN_BADGES_DEMO_CHAMPION_ID);
    expect(restored.isArchived).toBe(false);
    expect(restored.archivedAt).toBeNull();
    const versionAfterRestore = getQuizWinBadgesDemoVersion();
    expect(versionAfterRestore).toBe(versionAfterArchive + 1);
    demoRestoreQuizBadge(QUIZ_WIN_BADGES_DEMO_CHAMPION_ID);
    expect(getQuizWinBadgesDemoVersion()).toBe(versionAfterRestore);
    unsubscribe();
  });

  it("refuses to delete a badge with wins and names the holder count", () => {
    const refusal = refusalOf(() =>
      demoDeleteQuizBadge(QUIZ_WIN_BADGES_DEMO_CHAMPION_ID),
    );
    expect(refusal.status).toBe(409);
    expect(refusal.data).toMatchObject({
      code: "quiz_badge_in_use",
      holderCount: 1,
    });
  });

  it("deletes a badge nobody holds and takes it off every game", () => {
    const created = demoCreateQuizBadge(validBadgeBody("Speed Round Star"));
    demoPutQuizEventBadgeSetup(LIVE_EVENT_ID, {
      games: [
        ...SEEDED_LIVE_GAMES,
        { gameNumber: 3, badgeDefinitionIds: [created.id] },
      ],
    });
    expect(
      demoGetQuizEventBadgeSetup(LIVE_EVENT_ID).games[2]?.badges.map(
        (badge) => badge.definitionId,
      ),
    ).toEqual([created.id]);

    demoDeleteQuizBadge(created.id);
    expect(libraryRowOf(created.id)).toBeUndefined();
    const setup = demoGetQuizEventBadgeSetup(LIVE_EVENT_ID);
    expect(setup.games[2]?.badges).toEqual([]);
    expect(setup.games[0]?.badges).toHaveLength(2);
  });
});

describe("quiz event search and setup in demo", () => {
  it("searches quiz events by title, newest first", () => {
    const brunch = demoSearchQuizEvents("brunch", 1);
    expect(brunch.items.map((row) => row.slug)).toEqual([
      QUIZSHOW_DEMO_LIVE_SLUG,
    ]);
    const everything = demoSearchQuizEvents("", 1);
    expect(everything.items.map((row) => row.slug)).toEqual([
      QUIZSHOW_DEMO_LIVE_SLUG,
      QUIZSHOW_DEMO_RESULTS_SLUG,
      QUIZSHOW_DEMO_TEMPLATE_COPY_SLUG,
    ]);
    expect(everything).toMatchObject({ total: 3, page: 1, pageSize: 20 });
    expect(everything.items[0]).toMatchObject({
      configuredGameCount: 2,
      finishedGameCount: 1,
      status: "published",
    });
    expect(demoSearchQuizEvents("", "x").page).toBe(1);
  });

  it("answers event_has_no_quiz and event_not_found", () => {
    const noQuiz = refusalOf(() =>
      demoGetQuizEventBadgeSetup(demoQuizEventIdOf("trans-djs-warehouse")),
    );
    expect(noQuiz.status).toBe(409);
    expect(noQuiz.data).toMatchObject({ code: "quiz_badge_event_has_no_quiz" });
    const missing = refusalOf(() => demoGetQuizEventBadgeSetup("nope"));
    expect(missing.status).toBe(404);
    expect(missing.data).toMatchObject({ code: "quiz_badge_event_not_found" });
  });

  it("reads five games, the played game and the next game number", () => {
    const setup = demoGetQuizEventBadgeSetup(LIVE_EVENT_ID);
    expect(setup.games).toHaveLength(5);
    expect(setup.games[0]?.isFinished).toBe(true);
    expect(setup.games[1]?.isFinished).toBe(false);
    expect(setup.nextGameNumber).toBe(2);
    expect(setup.limits).toEqual({ gameSlotsMax: 5, badgesPerGameMax: 3 });
    const winners = setup.finishedGames[0]?.winners ?? [];
    expect(winners.map((winner) => winner.screenName)).toEqual([
      "Kai",
      "Quiz Whiz",
    ]);
    expect(winners[0]).toMatchObject({
      isRevoked: true,
      revokeReason: "Played from the host's laptop with the answers on screen",
      wins: [],
      revokedBy: { slug: "monica" },
    });
    expect(winners[1]).toMatchObject({
      isRevoked: false,
      revokedAt: null,
      member: { slug: currentUserSlug },
    });
    expect(winners[1]?.wins).toHaveLength(2);
  });
});

describe("quiz event setup saves in demo", () => {
  it("refuses a fourth badge, a repeated badge and a sixth game", () => {
    expect(
      refusalDataOf(() =>
        demoPutQuizEventBadgeSetup(LIVE_EVENT_ID, {
          games: [
            {
              gameNumber: 1,
              badgeDefinitionIds: ["one", "two", "three", "four"],
            },
          ],
        }),
      ),
    ).toMatchObject({
      code: "quiz_badge_slot_limit_reached",
      limit: 3,
      gameNumber: 1,
    });
    expect(
      refusalDataOf(() =>
        demoPutQuizEventBadgeSetup(LIVE_EVENT_ID, {
          games: [
            {
              gameNumber: 2,
              badgeDefinitionIds: [
                QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
                QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
              ],
            },
          ],
        }),
      ),
    ).toMatchObject({
      code: "quiz_badge_slot_duplicate",
      gameNumber: 2,
      definitionId: QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
    });
    expect(
      refusalDataOf(() =>
        demoPutQuizEventBadgeSetup(LIVE_EVENT_ID, {
          games: [{ gameNumber: 6, badgeDefinitionIds: [] }],
        }),
      ),
    ).toMatchObject({ code: "quiz_badge_game_limit_reached", limit: 5 });
  });

  it("refuses game number 0 and 1.5 and a body of the wrong shape", () => {
    for (const gameNumber of [0, 1.5]) {
      expect(
        refusalDataOf(() =>
          demoPutQuizEventBadgeSetup(LIVE_EVENT_ID, {
            games: [{ gameNumber, badgeDefinitionIds: [] }],
          }),
        ),
      ).toMatchObject({ code: "quiz_badge_game_number_invalid", gameNumber });
    }
    for (const body of [{ games: "x" }, null, { games: [3] }]) {
      expect(
        refusalDataOf(() => demoPutQuizEventBadgeSetup(LIVE_EVENT_ID, body)),
      ).toMatchObject({ code: "quiz_badge_setup_invalid" });
    }
  });

  it("keeps an archived badge on its game and refuses it on another", () => {
    const saved = demoPutQuizEventBadgeSetup(RESULTS_EVENT_ID, {
      games: [
        { gameNumber: 1, badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_PRIDE_ID] },
      ],
    });
    expect(saved.setup.games[0]?.badges[0]).toMatchObject({
      definitionId: QUIZ_WIN_BADGES_DEMO_PRIDE_ID,
      isArchived: true,
    });
    expect(saved.awardedWinCount).toBe(0);
    const refusal = refusalOf(() =>
      demoPutQuizEventBadgeSetup(RESULTS_EVENT_ID, {
        games: [
          {
            gameNumber: 1,
            badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_PRIDE_ID],
          },
          {
            gameNumber: 2,
            badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_PRIDE_ID],
          },
        ],
      }),
    );
    expect(refusal.status).toBe(409);
    expect(refusal.data).toMatchObject({
      code: "quiz_badge_archived",
      definitionId: QUIZ_WIN_BADGES_DEMO_PRIDE_ID,
    });
  });

  it("awards an added badge to the live winners of a finished game and skips the revoked one", () => {
    const created = demoCreateQuizBadge(validBadgeBody("Speed Round Star"));
    const saved = demoPutQuizEventBadgeSetup(LIVE_EVENT_ID, {
      games: [
        {
          gameNumber: 1,
          badgeDefinitionIds: [
            QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
            QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
            created.id,
          ],
        },
        {
          gameNumber: 2,
          badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID],
        },
      ],
    });
    expect(saved.awardedWinCount).toBe(1);
    const winners = saved.setup.finishedGames[0]?.winners ?? [];
    expect(winners[0]?.wins).toEqual([]);
    expect(winners[1]?.wins).toHaveLength(3);
    expect(libraryRowOf(created.id)).toMatchObject({
      holderCount: 1,
      winCount: 1,
      canDelete: false,
    });
  });

  it("awards a team game's three winners after the fact", () => {
    const saved = demoPutQuizEventBadgeSetup(TEMPLATE_COPY_EVENT_ID, {
      games: [
        {
          gameNumber: 1,
          badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID],
        },
      ],
    });
    expect(saved.awardedWinCount).toBe(3);
    expect(libraryRowOf(QUIZ_WIN_BADGES_DEMO_CHAMPION_ID)).toMatchObject({
      holderCount: 4,
      winCount: 5,
      eventCount: 2,
    });
  });

  it("keeps every win when a badge leaves a game", () => {
    const saved = demoPutQuizEventBadgeSetup(LIVE_EVENT_ID, {
      games: [
        {
          gameNumber: 1,
          badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID],
        },
        {
          gameNumber: 2,
          badgeDefinitionIds: [QUIZ_WIN_BADGES_DEMO_CHAMPION_ID],
        },
      ],
    });
    expect(saved.awardedWinCount).toBe(0);
    expect(ownerBadgeOf(CHAMPION_KEY)?.quiz?.winCount).toBe(2);
    expect(libraryRowOf(QUIZ_WIN_BADGES_DEMO_CHAMPION_ID)?.winCount).toBe(2);
  });
});

describe("quiz game win revoke in demo", () => {
  it("revokes a whole game for one member", () => {
    const response = demoRevokeQuizGameWin(
      LIVE_EVENT_ID,
      QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
      { reason: "Shared the answers with a friend" },
    );
    expect(response).toEqual({
      winnerId: QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
      revokedBadgeKeys: [CHAMPION_KEY, SHARPSHOOTER_KEY],
      removedAwardKeys: [SHARPSHOOTER_KEY],
    });
    const viewer = liveGameWinnersOf()?.find(
      (winner) =>
        winner.winnerId === QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
    );
    expect(viewer).toMatchObject({
      isRevoked: true,
      revokeReason: "Shared the answers with a friend",
      wins: [],
      revokedBy: { slug: currentUserSlug },
    });
  });

  it("counts two live wins of one badge and drops to one after a revoke", () => {
    expect(ownerBadgeOf(CHAMPION_KEY)?.quiz?.winCount).toBe(2);
    demoRevokeQuizGameWin(
      LIVE_EVENT_ID,
      QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
      { reason: "Shared the answers with a friend" },
    );
    expect(ownerBadgeOf(CHAMPION_KEY)?.quiz?.winCount).toBe(1);
    expect(ownerBadgeOf(CHAMPION_KEY)?.quiz?.wins).toHaveLength(1);
  });

  it("removes the award with the last live win", () => {
    expect(ownerBadgeOf(SHARPSHOOTER_KEY)).toBeDefined();
    demoRevokeQuizGameWin(
      LIVE_EVENT_ID,
      QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
      { reason: "Shared the answers with a friend" },
    );
    expect(ownerBadgeOf(SHARPSHOOTER_KEY)).toBeUndefined();
    expect(libraryRowOf(QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID)).toMatchObject({
      winCount: 0,
      holderCount: 0,
      canDelete: true,
    });
  });

  it("refuses a second revoke with its date before the reason", () => {
    const refusal = refusalOf(() =>
      demoRevokeQuizGameWin(
        LIVE_EVENT_ID,
        QUIZ_WIN_BADGES_DEMO_LIVE_KAI_WINNER_ID,
        { reason: "" },
      ),
    );
    expect(refusal.status).toBe(409);
    const data = refusal.data as Record<string, unknown>;
    expect(data.code).toBe("quiz_badge_winner_already_revoked");
    expect(typeof data.revokedAt).toBe("string");
  });

  it("refuses a blank and a long reason, and a winner of another event", () => {
    expect(
      refusalDataOf(() =>
        demoRevokeQuizGameWin(
          LIVE_EVENT_ID,
          QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
          { reason: "   " },
        ),
      ),
    ).toMatchObject({ code: "quiz_badge_revoke_reason_required" });
    expect(
      refusalDataOf(() =>
        demoRevokeQuizGameWin(
          LIVE_EVENT_ID,
          QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
          { reason: "x".repeat(301) },
        ),
      ),
    ).toMatchObject({
      code: "quiz_badge_revoke_reason_too_long",
      maxLength: 300,
    });
    const otherEvent = refusalOf(() =>
      demoRevokeQuizGameWin(
        RESULTS_EVENT_ID,
        QUIZ_WIN_BADGES_DEMO_LIVE_KAI_WINNER_ID,
        { reason: "Wrong event" },
      ),
    );
    expect(otherEvent.status).toBe(404);
    expect(otherEvent.data).toMatchObject({
      code: "quiz_badge_winner_not_found",
    });
  });
});

describe("quiz badges on the member side in demo", () => {
  it("masks a members-only win for another viewer", () => {
    const champion = demoQuizBadgeDtos({ isOwnerView: false }).find(
      (badge) => badge.key === CHAMPION_KEY,
    );
    const wins = champion?.quiz?.wins ?? [];
    expect(wins).toHaveLength(2);
    const maskedWins = wins.filter((win) => win.eventName === null);
    expect(maskedWins).toHaveLength(1);
    expect(maskedWins[0]?.eventSlug).toBeNull();
    expect(wins.every((win) => !win.isAdultsOnlyEvent)).toBe(true);
    const ownerWins = ownerBadgeOf(CHAMPION_KEY)?.quiz?.wins ?? [];
    expect(ownerWins.map((win) => win.eventName)).toContain(
      "Members' Quiz Social",
    );
  });

  it("drops a hidden badge for another viewer", () => {
    demoSetQuizBadgeHidden(CHAMPION_KEY, true);
    const otherKeys = demoQuizBadgeDtos({ isOwnerView: false }).map(
      (badge) => badge.key,
    );
    expect(otherKeys).not.toContain(CHAMPION_KEY);
    expect(otherKeys).toContain(SHARPSHOOTER_KEY);
    expect(ownerBadgeOf(CHAMPION_KEY)?.hiddenFromProfile).toBe(true);
    expect(ownerBadgeOf(SHARPSHOOTER_KEY)?.hiddenFromProfile).toBeUndefined();
  });

  it("previews the next game's badges", () => {
    expect(demoGetWinBadgesPreview(QUIZSHOW_DEMO_LIVE_SLUG).preview).toEqual({
      gameNumber: 2,
      badges: [
        {
          definitionId: QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
          badgeKey: CHAMPION_KEY,
          name: { en: "Quiz Night Champion", pt: "Campeã da noite de quiz" },
          iconKey: "star",
          tint: "plum",
          rarity: "legendary",
          isArchived: false,
        },
      ],
    });
    expect(
      demoGetWinBadgesPreview(QUIZSHOW_DEMO_RESULTS_SLUG).preview,
    ).toBeNull();
  });

  it("lists results winners by screen name with no member slug", () => {
    const results = demoResultsWinBadges(QUIZSHOW_DEMO_RESULTS_SLUG);
    expect(results?.gameNumber).toBe(1);
    expect(results?.winners).toEqual([
      {
        kind: "player",
        name: "Rita",
        badges: [
          expect.objectContaining({
            definitionId: QUIZ_WIN_BADGES_DEMO_PRIDE_ID,
          }),
        ],
      },
    ]);
    expect(results?.myBadges).toEqual([]);
    expect(JSON.stringify(results)).not.toContain("rita");
  });
});
