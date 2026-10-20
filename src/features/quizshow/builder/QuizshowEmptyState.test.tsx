import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowImportSource,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { quizshowKeys } from "../api/quizshowKeys";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { QUIZSHOW_STARTER_PACKS } from "../demo/quizshowStarterPacks.data";
import { QuizshowEmptyState } from "./QuizshowEmptyState";
import { QuizshowImportButtons } from "./QuizshowImportButtons";

const SLUG = QUIZSHOW_DEMO_LIVE_SLUG;
const EVENT_START_AT = new Date("2026-10-20T18:00:00.000Z");

const ADULTS_SOURCE: QuizshowImportSource = {
  eventSlug: "late-night-quiz",
  eventTitle: "Late night quiz",
  startAt: "2026-09-01T21:00:00.000Z",
  quizTitle: "After dark",
  roundCount: 3,
  questionCount: 12,
  hasAdultsRounds: true,
  isSameSeries: false,
};

function createClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
}

function renderEmptyState(queryClient: QueryClient, isAdultsEvent = false) {
  return render(
    <TestProviders queryClient={queryClient}>
      <QuizshowEmptyState
        slug={SLUG}
        eventStartAt={EVENT_START_AT}
        isAdultsEvent={isAdultsEvent}
        onStartBlank={() => undefined}
      />
    </TestProviders>,
  );
}

function cachedQuiz(queryClient: QueryClient) {
  return queryClient.getQueryData<QuizshowQuizResponse>(
    quizshowKeys.quiz(SLUG, true),
  );
}

describe("QuizshowEmptyState", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("offers a pack, a past event and a blank start", async () => {
    renderEmptyState(createClient());

    expect(
      await screen.findByRole("button", { name: "Start from a pack" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Copy from a past event" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start blank" })).toBeTruthy();
  });

  it("lists the four packs with their rounds and questions and imports one", async () => {
    const queryClient = createClient();
    renderEmptyState(queryClient);

    await userEvent.click(
      await screen.findByRole("button", { name: "Start from a pack" }),
    );
    const useButtons = await screen.findAllByRole("button", {
      name: "Use this pack",
    });
    expect(useButtons).toHaveLength(4);
    expect((await screen.findAllByText(/3 rounds/)).length).toBe(4);
    expect((await screen.findAllByText(/15 questions/)).length).toBe(4);

    const eurovisionIndex = QUIZSHOW_STARTER_PACKS.findIndex(
      (pack) => pack.key === "eurovision",
    );
    const eurovisionButton = useButtons[eurovisionIndex];
    if (!eurovisionButton) throw new Error("no Eurovision row");
    await userEvent.click(eurovisionButton);

    await waitFor(() =>
      expect(cachedQuiz(queryClient)?.quiz?.starterPackKey).toBe("eurovision"),
    );
    expect(await screen.findByText("Quiz copied")).toBeTruthy();
  });

  it("leads with the last event in this series", async () => {
    renderEmptyState(createClient());

    expect(
      await screen.findByRole("button", {
        name: "Copy from the last event in this series",
      }),
    ).toBeTruthy();
    expect(await screen.findByText(/Co-op info night, /)).toBeTruthy();
  });

  it("keeps a source with adults rounds out of reach on an event without 18+", async () => {
    const queryClient = createClient();
    queryClient.setQueryData(quizshowKeys.importSources(SLUG, true), {
      items: [ADULTS_SOURCE],
    });
    renderEmptyState(queryClient, false);

    await userEvent.click(
      await screen.findByRole("button", { name: "Copy from a past event" }),
    );
    const dialog = await screen.findByRole("dialog");
    const copyButton = within(dialog).getByRole("button", {
      name: "Copy this quiz",
    });

    expect(copyButton.getAttribute("aria-disabled")).toBe("true");
    expect(within(dialog).getByText("Has adults rounds")).toBeTruthy();
    await userEvent.click(copyButton);
    expect(cachedQuiz(queryClient)).toBeUndefined();
  });
});

describe("QuizshowImportButtons in the toolbar", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("asks before an import replaces a quiz", async () => {
    const queryClient = createClient();
    const onImported = vi.fn();
    render(
      <TestProviders queryClient={queryClient}>
        <QuizshowImportButtons
          slug={SLUG}
          onImported={onImported}
          hasQuiz
          eventStartAt={EVENT_START_AT}
          isAdultsEvent={false}
          variant="toolbar"
        />
      </TestProviders>,
    );

    await userEvent.click(
      await screen.findByRole("button", { name: "Start from a pack" }),
    );
    const useButtons = await screen.findAllByRole("button", {
      name: "Use this pack",
    });
    const firstButton = useButtons[0];
    if (!firstButton) throw new Error("no pack row");
    await userEvent.click(firstButton);

    expect(await screen.findByText("Replace this quiz?")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(cachedQuiz(queryClient)).toBeUndefined());
    expect(screen.queryByText("Quiz copied")).toBeNull();
    expect(onImported).not.toHaveBeenCalled();

    await userEvent.click(
      await screen.findByRole("button", { name: "Start from a pack" }),
    );
    const secondUseButtons = await screen.findAllByRole("button", {
      name: "Use this pack",
    });
    const secondFirstButton = secondUseButtons[0];
    if (!secondFirstButton) throw new Error("no pack row");
    await userEvent.click(secondFirstButton);
    await userEvent.click(
      await screen.findByRole("button", { name: "Replace quiz" }),
    );

    await waitFor(() => expect(onImported).toHaveBeenCalledTimes(1));
    expect(cachedQuiz(queryClient)?.quiz).not.toBeNull();
    expect(await screen.findByText("Quiz copied")).toBeTruthy();
  });
});
