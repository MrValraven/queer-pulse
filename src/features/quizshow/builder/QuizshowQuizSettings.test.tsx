import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { QuizshowQuizSettings } from "./QuizshowQuizSettings";
import { useQuizshowDraft } from "./useQuizshowDraft";

const UNDO_LABEL = "undo";

/** The settings over a real draft, with its undo and the two language fields in view. */
function SettingsHarness() {
  const controller = useQuizshowDraft(null);
  return (
    <>
      <QuizshowQuizSettings controller={controller} />
      <button
        type="button"
        data-testid="undo"
        aria-label={UNDO_LABEL}
        onClick={() => controller.undo?.()}
      />
      <output data-testid="languages">
        {`${controller.draft.languages}/${controller.draft.screenLanguage}`}
      </output>
    </>
  );
}

describe("QuizshowQuizSettings languages", () => {
  it("records one undo step for a language change that also moves the screen language", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <SettingsHarness />
      </TestProviders>,
    );
    await awaitCatalog("quizshow");
    expect(screen.getByTestId("languages")).toHaveTextContent("en/en");

    await user.click(
      await screen.findByRole("radio", { name: "English and Portuguese" }),
    );
    expect(screen.getByTestId("languages")).toHaveTextContent("both/en");

    // Leaving "both" moves the screen to the language left: two fields, one edit.
    await user.click(screen.getByRole("radio", { name: "Portuguese" }));
    expect(screen.getByTestId("languages")).toHaveTextContent("pt/pt");

    await user.click(screen.getByTestId("undo"));
    expect(screen.getByTestId("languages")).toHaveTextContent("both/en");
  });
});
