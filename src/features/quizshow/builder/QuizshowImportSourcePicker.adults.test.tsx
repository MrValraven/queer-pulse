import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowImportSource,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { eventScope } from "../quizshowScope";
import { QuizshowImportSourcePicker } from "./QuizshowImportSourcePicker";
import type { QuizshowSelectableRound } from "./quizshowRoundSelection";

const ADULTS_REASON = "Turn on 18+ to use these rounds";

const mocks = vi.hoisted(() => ({
  items: [] as QuizshowImportSource[],
}));

vi.mock("../api/useQuizshowQuiz", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/useQuizshowQuiz")>()),
  useQuizshowImportSources: () => ({
    data: { items: mocks.items },
    isError: false,
    isFetching: false,
    refetch: vi.fn(() => Promise.resolve()),
  }),
}));

function roundRow(
  roundIndex: number,
  title: string,
  contentLabel: QuizshowSelectableRound["contentLabel"],
): QuizshowSelectableRound {
  const text: QuizshowText = { en: title, pt: title };
  return {
    roundIndex,
    kind: "quiz",
    title: text,
    questionCount: 4,
    sliceCount: null,
    contentLabel,
  };
}

function sourceOf(
  eventSlug: string,
  rounds: QuizshowSelectableRound[],
): QuizshowImportSource {
  return {
    kind: "event",
    eventSlug,
    eventTitle: `Night ${eventSlug}`,
    startAt: null,
    gameId: null,
    quizTitle: "Quiz",
    roundCount: rounds.length,
    questionCount: rounds.length * 4,
    hasAdultsRounds: true,
    isSameSeries: false,
    rounds,
  };
}

function renderAppendPicker() {
  const onAppend = vi.fn();
  render(
    <TestProviders>
      <QuizshowImportSourcePicker
        scope={eventScope("target-night")}
        isOpen
        isAdultsEvent={false}
        mode="append"
        onClose={() => undefined}
        onPick={() => undefined}
        onAppend={onAppend}
      />
    </TestProviders>,
  );
  return { onAppend };
}

function rowOf(title: string): HTMLElement {
  const row = screen.getByText(title).closest("[role='group']");
  if (!(row instanceof HTMLElement)) throw new Error(`no row for ${title}`);
  return row;
}

describe("QuizshowImportSourcePicker adding rounds with 18+ off", () => {
  beforeEach(async () => {
    mocks.items = [
      sourceOf("labelled", [
        roundRow(0, "Opener", "none"),
        roundRow(1, "Late night", "adults"),
      ]),
      sourceOf("all-adults", [
        roundRow(0, "Opener", "adults"),
        roundRow(1, "Closer", "adults"),
      ]),
    ];
    await awaitCatalog("quizshow");
  });

  it("opens a source and holds only its adults row", async () => {
    const { onAppend } = renderAppendPicker();
    const row = rowOf("Night labelled");

    const addRounds = within(row).getByRole("button", {
      name: "Add rounds from this quiz",
    });
    expect(addRounds).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(addRounds);

    const checkboxes = await within(row).findAllByRole("checkbox");
    expect(checkboxes[0]).not.toHaveAttribute("aria-disabled");
    expect(checkboxes[1]).toHaveAttribute("aria-disabled", "true");
    expect(within(row).getAllByText(ADULTS_REASON)).toHaveLength(1);
    await userEvent.click(checkboxes[0] as HTMLElement);
    await userEvent.click(
      within(row).getByRole("button", { name: "Add these rounds" }),
    );
    expect(onAppend).toHaveBeenCalledWith(
      { from: "event", eventSlug: "labelled" },
      [0],
    );
  });

  it("opens a source whose rows are all adults and holds every row with the reason", async () => {
    const { onAppend } = renderAppendPicker();
    const row = rowOf("Night all-adults");

    const addRounds = within(row).getByRole("button", {
      name: "Add rounds from this quiz",
    });
    expect(addRounds).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(addRounds);

    const checkboxes = await within(row).findAllByRole("checkbox");
    for (const checkbox of checkboxes) {
      expect(checkbox).toHaveAttribute("aria-disabled", "true");
    }
    expect(within(row).getAllByText(ADULTS_REASON)).toHaveLength(2);
    expect(onAppend).not.toHaveBeenCalled();
  });
});
