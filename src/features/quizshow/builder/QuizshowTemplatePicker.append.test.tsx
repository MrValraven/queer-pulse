import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoGetGame,
  demoImportGame,
  resetQuizshowDemoGames,
} from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import {
  demoGetTemplate,
  resetQuizshowDemoTemplates,
} from "../api/quizshowDemoTemplates";
import { quizshowKeys } from "../api/quizshowKeys";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../demo/quizshowTemplates.data";
import { gameScope } from "../quizshowScope";
import { QuizshowImportButtons } from "./QuizshowImportButtons";

vi.mock("../api/quizshowDemoGames", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoGames")>();
  return { ...actual, demoImportGame: vi.fn(actual.demoImportGame) };
});

const TARGET_GAME_ID = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
const LISBON_ID = QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons;

function renderTemplateAppend(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  // The studio holds the target quiz in the cache; the append reads its stamp there.
  queryClient.setQueryData(
    quizshowKeys.game(TARGET_GAME_ID, true),
    demoGetGame(TARGET_GAME_ID),
  );
  render(
    <TestProviders queryClient={queryClient}>
      <QuizshowImportButtons
        scope={gameScope(TARGET_GAME_ID)}
        hasQuiz
        eventStartAt={null}
        isAdultsEvent
        variant="toolbar"
        initialOpenPicker="templateAppend"
      />
    </TestProviders>,
  );
  return queryClient;
}

describe("QuizshowTemplatePicker adding rounds (item 23)", () => {
  beforeEach(async () => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
    resetQuizshowDemoTemplates();
    vi.mocked(demoImportGame).mockClear();
    await awaitCatalog("quizshow");
  });

  it("opens the preview on the round checklist and closes once the rounds are added", async () => {
    const targetQuiz = demoGetGame(TARGET_GAME_ID).quiz;
    renderTemplateAppend();

    const picker = await screen.findByRole("dialog", {
      name: "Add rounds from a template",
    });
    // Append mode: each card adds rounds, with no replace and no separate Preview.
    expect(
      within(picker).queryByRole("button", { name: /^Use this template/ }),
    ).toBeNull();
    const lisbonTitle = demoGetTemplate(LISBON_ID).card.title.en;
    await userEvent.click(
      await within(picker).findByRole("button", {
        name: `Add rounds from this template, ${lisbonTitle}`,
      }),
    );

    const preview = await screen.findByRole("dialog", {
      name: "Template preview",
    });
    // The checklist is open on arrival and "Use this template" stays out.
    const checkboxes = await within(preview).findAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(1);
    expect(
      within(preview).queryByRole("button", { name: "Use this template" }),
    ).toBeNull();
    // Add-only: no show/hide toggle competing with the submit.
    expect(
      within(preview).queryByRole("button", {
        name: "Add rounds from this template",
      }),
    ).toBeNull();
    const [firstCheckbox] = checkboxes;
    if (!firstCheckbox) throw new Error("no round checkbox");
    await userEvent.click(firstCheckbox);
    await userEvent.click(
      within(preview).getByRole("button", { name: "Add these rounds" }),
    );

    await waitFor(() =>
      expect(vi.mocked(demoImportGame)).toHaveBeenCalledWith(
        TARGET_GAME_ID,
        expect.objectContaining({
          from: "template",
          templateId: LISBON_ID,
          mode: "append",
          expectedUpdatedAt: targetQuiz?.updatedAt ?? null,
        }),
      ),
    );
    // Both the preview and the picker close once the append lands.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(demoGetGame(TARGET_GAME_ID).quiz?.rounds.length).toBeGreaterThan(
      targetQuiz?.rounds.length ?? 0,
    );
  });
});
