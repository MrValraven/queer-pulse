import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import {
  QUIZSHOW_PHASES,
  QUIZSHOW_TIMED_PHASES,
} from "../../../shared/contracts/quizshow";
import type {
  QuizshowCursor,
  QuizshowLeaderboardEntry,
  QuizshowPodiumEntry,
  QuizshowQuestionView,
  QuizshowReveal,
  QuizshowRoundCard as QuizshowRoundCardData,
} from "../../../shared/contracts/quizshow";
import { QuizshowAnswerTile } from "./QuizshowAnswerTile";
import { QuizshowConnectionBanner } from "./QuizshowConnectionBanner";
import { QuizshowCountdownBar } from "./QuizshowCountdownBar";
import { QuizshowDistribution } from "./QuizshowDistribution";
import { QuizshowLeaderboard } from "./QuizshowLeaderboard";
import { QuizshowPausedNote } from "./QuizshowPausedNote";
import { QuizshowPodium } from "./QuizshowPodium";
import { QuizshowRoundCard } from "./QuizshowRoundCard";
import { optionLetter, pickQuizshowText } from "./quizshowText";
import { useQuizshowCountdown } from "./useQuizshowCountdown";

vi.mock("../../../shared/components/ui/RollingNumber", () => ({
  RollingNumber: (props: { value: string; revealFrom?: { value: string } }) => (
    <span
      data-testid="rolling-number"
      data-value={props.value}
      data-reveal-from={props.revealFrom?.value}
    >
      {props.value}
    </span>
  ),
}));

function stageTree(element: React.ReactNode, isReducedMotion = false) {
  return (
    <TestProviders>
      <ReducedMotionContext.Provider value={isReducedMotion}>
        {element}
      </ReducedMotionContext.Provider>
    </TestProviders>
  );
}

function renderStage(element: React.ReactNode, isReducedMotion = false) {
  return render(stageTree(element, isReducedMotion));
}

const QUESTION: QuizshowQuestionView = {
  questionId: "question-1",
  roundIndex: 0,
  questionIndex: 0,
  roundKind: "quiz",
  type: "multiple_choice",
  prompt: { en: "Which flag?", pt: "Que bandeira?" },
  mediaUrl: null,
  points: 1000,
  timeLimitSeconds: 20,
  options: [
    { id: "option-a", text: { en: "Rainbow", pt: "Arco-iris" } },
    { id: "option-b", text: { en: "Trans", pt: "Trans" } },
  ],
};

function revealWith(
  distribution: QuizshowReveal["distribution"],
  correct: QuizshowReveal["correct"] = null,
): QuizshowReveal {
  return {
    phaseId: "9",
    questionId: "question-1",
    correct,
    answeredCount: 5,
    eligibleCount: 6,
    distribution,
  };
}

function renderDistribution(reveal: QuizshowReveal) {
  return renderStage(
    <QuizshowDistribution
      reveal={reveal}
      question={QUESTION}
      language="en"
      size="screen"
    />,
  );
}

describe("quizshow stage text and tiles", () => {
  it("falls back to the other language when a text is blank", () => {
    expect(pickQuizshowText({ en: "Hello", pt: "Ola" }, "pt")).toBe("Ola");
    expect(pickQuizshowText({ en: "Hello", pt: "" }, "pt")).toBe("Hello");
    expect(pickQuizshowText({ en: "  ", pt: "Ola" }, "en")).toBe("Ola");
    expect(optionLetter(0)).toBe("A");
    expect(optionLetter(5)).toBe("F");
  });

  it("names an answer tile by letter, shape and text", () => {
    const onSelect = vi.fn();
    renderStage(
      <QuizshowAnswerTile
        colorKey="triangle"
        letter="A"
        text="Rainbow"
        size="phone"
        state="idle"
        onSelect={onSelect}
        ariaLabel="Answer A, Triangle: Rainbow"
      />,
    );
    const tile = screen.getByRole("button", {
      name: "Answer A, Triangle: Rainbow",
    });
    expect(tile.querySelector("[role='img']")).toBeNull();
    expect(tile.querySelector("[aria-hidden='true']")).not.toBeNull();
    tile.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("keeps a disabled tile focusable and silent", () => {
    const onSelect = vi.fn();
    renderStage(
      <QuizshowAnswerTile
        colorKey="circle"
        letter="C"
        text="Pink"
        size="phone"
        state="dimmed"
        onSelect={onSelect}
        isDisabled
        ariaLabel="Answer C, Circle: Pink"
      />,
    );
    const tile = screen.getByRole("button", { name: /Answer C/ });
    expect(tile).toHaveAttribute("aria-disabled", "true");
    expect(tile).not.toBeDisabled();
    tile.click();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marks only the correct tile with a check beside its text", () => {
    renderStage(
      <>
        <QuizshowAnswerTile
          colorKey="diamond"
          letter="B"
          text="Greenwich Village"
          size="screen"
          state="correct"
          ariaLabel="Correct answer, Answer B, Diamond: Greenwich Village"
        />
        <QuizshowAnswerTile
          colorKey="triangle"
          letter="A"
          text="Harlem"
          size="screen"
          state="dimmed"
          ariaLabel="Answer A, Triangle: Harlem"
        />
      </>,
    );
    const correctTile = screen.getByRole("group", { name: /Correct answer/ });
    const dimmedTile = screen.getByRole("group", { name: /Harlem/ });
    // The shape draws one icon; the correct tile adds the check after the text.
    expect(correctTile.querySelectorAll("svg")).toHaveLength(2);
    expect(dimmedTile.querySelectorAll("svg")).toHaveLength(1);
    const checkBadge = correctTile.lastElementChild;
    expect(checkBadge?.previousElementSibling).toHaveTextContent(
      "Greenwich Village",
    );
    expect(checkBadge).toHaveAttribute("aria-hidden", "true");
  });
});

describe("quizshow stage distribution", () => {
  it("draws the distribution for every kind", () => {
    const { unmount } = renderDistribution(
      revealWith(
        { kind: "options", counts: [3, 1] },
        { type: "multiple_choice", correctIndex: 0 },
      ),
    );
    expect(screen.getAllByTestId("rolling-number")).toHaveLength(2);
    expect(screen.getByText("Correct answer")).toBeInTheDocument();
    unmount();

    const trueFalse = renderDistribution(
      revealWith(
        { kind: "true_false", trueCount: 4, falseCount: 2 },
        { type: "true_false", isTrue: true },
      ),
    );
    expect(screen.getByText("True")).toBeInTheDocument();
    expect(screen.getByText("False")).toBeInTheDocument();
    trueFalse.unmount();

    const typed = renderDistribution(
      revealWith({ kind: "typed", correctCount: 3, incorrectCount: 2 }),
    );
    expect(screen.getByText("3 got it right")).toBeInTheDocument();
    expect(screen.getByText("2 missed it")).toBeInTheDocument();
    typed.unmount();

    const order = renderDistribution(
      revealWith({
        kind: "order",
        exactCount: 2,
        partialCount: 1,
        noneCount: 0,
      }),
    );
    expect(screen.getByText("2 in the right order")).toBeInTheDocument();
    expect(screen.getByText("1 partly right")).toBeInTheDocument();
    expect(screen.getByText("0 with nothing in place")).toBeInTheDocument();
    order.unmount();

    const closest = renderDistribution(
      revealWith({
        kind: "closest",
        closestValue: 1969,
        closestNames: ["Sam", "Ro"],
        withinBandCount: 2,
      }),
    );
    expect(screen.getByText("Closest guess: 1,969")).toBeInTheDocument();
    expect(screen.getByText("Closest: Sam, Ro")).toBeInTheDocument();
    expect(screen.getByText("2 within 10%")).toBeInTheDocument();
    closest.unmount();

    renderDistribution(
      revealWith({
        kind: "votes",
        favouriteOptionId: "vote-1",
        entries: [
          {
            optionId: "vote-1",
            answerId: "answer-1",
            text: "A very good caption",
            authorName: "Sam",
            isTruth: false,
            voteCount: 1,
            authorPoints: 500,
          },
          {
            optionId: "vote-2",
            answerId: null,
            text: "The real one",
            authorName: null,
            isTruth: true,
            voteCount: 3,
            authorPoints: 0,
          },
        ],
      }),
    );
    expect(screen.getByText("A very good caption")).toBeInTheDocument();
    expect(screen.getByText("by Sam")).toBeInTheDocument();
    expect(screen.getByText("1 vote")).toBeInTheDocument();
    expect(screen.getByText("3 votes")).toBeInTheDocument();
    expect(screen.getByText("The truth")).toBeInTheDocument();
    expect(screen.getByText("Hosts' favourite")).toBeInTheDocument();
  });
});

describe("quizshow stage party entries", () => {
  const VOTE_ENTRIES: Extract<
    QuizshowReveal["distribution"],
    { kind: "votes" }
  > = {
    kind: "votes",
    favouriteOptionId: "vote-1",
    entries: [
      {
        optionId: "vote-1",
        answerId: "answer-1",
        text: "A very good caption",
        authorName: "Sam",
        isTruth: false,
        voteCount: 1,
        authorPoints: 500,
      },
      {
        optionId: "vote-2",
        answerId: "answer-2",
        text: "the second one lol",
        authorName: "Ro",
        isTruth: false,
        voteCount: 2,
        authorPoints: 500,
      },
    ],
  };

  function distributionTree(distribution: QuizshowReveal["distribution"]) {
    return stageTree(
      <QuizshowDistribution
        reveal={revealWith(distribution)}
        question={QUESTION}
        language="en"
        size="screen"
      />,
      true,
    );
  }

  it("a hidden entry leaves the distribution", async () => {
    const { rerender } = render(distributionTree(VOTE_ENTRIES));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Hosts' favourite")).toBeInTheDocument();
    rerender(
      distributionTree({
        ...VOTE_ENTRIES,
        favouriteOptionId: null,
        entries: VOTE_ENTRIES.entries.filter(
          (entry) => entry.optionId !== "vote-1",
        ),
      }),
    );
    await waitFor(() =>
      expect(screen.queryByText("A very good caption")).toBeNull(),
    );
    await waitFor(() =>
      expect(screen.queryByText("Hosts' favourite")).toBeNull(),
    );
    expect(screen.getByText("the second one lol")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  function entryTextsInOrder(): string[] {
    return screen
      .getAllByRole("listitem")
      .map(
        (item) =>
          item.querySelector<HTMLElement>("span")?.textContent ??
          item.textContent ??
          "",
      );
  }

  it("lists the truth first and then the entries by votes", () => {
    render(
      distributionTree({
        kind: "votes",
        favouriteOptionId: null,
        entries: [
          ...VOTE_ENTRIES.entries,
          {
            optionId: "vote-truth",
            answerId: null,
            text: "the real answer",
            authorName: null,
            isTruth: true,
            voteCount: 0,
            authorPoints: 0,
          },
        ],
      }),
    );
    expect(entryTextsInOrder()).toEqual([
      "the real answer",
      "the second one lol",
      "A very good caption",
    ]);
  });

  it("caps the entries and counts the rest in a more line", () => {
    const manyEntries = Array.from({ length: 10 }, (_unused, entryIndex) => ({
      optionId: `vote-${entryIndex}`,
      answerId: `answer-${entryIndex}`,
      text: `caption number ${entryIndex}`,
      authorName: `Player ${entryIndex}`,
      isTruth: false,
      voteCount: entryIndex,
      authorPoints: 0,
    }));
    render(
      stageTree(
        <QuizshowDistribution
          reveal={revealWith({
            kind: "votes",
            favouriteOptionId: null,
            entries: manyEntries,
          })}
          question={QUESTION}
          language="en"
          size="screen"
          maxEntries={8}
        />,
        true,
      ),
    );
    // 8 entries plus the "+2 more" line; the two with the fewest votes stay off the screen.
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
    expect(screen.getByText("+2 more")).toBeInTheDocument();
    expect(screen.getByText("caption number 9")).toBeInTheDocument();
    expect(screen.queryByText("caption number 1")).toBeNull();
    expect(screen.queryByText("caption number 0")).toBeNull();
  });

  it("the cap keeps the hosts' favourite", () => {
    const lieEntries = Array.from({ length: 10 }, (_unused, entryIndex) => ({
      optionId: `vote-${entryIndex}`,
      answerId: `answer-${entryIndex}`,
      text: `lie number ${entryIndex}`,
      authorName: `Player ${entryIndex}`,
      isTruth: false,
      voteCount: entryIndex + 1,
      authorPoints: 0,
    }));
    const truthEntry = {
      optionId: "vote-truth",
      answerId: null,
      text: "the real answer",
      authorName: null,
      isTruth: true,
      voteCount: 0,
      authorPoints: 0,
    };
    render(
      stageTree(
        <QuizshowDistribution
          reveal={revealWith({
            kind: "votes",
            // The fewest votes: last in the order, far past the cap.
            favouriteOptionId: "vote-0",
            entries: [...lieEntries, truthEntry],
          })}
          question={QUESTION}
          language="en"
          size="screen"
          maxEntries={8}
        />,
        true,
      ),
    );
    // Truth, the six lies with the most votes, then the favourite in the last slot.
    expect(entryTextsInOrder()).toEqual([
      "the real answer",
      "lie number 9",
      "lie number 8",
      "lie number 7",
      "lie number 6",
      "lie number 5",
      "lie number 4",
      "lie number 0",
      "+3 more",
    ]);
    expect(screen.getByText("Hosts' favourite")).toBeInTheDocument();
    expect(screen.queryByText("lie number 3")).toBeNull();
  });
});

describe("quizshow stage pause", () => {
  const BAR_START_AT = 2_000_000;

  function barCursor(overrides: Partial<QuizshowCursor>): QuizshowCursor {
    return {
      phaseId: "12",
      status: "running",
      phase: "open",
      roundIndex: 0,
      questionIndex: 0,
      roundCount: 1,
      phaseStartedAt: BAR_START_AT,
      deadline: BAR_START_AT + 20_000,
      extraTimeDeadline: BAR_START_AT + 30_000,
      pausedRemainingMs: null,
      pausedExtraTimeRemainingMs: null,
      isRestartRecovery: false,
      ...overrides,
    };
  }

  function barTree(cursor: QuizshowCursor) {
    return stageTree(
      <QuizshowCountdownBar
        cursor={cursor}
        clockOffsetMs={0}
        hasExtraTime={false}
        size="phone"
      />,
    );
  }

  function barFillTransform(): string | undefined {
    return document.querySelector<HTMLElement>("[style*='scaleX']")?.style
      .transform;
  }

  it("the countdown bar holds its place while paused", () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    vi.setSystemTime(BAR_START_AT);
    try {
      const { rerender } = render(barTree(barCursor({})));
      act(() => {
        vi.advanceTimersByTime(5_000);
      });
      expect(barFillTransform()).toBe("scaleX(0.75)");

      rerender(
        barTree(
          barCursor({
            status: "paused",
            deadline: null,
            extraTimeDeadline: null,
            pausedRemainingMs: 15_000,
            pausedExtraTimeRemainingMs: 25_000,
          }),
        ),
      );
      expect(barFillTransform()).toBe("scaleX(0.75)");
      act(() => {
        vi.advanceTimersByTime(6_000);
      });
      expect(barFillTransform()).toBe("scaleX(0.75)");
      // The shared paused note says it; the bar itself stays quiet.
      expect(screen.queryByText("Paused")).toBeNull();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();

      rerender(
        barTree(
          barCursor({
            status: "paused",
            deadline: null,
            extraTimeDeadline: null,
            isRestartRecovery: true,
          }),
        ),
      );
      expect(barFillTransform()).toBe("scaleX(0.75)");
    } finally {
      vi.useRealTimers();
    }
  });

  function PausedNoteFromCursor({ cursor }: { cursor: QuizshowCursor }) {
    const { isPaused } = useQuizshowCountdown(cursor, 0, {
      hasExtraTime: false,
    });
    return <QuizshowPausedNote isPaused={isPaused} />;
  }

  it("the paused note shows in every paused phase", async () => {
    const timedPhases: readonly string[] = QUIZSHOW_TIMED_PHASES;
    const pausablePhases = QUIZSHOW_PHASES.filter(
      (phase) => phase !== "lobby" && phase !== "ended",
    );
    for (const phase of pausablePhases) {
      const isTimed = timedPhases.includes(phase);
      const { unmount } = renderStage(
        <PausedNoteFromCursor
          cursor={barCursor({
            status: "paused",
            phase,
            phaseStartedAt: isTimed ? BAR_START_AT : null,
            deadline: null,
            extraTimeDeadline: null,
            pausedRemainingMs: isTimed ? 8_000 : null,
          })}
        />,
      );
      expect(screen.getByText("Paused")).toBeInTheDocument();
      unmount();
    }

    // A restart pause carries no remainder and still shows the note.
    const restartPausedCursor = barCursor({
      status: "paused",
      deadline: null,
      extraTimeDeadline: null,
      isRestartRecovery: true,
    });
    const { rerender } = render(
      stageTree(<PausedNoteFromCursor cursor={restartPausedCursor} />, true),
    );
    expect(screen.getByText("Paused")).toBeInTheDocument();

    rerender(stageTree(<PausedNoteFromCursor cursor={barCursor({})} />, true));
    await waitFor(() => expect(screen.queryByText("Paused")).toBeNull());
  });
});

describe("quizshow stage standings", () => {
  it("rolls each leaderboard score up from its previous score", () => {
    const entries: QuizshowLeaderboardEntry[] = [
      {
        rank: 1,
        kind: "player",
        entrantId: "player-1",
        name: "Sam",
        colorKey: null,
        score: 1500,
        previousScore: 1000,
      },
      {
        rank: 2,
        kind: "team",
        entrantId: "team-1",
        name: "Stars",
        colorKey: "star",
        score: 900,
        previousScore: 900,
      },
    ];
    renderStage(
      <QuizshowLeaderboard
        scores={{
          phaseId: "11",
          scope: "question",
          entries,
          entrantCount: 2,
        }}
        highlightEntrantId="player-1"
        size="phone"
      />,
    );
    const rolling = screen.getAllByTestId("rolling-number");
    expect(rolling.map((node) => node.dataset.value)).toEqual(["1,500", "900"]);
    expect(rolling.map((node) => node.dataset.revealFrom)).toEqual([
      "1,000",
      "900",
    ]);
    expect(
      screen.getByRole("list", { name: "Leaderboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sam").closest("li")).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  describe("podium", () => {
    const entries: QuizshowPodiumEntry[] = [
      {
        place: 1,
        kind: "player",
        entrantId: "a",
        name: "Gold",
        colorKey: null,
        score: 3000,
      },
      {
        place: 2,
        kind: "player",
        entrantId: "b",
        name: "Silver",
        colorKey: null,
        score: 2000,
      },
      {
        place: 3,
        kind: "player",
        entrantId: "c",
        name: "Bronze",
        colorKey: null,
        score: 1000,
      },
    ];

    function revealDelays(): Record<string, string | undefined> {
      const delays: Record<string, string | undefined> = {};
      for (const step of document.querySelectorAll<HTMLElement>(
        "[data-place]",
      )) {
        delays[step.dataset.place ?? ""] = step.dataset.revealDelay;
      }
      return delays;
    }

    it("reveals the podium third, second, first", () => {
      renderStage(<QuizshowPodium entries={entries} size="screen" />);
      expect(revealDelays()).toEqual({ "3": "0", "2": "0.8", "1": "1.6" });
      expect(
        screen.getAllByRole("listitem").map((item) => item.dataset.place),
      ).toEqual(["1", "2", "3"]);
    });

    it("shows all three at once with reduced motion", () => {
      renderStage(<QuizshowPodium entries={entries} size="screen" />, true);
      expect(revealDelays()).toEqual({ "3": "0", "2": "0", "1": "0" });
    });
  });

  it("shows the round's content label and joker note", () => {
    const round: QuizshowRoundCardData = {
      roundIndex: 1,
      kind: "quiz",
      title: { en: "Spicy round", pt: "" },
      contentLabel: "spicy",
      questionCount: 5,
      isJokerAllowed: true,
      isSpeedBonusOn: false,
    };
    renderStage(
      <QuizshowRoundCard
        round={round}
        roundCount={3}
        language="pt"
        size="screen"
      />,
    );
    expect(screen.getByText("Round 2 of 3")).toBeInTheDocument();
    expect(screen.getByText("Spicy round")).toBeInTheDocument();
    expect(screen.getByText("Spicy")).toBeInTheDocument();
    expect(screen.getByText("Jokers allowed this round")).toBeInTheDocument();
    expect(screen.queryByText("Faster answers score more")).toBeNull();
  });

  it("shows the reconnecting line only while reconnecting", async () => {
    const { rerender } = renderStage(
      <QuizshowConnectionBanner status="attached" />,
    );
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    rerender(
      <TestProviders>
        <QuizshowConnectionBanner status="reconnecting" />
      </TestProviders>,
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Reconnecting to the game",
    );
    rerender(
      <TestProviders>
        <QuizshowConnectionBanner status="attached" />
      </TestProviders>,
    );
    await waitFor(() =>
      expect(screen.getByRole("status")).toBeEmptyDOMElement(),
    );
  });
});
