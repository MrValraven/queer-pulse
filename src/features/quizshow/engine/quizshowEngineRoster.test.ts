import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLobbyJoinInput,
  type QuizshowQuestion,
  type QuizshowQuiz,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import { quizshowRandomFrom } from "./quizshowRandom";
import {
  QUIZSHOW_ROSTER_HOST_HANDLERS,
  QUIZSHOW_ROSTER_PLAYER_HANDLERS,
  refreshQuiz,
} from "./quizshowEngineRoster";
import type { QuizshowEngineContext } from "./quizshowEngineSetup";
import type {
  QuizshowCommandResult,
  QuizshowEngineOptions,
  QuizshowEnginePlayer,
  QuizshowEngineState,
} from "./quizshowEngineTypes";
import { WHEEL_TEST_SETTINGS } from "./quizshowWheelTestFixtures";

function bilingual(english: string): QuizshowText {
  return { en: english, pt: english };
}

const BLANK_TEXT: QuizshowText = { en: "", pt: "" };

const CHOICE_QUESTION: QuizshowQuestion = {
  id: "question-choice",
  type: "multiple_choice",
  prompt: bilingual("Which option is the right one?"),
  mediaRef: null,
  mediaUrl: null,
  mediaAlt: BLANK_TEXT,
  mediaReveal: "instant",
  revealNote: BLANK_TEXT,
  numberUnit: BLANK_TEXT,
  timeLimitSeconds: null,
  points: 1000,
  options: [
    { id: "a", text: bilingual("First") },
    { id: "b", text: bilingual("Second") },
    { id: "c", text: bilingual("Third") },
  ],
  answer: { correctIndexes: [1] },
  acceptedAnswers: [],
};

function quizWith(updatedAt: string, title = "Demo night"): QuizshowQuiz {
  return {
    title,
    languages: "both",
    screenLanguage: "en",
    sourceTemplateId: null,
    sourceTemplate: null,
    updatedAt,
    rounds: [
      {
        id: "round-quiz",
        kind: "quiz",
        title: bilingual("Warm up"),
        contentLabel: "none",
        settings: WHEEL_TEST_SETTINGS,
        questions: [CHOICE_QUESTION],
      },
    ],
  };
}

const DEMO_QUIZ = quizWith("2026-11-01T00:00:00.000Z");

const RITA = "member-rita";
const NUNO = "member-nuno";
const BEA = "member-bea";

function engineWith(
  overrides: Partial<QuizshowEngineOptions> = {},
): QuizshowEngineState {
  return createQuizshowEngine({
    quiz: DEMO_QUIZ,
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: false,
    eventSlug: "pride-brunch-jun",
    eventTitle: "Pride brunch",
    joinCode: "QZ7KP4",
    sessionId: "demo-session",
    seed: 7,
    now: 0,
    ...overrides,
  });
}

function joinPayload(
  screenName: string,
  team: QuizshowLobbyJoinInput["team"] = null,
): QuizshowLobbyJoinInput {
  return { screenName, isAvatarShown: false, hasExtraTime: false, team };
}

function joined(
  state: QuizshowEngineState,
  memberKey: string,
  screenName: string,
  team: QuizshowLobbyJoinInput["team"] = null,
): QuizshowEngineState {
  return reduceQuizshowEngine(state, {
    type: "player",
    memberKey,
    name: "lobby:join",
    payload: joinPayload(screenName, team),
    now: 0,
  }).state;
}

/** Rita, Nuno and Bea in a solo lobby. */
function soloLobby(
  overrides: Partial<QuizshowEngineOptions> = {},
): QuizshowEngineState {
  let state = engineWith(overrides);
  state = joined(state, RITA, "Rita");
  state = joined(state, NUNO, "Nuno");
  return joined(state, BEA, "Bea");
}

/** Teams of two: Rita founds "Glitter", Nuno joins it, Bea founds "Sequins". */
function teamsLobby(): QuizshowEngineState {
  let state = engineWith({ playMode: "teams", maxTeamSize: 2 });
  state = joined(state, RITA, "Rita", {
    newTeam: { name: "Glitter", colorKey: "circle" },
  });
  const glitterId = teamIdNamed(state, "Glitter");
  state = joined(state, NUNO, "Nuno", { teamId: glitterId });
  return joined(state, BEA, "Bea", {
    newTeam: { name: "Sequins", colorKey: "star" },
  });
}

function teamIdNamed(state: QuizshowEngineState, name: string): string {
  const team = state.teams.find((candidate) => candidate.name === name);
  if (team === undefined) throw new Error(`No team named ${name}.`);
  return team.teamId;
}

function playerOf(
  state: QuizshowEngineState,
  memberKey: string,
): QuizshowEnginePlayer {
  const player = state.players.find(
    (candidate) => candidate.memberKey === memberKey,
  );
  if (player === undefined) throw new Error(`${memberKey} has not joined.`);
  return player;
}

type Outcome = QuizshowCommandResult & { state: QuizshowEngineState };

/** Runs a handler on a clone, as the reducer does, and keeps the clone. */
function run(
  state: QuizshowEngineState,
  handler: (context: QuizshowEngineContext) => QuizshowCommandResult,
): Outcome {
  const nextState = structuredClone(state);
  const context = {
    state: nextState,
    random: quizshowRandomFrom(nextState.randomState),
  };
  return { ...handler(context), state: nextState };
}

function playerRun(
  state: QuizshowEngineState,
  memberKey: string,
  name: keyof typeof QUIZSHOW_ROSTER_PLAYER_HANDLERS,
  payload: unknown,
  now: number,
): Outcome {
  return run(state, (context) =>
    QUIZSHOW_ROSTER_PLAYER_HANDLERS[name](
      context,
      playerOf(context.state, memberKey),
      payload,
      now,
    ),
  );
}

function hostRun(
  state: QuizshowEngineState,
  name: keyof typeof QUIZSHOW_ROSTER_HOST_HANDLERS,
  payload: unknown,
  now: number,
): Outcome {
  return run(state, (context) =>
    QUIZSHOW_ROSTER_HOST_HANDLERS[name](context, payload, now),
  );
}

function codeOf(outcome: Outcome): string | null {
  return outcome.ack.ok ? null : outcome.ack.code;
}

function started(state: QuizshowEngineState): QuizshowEngineState {
  return reduceQuizshowEngine(state, {
    type: "host",
    name: "host:start",
    payload: { phaseId: state.cursor.phaseId },
    now: 0,
  }).state;
}

/** Started, then `host:next` into the first question's `read`. */
function inRead(state: QuizshowEngineState): QuizshowEngineState {
  const running = started(state);
  return reduceQuizshowEngine(running, {
    type: "host",
    name: "host:next",
    payload: { phaseId: running.cursor.phaseId },
    now: 0,
  }).state;
}

function ended(state: QuizshowEngineState): QuizshowEngineState {
  return reduceQuizshowEngine(state, {
    type: "host",
    name: "host:end",
    payload: { phaseId: state.cursor.phaseId },
    now: 0,
  }).state;
}

function removed(
  state: QuizshowEngineState,
  memberKey: string,
): QuizshowEngineState {
  return reduceQuizshowEngine(state, {
    type: "host",
    name: "host:removePlayer",
    payload: { playerId: playerOf(state, memberKey).playerId },
    now: 0,
  }).state;
}

function left(
  state: QuizshowEngineState,
  memberKey: string,
): QuizshowEngineState {
  return playerRun(state, memberKey, "lobby:leave", {}, 0).state;
}

/** A player frame through the whole engine, where runPlayerCommand refuses removed players and players who left. */
function engineCodeOf(
  state: QuizshowEngineState,
  memberKey: string,
  name: "lobby:leave" | "reaction:send",
  payload: unknown,
): string | null {
  const { ack } = reduceQuizshowEngine(state, {
    type: "player",
    memberKey,
    name,
    payload,
    now: 0,
  });
  return ack === null || ack.ok ? null : ack.code;
}

describe("lobby:leave", () => {
  it("marks the player left, keeps their score and drops the team they emptied", () => {
    const lobby = teamsLobby();
    const beaTeamId = teamIdNamed(lobby, "Sequins");
    const outcome = playerRun(lobby, BEA, "lobby:leave", {}, 500);
    expect(outcome.ack).toEqual({ ok: true });
    expect(playerOf(outcome.state, BEA).leftAt).toBe(500);
    expect(playerOf(outcome.state, BEA).teamId).toBe(beaTeamId);
    expect(outcome.state.teams.map((team) => team.name)).toEqual(["Glitter"]);
    expect(outcome.effects).toEqual([
      { kind: "lobby_changed" },
      { kind: "player_left", playerId: playerOf(lobby, BEA).playerId },
    ]);
  });

  it("keeps a host-made team the player leaves empty", () => {
    const lobby = teamsLobby();
    const withTables = hostRun(
      lobby,
      "host:createTeams",
      { names: ["Table 1"] },
      0,
    ).state;
    const tableId = teamIdNamed(withTables, "Table 1");
    const moved = hostRun(
      withTables,
      "host:movePlayer",
      { playerId: playerOf(withTables, BEA).playerId, teamId: tableId },
      0,
    ).state;
    const outcome = playerRun(moved, BEA, "lobby:leave", {}, 0);
    expect(outcome.state.teams.some((team) => team.teamId === tableId)).toBe(
      true,
    );
  });

  it("refuses quizshow_not_joined for a player who already left", () => {
    expect(engineCodeOf(left(soloLobby(), RITA), RITA, "lobby:leave", {})).toBe(
      "quizshow_not_joined",
    );
  });

  it("refuses quizshow_player_removed for a removed player", () => {
    expect(
      engineCodeOf(removed(soloLobby(), RITA), RITA, "lobby:leave", {}),
    ).toBe("quizshow_player_removed");
  });

  it("refuses quizshow_session_ended once the session ended", () => {
    expect(
      codeOf(playerRun(ended(soloLobby()), RITA, "lobby:leave", {}, 0)),
    ).toBe("quizshow_session_ended");
  });
});

describe("reaction:send", () => {
  it("counts the reaction anonymously and asks for a reactions frame", () => {
    const outcome = playerRun(
      soloLobby(),
      RITA,
      "reaction:send",
      { reactionId: "heart" },
      0,
    );
    expect(outcome.ack).toEqual({ ok: true });
    expect(outcome.state.reactionCounts).toEqual({ heart: 1 });
    expect(outcome.effects).toEqual([{ kind: "reactions_changed" }]);
  });

  it("refuses quizshow_rate_limited past the burst, then refills one per reactionRefillMs", () => {
    let state = soloLobby();
    for (
      let reactionNumber = 0;
      reactionNumber < QUIZSHOW_LIMITS.reactionBurst;
      reactionNumber += 1
    ) {
      state = playerRun(
        state,
        RITA,
        "reaction:send",
        { reactionId: "fire" },
        0,
      ).state;
    }
    expect(
      codeOf(
        playerRun(state, RITA, "reaction:send", { reactionId: "fire" }, 0),
      ),
    ).toBe("quizshow_rate_limited");
    const refilled = playerRun(
      state,
      RITA,
      "reaction:send",
      { reactionId: "fire" },
      QUIZSHOW_LIMITS.reactionRefillMs,
    );
    expect(refilled.ack.ok).toBe(true);
    expect(refilled.state.reactionCounts.fire).toBe(
      QUIZSHOW_LIMITS.reactionBurst + 1,
    );
  });

  it("refuses quizshow_reaction_not_now while a question is asked", () => {
    expect(
      codeOf(
        playerRun(
          inRead(soloLobby()),
          RITA,
          "reaction:send",
          { reactionId: "clap" },
          0,
        ),
      ),
    ).toBe("quizshow_reaction_not_now");
  });

  it("refuses quizshow_not_joined for a player who left", () => {
    expect(
      engineCodeOf(left(soloLobby(), RITA), RITA, "reaction:send", {
        reactionId: "wow",
      }),
    ).toBe("quizshow_not_joined");
  });

  it("refuses quizshow_player_removed for a removed player", () => {
    expect(
      engineCodeOf(removed(soloLobby(), RITA), RITA, "reaction:send", {
        reactionId: "wow",
      }),
    ).toBe("quizshow_player_removed");
  });
});

describe("host:renamePlayer", () => {
  it("renames an active player", () => {
    const lobby = soloLobby();
    const ritaId = playerOf(lobby, RITA).playerId;
    const outcome = hostRun(
      lobby,
      "host:renamePlayer",
      { playerId: ritaId, screenName: "  Rita B  " },
      0,
    );
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(playerOf(outcome.state, RITA).screenName).toBe("Rita B");
    expect(outcome.effects).toEqual([
      { kind: "lobby_changed" },
      { kind: "me_changed", playerIds: [ritaId] },
    ]);
  });

  it("keeps the same name as a no-op", () => {
    const lobby = soloLobby();
    const outcome = hostRun(
      lobby,
      "host:renamePlayer",
      { playerId: playerOf(lobby, RITA).playerId, screenName: "Rita" },
      0,
    );
    expect(outcome.ack).toEqual({ ok: true, isNoop: true });
  });

  it("refuses quizshow_screen_name_taken with a suggestion, a left player's name included", () => {
    const lobby = left(soloLobby(), NUNO);
    const outcome = hostRun(
      lobby,
      "host:renamePlayer",
      { playerId: playerOf(lobby, RITA).playerId, screenName: "NÚNO" },
      0,
    );
    expect(outcome.ack).toMatchObject({
      ok: false,
      code: "quizshow_screen_name_taken",
      suggestedScreenName: "NÚNO 2",
    });
  });

  it("refuses quizshow_text_blank", () => {
    const lobby = soloLobby();
    expect(
      codeOf(
        hostRun(
          lobby,
          "host:renamePlayer",
          { playerId: playerOf(lobby, RITA).playerId, screenName: "   " },
          0,
        ),
      ),
    ).toBe("quizshow_text_blank");
  });

  it("refuses quizshow_player_not_found for an unknown or removed player", () => {
    const lobby = removed(soloLobby(), RITA);
    expect(
      codeOf(
        hostRun(
          lobby,
          "host:renamePlayer",
          { playerId: "nobody", screenName: "Ana" },
          0,
        ),
      ),
    ).toBe("quizshow_player_not_found");
    expect(
      codeOf(
        hostRun(
          lobby,
          "host:renamePlayer",
          { playerId: playerOf(lobby, RITA).playerId, screenName: "Ana" },
          0,
        ),
      ),
    ).toBe("quizshow_player_not_found");
  });

  it("refuses quizshow_player_left for a player who left", () => {
    const lobby = left(soloLobby(), RITA);
    expect(
      codeOf(
        hostRun(
          lobby,
          "host:renamePlayer",
          { playerId: playerOf(lobby, RITA).playerId, screenName: "Ana" },
          0,
        ),
      ),
    ).toBe("quizshow_player_left");
  });

  it("refuses quizshow_session_ended with the cursor once the session ended", () => {
    const lobby = ended(soloLobby());
    const outcome = hostRun(
      lobby,
      "host:renamePlayer",
      { playerId: playerOf(lobby, RITA).playerId, screenName: "Ana" },
      0,
    );
    expect(outcome.ack).toMatchObject({
      ok: false,
      code: "quizshow_session_ended",
      cursor: lobby.cursor,
    });
  });
});

describe("host:movePlayer", () => {
  it("moves a player to a team with room and drops the team they emptied", () => {
    const lobby = teamsLobby();
    const glitterId = teamIdNamed(lobby, "Glitter");
    const withTable = hostRun(
      lobby,
      "host:createTeams",
      { names: ["Table 1"] },
      0,
    ).state;
    const tableId = teamIdNamed(withTable, "Table 1");
    const beaMoved = hostRun(
      withTable,
      "host:movePlayer",
      { playerId: playerOf(withTable, BEA).playerId, teamId: tableId },
      0,
    );
    expect(beaMoved.ack).toEqual({ ok: true, isNoop: false });
    expect(playerOf(beaMoved.state, BEA).teamId).toBe(tableId);
    expect(beaMoved.state.teams.map((team) => team.name)).toEqual([
      "Glitter",
      "Table 1",
    ]);
    expect(beaMoved.effects).toEqual([
      { kind: "lobby_changed" },
      { kind: "me_changed", playerIds: [playerOf(lobby, BEA).playerId] },
    ]);
    const sameTeam = hostRun(
      beaMoved.state,
      "host:movePlayer",
      { playerId: playerOf(lobby, RITA).playerId, teamId: glitterId },
      0,
    );
    expect(sameTeam.ack).toEqual({ ok: true, isNoop: true });
  });

  it("refuses quizshow_team_full", () => {
    const lobby = teamsLobby();
    expect(
      codeOf(
        hostRun(
          lobby,
          "host:movePlayer",
          {
            playerId: playerOf(lobby, BEA).playerId,
            teamId: teamIdNamed(lobby, "Glitter"),
          },
          0,
        ),
      ),
    ).toBe("quizshow_team_full");
  });

  it("refuses quizshow_team_not_found", () => {
    const lobby = teamsLobby();
    expect(
      codeOf(
        hostRun(
          lobby,
          "host:movePlayer",
          { playerId: playerOf(lobby, BEA).playerId, teamId: "no-team" },
          0,
        ),
      ),
    ).toBe("quizshow_team_not_found");
  });

  it("refuses quizshow_player_not_found and quizshow_player_left", () => {
    const lobby = left(teamsLobby(), NUNO);
    const sequinsId = teamIdNamed(lobby, "Sequins");
    expect(
      codeOf(
        hostRun(
          lobby,
          "host:movePlayer",
          { playerId: "nobody", teamId: sequinsId },
          0,
        ),
      ),
    ).toBe("quizshow_player_not_found");
    expect(
      codeOf(
        hostRun(
          lobby,
          "host:movePlayer",
          { playerId: playerOf(lobby, NUNO).playerId, teamId: sequinsId },
          0,
        ),
      ),
    ).toBe("quizshow_player_left");
  });

  it("refuses quizshow_teams_off in solo play, without the cursor", () => {
    const lobby = soloLobby();
    const outcome = hostRun(
      lobby,
      "host:movePlayer",
      { playerId: playerOf(lobby, RITA).playerId, teamId: "any" },
      0,
    );
    expect(outcome.ack).toEqual({
      ok: false,
      code: "quizshow_teams_off",
      message: "quizshow_teams_off",
    });
  });

  it("refuses quizshow_move_during_question with the cursor", () => {
    const reading = inRead(teamsLobby());
    const outcome = hostRun(
      reading,
      "host:movePlayer",
      {
        playerId: playerOf(reading, NUNO).playerId,
        teamId: teamIdNamed(reading, "Sequins"),
      },
      0,
    );
    expect(outcome.ack).toMatchObject({
      ok: false,
      code: "quizshow_move_during_question",
      cursor: reading.cursor,
    });
  });

  it("refuses quizshow_move_during_question in reveal and scores, where a rescore recounts team points", () => {
    const reading = inRead(teamsLobby());
    for (const phase of ["reveal", "scores"] as const) {
      const scoring = structuredClone(reading);
      scoring.cursor.phase = phase;
      const outcome = hostRun(
        scoring,
        "host:movePlayer",
        {
          playerId: playerOf(scoring, NUNO).playerId,
          teamId: teamIdNamed(scoring, "Sequins"),
        },
        0,
      );
      expect(codeOf(outcome)).toBe("quizshow_move_during_question");
      expect(playerOf(outcome.state, NUNO).teamId).toBe(
        playerOf(scoring, NUNO).teamId,
      );
    }
  });
});

describe("host:createTeams", () => {
  it("creates every team host-made, with the first free keys, ids in input order", () => {
    const lobby = teamsLobby();
    const outcome = hostRun(
      lobby,
      "host:createTeams",
      { names: [" Table 1 ", "Table 2"] },
      0,
    );
    if (!outcome.ack.ok) throw new Error("createTeams refused.");
    const created = outcome.state.teams.slice(2);
    expect(outcome.ack).toEqual({
      ok: true,
      isNoop: false,
      teamIds: created.map((team) => team.teamId),
    });
    expect(
      created.map(({ name, colorKey, isHostMade }) => ({
        name,
        colorKey,
        isHostMade,
      })),
    ).toEqual([
      { name: "Table 1", colorKey: "triangle", isHostMade: true },
      { name: "Table 2", colorKey: "square", isHostMade: true },
    ]);
    expect(outcome.effects).toEqual([{ kind: "lobby_changed" }]);
  });

  it("creates nothing when one name is taken by folded key", () => {
    const outcome = hostRun(
      teamsLobby(),
      "host:createTeams",
      { names: ["Table 1", "GLÍTTER"] },
      0,
    );
    expect(codeOf(outcome)).toBe("quizshow_team_name_taken");
    expect(outcome.state.teams).toHaveLength(2);
    expect(
      codeOf(
        hostRun(
          teamsLobby(),
          "host:createTeams",
          { names: ["Mesa", "mesa"] },
          0,
        ),
      ),
    ).toBe("quizshow_team_name_taken");
  });

  it("refuses quizshow_text_blank", () => {
    expect(
      codeOf(
        hostRun(
          teamsLobby(),
          "host:createTeams",
          { names: ["Table 1", "  "] },
          0,
        ),
      ),
    ).toBe("quizshow_text_blank");
  });

  it("refuses quizshow_team_limit past teamsPerSessionMax", () => {
    const names = Array.from(
      { length: QUIZSHOW_LIMITS.teamsPerSessionMax - 1 },
      (_unused, tableIndex) => `Table ${tableIndex + 1}`,
    );
    expect(
      codeOf(hostRun(teamsLobby(), "host:createTeams", { names }, 0)),
    ).toBe("quizshow_team_limit");
  });

  it("refuses quizshow_teams_off in solo play", () => {
    expect(
      codeOf(
        hostRun(soloLobby(), "host:createTeams", { names: ["Table 1"] }, 0),
      ),
    ).toBe("quizshow_teams_off");
  });

  it("refuses quizshow_not_in_lobby once the game runs", () => {
    expect(
      codeOf(
        hostRun(
          started(teamsLobby()),
          "host:createTeams",
          { names: ["Table 1"] },
          0,
        ),
      ),
    ).toBe("quizshow_not_in_lobby");
  });
});

describe("host:setJoinLock", () => {
  it("locks joining once; the same value is a no-op", () => {
    const outcome = hostRun(
      soloLobby(),
      "host:setJoinLock",
      { isLocked: true },
      0,
    );
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(outcome.state.isJoinLocked).toBe(true);
    expect(outcome.effects).toEqual([{ kind: "flags_changed" }]);
    expect(
      hostRun(outcome.state, "host:setJoinLock", { isLocked: true }, 0).ack,
    ).toEqual({ ok: true, isNoop: true });
  });

  it("refuses quizshow_session_ended once the session ended", () => {
    expect(
      codeOf(
        hostRun(ended(soloLobby()), "host:setJoinLock", { isLocked: true }, 0),
      ),
    ).toBe("quizshow_session_ended");
  });
});

describe("host:setAutoAdvance", () => {
  it("turns on in the lobby without arming a countdown", () => {
    const outcome = hostRun(
      soloLobby(),
      "host:setAutoAdvance",
      { isOn: true },
      0,
    );
    expect(outcome.state.isAutoAdvanceOn).toBe(true);
    expect(outcome.state.cursor.autoAdvanceAt).toBeNull();
    expect(outcome.effects).toEqual([{ kind: "flags_changed" }]);
  });

  it("arms a round intro from now and clears it when turned off", () => {
    const intro = started(soloLobby());
    expect(intro.cursor.phase).toBe("round_intro");
    const armed = hostRun(intro, "host:setAutoAdvance", { isOn: true }, 1_000);
    expect(armed.state.cursor.autoAdvanceAt).toBe(
      1_000 + QUIZSHOW_LIMITS.autoAdvanceRoundIntroMs,
    );
    expect(armed.effects).toEqual([
      { kind: "flags_changed" },
      { kind: "phase_changed" },
    ]);
    const cleared = hostRun(
      armed.state,
      "host:setAutoAdvance",
      { isOn: false },
      2_000,
    );
    expect(cleared.state.cursor.autoAdvanceAt).toBeNull();
    expect(cleared.effects).toEqual([
      { kind: "flags_changed" },
      { kind: "phase_changed" },
    ]);
    expect(
      hostRun(cleared.state, "host:setAutoAdvance", { isOn: false }, 0).ack,
    ).toEqual({ ok: true, isNoop: true });
  });

  it("refuses quizshow_session_ended once the session ended", () => {
    expect(
      codeOf(
        hostRun(ended(soloLobby()), "host:setAutoAdvance", { isOn: true }, 0),
      ),
    ).toBe("quizshow_session_ended");
  });
});

describe("host:notifyGuests", () => {
  it("records the send with no push in demo and refreshes the hosts", () => {
    const outcome = hostRun(soloLobby(), "host:notifyGuests", {}, 9_000);
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(outcome.state.guestPushSentAt).toBe(9_000);
    expect(outcome.effects).toEqual([{ kind: "state_reset", scope: "hosts" }]);
    expect(codeOf(hostRun(outcome.state, "host:notifyGuests", {}, 0))).toBe(
      "quizshow_guest_push_already_sent",
    );
  });

  it("refuses quizshow_guest_push_needs_event on a game session", () => {
    expect(
      codeOf(
        hostRun(
          soloLobby({ eventSlug: null, eventTitle: null, gameId: "game-1" }),
          "host:notifyGuests",
          {},
          0,
        ),
      ),
    ).toBe("quizshow_guest_push_needs_event");
  });

  it("refuses quizshow_guest_push_practice in a practice lobby", () => {
    expect(
      codeOf(
        hostRun(soloLobby({ isPractice: true }), "host:notifyGuests", {}, 0),
      ),
    ).toBe("quizshow_guest_push_practice");
  });

  it("refuses quizshow_not_in_lobby once the game runs", () => {
    expect(
      codeOf(hostRun(started(soloLobby()), "host:notifyGuests", {}, 0)),
    ).toBe("quizshow_not_in_lobby");
  });
});

describe("pairing in demo", () => {
  it("refuses quizshow_pairing_code_not_found for every code", () => {
    expect(
      codeOf(
        hostRun(soloLobby(), "host:pairDevice", { pairingCode: "234567" }, 0),
      ),
    ).toBe("quizshow_pairing_code_not_found");
  });

  it("refuses quizshow_device_not_found for every unpair", () => {
    expect(
      codeOf(
        hostRun(
          soloLobby(),
          "host:unpairDevice",
          { pairingId: "pairing-1" },
          0,
        ),
      ),
    ).toBe("quizshow_device_not_found");
  });
});

describe("refreshQuiz", () => {
  const LATER = "2026-11-02T00:00:00.000Z";

  it("swaps in the latest quiz and resets every viewer", () => {
    const outcome = run(soloLobby(), (context) =>
      refreshQuiz(context, quizWith(LATER, "Edited night"), LATER, 0),
    );
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(outcome.state.quiz.title).toBe("Edited night");
    expect(outcome.state.sourceUpdatedAt).toBe(LATER);
    expect(outcome.state.cursor.roundCount).toBe(1);
    expect(outcome.state.players).toHaveLength(3);
    expect(outcome.effects).toEqual([{ kind: "state_reset" }]);
  });

  it("is a no-op for the version the lobby already holds", () => {
    const lobby = soloLobby();
    const outcome = run(lobby, (context) =>
      refreshQuiz(context, DEMO_QUIZ, lobby.sourceUpdatedAt, 0),
    );
    expect(outcome.ack).toEqual({ ok: true, isNoop: true });
    expect(outcome.effects).toEqual([]);
  });

  function adultsQuizWith(updatedAt: string): QuizshowQuiz {
    const quiz = quizWith(updatedAt);
    return {
      ...quiz,
      rounds: quiz.rounds.map((round) => ({
        ...round,
        contentLabel: "adults" as const,
      })),
    };
  }

  it("refuses quizshow_refresh_adults_lobby_joined with the cursor once people joined", () => {
    const lobby = soloLobby();
    const outcome = run(lobby, (context) =>
      refreshQuiz(context, adultsQuizWith(LATER), LATER, 0),
    );
    expect(outcome.ack).toMatchObject({
      ok: false,
      code: "quizshow_refresh_adults_lobby_joined",
      cursor: lobby.cursor,
    });
    expect(outcome.state.quiz.title).toBe(lobby.quiz.title);
    expect(outcome.state.isAdultsOnly).toBe(false);
  });

  it("turns an empty lobby 18+", () => {
    const outcome = run(engineWith(), (context) =>
      refreshQuiz(context, adultsQuizWith(LATER), LATER, 0),
    );
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(outcome.state.isAdultsOnly).toBe(true);
  });

  it("turns a lobby 18+ once everyone in it left", () => {
    let lobby = engineWith();
    lobby = left(joined(lobby, RITA, "Rita"), RITA);
    const outcome = run(lobby, (context) =>
      refreshQuiz(context, adultsQuizWith(LATER), LATER, 0),
    );
    expect(outcome.ack).toEqual({ ok: true, isNoop: false });
    expect(outcome.state.isAdultsOnly).toBe(true);
  });

  it("refuses quizshow_not_in_lobby once the game runs", () => {
    const outcome = run(started(soloLobby()), (context) =>
      refreshQuiz(context, quizWith(LATER), LATER, 0),
    );
    expect(codeOf(outcome)).toBe("quizshow_not_in_lobby");
  });
});
