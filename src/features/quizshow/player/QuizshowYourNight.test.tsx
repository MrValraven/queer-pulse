import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import type {
  QuizshowAnswerPayload,
  QuizshowMyReveal,
  QuizshowQuestionView,
  QuizshowRematch,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_PLAY_CODE_ROUTE } from "../quizshowPaths";
import {
  createQuizshowClientState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import type { QuizshowNightEntry } from "../realtime/quizshowNightLog";
import { QuizshowPlayerEnd } from "./QuizshowPlayerEnd";
import { QuizshowYourNight } from "./QuizshowYourNight";

const drawYourNightImageMock = vi.hoisted(() => vi.fn());

vi.mock("./quizshowYourNightImage", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./quizshowYourNightImage")>();
  return { ...actual, drawYourNightImage: drawYourNightImageMock };
});

function questionView(
  questionId: string,
  questionIndex: number,
  type: QuizshowQuestionView["type"],
): QuizshowQuestionView {
  return {
    questionId,
    roundIndex: 0,
    questionIndex,
    roundKind: "quiz",
    type,
    prompt: { en: `Question ${questionIndex + 1}`, pt: "" },
    mediaUrl: null,
    points: 100,
    timeLimitSeconds: 20,
    mediaAlt: { en: "", pt: "" },
    mediaReveal: "instant",
    numberUnit: { en: "", pt: "" },
    readMs: 4000,
    options:
      type === "multiple_choice" || type === "poll"
        ? [
            { id: "option-a", text: { en: "Lisbon", pt: "" } },
            { id: "option-b", text: { en: "Porto", pt: "" } },
          ]
        : null,
  };
}

function reveal(
  questionId: string,
  fields: Partial<QuizshowMyReveal>,
): QuizshowMyReveal {
  return {
    phaseId: `phase-${questionId}`,
    questionId,
    hasAnswered: true,
    ownAnswerId: `answer-${questionId}`,
    isCorrect: true,
    correctPositions: null,
    pointsAwarded: 100,
    streakBonus: 0,
    isJokerActive: false,
    streak: 1,
    score: 0,
    teamScore: null,
    rank: 1,
    ...fields,
  };
}

function payloadFor(type: QuizshowQuestionView["type"]): QuizshowAnswerPayload {
  if (type === "type_answer") return { type: "type_answer", text: "Coimbra" };
  if (type === "poll") return { type: "poll", optionIndex: 0 };
  return { type: "multiple_choice", optionIndex: 0 };
}

function nightEntry(
  question: QuizshowQuestionView,
  myReveal: QuizshowMyReveal,
): QuizshowNightEntry {
  return {
    questionId: question.questionId,
    roundIndex: question.roundIndex,
    questionIndex: question.questionIndex,
    isWarmUp: false,
    question,
    myAnswer: {
      questionId: question.questionId,
      phaseId: myReveal.phaseId,
      payload: payloadFor(question.type),
      receivedAt: 0,
    },
    myReveal,
    correct: null,
    note: null,
  };
}

/** Two right of three scored answers, a best streak of 2, 2300 joker points, and a poll left out. */
const FIXED_LOG: QuizshowNightEntry[] = [
  nightEntry(
    questionView("q1", 0, "multiple_choice"),
    reveal("q1", { streak: 1 }),
  ),
  nightEntry(
    questionView("q2", 1, "multiple_choice"),
    reveal("q2", { streak: 2, isJokerActive: true, pointsAwarded: 4600 }),
  ),
  nightEntry(
    questionView("q3", 2, "type_answer"),
    reveal("q3", { isCorrect: false, streak: 0, pointsAwarded: 0 }),
  ),
  nightEntry(
    questionView("q4", 3, "poll"),
    reveal("q4", { isCorrect: null, streak: 0, pointsAwarded: 0 }),
  ),
];

function renderNight({ isTeams = false }: { isTeams?: boolean } = {}) {
  render(
    <TestProviders>
      <ReducedMotionContext.Provider value={true}>
        <QuizshowYourNight
          nightLog={FIXED_LOG}
          finalPlace={{ place: 3, total: 12 }}
          quizTitle="Quiz night"
          isTeams={isTeams}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

/** Resolves the save chain (draw, share check, download) one microtask hop at a time, inside act. */
async function flushPromises() {
  await act(async () => {
    for (let hop = 0; hop < 20; hop += 1) await Promise.resolve();
  });
}

const OBJECT_URL_METHODS = ["createObjectURL", "revokeObjectURL"] as const;
const originalObjectUrlDescriptors = OBJECT_URL_METHODS.map((methodName) => ({
  methodName,
  descriptor: Object.getOwnPropertyDescriptor(URL, methodName),
}));

/** jsdom has no object URLs: stand both methods in, restored after each test. */
function stubObjectUrls() {
  const createObjectUrl = vi.fn(() => "blob:night");
  const revokeObjectUrl = vi.fn();
  Object.defineProperty(URL, "createObjectURL", {
    value: createObjectUrl,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    value: revokeObjectUrl,
    configurable: true,
    writable: true,
  });
  return { createObjectUrl, revokeObjectUrl };
}

beforeEach(() => {
  drawYourNightImageMock.mockResolvedValue(
    new Blob(["png"], { type: "image/png" }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  drawYourNightImageMock.mockReset();
  Reflect.deleteProperty(navigator, "share");
  Reflect.deleteProperty(navigator, "canShare");
  for (const { methodName, descriptor } of originalObjectUrlDescriptors) {
    if (descriptor === undefined) Reflect.deleteProperty(URL, methodName);
    else Object.defineProperty(URL, methodName, descriptor);
  }
  window.sessionStorage.clear();
});

describe("QuizshowYourNight summary", () => {
  it("counts right of answered, the best streak, joker points and the place", async () => {
    renderNight();
    await awaitCatalog("quizshow");

    const facts = within(screen.getByRole("list"));
    expect(facts.getByText("2 of 3 right")).toBeInTheDocument();
    expect(facts.getByText("Best streak: 2")).toBeInTheDocument();
    expect(facts.getByText("Joker points: 2,300")).toBeInTheDocument();
    expect(facts.getByText("Final place: 3rd of 12")).toBeInTheDocument();
  });
});

describe("QuizshowYourNight team place", () => {
  it("names the team's place in teams play", async () => {
    renderNight({ isTeams: true });
    await awaitCatalog("quizshow");

    expect(screen.getByText("Team place: 3rd of 12")).toBeInTheDocument();
    expect(screen.queryByText(/^Final place/)).toBeNull();
  });
});

describe("QuizshowYourNight Save image", () => {
  it("hands the PNG to the share sheet when the browser can share files", async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    });
    Object.defineProperty(navigator, "canShare", {
      value: vi.fn(() => true),
      configurable: true,
    });
    const { createObjectUrl } = stubObjectUrls();
    renderNight();
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Save image" }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const [shareData] = share.mock.calls[0] as [ShareData];
    expect(shareData.files?.[0]?.type).toBe("image/png");
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it("downloads the PNG when the browser cannot share files and frees the URL after 30 s", async () => {
    const { createObjectUrl, revokeObjectUrl } = stubObjectUrls();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    renderNight();
    await awaitCatalog("quizshow");
    // Faked only after the catalog loaded, so awaitCatalog's own timer runs for real.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    await user.click(screen.getByRole("button", { name: "Save image" }));

    // Flush the save chain's promise hops without moving the faked clock.
    await flushPromises();
    expect(click).toHaveBeenCalledTimes(1);
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("pulse-live-your-night.png");
    vi.advanceTimersByTime(29_999);
    expect(revokeObjectUrl).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:night");
  });
});

function endedState(rematch: QuizshowRematch): QuizshowClientState {
  return {
    ...createQuizshowClientState("player"),
    status: "attached",
    hasAttached: true,
    sessionEnd: {
      sessionId: "session-1",
      status: "finished",
      podium: [],
      nextEvent: null,
      hasResults: true,
      isPractice: false,
      giving: null,
    },
    rematch,
    lastTeamName: "Glitter Owls",
  };
}

function renderEnd(state: QuizshowClientState) {
  render(
    <TestProviders initialEntries={["/quiz-end"]}>
      <ReducedMotionContext.Provider value={true}>
        <Routes>
          <Route
            path="/quiz-end"
            element={
              <QuizshowPlayerEnd state={state} kind="game" eventSlug={null} />
            }
          />
          <Route
            path={QUIZSHOW_PLAY_CODE_ROUTE}
            element={<p data-testid="rematch-join" />}
          />
        </Routes>
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

describe("QuizshowPlayerEnd rematch", () => {
  it("remembers the old team's name for the new code and opens it", async () => {
    const user = userEvent.setup();
    renderEnd(
      endedState({
        fromSessionId: "session-1",
        sessionId: "session-2",
        joinCode: "QZ8RMT",
        playMode: "teams",
      }),
    );
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Join the rematch" }));

    expect(
      window.sessionStorage.getItem("quizshow.rematchTeamName.QZ8RMT"),
    ).toBe("Glitter Owls");
    expect(await screen.findByTestId("rematch-join")).toBeInTheDocument();
  });

  it("stores no team name for a solo rematch", async () => {
    const user = userEvent.setup();
    renderEnd(
      endedState({
        fromSessionId: "session-1",
        sessionId: "session-2",
        joinCode: "QZ8RMT",
        playMode: "solo",
      }),
    );
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Join the rematch" }));

    expect(
      window.sessionStorage.getItem("quizshow.rematchTeamName.QZ8RMT"),
    ).toBeNull();
    expect(await screen.findByTestId("rematch-join")).toBeInTheDocument();
  });
});
