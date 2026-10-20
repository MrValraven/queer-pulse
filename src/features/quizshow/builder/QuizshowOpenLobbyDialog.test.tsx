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
import {
  demoDeleteGameResults,
  demoGameLiveSession,
  demoOpenGameSession,
  resetQuizshowDemoGames,
} from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { QUIZSHOW_STARTER_PACKS } from "../demo/quizshowStarterPacks.data";
import { ApiError } from "../../../shared/api/client";
import {
  eventScope,
  gameScope,
  quizshowScopeScreenPath,
  type QuizshowScope,
} from "../quizshowScope";
import { QuizshowLiveSessionPanel } from "./QuizshowLiveSessionPanel";
import { QuizshowOpenLobbyButton } from "./QuizshowOpenLobbyButton";
import { QuizshowOpenLobbyDialog } from "./QuizshowOpenLobbyDialog";

vi.mock("../api/quizshowDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoStore")>();
  return { ...actual, demoOpenSession: vi.fn(actual.demoOpenSession) };
});

vi.mock("../api/quizshowDemoGames", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoGames")>();
  return { ...actual, demoOpenGameSession: vi.fn(actual.demoOpenGameSession) };
});

vi.mock("../../../shared/components/ui", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../shared/components/ui")>();
  return {
    ...actual,
    QrCode: ({ url }: { url: string }) => (
      <output data-testid="qr" data-url={url} />
    ),
  };
});

const GAME_ID = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
const OPEN_GAME_ID = QUIZSHOW_DEMO_GAME_IDS.afterDark;

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

function renderDialog(scope: QuizshowScope) {
  return render(
    <TestProviders>
      <QuizshowOpenLobbyDialog scope={scope} isOpen onClose={() => {}} />
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
    resetQuizshowDemoGames();
    vi.mocked(demoOpenGameSession).mockClear();
    vi.mocked(demoOpenSession).mockClear();
  });

  it("opens a solo lobby with review and the guest push on by default", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, packQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

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
        quizshowScopeScreenPath(eventScope(QUIZSHOW_DEMO_LIVE_SLUG)),
      ),
    );
  });

  it("keeps Let guests know on an event lobby", async () => {
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, packQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

    expect(await screen.findByText("Let guests know")).toBeTruthy();
  });

  it("asks for a team size only in teams mode", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, packQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

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
    renderDialog(eventScope(QUIZSHOW_DEMO_RESULTS_SLUG));

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
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

    await user.click(await screen.findByRole("button", { name: "Open lobby" }));

    expect(
      await screen.findByText("A game is already open for this event"),
    ).toBeTruthy();
    const link = screen.getByRole("link", { name: "Go to the game" });
    expect(link.getAttribute("href")).toBe(
      quizshowScopeScreenPath(eventScope(QUIZSHOW_DEMO_LIVE_SLUG)),
    );
  });

  it("lists what to finish when the quiz is incomplete", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, packQuiz({ title: "" }));
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

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
          scope={eventScope(QUIZSHOW_DEMO_LIVE_SLUG)}
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

describe("QuizshowOpenLobbyDialog on a game", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
    vi.mocked(demoOpenGameSession).mockClear();
  });

  it("sends notifyGuests false and hides the guests switch for a game", async () => {
    const user = userEvent.setup();
    demoDeleteGameResults(GAME_ID);
    renderDialog(gameScope(GAME_ID));

    expect(await screen.findByText("How people play")).toBeTruthy();
    expect(screen.queryByText("Let guests know")).toBeNull();
    expect(
      screen.getByText("You see every written answer first and can hide any"),
    ).toBeTruthy();
    expect(
      screen.queryByText(
        "You and your co-hosts see every written answer first and can hide any",
      ),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Open lobby" }));

    await waitFor(() => expect(demoOpenGameSession).toHaveBeenCalledTimes(1));
    expect(vi.mocked(demoOpenGameSession).mock.calls[0]?.[1]).toMatchObject({
      notifyGuests: false,
    });
  });

  it("opens a game lobby without the guest push and goes to the game's big screen", async () => {
    const user = userEvent.setup();
    demoDeleteGameResults(GAME_ID);
    renderDialog(gameScope(GAME_ID));

    await user.click(await screen.findByRole("button", { name: "Open lobby" }));

    await waitFor(() =>
      expect(screen.getByTestId("location").textContent).toBe(
        `/play/games/${GAME_ID}/screen`,
      ),
    );
    expect(demoGameLiveSession(GAME_ID)?.status).toBe("lobby");
    expect(screen.queryByText("Guests got a push with the code")).toBeNull();
    expect(
      screen.queryByText(
        "Guests already got a push for this event in the last two hours",
      ),
    ).toBeNull();
  });

  it("links the live panel to the game's screen and remote", () => {
    const liveSession = demoGameLiveSession(OPEN_GAME_ID);
    expect(liveSession).not.toBeNull();
    if (!liveSession) return;
    render(
      <TestProviders>
        <QuizshowLiveSessionPanel
          scope={gameScope(OPEN_GAME_ID)}
          liveSession={liveSession}
        />
      </TestProviders>,
    );

    expect(
      screen
        .getByRole("link", { name: "Open big screen" })
        .getAttribute("href"),
    ).toBe(`/play/games/${OPEN_GAME_ID}/screen`);
    expect(
      screen.getByRole("link", { name: "Open remote" }).getAttribute("href"),
    ).toBe(`/play/games/${OPEN_GAME_ID}/remote`);
    expect(screen.getByTestId("qr").getAttribute("data-url")).toBe(
      `${window.location.origin}/play/games/${OPEN_GAME_ID}/remote`,
    );
  });

  it("points to the open game lobby with the game copy", async () => {
    const user = userEvent.setup();
    renderDialog(gameScope(OPEN_GAME_ID));

    await user.click(await screen.findByRole("button", { name: "Open lobby" }));

    expect(
      await screen.findByText("A lobby is already open for this game"),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Go to the game" }).getAttribute("href"),
    ).toBe(`/play/games/${OPEN_GAME_ID}/screen`);
  });

  it("asks before deleting a game's kept results with the game copy", async () => {
    const user = userEvent.setup();
    renderDialog(gameScope(GAME_ID));

    await user.click(await screen.findByRole("button", { name: "Open lobby" }));

    expect(await screen.findByText("Start a new game?")).toBeTruthy();
    expect(
      screen.getByText(
        "This game already has kept results. Opening a new lobby deletes them",
      ),
    ).toBeTruthy();
    expect(vi.mocked(demoOpenGameSession).mock.calls[0]?.[1]).toMatchObject({
      shouldReplaceResults: false,
    });

    await user.click(
      screen.getByRole("button", { name: "Delete results and open lobby" }),
    );
    await waitFor(() => expect(demoOpenGameSession).toHaveBeenCalledTimes(2));
    expect(vi.mocked(demoOpenGameSession).mock.calls[1]?.[1]).toMatchObject({
      shouldReplaceResults: true,
    });
  });

  it("says when the lobby limit for the hour is reached", async () => {
    const user = userEvent.setup();
    demoDeleteGameResults(GAME_ID);
    vi.mocked(demoOpenGameSession).mockImplementationOnce(() => {
      throw new ApiError(429, "quizshow_lobby_rate_limited", {
        code: "quizshow_lobby_rate_limited",
      });
    });
    renderDialog(gameScope(GAME_ID));

    await user.click(await screen.findByRole("button", { name: "Open lobby" }));

    expect(
      await screen.findByText(
        "You've opened 10 lobbies in the last hour. Try again a little later",
      ),
    ).toBeTruthy();
  });
});
