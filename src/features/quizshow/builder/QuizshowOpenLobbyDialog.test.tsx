import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
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
import { quizshowKeys } from "../api/quizshowKeys";
import {
  QUIZSHOW_DEMO_TEMPLATE_IDS,
  templateSeedById,
} from "../demo/quizshowTemplates.data";
import { normaliseStoredQuizShape } from "../quizshowNormalise";
import { resetQuizWinBadgesDemoStore } from "../winBadges/quizWinBadgesDemoStore";
import { ApiError } from "../../../shared/api/client";
import {
  eventScope,
  gameScope,
  quizshowScopeScreenPath,
  type QuizshowSessionScope,
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

function templateQuiz(
  overrides: Partial<QuizshowQuizInput> = {},
): QuizshowQuizInput {
  const quiz = normaliseStoredQuizShape(
    templateSeedById(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory).quiz,
  );
  return { ...quiz, expectedUpdatedAt: null, ...overrides };
}

function renderDialog(
  scope: QuizshowSessionScope,
  options: {
    queryClient?: QueryClient;
    isPracticeOnly?: boolean;
    rematchOf?: { sessionId: string; isPractice: boolean } | null;
  } = {},
) {
  return render(
    <TestProviders queryClient={options.queryClient}>
      <QuizshowOpenLobbyDialog
        scope={scope}
        rounds={[]}
        isOpen
        onClose={() => {}}
        isPracticeOnly={options.isPracticeOnly}
        rematchOf={options.rematchOf}
      />
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

  it("opens a solo lobby with review on and the guest push off by default", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

    const guestsSwitch = await screen.findByRole("switch", {
      name: /Let guests know/,
    });
    expect(guestsSwitch.getAttribute("aria-checked")).toBe("false");
    await user.click(screen.getByRole("button", { name: "Open lobby" }));

    await waitFor(() => expect(demoOpenSession).toHaveBeenCalledTimes(1));
    expect(lastOpenInput()).toEqual({
      playMode: "solo",
      maxTeamSize: null,
      isReviewOn: true,
      notifyGuests: false,
      shouldReplaceResults: false,
      isPractice: false,
      rematchOfSessionId: null,
    });
    expect(demoGetQuiz(QUIZSHOW_DEMO_LIVE_SLUG).liveSession?.playMode).toBe(
      "solo",
    );
    await waitFor(() =>
      expect(screen.getByTestId("location").textContent).toBe(
        quizshowScopeScreenPath(eventScope(QUIZSHOW_DEMO_LIVE_SLUG)),
      ),
    );
    // Checked once the open settled, so a push toast would already show.
    expect(screen.queryByText("Guests got a push with the code")).toBeNull();
  });

  it("keeps Let guests know on an event lobby", async () => {
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

    expect(await screen.findByText("Let guests know")).toBeTruthy();
  });

  it("asks for a team size only in teams mode", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

    expect(await screen.findByText("How people play")).toBeTruthy();
    expect(screen.queryByText("Most people per team")).toBeNull();

    await user.click(screen.getByRole("radio", { name: /^Teams/ }));
    expect(await screen.findByText("Most people per team")).toBeTruthy();
    expect(screen.getByText("No limit")).toBeTruthy();

    await user.click(screen.getByRole("radio", { name: /^Solo/ }));
    await user.click(screen.getByRole("button", { name: "Open lobby" }));

    await waitFor(() => expect(demoOpenSession).toHaveBeenCalledTimes(1));
    expect(lastOpenInput().maxTeamSize).toBeNull();
  });

  it("asks before deleting kept results, then resends with the flag", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_RESULTS_SLUG, templateQuiz());
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
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz());
    demoOpenSession(QUIZSHOW_DEMO_LIVE_SLUG, {
      playMode: "solo",
      maxTeamSize: null,
      isReviewOn: true,
      notifyGuests: false,
      shouldReplaceResults: false,
      isPractice: false,
      rematchOfSessionId: null,
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
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz({ title: "" }));
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
          rounds={[]}
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

describe("QuizshowOpenLobbyDialog settings, practice and rematch", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
    vi.mocked(demoOpenSession).mockClear();
  });

  it("sends the guest push once the host turns it on", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

    await user.click(
      await screen.findByRole("switch", { name: /Let guests know/ }),
    );
    await user.click(screen.getByRole("button", { name: "Open lobby" }));

    expect(
      await screen.findByText("Guests got a push with the code"),
    ).toBeTruthy();
    expect(lastOpenInput().notifyGuests).toBe(true);
  });

  it("prefills the play mode, team size and review from the last open", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz());
    const scope = eventScope(QUIZSHOW_DEMO_LIVE_SLUG);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    queryClient.setQueryData(quizshowKeys.quizFor(scope, true), {
      ...demoGetQuiz(QUIZSHOW_DEMO_LIVE_SLUG),
      lastOpenSettings: {
        playMode: "teams",
        maxTeamSize: 6,
        isReviewOn: false,
      },
    });
    renderDialog(scope, { queryClient });

    const teams = await screen.findByRole("radio", { name: /^Teams/ });
    expect(teams.getAttribute("aria-checked")).toBe("true");
    expect(await screen.findByText("Most people per team")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Open lobby" }));

    await waitFor(() => expect(demoOpenSession).toHaveBeenCalledTimes(1));
    expect(lastOpenInput()).toMatchObject({
      playMode: "teams",
      maxTeamSize: 6,
      isReviewOn: false,
      notifyGuests: false,
    });
  });

  it("opens a practice lobby without the guest push", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_RESULTS_SLUG, templateQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_RESULTS_SLUG));

    // The push is on before practice: practice still sends none.
    await user.click(
      await screen.findByRole("switch", { name: /Let guests know/ }),
    );
    await user.click(screen.getByRole("switch", { name: /Practice lobby/ }));
    await waitFor(() =>
      expect(screen.queryByText("Let guests know")).toBeNull(),
    );
    await user.click(screen.getByRole("button", { name: "Open lobby" }));

    await waitFor(() => expect(demoOpenSession).toHaveBeenCalledTimes(1));
    expect(lastOpenInput()).toMatchObject({
      isPractice: true,
      notifyGuests: false,
      shouldReplaceResults: false,
    });
    // Kept results stay untouched, so nothing asks to replace them.
    expect(screen.queryByText("Start a new game?")).toBeNull();
  });

  it("says practice games give no badges for an event with badges", async () => {
    const user = userEvent.setup();
    const practiceLine = "Practice games give no badges";
    resetQuizWinBadgesDemoStore();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG));

    const practiceSwitch = await screen.findByRole("switch", {
      name: /Practice lobby/,
    });
    expect(screen.queryByText(practiceLine)).toBeNull();

    await user.click(practiceSwitch);
    expect(await screen.findByText(practiceLine)).toBeTruthy();

    await user.click(practiceSwitch);
    await waitFor(() => expect(screen.queryByText(practiceLine)).toBeNull());
  });

  it("holds practice on for a draft event", async () => {
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz());
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG), {
      isPracticeOnly: true,
    });

    const practice = await screen.findByRole("switch", {
      name: /Practice lobby/,
    });
    expect(practice.getAttribute("aria-checked")).toBe("true");
    expect(practice).toBeDisabled();
    expect(screen.queryByText("Let guests know")).toBeNull();
  });

  it("names a rematch and sends the finished session's id", async () => {
    const user = userEvent.setup();
    demoPutQuiz(QUIZSHOW_DEMO_LIVE_SLUG, templateQuiz());
    vi.mocked(demoOpenSession).mockImplementationOnce(() => {
      throw new ApiError(409, "quizshow_rematch_expired", {
        code: "quizshow_rematch_expired",
      });
    });
    renderDialog(eventScope(QUIZSHOW_DEMO_LIVE_SLUG), {
      rematchOf: { sessionId: "session-finished", isPractice: false },
    });

    expect(
      await screen.findByRole("dialog", {
        name: "Play again with these players",
      }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Play again with these players" }),
    );

    expect(
      await screen.findByText(
        "A rematch opens up to 30 minutes after a game ends",
      ),
    ).toBeTruthy();
    expect(lastOpenInput()).toMatchObject({
      rematchOfSessionId: "session-finished",
      isPractice: false,
    });
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

  it("links the live panel to the game's screen and remote", async () => {
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
    await awaitCatalog("quizshow");

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
