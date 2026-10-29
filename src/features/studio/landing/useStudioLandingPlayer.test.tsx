import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
  type MockInstance,
} from "vitest";
import type { StudioLandingPreviewView } from "../api/studioLanding.adapters";
import { useStudioLandingPlayer } from "./useStudioLandingPlayer";

const mocks: {
  isDemo: boolean;
  postStudioPlay: Mock;
  recordRecentlyPlayed: Mock;
} = vi.hoisted(() => ({
  isDemo: false,
  postStudioPlay: vi.fn(),
  recordRecentlyPlayed: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mocks.isDemo }),
}));
vi.mock("../api/studioListening.api", () => ({
  postStudioPlay: mocks.postStudioPlay,
}));
vi.mock("../player/studioListeningMemory", () => ({
  recordStudioRecentlyPlayed: mocks.recordRecentlyPlayed,
}));

function previewOf(id: string, trackTitle: string): StudioLandingPreviewView {
  return {
    id,
    trackTitle,
    durationSeconds: 220,
    coverUrl: null,
    coverTint: "coral",
    artist: {
      name: "Nightform",
      handle: "nightform",
      kindLabelKey: null,
      avatarUrl: null,
      initials: "N",
      tint: "plum",
      personaHref: "/p/nightform",
    },
  };
}

const PREVIEW_ONE = previewOf("preview-1", "Night Bus");
const PREVIEW_TWO = previewOf("preview-2", "Paragem");

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function streamAnswerFor(url: unknown) {
  const previewId = /previews\/([^/]+)\/stream$/.exec(String(url))?.[1];
  return jsonResponse(200, {
    url: `https://cdn.example/${previewId}.wav`,
    expiresAt: "2999-01-01T00:00:00.000Z",
  });
}

/** A live page with no Studio player around it: the landing player needs none. */
function liveWrapperWithoutStudioPlayer({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function setOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}

let playedElements: HTMLMediaElement[] = [];
let playSpy: MockInstance<HTMLMediaElement["play"]>;
let pauseSpy: MockInstance<HTMLMediaElement["pause"]>;
let loadSpy: MockInstance<HTMLMediaElement["load"]>;

beforeEach(() => {
  mocks.isDemo = false;
  mocks.postStudioPlay.mockReset();
  mocks.recordRecentlyPlayed.mockReset();
  setOnline(true);
  playedElements = [];
  playSpy = vi
    .spyOn(HTMLMediaElement.prototype, "play")
    .mockImplementation(function (this: HTMLMediaElement) {
      playedElements.push(this);
      return Promise.resolve();
    });
  pauseSpy = vi
    .spyOn(HTMLMediaElement.prototype, "pause")
    .mockImplementation(() => undefined);
  loadSpy = vi
    .spyOn(HTMLMediaElement.prototype, "load")
    .mockImplementation(() => undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  setOnline(true);
});

function renderPlayer() {
  return renderHook(() => useStudioLandingPlayer(), {
    wrapper: liveWrapperWithoutStudioPlayer,
  });
}

async function failureOf(fetchMock: Mock) {
  vi.stubGlobal("fetch", fetchMock);
  const { result } = renderPlayer();
  act(() => result.current.toggle(PREVIEW_ONE));
  await waitFor(() =>
    expect(result.current.state.failures["preview-1"]).toBeDefined(),
  );
  return result.current.state;
}

describe("useStudioLandingPlayer", () => {
  it("fetches the stream without credentials and plays it, recording nothing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        url: "https://cdn.example/a.wav",
        expiresAt: "2999-10-28T12:00:00.000Z",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderPlayer();
    act(() => result.current.toggle(PREVIEW_ONE));
    expect(result.current.state).toMatchObject({
      activeId: "preview-1",
      status: "loading",
    });
    await waitFor(() =>
      expect(result.current.state).toMatchObject({
        activeId: "preview-1",
        status: "playing",
      }),
    );
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toMatch(
      /\/v1\/studio\/landing\/previews\/preview-1\/stream$/,
    );
    expect(init).toMatchObject({ credentials: "omit" });
    expect(init).not.toHaveProperty("headers");
    expect(playedElements[0]?.getAttribute("src")).toBe(
      "https://cdn.example/a.wav",
    );
    expect(mocks.postStudioPlay).not.toHaveBeenCalled();
    expect(mocks.recordRecentlyPlayed).not.toHaveBeenCalled();
  });

  it("plays one track at a time", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(streamAnswerFor));
    const { result } = renderPlayer();
    act(() => result.current.toggle(PREVIEW_ONE));
    await waitFor(() => expect(result.current.state.status).toBe("playing"));
    pauseSpy.mockClear();
    act(() => result.current.toggle(PREVIEW_TWO));
    expect(pauseSpy).toHaveBeenCalled();
    await waitFor(() =>
      expect(result.current.state).toMatchObject({
        activeId: "preview-2",
        status: "playing",
      }),
    );
    expect(playedElements.at(-1)?.getAttribute("src")).toBe(
      "https://cdn.example/preview-2.wav",
    );
    expect(new Set(playedElements).size).toBe(1);
  });

  it("drops a slow answer for an earlier pick", async () => {
    let answerFirst: (response: Response) => void = () => undefined;
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(
        () => new Promise<Response>((resolve) => (answerFirst = resolve)),
      )
      .mockImplementation(streamAnswerFor);
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderPlayer();
    act(() => result.current.toggle(PREVIEW_ONE));
    act(() => result.current.toggle(PREVIEW_TWO));
    await waitFor(() => expect(result.current.state.status).toBe("playing"));
    await act(async () => {
      answerFirst(streamAnswerFor("previews/preview-1/stream"));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(result.current.state.activeId).toBe("preview-2");
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it("marks a removed preview unavailable", async () => {
    const state = await failureOf(
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(404, { code: "studio_landing_preview_unavailable" }),
        ),
    );
    expect(state.failures["preview-1"]).toBe("unavailable");
    expect(state).toMatchObject({ activeId: null, status: "idle" });
    expect(playSpy).not.toHaveBeenCalled();
  });

  it.each([
    [429, "rateLimited"],
    [503, "server"],
  ])("names a %s as %s", async (status, reason) => {
    const state = await failureOf(
      vi.fn().mockResolvedValue(jsonResponse(status, {})),
    );
    expect(state.failures["preview-1"]).toBe(reason);
    expect(state.status).toBe("idle");
  });

  it("names an offline failure", async () => {
    setOnline(false);
    const state = await failureOf(
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    expect(state.failures["preview-1"]).toBe("offline");
  });

  it("names a media error as playback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(streamAnswerFor));
    const { result } = renderPlayer();
    act(() => result.current.toggle(PREVIEW_ONE));
    await waitFor(() => expect(result.current.state.status).toBe("playing"));
    act(() => {
      playedElements[0]?.dispatchEvent(new Event("error"));
    });
    expect(result.current.state.failures["preview-1"]).toBe("playback");
    expect(result.current.state.status).toBe("idle");
  });

  it("retry clears the failure and plays again", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(503, {}))
      .mockImplementation(streamAnswerFor);
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderPlayer();
    act(() => result.current.toggle(PREVIEW_ONE));
    await waitFor(() =>
      expect(result.current.state.failures["preview-1"]).toBe("server"),
    );
    act(() => result.current.retry(PREVIEW_ONE));
    expect(result.current.state.failures["preview-1"]).toBeUndefined();
    await waitFor(() => expect(result.current.state.status).toBe("playing"));
  });

  it("pauses and resumes the same track without a second fetch", async () => {
    const fetchMock = vi.fn().mockImplementation(streamAnswerFor);
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderPlayer();
    act(() => result.current.toggle(PREVIEW_ONE));
    await waitFor(() => expect(result.current.state.status).toBe("playing"));
    act(() => result.current.toggle(PREVIEW_ONE));
    expect(result.current.state).toMatchObject({
      activeId: "preview-1",
      status: "paused",
    });
    expect(pauseSpy).toHaveBeenCalled();
    act(() => result.current.toggle(PREVIEW_ONE));
    await waitFor(() => expect(result.current.state.status).toBe("playing"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(playSpy).toHaveBeenCalledTimes(2);
  });

  it("in demo runs a silent clock and fetches nothing", () => {
    vi.useFakeTimers();
    mocks.isDemo = true;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderPlayer();
    act(() => result.current.toggle(PREVIEW_ONE));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.state).toMatchObject({
      activeId: "preview-1",
      status: "playing",
    });
    expect(result.current.state.elapsedSeconds).toBeGreaterThanOrEqual(2);
    act(() => result.current.toggle(PREVIEW_ONE));
    const pausedAt = result.current.state.elapsedSeconds;
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.state.elapsedSeconds).toBe(pausedAt);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
  });

  it("stops and releases the audio on unmount", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(streamAnswerFor));
    const { result, unmount } = renderPlayer();
    act(() => result.current.toggle(PREVIEW_ONE));
    await waitFor(() => expect(result.current.state.status).toBe("playing"));
    const audio = playedElements[0]!;
    pauseSpy.mockClear();
    unmount();
    expect(pauseSpy).toHaveBeenCalled();
    expect(audio.hasAttribute("src")).toBe(false);
    expect(loadSpy).toHaveBeenCalled();
  });
});
