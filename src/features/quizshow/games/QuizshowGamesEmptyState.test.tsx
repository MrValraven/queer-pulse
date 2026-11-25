import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import {
  QuizshowGamesEmptyState,
  type QuizshowNewGameStart,
} from "./QuizshowGamesEmptyState";

// Our team has published no template yet, so the picker shows its empty state.
vi.mock("../api/useQuizshowTemplates", () => ({
  useQuizshowTemplateCards: () => ({
    data: { items: [] },
    error: null,
    isError: false,
    isFetching: false,
    refetch: () => Promise.resolve(),
  }),
}));

const EMPTY_TITLE = "No templates yet";

/** The empty My games with its template picker opened. */
async function openEmptyTemplatePicker() {
  const onStartNewGame = vi.fn<(start: QuizshowNewGameStart) => void>();
  render(
    <TestProviders>
      <QuizshowGamesEmptyState onStartNewGame={onStartNewGame} />
    </TestProviders>,
  );
  await awaitCatalog("quizshow");
  await userEvent.click(
    await screen.findByRole("button", { name: "Start from a template" }),
  );
  const templateDialog = await screen.findByRole("dialog");
  await within(templateDialog).findByRole("heading", { name: EMPTY_TITLE });
  return { onStartNewGame, templateDialog };
}

async function expectTemplatePickerClosed() {
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
}

describe("QuizshowGamesEmptyState with no published template", () => {
  it("closes the picker and starts a blank game", async () => {
    const { onStartNewGame, templateDialog } = await openEmptyTemplatePicker();

    await userEvent.click(
      within(templateDialog).getByRole("button", {
        name: "Start from a blank quiz",
      }),
    );

    expect(onStartNewGame).toHaveBeenCalledTimes(1);
    expect(onStartNewGame).toHaveBeenCalledWith("blank");
    await expectTemplatePickerClosed();
  });

  it("closes the picker and starts a copied game", async () => {
    const { onStartNewGame, templateDialog } = await openEmptyTemplatePicker();

    await userEvent.click(
      within(templateDialog).getByRole("button", {
        name: "Copy from another quiz",
      }),
    );

    expect(onStartNewGame).toHaveBeenCalledTimes(1);
    expect(onStartNewGame).toHaveBeenCalledWith("copy");
    await expectTemplatePickerClosed();
  });
});
