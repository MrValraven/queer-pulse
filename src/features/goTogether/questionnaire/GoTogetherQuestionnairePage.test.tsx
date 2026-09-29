import { fireEvent, render, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import type { FriendMatchAnswers } from "../goTogetherQuestionnaire.data";
import { GoTogetherQuestionnairePage } from "./GoTogetherQuestionnairePage";
import { QUESTIONNAIRE_STEPS } from "./questionnaireSteps.data";

/**
 * The questionnaire page with the profile hooks mocked: the query hands back
 * `profileState.answers`, and the save mutation is a spy whose options the
 * test resolves by hand, so no request is ever made.
 */

type SaveMutate = (
  answers: FriendMatchAnswers,
  options?: { onSuccess?: () => void },
) => void;

const { saveMutate, profileState } = vi.hoisted(() => ({
  saveMutate: vi.fn<SaveMutate>(),
  profileState: { answers: null as FriendMatchAnswers | null },
}));

vi.mock("../api/useFriendMatchProfile", () => ({
  useFriendMatchProfile: () => ({
    isPending: false,
    isError: false,
    data: {
      answers: profileState.answers,
      questionnaireVersion: profileState.answers ? 1 : null,
      currentVersion: 1,
      needsRefresh: false,
      refreshSuggested: false,
      consentedAt: null,
      updatedAt: null,
    },
    refetch: vi.fn(),
  }),
  useSaveFriendMatchProfile: () => ({
    mutate: saveMutate,
    isPending: false,
    error: null,
    reset: () => {},
  }),
}));

const COMPLETE_ANSWERS: FriendMatchAnswers = {
  values: {
    community: 5,
    creativity: 4,
    family: 3,
    fun: 4,
    career: 2,
    spirituality: 1,
  },
  humour: { h1: "a", h2: "b", h3: "a", h4: "b" },
  interests: ["boardGames", "queerHistory"],
  music: ["pop", "fado"],
  energy: { talker: 2, nightShape: 3, planner: 4 },
  intent: "both",
  meetFrequency: "monthly",
  languages: ["pt", "en"],
  drinking: "eitherWay",
  ageBracket: "25-34",
  agePreference: "any",
  area: "Arroios",
};

/** Copy the action bar and the area step show, as the EN catalog words it. */
const CONSENT_HINT = "Tick the box above to save your answers.";
const INCOMPLETE_HINT = "Answer every question on this step to continue.";
const CLEAR_AND_SKIP = "Clear and skip";

const AREA_STEP_INDEX = QUESTIONNAIRE_STEPS.findIndex(
  (step) => step.id === "area",
);

/** Stand-in pages the save navigates to. */
const GATHERING_PAGE_TEXT = "Pride picnic page";
const GATHERINGS_LIST_TEXT = "Gatherings list";

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  saveMutate.mockReset();
  profileState.answers = null;
});

function renderPage(returnPath?: string) {
  const search =
    returnPath == null ? "" : `?return=${encodeURIComponent(returnPath)}`;
  render(
    <TestProviders initialEntries={[`/go-together/questionnaire${search}`]}>
      <Routes>
        <Route
          path="/go-together/questionnaire"
          element={<GoTogetherQuestionnairePage />}
        />
        <Route
          path="/gatherings/pride-picnic"
          element={<p>{GATHERING_PAGE_TEXT}</p>}
        />
        <Route
          path={routes.gatherings}
          element={<p>{GATHERINGS_LIST_TEXT}</p>}
        />
      </Routes>
    </TestProviders>,
  );
}

/** The current step's section, named by its focusable h1. */
function stepRegion() {
  const heading = screen.getByRole("heading", { level: 1 });
  const region = heading.closest("section");
  if (region == null)
    throw new Error("The step heading sits outside a section");
  return region;
}

function checkedRadioCount() {
  return within(stepRegion()).getAllByRole("radio", { checked: true }).length;
}

function clickNext() {
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
}

function clickBack() {
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
}

async function walkToConsentStep() {
  for (
    let stepIndex = 0;
    stepIndex < QUESTIONNAIRE_STEPS.length - 1;
    stepIndex += 1
  ) {
    clickNext();
  }
  return screen.findByRole("checkbox");
}

describe("GoTogetherQuestionnairePage", () => {
  it("renders each Likert scale as a radio group with arrow-key navigation", async () => {
    renderPage();

    await screen.findAllByRole("radiogroup");
    const scales = within(stepRegion()).getAllByRole("radiogroup");
    expect(scales).toHaveLength(6);
    const firstScale = scales[0]!;
    const radios = within(firstScale).getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(radios[0]).toHaveAttribute("tabindex", "0");
    expect(radios[1]).toHaveAttribute("tabindex", "-1");

    radios[0]!.focus();
    fireEvent.keyDown(radios[0]!, { key: "ArrowRight" });

    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveFocus();

    fireEvent.keyDown(radios[1]!, { key: "End" });
    expect(radios[4]).toHaveAttribute("aria-checked", "true");
    expect(radios[4]).toHaveFocus();
  });

  it("keeps Save unavailable until the consent box is ticked, and says why on a press", async () => {
    profileState.answers = COMPLETE_ANSWERS;
    renderPage();

    const consentBox = await walkToConsentStep();
    const saveButton = screen.getByRole("button", { name: "Save my answers" });
    expect(consentBox).not.toBeChecked();
    expect(saveButton).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByText(CONSENT_HINT)).not.toBeInTheDocument();

    fireEvent.click(saveButton);

    expect(saveMutate).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(CONSENT_HINT);
    expect(saveButton).toHaveAccessibleDescription(CONSENT_HINT);

    fireEvent.click(consentBox);

    expect(consentBox).toBeChecked();
    expect(saveButton).not.toHaveAttribute("aria-disabled");
    expect(screen.queryByText(CONSENT_HINT)).not.toBeInTheDocument();
  });

  it("shows the incomplete hint only after a press on the unavailable Next", async () => {
    renderPage();

    await screen.findAllByRole("radiogroup");
    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByText(INCOMPLETE_HINT)).not.toBeInTheDocument();

    fireEvent.click(nextButton);

    expect(screen.getByText(/Step 1 of 9/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(INCOMPLETE_HINT);
  });

  it("keeps the pick counter in the action bar, outside the scrolling step", async () => {
    profileState.answers = COMPLETE_ANSWERS;
    renderPage();

    await screen.findAllByRole("radiogroup");
    clickNext();
    clickNext();

    const counter = screen.getByText("You've picked 2 of 8.");
    expect(counter).toHaveAttribute("role", "status");
    expect(stepRegion()).not.toContainElement(counter);
  });

  it("offers Clear and skip on the area step only once an area is chosen", async () => {
    profileState.answers = { ...COMPLETE_ANSWERS, area: null };
    renderPage();

    await screen.findAllByRole("radiogroup");
    for (let stepIndex = 0; stepIndex < AREA_STEP_INDEX; stepIndex += 1) {
      clickNext();
    }

    expect(
      screen.queryByRole("button", { name: CLEAR_AND_SKIP }),
    ).not.toBeInTheDocument();
  });

  it("clears a chosen area and moves on to consent", async () => {
    profileState.answers = COMPLETE_ANSWERS;
    renderPage();

    await screen.findAllByRole("radiogroup");
    for (let stepIndex = 0; stepIndex < AREA_STEP_INDEX; stepIndex += 1) {
      clickNext();
    }
    fireEvent.click(screen.getByRole("button", { name: CLEAR_AND_SKIP }));

    expect(await screen.findByRole("checkbox")).toBeInTheDocument();
    clickBack();
    expect(screen.queryByText("Arroios")).not.toBeInTheDocument();
  });

  it("saves the answers, then returns to a safe return path", async () => {
    profileState.answers = COMPLETE_ANSWERS;
    saveMutate.mockImplementation((_answers, options) =>
      options?.onSuccess?.(),
    );
    renderPage("/gatherings/pride-picnic");

    fireEvent.click(await walkToConsentStep());
    fireEvent.click(screen.getByRole("button", { name: "Save my answers" }));

    expect(saveMutate).toHaveBeenCalledTimes(1);
    expect(saveMutate.mock.calls[0]?.[0]).toEqual(COMPLETE_ANSWERS);
    expect(await screen.findByText(GATHERING_PAGE_TEXT)).toBeInTheDocument();
  });

  it.each([
    "/\t/evil.example",
    "//evil.example",
    "/\\evil.example",
    "https://evil.example",
  ])(
    "sends the unsafe return value %j to the gatherings list",
    async (unsafeReturn) => {
      profileState.answers = COMPLETE_ANSWERS;
      saveMutate.mockImplementation((_answers, options) =>
        options?.onSuccess?.(),
      );
      renderPage(unsafeReturn);

      fireEvent.click(await walkToConsentStep());
      fireEvent.click(screen.getByRole("button", { name: "Save my answers" }));

      expect(saveMutate).toHaveBeenCalledTimes(1);
      expect(await screen.findByText(GATHERINGS_LIST_TEXT)).toBeInTheDocument();
    },
  );

  it("points the first step's Back link at the gathering list for an unsafe return", async () => {
    renderPage("/\t/evil.example");

    const backLink = await screen.findByRole("link", { name: "Back" });

    expect(backLink).toHaveAttribute("href", routes.gatherings);
  });

  it("prefills every step from the saved answers", async () => {
    profileState.answers = COMPLETE_ANSWERS;
    renderPage();

    // Values: six rows, one point checked in each.
    await screen.findAllByRole("radiogroup");
    expect(checkedRadioCount()).toBe(6);

    // Humour: one line checked in each of the four pairs.
    clickNext();
    expect(checkedRadioCount()).toBe(4);

    // Interests.
    clickNext();
    expect(screen.getByRole("button", { name: "Board games" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Queer history" }),
    ).toHaveAttribute("aria-pressed", "true");

    // Music.
    clickNext();
    expect(screen.getByRole("button", { name: "Pop" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Fado" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // Energy: three rows.
    clickNext();
    expect(checkedRadioCount()).toBe(3);

    // Intent and meeting rhythm.
    clickNext();
    expect(screen.getByRole("radio", { name: "A bit of both" })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: "About once a month" }),
    ).toBeChecked();

    // Dealbreakers.
    clickNext();
    expect(screen.getByRole("button", { name: "Portuguese" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("radio", { name: "Either way is fine" }),
    ).toBeChecked();
    expect(screen.getByRole("radio", { name: "25 to 34" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Any age" })).toBeChecked();

    // Area.
    clickNext();
    expect(screen.getByText("Arroios")).toBeInTheDocument();

    // Consent is asked again on every save.
    clickNext();
    expect(await screen.findByRole("checkbox")).not.toBeChecked();
  });
});
