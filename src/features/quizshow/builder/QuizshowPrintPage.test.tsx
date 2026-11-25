import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { demoGetGame, resetQuizshowDemoGames } from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import {
  QUIZSHOW_GAME_PRINT_ROUTE,
  QUIZSHOW_PRINT_ROUTE,
  quizshowPrintPath,
} from "../quizshowPaths";
import { eventScope, gameScope } from "../quizshowScope";
import {
  QuizshowEventPrintPage,
  QuizshowGamePrintPage,
} from "./QuizshowPrintPage";
import { buildAnswerSheets } from "./quizshowPrintModel";

const GAME_ID = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;

/** Live mode with a signed-in member who does not organise the event. */
const liveMock = vi.hoisted(() => ({ isLive: false }));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...actual,
    useDemoMode: () => {
      const value = actual.useDemoMode();
      return liveMock.isLive ? { ...value, demoMode: false } : value;
    },
  };
});
vi.mock("../../gatherings/api/useEvent", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../gatherings/api/useEvent")>();
  return {
    ...actual,
    useEvent: (param: string | undefined) => {
      const result = actual.useEvent(param);
      if (!liveMock.isLive) return result;
      return {
        data: {
          gathering: {
            slug: param ?? "quiz-night",
            title: "Quiz night",
            viewerIsOrganizer: false,
          },
        },
        error: null,
        isError: false,
        isLoading: false,
      };
    },
  };
});

function renderPrint(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <Routes>
        <Route
          path={QUIZSHOW_PRINT_ROUTE}
          element={<QuizshowEventPrintPage />}
        />
        <Route
          path={QUIZSHOW_GAME_PRINT_ROUTE}
          element={<QuizshowGamePrintPage />}
        />
      </Routes>
    </TestProviders>,
  );
}

async function findSheet(): Promise<HTMLElement> {
  return waitFor(() => {
    const sheet = document.querySelector<HTMLElement>("[data-print-sheet]");
    if (sheet === null) throw new Error("No print sheet yet");
    return sheet;
  });
}

/** The game's path with the sheet param left off. */
function gamePathWithoutSheet(): string {
  return quizshowPrintPath(gameScope(GAME_ID), "host").split("?")[0] ?? "";
}

beforeEach(() => {
  window.localStorage.clear();
  resetQuizshowDemoGames();
  liveMock.isLive = false;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QuizshowPrintPage in demo", () => {
  it("shows the host sheet when the query asks for it", async () => {
    renderPrint(quizshowPrintPath(gameScope(GAME_ID), "host"));
    const sheet = await findSheet();
    expect(sheet.dataset.printSheet).toBe("host");
  });

  it("shows the answer sheets with one page per round when the query asks for them", async () => {
    renderPrint(quizshowPrintPath(gameScope(GAME_ID), "answers"));
    const sheet = await findSheet();
    expect(sheet.dataset.printSheet).toBe("answers");
    const quiz = demoGetGame(GAME_ID).quiz;
    if (quiz === null) throw new Error("The demo game has no quiz");
    expect(sheet.querySelectorAll("section")).toHaveLength(
      buildAnswerSheets(quiz).length,
    );
  });

  it("defaults to the host sheet without a sheet param", async () => {
    renderPrint(gamePathWithoutSheet());
    const sheet = await findSheet();
    expect(sheet.dataset.printSheet).toBe("host");
  });

  it("defaults to the host sheet for an unknown sheet", async () => {
    renderPrint(`${gamePathWithoutSheet()}?sheet=poster`);
    const sheet = await findSheet();
    expect(sheet.dataset.printSheet).toBe("host");
  });

  it("prints the event's sheets too", async () => {
    renderPrint(
      quizshowPrintPath(eventScope(QUIZSHOW_DEMO_LIVE_SLUG), "answers"),
    );
    const sheet = await findSheet();
    expect(sheet.dataset.printSheet).toBe("answers");
  });

  it("opens the print dialog from the Print button", async () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    renderPrint(quizshowPrintPath(gameScope(GAME_ID), "host"));
    await awaitCatalog("quizshow");
    await findSheet();
    await userEvent.click(
      screen.getByRole("button", { name: "Print these pages" }),
    );
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});

describe("QuizshowPrintPage live", () => {
  it("tells a member who does not organise the event that only hosts can print, with no sheet", async () => {
    liveMock.isLive = true;
    renderPrint(quizshowPrintPath(eventScope("quiz-night"), "host"));
    await awaitCatalog("quizshow");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Only the event's hosts can do that",
      }),
    ).toBeInTheDocument();
    expect(document.querySelector("[data-print-sheet]")).toBeNull();
    expect(
      screen.getByRole("link", { name: "Back to the event" }),
    ).toBeInTheDocument();
  });
});
