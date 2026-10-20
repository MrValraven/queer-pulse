import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowOpenSessionInput,
  QuizshowQuizInput,
} from "../../../shared/contracts/quizshow";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "../api/quizshowDemoStore.data";
import {
  demoGetQuiz,
  demoOpenSession,
  demoPutQuiz,
  resetQuizshowDemoStore,
} from "../api/quizshowDemoStore";
import { QUIZSHOW_STARTER_PACKS } from "../demo/quizshowStarterPacks.data";
import { quizshowScreenPath } from "../quizshowPaths";
import { QuizshowOpenLobbyButton } from "./QuizshowOpenLobbyButton";
import { QuizshowOpenLobbyDialog } from "./QuizshowOpenLobbyDialog";

vi.mock("../api/quizshowDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoStore")>();
  return { ...actual, demoOpenSession: vi.fn(actual.demoOpenSession) };
});

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function packQuiz(
  overrides: Partial<QuizshowQuizInput> = {},
): QuizshowQuizInput {
  const pack = QUIZSHOW_STARTER_PACKS[0];
  if (!pack) throw new Error("no starter pack");
  return { ...pack.quiz, expectedUpdatedAt: null, ...overrides };
}

function renderDialog(slug: string) {
  return render(
    <TestProviders>
      <QuizshowOpenLobbyDialog slug={slug} isOpen onClose={() => {}} />
      <LocationProbe />
    </TestProviders>,
  );
}

function lastOpenInput(): QuizshowOpenSessionInput {
  const calls = vi.mocked(demoOpenSession).mock.calls;
  const lastCall = calls[calls.length - 1];
  if (!lastCall) throw new Error("demoOpenSession was not called");
  return lastCall[1];
}

describe("QuizshowOpenLobbyDialog", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    vi.mocked(demoOpenSession).mockClear();
  });

  it("opens a solo lobby with review and the guest push on by default", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, packQuiz());
    renderDialog(QUIZSHOW_DEMO_LIVE_SLUG);

    await user.click(await screen.findByRole("button", { name: "Open lobby" }));

    expect(
      await screen.findByText("Guests got a push with the code"),
    ).toBeTruthy();
    expect(lastOpenInput()).toMatchObject({
      playMode: "solo",
      maxTeamSize: null,
      isReviewOn: true,
      notifyGuests: true,
      shouldReplaceResults: false,
    });
    expect(demoGetQuiz(QUIZSHOW_DEMO_LIVE_SLUG).liveSession?.playMode).toBe(
      "solo",
    );
    await waitFor(() =>
      expect(screen.getByTestId("location").textContent).toBe(
        quizshowScreenPath(QUIZSHOW_DEMO_LIVE_SLUG),
      ),
    );
  });

  it("asks for a team size only in teams mode", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, packQuiz());
    renderDialog(QUIZSHOW_DEMO_LIVE_SLUG);

    expect(await screen.findByText("How people play")).toBeTruthy();
    expect(screen.queryByText("Most people per team")).toBeNull();

    await user.click(screen.getByRole("radio", { name: "In teams" }));
    expect(await screen.findByText("Most people per team")).toBeTruthy();
    expect(screen.getByText("No limit")).toBeTruthy();

    await user.click(
      screen.getByRole("radio", { name: "Everyone for themselves" }),
    );
    await user.click(screen.getByRole("button", { name: "Open lobby" }));

    await waitFor(() => expect(demoOpenSession).toHaveBeenCalledTimes(1));
    expect(lastOpenInput().maxTeamSize).toBeNull();
  });

  it("asks before deleting kept results, then resends with the flag", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_RESULTS_SLUG, packQuiz());
    renderDialog(QUIZSHOW_DEMO_RESULTS_SLUG);

    await user.click(await screen.findByRole("button", { name: "Open lobby" }));
    expect(await screen.findByText("Start a new game?")).toBeTruthy();
    expect(lastOpenInput().shouldReplaceResults).toBe(false);

    await user.click(
      screen.getByRole("button", { name: "Delete results and open lobby" }),
    );

    await waitFor(() => expect(demoOpenSession).toHaveBeenCalledTimes(2));
    expect(lastOpenInput().shouldReplaceResults).toBe(true);
  });

  it("points to the open game when one is already running", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, packQuiz());
    demoOpenSession(QUIZSHOW_DEMO_LIVE_SLUG, {
      playMode: "solo",
      maxTeamSize: null,
      isReviewOn: true,
      notifyGuests: false,
      shouldReplaceResults: false,
    });
    renderDialog(QUIZSHOW_DEMO_LIVE_SLUG);

    await user.click(await screen.findByRole("button", { name: "Open lobby" }));

    expect(
      await screen.findByText("A game is already open for this event"),
    ).toBeTruthy();
    const link = screen.getByRole("link", { name: "Go to the game" });
    expect(link.getAttribute("href")).toBe(
      quizshowScreenPath(QUIZSHOW_DEMO_LIVE_SLUG),
    );
  });

  it("lists what to finish when the quiz is incomplete", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, packQuiz({ title: "" }));
    renderDialog(QUIZSHOW_DEMO_LIVE_SLUG);

    await user.click(await screen.findByRole("button", { name: "Open lobby" }));

    const heading = await screen.findByText("Finish these first");
    const alert = heading.closest('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.textContent).toContain("Give the quiz a title");
  });

  it("keeps the button blocked with its reason", async () => {
    const user = userEvent.setup();
    const reason = "Save your changes first";
    render(
      <TestProviders>
        <QuizshowOpenLobbyButton
          slug={QUIZSHOW_DEMO_LIVE_SLUG}
          isBlocked
          blockedReason={reason}
        />
      </TestProviders>,
    );

    const button = await screen.findByRole("button", { name: "Open lobby" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    const reasonId = button.getAttribute("aria-describedby");
    expect(reasonId).toBeTruthy();
    expect(document.getElementById(reasonId ?? "")?.textContent).toBe(reason);

    await user.click(button);
    expect(screen.queryByText("How people play")).toBeNull();
  });
});
