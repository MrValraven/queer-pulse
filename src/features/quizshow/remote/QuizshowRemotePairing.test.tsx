import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi, type Mock } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import type {
  QuizshowCursor,
  QuizshowHostState,
  QuizshowPairedDevice,
} from "../../../shared/contracts/quizshow";
import { createQuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import type { QuizshowHostSession } from "../screen/quizshowHostSession";
import { quizshowHelperPairPath } from "../quizshowPaths";
import { eventScope } from "../quizshowScope";
import { QuizshowRemoteView } from "./QuizshowRemotePage";

type SendFunction = (name: string, payload: unknown) => Promise<unknown>;

const sessionMock = vi.hoisted(() => ({
  controller: null as QuizshowSessionController | null,
}));

vi.mock("../realtime/useQuizshowSession", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../realtime/useQuizshowSession")>()),
  useQuizshowSession: () => sessionMock.controller,
}));
vi.mock("../screen/QuizshowScreenStage", () => ({
  QuizshowScreenStage: () => <div data-testid="screen-stage" />,
}));
vi.mock("../sound/useQuizshowCues", () => ({ useQuizshowCues: vi.fn() }));
vi.mock("../../../shared/hooks/useScreenWakeLock", () => ({
  useScreenWakeLock: vi.fn(),
}));
vi.mock("../../../shared/lib/messageChime", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../shared/lib/messageChime")
  >()),
  primeMessageChime: vi.fn(),
}));

const SCREEN_DEVICE: QuizshowPairedDevice = {
  pairingId: "pairing-screen-1",
  kind: "screen",
  helperName: null,
  pairedAt: 1_700_000_000_000,
  isConnected: true,
};

function hostState(overrides: Partial<QuizshowHostState> = {}) {
  const cursor: QuizshowCursor = {
    phaseId: "1",
    status: "lobby",
    phase: "lobby",
    roundIndex: null,
    questionIndex: null,
    roundCount: 1,
    phaseStartedAt: 1_000,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    roundNumber: 0,
    upNext: null,
    canSpinForNextRound: false,
    talkStartsAt: null,
    autoAdvanceAt: null,
    podiumRevealedCount: null,
  };
  const state: QuizshowHostState = {
    role: "host",
    sessionId: "session-1",
    eventSlug: "pride-brunch-jun",
    eventTitle: "Pride brunch",
    kind: "event",
    gameId: null,
    isAdultsOnly: false,
    joinCode: "QZ7KP4",
    quizTitle: "Pride quiz",
    languages: "both",
    screenLanguage: "en",
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    isPractice: false,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    giving: null,
    isScreenMuted: false,
    cursor,
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    lobby: { players: [], teams: [], playerCount: 0 },
    question: null,
    answerCount: null,
    voteOptions: null,
    wheel: null,
    wheelBonus: null,
    reviewList: null,
    pairedDevices: [],
    typedAnswers: null,
    guestPushSentAt: null,
    ...overrides,
  };
  return state;
}

function stubController(
  state: QuizshowHostState,
  {
    isDemo = false,
    sendResult = { ok: true, isNoop: false },
  }: { isDemo?: boolean; sendResult?: unknown } = {},
): Mock<SendFunction> {
  const send = vi.fn<SendFunction>(() => Promise.resolve(sendResult));
  sessionMock.controller = {
    state: {
      ...createQuizshowClientState("host"),
      status: "attached",
      hasAttached: true,
      session: state,
    },
    clockOffsetMs: 0,
    isDemo,
    send: send as unknown as QuizshowSessionController["send"],
    submitAnswer:
      vi.fn() as unknown as QuizshowSessionController["submitAnswer"],
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
  return send;
}

function hostSessionOf(deviceTicket: string | null): QuizshowHostSession {
  return {
    scope: eventScope("pride-brunch-jun"),
    slug: "pride-brunch-jun",
    eventTitle: "Pride brunch",
    gameTitle: "",
    isAdultsOnly: false,
    backPath: "/gatherings/pride-brunch-jun",
    backLabelKey: "quizshow:screen.backToEvent",
    noGameKeys: {
      screen: "quizshow:screen.noGame",
      remote: "quizshow:remote.noGame",
    },
    isOrganizer: true,
    isLoading: false,
    sessionId: "session-1",
    errorCode: null,
    hasLoadFailed: false,
    playMode: "solo",
    deviceTicket,
  };
}

async function renderRemote(
  deviceTicket: string | null = null,
  onSessionRefused?: (refusalCode: string) => void,
) {
  render(
    <TestProviders initialEntries={["/remote"]}>
      <ReducedMotionContext.Provider value>
        <QuizshowRemoteView
          hostSession={hostSessionOf(deviceTicket)}
          onSessionRefused={onSessionRefused}
        />
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
  await awaitCatalog("quizshow");
}

async function openPairForm() {
  await userEvent.click(screen.getByRole("button", { name: "Pair a device" }));
  return screen.getByLabelText("Pairing code");
}

afterEach(() => {
  sessionMock.controller = null;
});

describe("Pair a device on the remote", () => {
  it("shows no pairing UI in demo", async () => {
    stubController(hostState({ pairedDevices: [SCREEN_DEVICE] }), {
      isDemo: true,
    });
    await renderRemote();
    expect(
      screen.queryByRole("button", { name: "Pair a device" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Paired devices")).not.toBeInTheDocument();
  });

  it("shows no pairing UI on a helper's remote", async () => {
    stubController(hostState({ pairedDevices: [SCREEN_DEVICE] }));
    await renderRemote("helper-ticket");
    expect(
      screen.queryByRole("button", { name: "Pair a device" }),
    ).not.toBeInTheDocument();
  });

  it("accepts six digits from 2 to 9 only", async () => {
    const send = stubController(hostState());
    await renderRemote();
    const field = await openPairForm();
    expect(field).toHaveAttribute("inputmode", "numeric");
    const submit = screen.getByRole("button", { name: "Pair this device" });

    for (const refusedCode of ["123456", "23456", "234561", "23456a"]) {
      await userEvent.clear(field);
      await userEvent.type(field, refusedCode);
      await userEvent.click(submit);
      expect(field).toHaveAttribute("aria-invalid", "true");
    }
    expect(
      screen.getByText(
        "Type the 6 digits of the code on the device. They run from 2 to 9",
      ),
    ).toBeInTheDocument();
    expect(send).not.toHaveBeenCalled();

    await userEvent.clear(field);
    await userEvent.type(field, "234 567");
    await userEvent.click(submit);
    await waitFor(() =>
      expect(send).toHaveBeenCalledWith("host:pairDevice", {
        pairingCode: "234567",
      }),
    );
  });

  it("names the helper when a pairing is refused for them", async () => {
    stubController(hostState(), {
      sendResult: {
        ok: false,
        code: "quizshow_helper_is_playing",
        message: "playing",
      },
    });
    await renderRemote();
    const field = await openPairForm();
    await userEvent.type(field, "234567");
    await userEvent.click(
      screen.getByRole("button", { name: "Pair this device" }),
    );
    expect(
      await screen.findByText(
        "This member is playing this game, so they can't help run it",
      ),
    ).toBeInTheDocument();
  });

  it("sends the device's id once the unpair is confirmed", async () => {
    const send = stubController(hostState({ pairedDevices: [SCREEN_DEVICE] }));
    await renderRemote();
    await userEvent.click(
      screen.getByRole("button", { name: "Unpair this screen" }),
    );
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Keep it paired" }),
      ).toHaveFocus(),
    );
    expect(send).not.toHaveBeenCalled();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Unpair this screen" }),
    );
    await waitFor(() =>
      expect(send).toHaveBeenCalledWith("host:unpairDevice", {
        pairingId: "pairing-screen-1",
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Pair a device" }),
      ).toHaveFocus(),
    );
  });
});

describe("QuizshowRemoteView refusal reports", () => {
  it("reports a refused command, such as a helper ticket past its time", async () => {
    const onSessionRefused = vi.fn();
    stubController(hostState(), {
      sendResult: {
        ok: false,
        code: "quizshow_device_ticket_expired",
        message: "expired",
      },
    });
    await renderRemote("helper-ticket", onSessionRefused);
    await userEvent.click(
      screen.getByRole("button", { name: "Mute the big screen" }),
    );
    await waitFor(() =>
      expect(onSessionRefused).toHaveBeenCalledWith(
        "quizshow_device_ticket_expired",
      ),
    );
  });

  it("reports a refused session state, such as an unpairing", async () => {
    const onSessionRefused = vi.fn();
    stubController(hostState());
    const controller = sessionMock.controller;
    if (controller === null)
      throw new Error("stubController sets a controller");
    sessionMock.controller = {
      ...controller,
      state: {
        ...controller.state,
        status: "refused",
        refusalCode: "quizshow_device_unpaired",
      },
    };
    await renderRemote("helper-ticket", onSessionRefused);
    expect(onSessionRefused).toHaveBeenCalledWith("quizshow_device_unpaired");
  });
});

describe("A command the game never answered", () => {
  const TIMEOUT_LINE =
    "The game didn't answer in time. Check your connection and try again";

  it("names the timeout on a pairing", async () => {
    stubController(hostState(), {
      sendResult: { ok: false, code: "transport_timeout", message: "" },
    });
    await renderRemote();
    const field = await openPairForm();
    await userEvent.type(field, "234567");
    await userEvent.click(
      screen.getByRole("button", { name: "Pair this device" }),
    );
    expect(await screen.findByText(TIMEOUT_LINE)).toBeInTheDocument();
  });

  it("names the timeout on a host command", async () => {
    stubController(hostState(), {
      sendResult: { ok: false, code: "transport_timeout", message: "" },
    });
    await renderRemote();
    await userEvent.click(
      screen.getByRole("button", { name: "Mute the big screen" }),
    );
    expect(await screen.findByText(TIMEOUT_LINE)).toBeInTheDocument();
  });
});

describe("Pairing again after a game ends", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  function endedHostState(overrides: Partial<QuizshowHostState> = {}) {
    const base = hostState(overrides);
    return {
      ...base,
      cursor: { ...base.cursor, phase: "ended", status: "finished" },
    } satisfies QuizshowHostState;
  }

  it("keeps the digits of a pasted code with spaces between its pairs", async () => {
    const send = stubController(hostState());
    await renderRemote();
    const field = await openPairForm();
    await userEvent.click(field);
    await userEvent.paste("23 45 67");
    expect(field).toHaveValue("234567");
    await userEvent.click(
      screen.getByRole("button", { name: "Pair this device" }),
    );
    await waitFor(() =>
      expect(send).toHaveBeenCalledWith("host:pairDevice", {
        pairingCode: "234567",
      }),
    );
  });

  it("tells the host at the end that paired devices pair again for the next game", async () => {
    stubController(endedHostState({ pairedDevices: [SCREEN_DEVICE] }));
    await renderRemote();
    expect(
      await screen.findByText(
        "For the next game, pair the screen and your helpers again",
      ),
    ).toBeInTheDocument();
  });

  it("asks the host to pair the screen again in the lobby after a game that had one", async () => {
    window.sessionStorage.setItem(
      "quizshow.remote.pairedBefore.event:pride-brunch-jun",
      "session-0",
    );
    stubController(hostState());
    await renderRemote();
    expect(
      await screen.findByText("Pair the screen again for this game"),
    ).toBeInTheDocument();
  });

  it("says nothing in the lobby when no earlier game had a device paired", async () => {
    stubController(hostState());
    await renderRemote();
    await screen.findByRole("button", { name: "Pair a device" });
    expect(
      screen.queryByText("Pair the screen again for this game"),
    ).not.toBeInTheDocument();
  });

  it("offers a helper a new code once the game ended", async () => {
    stubController(endedHostState());
    await renderRemote("helper-ticket");
    expect(
      await screen.findByRole("link", { name: "Pair again" }),
    ).toHaveAttribute("href", quizshowHelperPairPath());
  });
});
