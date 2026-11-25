import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import type { QuizshowHostSession } from "../screen/quizshowHostSession";
import {
  readDeviceTicket,
  saveDeviceTicket,
  type QuizshowPairedClaim,
} from "../screen/quizshowDeviceTicket";
import { QuizshowHelperRemotePage } from "./QuizshowHelperRemotePage";

const demoMock = vi.hoisted(() => ({ isLive: true }));
const viewMock = vi.hoisted(() => ({
  hostSessions: [] as QuizshowHostSession[],
}));
const quizHookMock = vi.hoisted(() => ({
  useQuizshowQuiz: vi.fn(),
  useQuizshowEventSession: vi.fn(),
  useQuizshowGameSession: vi.fn(),
}));

// Pairing is live only; the demo case turns this off.
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...original,
    useDemoMode: () => {
      const value = original.useDemoMode();
      return demoMock.isLive ? { ...value, demoMode: false } : value;
    },
  };
});
vi.mock("./QuizshowRemotePage", () => ({
  QuizshowRemoteView: ({
    hostSession,
    onSessionRefused,
  }: {
    hostSession: QuizshowHostSession;
    onSessionRefused?: (refusalCode: string) => void;
  }) => {
    viewMock.hostSessions.push(hostSession);
    return (
      <div data-testid="remote-view">
        <button
          type="button"
          onClick={() => onSessionRefused?.("quizshow_device_unpaired")}
        >
          refuse
        </button>
      </div>
    );
  },
}));
// The helper remote reads nothing over REST: these hooks must never run.
vi.mock("../api/useQuizshowQuiz", () => ({
  useQuizshowQuiz: quizHookMock.useQuizshowQuiz,
}));
vi.mock("../screen/useQuizshowEventSession", () => ({
  useQuizshowEventSession: quizHookMock.useQuizshowEventSession,
}));
vi.mock("../screen/useQuizshowGameSession", () => ({
  useQuizshowGameSession: quizHookMock.useQuizshowGameSession,
}));

const HELPER_CLAIM: QuizshowPairedClaim = {
  status: "paired",
  deviceTicket: "helper-ticket-1",
  sessionId: "session-1",
  kind: "event",
  eventSlug: "pride-brunch-jun",
  gameId: null,
};

function renderAt(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <Routes>
        <Route path="/play/remote" element={<p>pair page</p>} />
        <Route
          path="/play/remote/:sessionId"
          element={<QuizshowHelperRemotePage />}
        />
      </Routes>
    </TestProviders>,
  );
}

afterEach(() => {
  window.sessionStorage.clear();
  viewMock.hostSessions = [];
  demoMock.isLive = true;
  vi.clearAllMocks();
});

describe("QuizshowHelperRemotePage", () => {
  it("goes to the code page without a stored helper pairing", () => {
    renderAt("/play/remote/session-1");
    expect(screen.getByText("pair page")).toBeInTheDocument();
    expect(screen.queryByTestId("remote-view")).not.toBeInTheDocument();
  });

  it("goes to the code page when the stored pairing is a TV's", () => {
    saveDeviceTicket(HELPER_CLAIM, "screen");
    renderAt("/play/remote/session-1");
    expect(screen.getByText("pair page")).toBeInTheDocument();
  });

  it("goes to the code page in demo, which has no pairing", () => {
    demoMock.isLive = false;
    saveDeviceTicket(HELPER_CLAIM, "helper");
    renderAt("/play/remote/session-1");
    expect(screen.getByText("pair page")).toBeInTheDocument();
  });

  it("renders the remote from the stored helper ticket alone", () => {
    saveDeviceTicket(HELPER_CLAIM, "helper");
    renderAt("/play/remote/session-1");
    expect(screen.getByTestId("remote-view")).toBeInTheDocument();
    const hostSession = viewMock.hostSessions.at(-1);
    expect(hostSession).toMatchObject({
      sessionId: "session-1",
      deviceTicket: "helper-ticket-1",
      isOrganizer: true,
      isLoading: false,
      backPath: "/play",
      backLabelKey: "quizshow:player.backToPlay",
      scope: { kind: "event", eventSlug: "pride-brunch-jun" },
    });
    expect(quizHookMock.useQuizshowQuiz).not.toHaveBeenCalled();
    expect(quizHookMock.useQuizshowEventSession).not.toHaveBeenCalled();
    expect(quizHookMock.useQuizshowGameSession).not.toHaveBeenCalled();
  });

  it("clears the ticket and offers a new code once the host unpairs", async () => {
    saveDeviceTicket(HELPER_CLAIM, "helper");
    renderAt("/play/remote/session-1");
    await userEvent.click(screen.getByRole("button", { name: "refuse" }));
    await awaitCatalog("quizshow");
    expect(readDeviceTicket("session-1")).toBeNull();
    expect(
      screen.getByText("The host unpaired this phone from the game"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pair again" })).toHaveAttribute(
      "href",
      "/play/remote",
    );
  });
});
