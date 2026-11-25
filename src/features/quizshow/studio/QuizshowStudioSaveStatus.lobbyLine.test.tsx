import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { gameScope } from "../quizshowScope";
import {
  QuizshowStudioContext,
  type QuizshowStudioContextValue,
} from "./QuizshowStudioContext";
import { QuizshowStudioLobbyStrip } from "./QuizshowStudioSaveStatus";

const refreshMutate = vi.fn();

vi.mock("../api/useQuizshowMutations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/useQuizshowMutations")>()),
  useRefreshQuizshowLobby: () => ({ isPending: false, mutate: refreshMutate }),
}));

/** Just what the lobby strip reads: a lobby that took its questions before the latest save. */
function studioWith(saveFirst: () => Promise<string | null>) {
  return {
    scope: gameScope("game-1"),
    data: {
      quiz: { updatedAt: "2026-11-20T10:00:00.000Z" },
      liveSession: {
        sessionId: "session-1",
        joinCode: "QG4MW8",
        status: "lobby",
        playMode: "individual",
        playerCount: 0,
        startedAt: "2026-11-20T09:00:00.000Z",
        isPractice: false,
        isBehindQuiz: true,
      },
    },
    save: { saveFirst },
  } as unknown as QuizshowStudioContextValue;
}

function renderStrip(saveFirst: () => Promise<string | null>) {
  return render(
    <TestProviders>
      <QuizshowStudioContext.Provider value={studioWith(saveFirst)}>
        <QuizshowStudioLobbyStrip />
      </QuizshowStudioContext.Provider>
    </TestProviders>,
  );
}

describe("Use my latest edits in this lobby", () => {
  beforeEach(() => {
    refreshMutate.mockReset();
  });

  it("stores the edits still in the draft before it asks the lobby to refresh", async () => {
    const order: string[] = [];
    const saveFirst = vi.fn(() => {
      order.push("save");
      return Promise.resolve(null);
    });
    refreshMutate.mockImplementation(() => order.push("refresh"));
    renderStrip(saveFirst);
    await awaitCatalog("quizshow");

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Use my latest edits in this lobby",
      }),
    );

    await waitFor(() => expect(refreshMutate).toHaveBeenCalledTimes(1));
    expect(order).toEqual(["save", "refresh"]);
  });

  it("does not refresh when the save is held, and names the reason", async () => {
    renderStrip(() => Promise.resolve("Round 1 needs at least one question"));
    await awaitCatalog("quizshow");

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Use my latest edits in this lobby",
      }),
    );

    expect(
      (await screen.findAllByText("Round 1 needs at least one question"))
        .length,
    ).toBeGreaterThan(0);
    expect(refreshMutate).not.toHaveBeenCalled();
  });
});
