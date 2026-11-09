import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import type {
  QuizshowCursor,
  QuizshowQuestionView,
  QuizshowRoundCard,
  QuizshowScreenState,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { QuizshowScreenLobby } from "./QuizshowScreenLobby";
import { QuizshowScreenParty } from "./QuizshowScreenParty";
import { QuizshowScreenQuestion } from "./QuizshowScreenQuestion";

function cursorWith(overrides: Partial<QuizshowCursor> = {}): QuizshowCursor {
  return {
    phaseId: "1",
    status: "running",
    phase: "read",
    roundIndex: 4,
    questionIndex: 0,
    roundCount: 5,
    phaseStartedAt: null,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: 2,
    upNext: null,
    canSpinForNextRound: false,
    ...overrides,
  };
}

function roundCardOf(
  roundIndex: number,
  overrides: Partial<QuizshowRoundCard> = {},
): QuizshowRoundCard {
  return {
    roundIndex,
    kind: "quiz",
    title: { en: `Round title ${roundIndex}`, pt: `Titulo ${roundIndex}` },
    contentLabel: "none",
    questionCount: 4,
    isJokerAllowed: true,
    isSpeedBonusOn: false,
    ...overrides,
  };
}

function questionOf(
  overrides: Partial<QuizshowQuestionView> = {},
): QuizshowQuestionView {
  return {
    questionId: "question-1",
    roundIndex: 4,
    questionIndex: 0,
    roundKind: "quiz",
    type: "true_false",
    prompt: { en: "Was Stonewall in 1969?", pt: "Stonewall foi em 1969?" },
    mediaUrl: null,
    points: 1000,
    timeLimitSeconds: 20,
    options: null,
    ...overrides,
  };
}

function screenSession(
  overrides: Partial<QuizshowScreenState> = {},
): QuizshowScreenState {
  return {
    sessionId: "session-1",
    eventSlug: "quiz-night",
    eventTitle: "Quiz night",
    kind: "event",
    gameId: null,
    isAdultsOnly: false,
    joinCode: "QZ7KP4",
    quizTitle: "Pride quiz",
    languages: "both",
    screenLanguage: "en",
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    isScreenMuted: false,
    cursor: cursorWith(),
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    role: "screen",
    lobby: { players: [], teams: [], playerCount: 0 },
    question: null,
    answerCount: null,
    voteOptions: null,
    wheel: null,
    wheelBonus: null,
    ...overrides,
  };
}

/** Pick a question: the wheel step at row 3 drew Music (row 4), the question now playing. */
const PICK_A_QUESTION_WHEEL: QuizshowWheelView = {
  wheelRoundIndex: 3,
  pick: "question",
  slices: [
    {
      roundIndex: 4,
      title: { en: "Music", pt: "Musica" },
      kind: "quiz",
      contentLabel: "none",
      wheelBonus: 0,
      questionCount: 4,
      isPlayed: true,
    },
  ],
  spinNumber: 2,
  spinTotal: 9,
  spin: null,
  playingRoundIndex: 4,
};

function itemAt(items: HTMLElement[], index: number): HTMLElement {
  const item = items.at(index);
  if (item === undefined) throw new Error(`No list item at index ${index}.`);
  return item;
}

async function renderOnScreen(content: React.ReactNode) {
  const rendered = render(
    <TestProviders>
      <MotionProvider>{content}</MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("quizshow");
  return rendered;
}

describe("the TV round lines", () => {
  it("reads the played-count round number on a quiz question", async () => {
    const session = screenSession({ round: roundCardOf(4) });
    await renderOnScreen(
      <QuizshowScreenQuestion
        session={session}
        question={questionOf()}
        clockOffsetMs={0}
        size="screen"
      />,
    );
    expect(screen.getByText("Round 2 of 5")).toBeInTheDocument();
    expect(screen.getByText("Round title 4")).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 4")).toBeInTheDocument();
  });

  it("reads the category pill alone on a pick-a-question wheel question", async () => {
    const session = screenSession({
      round: roundCardOf(4),
      wheel: PICK_A_QUESTION_WHEEL,
    });
    await renderOnScreen(
      <QuizshowScreenQuestion
        session={session}
        question={questionOf()}
        clockOffsetMs={0}
        size="screen"
      />,
    );
    expect(screen.getByText("Music · spin 2 of 9")).toBeInTheDocument();
    expect(screen.queryByText("Round title 4")).toBeNull();
    expect(screen.queryByText(/^Question \d+ of \d+$/)).toBeNull();
    expect(screen.queryByText(/^Round \d+ of \d+$/)).toBeNull();
  });

  it("keeps the kind segment after the wheel segment on a party question", async () => {
    const partyRound = roundCardOf(4, { kind: "caption_this" });
    const session = screenSession({
      round: partyRound,
      wheel: PICK_A_QUESTION_WHEEL,
    });
    await renderOnScreen(
      <QuizshowScreenParty
        session={session}
        question={questionOf({
          roundKind: "caption_this",
          type: "prompt",
        })}
        clockOffsetMs={0}
        size="screen"
      />,
    );
    const segments = screen
      .getByText("Music · spin 2 of 9")
      .parentElement?.querySelectorAll("span");
    expect(
      Array.from(segments ?? []).map((segment) => segment.textContent),
    ).toEqual(["Music · spin 2 of 9", "Caption This"]);
  });

  it("numbers the party pill by played rounds without a wheel", async () => {
    const session = screenSession({
      round: roundCardOf(4, { kind: "caption_this" }),
    });
    await renderOnScreen(
      <QuizshowScreenParty
        session={session}
        question={questionOf({ roundKind: "caption_this", type: "prompt" })}
        clockOffsetMs={0}
        size="screen"
      />,
    );
    expect(screen.getByText("Round 2 of 5")).toBeInTheDocument();
    expect(screen.getByText("Caption This")).toBeInTheDocument();
  });

  it("numbers the lobby list without counting wheel rows", async () => {
    const rounds = [
      roundCardOf(0),
      roundCardOf(1, { kind: "wheel", title: { en: "", pt: "" } }),
      roundCardOf(2),
    ];
    const session = screenSession({
      cursor: cursorWith({ phase: "lobby", roundIndex: null, roundNumber: 0 }),
      rounds,
    });
    await renderOnScreen(
      <QuizshowScreenLobby session={session} size="screen" />,
    );
    const items = screen.getAllByRole("listitem");
    const roundItems = items.filter((item) =>
      item.textContent?.includes("Round title"),
    );
    expect(roundItems).toHaveLength(2);
    expect(within(itemAt(roundItems, 0)).getByText("1")).toBeInTheDocument();
    expect(within(itemAt(roundItems, 1)).getByText("2")).toBeInTheDocument();
    const wheelItem = items.find((item) => item.textContent === "Wheel");
    expect(wheelItem).toBeDefined();
    expect(wheelItem?.textContent).not.toMatch(/\d/);
  });

  it("reads Round N for a blank-titled round in the lobby list", async () => {
    const rounds = [
      roundCardOf(0),
      roundCardOf(1, { kind: "wheel", title: { en: "", pt: "" } }),
      roundCardOf(2, { title: { en: "  ", pt: "" } }),
    ];
    const session = screenSession({
      cursor: cursorWith({ phase: "lobby", roundIndex: null, roundNumber: 0 }),
      rounds,
    });
    await renderOnScreen(
      <QuizshowScreenLobby session={session} size="screen" />,
    );
    expect(screen.getByText("Round title 0")).toBeInTheDocument();
    // The wheel row before it never counts, so the blank round is the second one.
    expect(screen.getByText("Round 2")).toBeInTheDocument();
  });
});
