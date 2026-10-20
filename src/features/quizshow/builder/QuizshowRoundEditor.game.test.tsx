import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { QuizshowScopeContext, gameScope } from "../quizshowScope";
import { newRound } from "./quizshowDraft";
import { QuizshowProblemList } from "./QuizshowProblemList";
import { QuizshowRoundEditor } from "./QuizshowRoundEditor";

vi.mock("./QuizshowBilingualInput", () => ({
  QuizshowBilingualInput: ({ label }: { label: string }) => (
    <input aria-label={label} />
  ),
}));

const EVENT_HINT =
  "Turn on 18+ for this event in Edit details to use this label";
const GAME_HINT = "Turn on 18+ for this game to use this label";

function renderEditor(isGameScope: boolean) {
  const editor = (
    <QuizshowRoundEditor
      round={newRound("quiz")}
      roundIndex={0}
      isAdultsEvent={false}
      onChange={vi.fn()}
      onChangeKind={vi.fn()}
    />
  );
  render(
    isGameScope ? (
      <QuizshowScopeContext.Provider value={gameScope("game-1")}>
        {editor}
      </QuizshowScopeContext.Provider>
    ) : (
      editor
    ),
    { wrapper: TestProviders },
  );
}

describe("QuizshowRoundEditor game copy", () => {
  it("shows the event hint for the adults label under no scope provider", async () => {
    renderEditor(false);
    expect(await screen.findByText(EVENT_HINT)).toBeInTheDocument();
  });

  it("shows the game hint for the adults label under a game scope", async () => {
    renderEditor(true);
    expect(await screen.findByText(GAME_HINT)).toBeInTheDocument();
    expect(screen.queryByText(EVENT_HINT)).not.toBeInTheDocument();
  });

  it("names the game in the adults problem under a game scope", async () => {
    render(
      <QuizshowScopeContext.Provider value={gameScope("game-1")}>
        <QuizshowProblemList
          problems={[
            {
              code: "adults_round_needs_adults_event",
              roundIndex: 1,
              questionIndex: null,
              language: null,
            },
          ]}
        />
      </QuizshowScopeContext.Provider>,
      { wrapper: TestProviders },
    );
    expect(
      await screen.findByText(
        "Round 2 is labelled adults only, and this game is not marked 18+",
      ),
    ).toBeInTheDocument();
  });
});
