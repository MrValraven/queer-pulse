import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { demoQuizFor } from "../api/quizshowDemoStore";
import { QUIZSHOW_SIMULATED_PLAYERS } from "../engine/quizshowSimulatedPlayers.data";
import { QUIZSHOW_DEMO_JOIN_CODE } from "../quizshow.constants";
import { draftFromQuiz, type QuizshowDraft } from "./quizshowDraft";
import { QuizshowDryRun } from "./QuizshowDryRun";

const socketMock = vi.hoisted(() => ({
  io: vi.fn(),
  constructed: vi.fn(),
}));

vi.mock("socket.io-client", () => ({ io: socketMock.io }));
vi.mock("../realtime/quizshowSocket", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../realtime/quizshowSocket")>();
  class CountedSocketClient extends actual.QuizshowSocketClient {
    constructor(
      ...args: ConstructorParameters<typeof actual.QuizshowSocketClient>
    ) {
      super(...args);
      socketMock.constructed(...args);
    }
  }
  return { ...actual, QuizshowSocketClient: CountedSocketClient };
});
// Live mode: the try-out still plays, since it never asks the demo switch.
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({
    demoMode: false,
    available: true,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));
vi.mock("../../../shared/components/ui/RollingNumber", () => ({
  RollingNumber: (props: { value: string }) => <span>{props.value}</span>,
}));

const FIRST_ROUND_TITLE = "Dry run warm up";
const JOIN_GAP_MS = 700;
const LOBBY_SETTLE_MS = 3_000;
/** Every pretend player has joined and the lobby has settled; the round card shows for four seconds after. */
const UNTIL_FIRST_ROUND_MS =
  JOIN_GAP_MS * QUIZSHOW_SIMULATED_PLAYERS.length + LOBBY_SETTLE_MS + 1_500;
const ROUND_CARD_MS = 4_000;
const PICTURE_KEY = "event-cover/quiz-picture.jpg";
const PICTURE_URL = "https://files.example.test/event-cover/quiz-picture.jpg";
/** In demo a fresh pick's key is the picture field's own `blob:` URL, gone once the question closed. */
const REVOKED_FIELD_KEY = "blob:field-preview";
const DRAFT_COPY_URL = "blob:draft-copy";

function dryRunDraft(): QuizshowDraft {
  const draft = draftFromQuiz(demoQuizFor("dry-run-test-event"));
  return {
    ...draft,
    title: "Tuesday trivia",
    rounds: draft.rounds.map((round, roundIndex) =>
      roundIndex === 0
        ? { ...round, title: { en: FIRST_ROUND_TITLE, pt: FIRST_ROUND_TITLE } }
        : round,
    ),
  };
}

/** The draft with a picture on its first question: the key in the question, the resolved URL beside it. */
function draftWithPicture(
  mediaRef: string = PICTURE_KEY,
  mediaUrl: string | null = PICTURE_URL,
): QuizshowDraft {
  const draft = dryRunDraft();
  return {
    ...draft,
    rounds: draft.rounds.map((round, roundIndex) =>
      roundIndex === 0
        ? {
            ...round,
            questions: round.questions.map((draftQuestion, questionIndex) =>
              questionIndex === 0
                ? {
                    ...draftQuestion,
                    question: {
                      ...draftQuestion.question,
                      mediaRef,
                    },
                    mediaUrl,
                  }
                : draftQuestion,
            ),
          }
        : round,
    ),
  };
}

function renderDryRun(
  onClose: () => void = () => {},
  draft: QuizshowDraft = dryRunDraft(),
  pickedPreviewUrls?: ReadonlyMap<string, string>,
) {
  return render(
    <I18nProvider>
      <QuizshowDryRun
        draft={draft}
        pickedPreviewUrls={pickedPreviewUrls}
        onClose={onClose}
      />
    </I18nProvider>,
  );
}

let fetchSpy: MockInstance<typeof globalThis.fetch>;

beforeEach(() => {
  socketMock.io.mockReset();
  socketMock.constructed.mockReset();
  fetchSpy = vi.spyOn(globalThis, "fetch");
});

afterEach(() => {
  fetchSpy.mockRestore();
  vi.useRealTimers();
});

describe("QuizshowDryRun", () => {
  it("plays the draft with twelve pretend players and no request", async () => {
    expect(QUIZSHOW_SIMULATED_PLAYERS).toHaveLength(12);
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderDryRun();

    expect(
      await screen.findByRole("heading", { name: "Waiting for players" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: FIRST_ROUND_TITLE }),
    ).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(JOIN_GAP_MS + 100);
    });
    expect(screen.getByText("Rita")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(UNTIL_FIRST_ROUND_MS);
    });

    expect(
      await screen.findByRole(
        "heading",
        { name: FIRST_ROUND_TITLE },
        { timeout: 3_000 },
      ),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(socketMock.io).not.toHaveBeenCalled();
    expect(socketMock.constructed).not.toHaveBeenCalled();
  });

  it("shows no join code, QR or join line, since nobody can join a try-out", async () => {
    renderDryRun();

    expect(
      await screen.findByRole("heading", { name: "Waiting for players" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(QUIZSHOW_DEMO_JOIN_CODE)).not.toBeInTheDocument();
    expect(
      document.querySelector("[data-quizshow-join-code]"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "QR code to join the game" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Code")).not.toBeInTheDocument();
    expect(screen.queryByText(/^Join at /)).not.toBeInTheDocument();
  });

  it("shows the draft's picture in the try-out", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderDryRun(() => {}, draftWithPicture());
    await screen.findByRole("heading", { name: "Waiting for players" });

    act(() => {
      vi.advanceTimersByTime(UNTIL_FIRST_ROUND_MS + ROUND_CARD_MS);
    });

    await waitFor(
      () =>
        expect(
          document.querySelector(`img[src="${PICTURE_URL}"]`),
        ).toBeInTheDocument(),
      { timeout: 3_000 },
    );
    expect(
      document.querySelector(`img[src="${PICTURE_KEY}"]`),
    ).not.toBeInTheDocument();
  });

  it("the try-out shows a picture picked before the question was reopened", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    renderDryRun(
      () => {},
      draftWithPicture(REVOKED_FIELD_KEY, null),
      new Map([[REVOKED_FIELD_KEY, DRAFT_COPY_URL]]),
    );
    await screen.findByRole("heading", { name: "Waiting for players" });

    act(() => {
      vi.advanceTimersByTime(UNTIL_FIRST_ROUND_MS + ROUND_CARD_MS);
    });

    await waitFor(
      () =>
        expect(
          document.querySelector(`img[src="${DRAFT_COPY_URL}"]`),
        ).toBeInTheDocument(),
      { timeout: 3_000 },
    );
    expect(
      document.querySelector(`img[src="${REVOKED_FIELD_KEY}"]`),
    ).not.toBeInTheDocument();
  });

  it("closes on Close the try-out", async () => {
    const onClose = vi.fn();
    renderDryRun(onClose);

    fireEvent.click(
      await screen.findByRole("button", { name: "Close the try-out" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
