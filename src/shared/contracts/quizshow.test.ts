import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_JOIN_CODE_ALPHABET,
  QUIZSHOW_JOIN_CODE_PATTERN,
  QUIZSHOW_LIMITS,
  QUIZSHOW_OPEN_SESSION_STATUSES,
  QUIZSHOW_PARTY_ROUND_KINDS,
  QUIZSHOW_PHASES,
  QUIZSHOW_PLAYABLE_ROUND_KINDS,
  QUIZSHOW_QUIZ_PROBLEM_CODES,
  QUIZSHOW_ROUND_KINDS,
  QUIZSHOW_WHEEL_BONUS_VALUES,
  QUIZSHOW_WHEEL_PICKS,
  QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
  QUIZSHOW_TEAM_COLOR_KEYS,
  QUIZSHOW_TIMED_PHASES,
  QUIZSHOW_ERROR_CODES,
  QUIZSHOW_GAMES_PER_MEMBER_MAX,
  QUIZSHOW_LOBBY_OPENS_PER_HOUR_MAX,
  QUIZSHOW_PAIRING_CODE_PATTERN,
  QUIZSHOW_TEMPLATE_CARD_FIELDS,
  QUIZSHOW_TEMPLATE_STATUSES,
  type QuizshowImportInput,
  type QuizshowCursor,
  type QuizshowMyReveal,
  type QuizshowPhaseChangeFrame,
  type QuizshowStateBase,
} from "./quizshow";

/** Contract 3.3: the item 8 causes, then the new feature codes, in table order. */
const QUIZSHOW_V2_ERROR_CODES = [
  "quizshow_session_not_started",
  "quizshow_already_started",
  "quizshow_session_paused",
  "quizshow_session_ended",
  "quizshow_spin_not_available",
  "quizshow_no_wheel_open",
  "quizshow_no_timer_running",
  "quizshow_already_revealed",
  "quizshow_nothing_to_reveal",
  "quizshow_nothing_to_skip",
  "quizshow_review_not_open",
  "quizshow_unhide_review_only",
  "quizshow_author_removed",
  "quizshow_favourite_not_available",
  "quizshow_teams_off",
  "quizshow_screen_name_taken",
  "quizshow_joining_locked",
  "quizshow_not_in_lobby",
  "quizshow_move_during_question",
  "quizshow_player_left",
  "quizshow_rescore_not_now",
  "quizshow_accept_needs_typed_answer",
  "quizshow_change_needs_choice_question",
  "quizshow_answer_text_not_found",
  "quizshow_answer_already_correct",
  "quizshow_correct_option_not_found",
  "quizshow_every_option_correct",
  "quizshow_adjust_not_now",
  "quizshow_adjust_below_zero",
  "quizshow_entrant_not_found",
  "quizshow_pairing_code_not_found",
  "quizshow_pairing_code_expired",
  "quizshow_pairing_code_used",
  "quizshow_paired_devices_full",
  "quizshow_helper_cannot_pair",
  "quizshow_helper_is_playing",
  "quizshow_device_not_found",
  "quizshow_device_unpaired",
  "quizshow_device_ticket_expired",
  "quizshow_pairing_not_found",
  "quizshow_pairing_rate_limited",
  "quizshow_pairing_too_many_tries",
  "quizshow_guest_push_cooldown",
  "quizshow_guest_push_already_sent",
  "quizshow_guest_push_needs_event",
  "quizshow_guest_push_practice",
  "quizshow_refresh_quiz_incomplete",
  "quizshow_refresh_adults_mismatch",
  "quizshow_refresh_adults_lobby_joined",
  "quizshow_refresh_quiz_gone",
  "quizshow_rematch_not_found",
  "quizshow_rematch_expired",
  "quizshow_reaction_not_now",
  "quizshow_import_round_not_found",
  "quizshow_import_too_many_rounds",
  "quizshow_import_too_many_questions",
  "quizshow_import_too_many_wheels",
] as const;

describe("quizshow contract mirror", () => {
  it("keeps the join code alphabet free of look-alike characters", () => {
    expect(QUIZSHOW_JOIN_CODE_ALPHABET).toBe("ABCDEFGHJKMNPQRSTUVWXYZ23456789");
    expect(QUIZSHOW_JOIN_CODE_PATTERN.test("QZ7KP4")).toBe(true);
    expect(QUIZSHOW_JOIN_CODE_PATTERN.test("QZ7KP0")).toBe(false);
    expect(QUIZSHOW_JOIN_CODE_PATTERN.test("qz7kp4")).toBe(false);
    expect(QUIZSHOW_JOIN_CODE_PATTERN.test("QZ7KP")).toBe(false);
  });
  it("carries the scoring numbers the server uses", () => {
    expect(QUIZSHOW_LIMITS.streakStep).toBe(100);
    expect(QUIZSHOW_LIMITS.streakCap).toBe(500);
    expect(QUIZSHOW_LIMITS.answerGraceMs).toBe(500);
    expect(QUIZSHOW_LIMITS.extraTimeFactor).toBe(1.5);
    expect(QUIZSHOW_LIMITS.readPhaseBaseMs).toBe(1500);
    expect(QUIZSHOW_LIMITS.readPhaseMsPerChar).toBe(25);
    expect(QUIZSHOW_LIMITS.readPhaseMinMs).toBe(3000);
    expect(QUIZSHOW_LIMITS.readPhaseMaxMs).toBe(8000);
    expect("readPhaseMs" in QUIZSHOW_LIMITS).toBe(false);
    expect("closestNumberBand" in QUIZSHOW_LIMITS).toBe(false);
    expect(QUIZSHOW_LIMITS.pointsValues).toEqual([500, 1000, 2000]);
    expect(QUIZSHOW_LIMITS.lieDetectorFooledPoints).toBe(500);
    expect(QUIZSHOW_LIMITS.partyVotePoints).toBe(250);
  });
  it("lists the wheel phase after the leaderboard and keeps it untimed, with the open statuses in contract order", () => {
    expect(QUIZSHOW_PHASES).toEqual([
      "lobby",
      "round_intro",
      "read",
      "open",
      "write",
      "review",
      "vote",
      "reveal",
      "scores",
      "leaderboard",
      "wheel",
      "podium",
      "ended",
    ]);
    expect(QUIZSHOW_TIMED_PHASES).toEqual(["read", "open", "write", "vote"]);
    expect(QUIZSHOW_OPEN_SESSION_STATUSES).toEqual([
      "lobby",
      "running",
      "paused",
    ]);
  });
  it("offers one team key per team a session can hold", () => {
    expect(QUIZSHOW_TEAM_COLOR_KEYS).toHaveLength(24);
    expect(QUIZSHOW_TEAM_COLOR_KEYS.length).toBe(
      QUIZSHOW_LIMITS.teamsPerSessionMax,
    );
  });
  it("accepts a pairing code of six digits from 2 to 9 only", () => {
    expect(QUIZSHOW_PAIRING_CODE_PATTERN.test("234567")).toBe(true);
    expect(QUIZSHOW_PAIRING_CODE_PATTERN.test("123456")).toBe(false);
    expect(QUIZSHOW_PAIRING_CODE_PATTERN.test("23456")).toBe(false);
  });
  it("carries the shared screen mute on the state base", () => {
    const base: Pick<
      QuizshowStateBase,
      "isScreenMuted" | "kind" | "gameId" | "isAdultsOnly"
    > = {
      isScreenMuted: true,
      kind: "game",
      gameId: "game-1",
      isAdultsOnly: false,
    };
    expect(base.isScreenMuted).toBe(true);
  });
  it("names the player's own answer row on their reveal, null without an answer", () => {
    const withAnswer: Pick<QuizshowMyReveal, "hasAnswered" | "ownAnswerId"> = {
      hasAnswered: true,
      ownAnswerId: "answer-1",
    };
    const withoutAnswer: Pick<QuizshowMyReveal, "hasAnswered" | "ownAnswerId"> =
      { hasAnswered: false, ownAnswerId: null };
    expect(withAnswer.ownAnswerId).toBe("answer-1");
    expect(withoutAnswer.ownAnswerId).toBeNull();
  });
  it("carries the game error codes and keeps the restriction code last", () => {
    const resultsIndex = QUIZSHOW_ERROR_CODES.indexOf(
      "quizshow_results_not_found",
    );
    expect(
      QUIZSHOW_ERROR_CODES.slice(resultsIndex + 1, resultsIndex + 5),
    ).toEqual([
      "quizshow_game_not_found",
      "quizshow_game_limit_reached",
      "quizshow_lobby_rate_limited",
      "quizshow_game_adults_rounds_need_switch",
    ]);
    const rateLimitedIndex = QUIZSHOW_ERROR_CODES.indexOf(
      "quizshow_rate_limited",
    );
    expect(QUIZSHOW_ERROR_CODES[rateLimitedIndex + 1]).toBe(
      "quizshow_adult_consent_required",
    );
    expect(QUIZSHOW_ERROR_CODES.at(-1)).toBe("ACCOUNT_RESTRICTED");
  });
  it("caps games at 50 and lobbies at 10 an hour", () => {
    expect(QUIZSHOW_GAMES_PER_MEMBER_MAX).toBe(50);
    expect(QUIZSHOW_LOBBY_OPENS_PER_HOUR_MAX).toBe(10);
  });
  it("appends the template codes after the game adults code", () => {
    const adultsSwitchIndex = QUIZSHOW_ERROR_CODES.indexOf(
      "quizshow_game_adults_rounds_need_switch",
    );
    expect(QUIZSHOW_ERROR_CODES[adultsSwitchIndex + 1]).toBe(
      "quizshow_template_not_found",
    );
    expect(QUIZSHOW_ERROR_CODES[adultsSwitchIndex + 2]).toBe(
      "quizshow_template_card_incomplete",
    );
    expect(
      (QUIZSHOW_ERROR_CODES as readonly string[]).includes(
        "quizshow_pack_not_found",
      ),
    ).toBe(false);
  });
  it("caps template cards and staff notes", () => {
    expect(QUIZSHOW_LIMITS.templateCardTitleMax).toBe(120);
    expect(QUIZSHOW_LIMITS.templateCardDescriptionMax).toBe(300);
    expect(QUIZSHOW_LIMITS.templateStaffNotesMax).toBe(20000);
  });
  it("lists the card fields in refusal order", () => {
    expect(QUIZSHOW_TEMPLATE_CARD_FIELDS).toEqual([
      "title.en",
      "title.pt",
      "description.en",
      "description.pt",
    ]);
  });
  it("lists the template statuses", () => {
    expect(QUIZSHOW_TEMPLATE_STATUSES).toEqual(["draft", "published"]);
  });
  it("drops the starter packs from the contract", () => {
    // Kept on one line so the expected error lands on the line below the directive.
    // prettier-ignore
    // @ts-expect-error the pack import body is gone
    const packBody: QuizshowImportInput = { from: "pack", packKey: "eurovision" };
    expect(packBody).toBeDefined();
  });
  it("ends the error list with the reused restriction code", () => {
    expect(QUIZSHOW_ERROR_CODES.at(-1)).toBe("ACCOUNT_RESTRICTED");
    expect(new Set(QUIZSHOW_ERROR_CODES).size).toBe(
      QUIZSHOW_ERROR_CODES.length,
    );
  });
});

describe("quizshow contract mirror, wheel vocabulary", () => {
  it("adds the wheel kind and keeps it out of the playable and party kinds", () => {
    expect(QUIZSHOW_ROUND_KINDS).toEqual([
      "quiz",
      "lie_detector",
      "caption_this",
      "drag_name",
      "wheel",
    ]);
    expect(QUIZSHOW_PLAYABLE_ROUND_KINDS).toEqual([
      "quiz",
      "lie_detector",
      "caption_this",
      "drag_name",
    ]);
    expect(QUIZSHOW_PARTY_ROUND_KINDS).not.toContain("wheel");
  });
  it("carries the wheel picks, bonus values and settings defaults", () => {
    expect(QUIZSHOW_WHEEL_PICKS).toEqual(["round", "question"]);
    expect(QUIZSHOW_WHEEL_BONUS_VALUES).toEqual([0, 250, 500, 1000]);
    expect(QUIZSHOW_WHEEL_SETTINGS_DEFAULTS).toEqual({
      wheelBonus: 0,
      wheelPick: "round",
      sliceCount: null,
    });
  });
  it("carries the wheel limits the server uses", () => {
    expect(QUIZSHOW_LIMITS.roundsMax).toBe(10);
    expect(QUIZSHOW_LIMITS.roundRowsMax).toBe(13);
    expect(QUIZSHOW_LIMITS.wheelStepsMax).toBe(3);
    expect(QUIZSHOW_LIMITS.wheelSlicesMin).toBe(2);
    expect(QUIZSHOW_LIMITS.wheelSlicesMax).toBe(8);
    expect(QUIZSHOW_LIMITS.wheelSpinMs).toBe(5500);
    expect(QUIZSHOW_LIMITS.wheelSpinReducedMotionMs).toBe(1200);
    expect(QUIZSHOW_LIMITS.wheelTurnsMin).toBe(5);
    expect(QUIZSHOW_LIMITS.wheelTurnsMax).toBe(6);
    expect(QUIZSHOW_LIMITS.wheelJitterSeedMax).toBe(1000);
    expect(QUIZSHOW_LIMITS.wheelJitterSpread).toBe(0.7);
    expect(QUIZSHOW_LIMITS.wheelPointerAngle).toBe(270);
    expect(QUIZSHOW_LIMITS.wheelLandingToleranceMs).toBe(250);
  });
  it("appends the wheel problem codes and the wheel socket codes", () => {
    const wheelProblemIndex =
      QUIZSHOW_QUIZ_PROBLEM_CODES.indexOf("too_many_wheels");
    expect(
      QUIZSHOW_QUIZ_PROBLEM_CODES.slice(
        wheelProblemIndex,
        wheelProblemIndex + 2,
      ),
    ).toEqual(["too_many_wheels", "wheel_too_few_slices"]);
    const jokerIndex = QUIZSHOW_ERROR_CODES.indexOf(
      "quizshow_joker_wheel_next",
    );
    expect(QUIZSHOW_ERROR_CODES.slice(jokerIndex - 4, jokerIndex + 1)).toEqual([
      "quizshow_wheel_not_spun",
      "quizshow_wheel_spinning",
      "quizshow_wheel_spin_too_few_rounds",
      "quizshow_wheel_already_next",
      "quizshow_joker_wheel_next",
    ]);
  });
  it("carries the wheel on the state base and the phase change", () => {
    const stateWheel: Pick<QuizshowStateBase, "wheel" | "wheelBonus"> = {
      wheel: null,
      wheelBonus: null,
    };
    const frameWheel: Pick<QuizshowPhaseChangeFrame, "wheel" | "wheelBonus"> = {
      wheel: null,
      wheelBonus: null,
    };
    const cursorProgress: Pick<
      QuizshowCursor,
      "roundNumber" | "upNext" | "canSpinForNextRound"
    > = {
      roundNumber: 2,
      upNext: { kind: "wheel", wheelRoundIndex: 3 },
      canSpinForNextRound: false,
    };
    expect(stateWheel.wheel).toBeNull();
    expect(frameWheel.wheelBonus).toBeNull();
    expect(cursorProgress.upNext).toEqual({
      kind: "wheel",
      wheelRoundIndex: 3,
    });
  });
});

describe("quizshow contract mirror, Pulse Live v2 codes", () => {
  it("appends the 57 v2 error codes once each, in contract order, before the restriction code", () => {
    const jokerIndex = QUIZSHOW_ERROR_CODES.indexOf(
      "quizshow_joker_wheel_next",
    );
    const accountIndex = QUIZSHOW_ERROR_CODES.indexOf("ACCOUNT_RESTRICTED");
    expect(QUIZSHOW_ERROR_CODES.slice(jokerIndex + 1, accountIndex)).toEqual([
      ...QUIZSHOW_V2_ERROR_CODES,
    ]);
    expect(QUIZSHOW_V2_ERROR_CODES).toHaveLength(57);
    for (const code of QUIZSHOW_V2_ERROR_CODES) {
      expect(
        QUIZSHOW_ERROR_CODES.filter((listed) => listed === code),
      ).toHaveLength(1);
    }
  });
  it("appends the six v2 problem codes after the wheel problems", () => {
    expect(QUIZSHOW_QUIZ_PROBLEM_CODES.slice(-6)).toEqual([
      "correct_option_missing",
      "too_many_correct_options",
      "tolerance_out_of_range",
      "poll_in_party_round",
      "slow_reveal_needs_picture",
      "warm_up_not_first",
    ]);
  });
});
