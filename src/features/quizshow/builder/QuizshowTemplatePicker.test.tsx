import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import type { QuizshowTemplateCard } from "../../../shared/contracts/quizshow";
import { QuizshowTemplatePicker } from "./QuizshowTemplatePicker";

interface TemplateCardsResult {
  data: { items: QuizshowTemplateCard[] } | undefined;
  error: unknown;
  isError: boolean;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
}

const mocks = vi.hoisted(() => ({
  templateCards: null as TemplateCardsResult | null,
}));

vi.mock("../api/useQuizshowTemplates", () => ({
  useQuizshowTemplateCards: () => mocks.templateCards,
}));

const FAMILY_CARD: QuizshowTemplateCard = {
  id: "template-family",
  title: { en: "Pride history", pt: "História do Orgulho" },
  description: { en: "Marches and milestones", pt: "Marchas e marcos" },
  languages: "both",
  roundCount: 3,
  questionCount: 15,
  hasAdultsRounds: false,
};

const ADULTS_CARD: QuizshowTemplateCard = {
  id: "template-adults",
  title: { en: "After dark", pt: "Depois do escuro" },
  description: { en: "Late night questions", pt: "Perguntas da noite" },
  languages: "both",
  roundCount: 2,
  questionCount: 8,
  hasAdultsRounds: true,
};

function listedCards(items: QuizshowTemplateCard[]): TemplateCardsResult {
  return {
    data: { items },
    error: null,
    isError: false,
    isFetching: false,
    refetch: vi.fn(() => Promise.resolve()),
  };
}

function renderPicker(isAdultsAllowed: boolean) {
  const onPick = vi.fn();
  render(
    <TestProviders>
      <QuizshowTemplatePicker
        isOpen
        isAdultsAllowed={isAdultsAllowed}
        onClose={() => undefined}
        onPick={onPick}
      />
    </TestProviders>,
  );
  return { onPick };
}

async function adultsUseButton(): Promise<HTMLElement> {
  const dialog = await screen.findByRole("dialog");
  const adultsTitle = within(dialog).getByText("After dark");
  const adultsRow = adultsTitle.closest("div")?.parentElement;
  if (!adultsRow) throw new Error("no adults template row");
  return within(adultsRow).getByRole("button", { name: "Use this template" });
}

describe("QuizshowTemplatePicker", () => {
  beforeEach(() => {
    mocks.templateCards = listedCards([FAMILY_CARD, ADULTS_CARD]);
  });

  it("tags a template with adults rounds and blocks it outside an 18+ quiz", async () => {
    const { onPick } = renderPicker(false);

    const blockedButton = await adultsUseButton();
    const adultsTag = screen.getByText("Has adults rounds");

    expect(blockedButton.getAttribute("aria-disabled")).toBe("true");
    expect(blockedButton.hasAttribute("disabled")).toBe(false);
    expect(adultsTag.id).not.toBe("");
    expect(blockedButton.getAttribute("aria-describedby")).toBe(adultsTag.id);
    expect(screen.getAllByText("Has adults rounds")).toHaveLength(1);

    await userEvent.click(blockedButton);
    expect(onPick).not.toHaveBeenCalled();

    const useButtons = screen.getAllByRole("button", {
      name: "Use this template",
    });
    const familyButton = useButtons[0];
    if (!familyButton) throw new Error("no family template row");
    expect(familyButton.getAttribute("aria-disabled")).not.toBe("true");
    await userEvent.click(familyButton);
    expect(onPick).toHaveBeenCalledWith(FAMILY_CARD);
  });

  it("lets an 18+ quiz pick it", async () => {
    const { onPick } = renderPicker(true);

    const adultsButton = await adultsUseButton();

    expect(screen.getByText("Has adults rounds")).toBeTruthy();
    expect(adultsButton.getAttribute("aria-disabled")).not.toBe("true");
    expect(adultsButton.getAttribute("aria-describedby")).toBeNull();
    await userEvent.click(adultsButton);
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith(ADULTS_CARD);
  });

  it("says when our team has published no templates yet", async () => {
    mocks.templateCards = listedCards([]);
    renderPicker(false);

    const dialog = await screen.findByRole("dialog");

    expect(
      await within(dialog).findByText(
        "Our team hasn't published any templates yet",
      ),
    ).toBeTruthy();
    expect(
      within(dialog).queryByRole("button", { name: "Use this template" }),
    ).toBeNull();
  });

  it("names the failure when the templates do not load and retries", async () => {
    const refetch = vi.fn(() => Promise.resolve());
    mocks.templateCards = {
      data: undefined,
      error: new ApiError(404, "Not Found"),
      isError: true,
      isFetching: false,
      refetch,
    };
    renderPicker(false);

    const dialog = await screen.findByRole("dialog");

    expect(
      await within(dialog).findByText("We couldn't load the templates"),
    ).toBeTruthy();
    expect(
      within(dialog).getByText(
        "Quiz templates need Pulse Live access, and this account doesn't have it yet",
      ),
    ).toBeTruthy();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Try again" }),
    );
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("names a failed fetch as offline and a server failure as ours", async () => {
    mocks.templateCards = {
      data: undefined,
      error: new TypeError("Failed to fetch"),
      isError: true,
      isFetching: false,
      refetch: vi.fn(() => Promise.resolve()),
    };
    const { unmount } = render(
      <TestProviders>
        <QuizshowTemplatePicker
          isOpen
          isAdultsAllowed={false}
          onClose={() => undefined}
          onPick={() => undefined}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText(
        "We couldn't reach QueerPulse. Check your connection, then try again",
      ),
    ).toBeTruthy();
    unmount();

    mocks.templateCards = {
      data: undefined,
      error: new ApiError(500, "Internal Server Error"),
      isError: true,
      isFetching: false,
      refetch: vi.fn(() => Promise.resolve()),
    };
    renderPicker(false);
    expect(
      await screen.findByText(
        "Our server hit a problem. Try again in a moment",
      ),
    ).toBeTruthy();
  });
});
