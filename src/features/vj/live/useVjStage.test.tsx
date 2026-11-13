import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  VJ_CONTRACT_VERSION,
  VJ_LIMITS,
  type VjAttachSuccess,
  type VjLibraryChange,
  type VjScreenStatus,
  type VjStageCause,
  type VjStageRestore,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import type { VjDemoLockSeam } from "../demo/vjDemoHosting";
import type { VjDemoLibraryLookup } from "../demo/vjDemoStore";
import { VjDemoTransport } from "../demo/vjDemoTransport";
import type {
  VjAckFor,
  VjClientFrameName,
  VjClientPayload,
  VjScreenStatusPayload,
} from "../realtime/vjFrames";
import {
  VjSendError,
  type VjConnectionState,
  type VjTransport,
  type VjTransportOptions,
} from "../realtime/vjTransport";
import { vjErrorKeyOf } from "../vjErrors";
import { useVjStage, type VjStageAttach } from "./useVjStage";

type CapturedOptions = VjTransportOptions & { isDemoMode: boolean };

const harness = vi.hoisted(() => ({
  isDemoMode: false,
  factory: null as null | ((options: unknown) => unknown),
}));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: harness.isDemoMode }),
}));
vi.mock("../realtime/createVjTransport", () => ({
  createVjTransport: (options: unknown) => {
    if (harness.factory === null) throw new Error("no transport factory");
    return harness.factory(options);
  },
}));

const EPOCH_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const EPOCH_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const SCREEN_ID = "22222222-2222-4222-8222-22222222222a";
const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";

interface SentFrame {
  name: VjClientFrameName;
  payload: unknown;
}

interface FakeTransport extends VjTransport {
  options: CapturedOptions;
  sent: SentFrame[];
  statuses: VjScreenStatusPayload[];
  /** Answers for the next sends, in order; an Error rejects. */
  answers: unknown[];
  connectCount: number;
  isDisposed: boolean;
}

let fakeTransports: FakeTransport[] = [];

function createFakeTransport(options: CapturedOptions): FakeTransport {
  const fake: FakeTransport = {
    options,
    sent: [],
    statuses: [],
    answers: [],
    connectCount: 0,
    isDisposed: false,
    connect() {
      fake.connectCount += 1;
    },
    send<Name extends VjClientFrameName>(
      name: Name,
      payload: VjClientPayload<Name>,
    ): Promise<VjAckFor<Name>> {
      fake.sent.push({ name, payload });
      const answer = fake.answers.shift() ?? {
        ok: true,
        serverNow: 0,
        revision: fake.sent.length,
        isNoop: false,
        applyAt: null,
      };
      return answer instanceof Error
        ? Promise.reject(answer)
        : Promise.resolve(answer as VjAckFor<Name>);
    },
    sendScreenStatus(payload) {
      fake.statuses.push(payload);
    },
    dispose() {
      fake.isDisposed = true;
    },
  };
  fakeTransports.push(fake);
  return fake;
}

function lastTransport(): FakeTransport {
  const transport = fakeTransports.at(-1);
  if (transport === undefined) throw new Error("no transport built");
  return transport;
}

function stateAt(
  stageEpoch: string,
  revision: number,
  overrides: Partial<VjStageState> = {},
): VjStageState {
  return { ...createVjStageState(stageEpoch, 0), revision, ...overrides };
}

function attachSuccess(overrides: Partial<VjAttachSuccess> = {}) {
  return {
    role: "remote" as const,
    connectionExpiresAt: 0,
    stageEpoch: EPOCH_A,
    isRestored: false,
    isLead: null,
    screenNumber: null,
    ...overrides,
  };
}

function reportConnection(transport: FakeTransport, next: VjConnectionState) {
  act(() => transport.options.onConnection(next));
}

function attachTransport(
  transport: FakeTransport,
  overrides: Partial<VjAttachSuccess> = {},
) {
  reportConnection(transport, {
    status: "attached",
    refusal: null,
    attach: attachSuccess(overrides),
  });
}

function pushState(
  transport: FakeTransport,
  state: VjStageState,
  cause: VjStageCause = "command",
  sourceClientId: string | null = null,
) {
  act(() =>
    transport.options.onFrame({
      event: "stage:state",
      payload: { state, cause, sourceClientId, applyAt: null },
    }),
  );
}

function screenStatus(number: number, isLead: boolean): VjScreenStatus {
  return {
    screenId: `33333333-3333-4333-8333-33333333333${number}`,
    number,
    isConnected: true,
    isLead,
    isFullscreen: false,
    connectedAt: 1_000 + number,
    lastSeenAt: 2_000,
    preload: { packId: null, clips: [] },
    health: null,
    nextClipId: null,
    mic: null,
  };
}

function renderRemote() {
  return renderHook(() => useVjStage({ role: "remote" }));
}

beforeEach(() => {
  fakeTransports = [];
  harness.isDemoMode = false;
  harness.factory = (options) =>
    createFakeTransport(options as CapturedOptions);
});

describe("useVjStage commands over a fake transport", () => {
  it("attaches as a remote and applies the first state", () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    expect(transport.options.role).toBe("remote");
    expect(transport.options.isDemoMode).toBe(false);
    expect(transport.connectCount).toBe(1);
    expect(transport.options.buildAttachPayload()).toEqual({
      role: "remote",
      contractVersion: VJ_CONTRACT_VERSION,
    });
    expect(result.current.isConnected).toBe(false);
    expect(result.current.state).toBeNull();

    attachTransport(transport);
    const first = stateAt(EPOCH_A, 0);
    pushState(transport, first, "attach");

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connection.attach?.stageEpoch).toBe(EPOCH_A);
    expect(result.current.state).toEqual(first);
    expect(result.current.lastCause).toBe("attach");
    expect(result.current.lastSourceClientId).toBeNull();
  });

  it("stamps every command with this page's clientId and a rising commandSequence", async () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);

    await act(async () => {
      await result.current.commands.setPack(PACK_WARM);
      await result.current.commands.goClip(CLIP_GRID);
      await result.current.commands.setOverlay({
        text: "hello",
        isVisible: true,
      });
    });

    const clientId = result.current.clientId;
    expect(clientId).toMatch(/^[0-9a-f-]{36}$/);
    expect(transport.sent.map((frame) => frame.name)).toEqual([
      "stage:setPack",
      "stage:goClip",
      "stage:setOverlay",
    ]);
    expect(transport.sent.map((frame) => frame.payload)).toEqual([
      { packId: PACK_WARM, clientId, commandSequence: 1 },
      { clipId: CLIP_GRID, clientId, commandSequence: 2 },
      { text: "hello", isVisible: true, clientId, commandSequence: 3 },
    ]);
  });

  it("sends only the fields a patch sets", async () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);

    await act(async () => {
      await result.current.commands.setShuffle({
        isOn: true,
        intervalValue: undefined,
      });
    });

    expect(transport.sent[0]?.payload).toEqual({
      isOn: true,
      clientId: result.current.clientId,
      commandSequence: 1,
    });
    expect(Object.keys(transport.sent[0]?.payload as object)).not.toContain(
      "intervalValue",
    );
  });

  it("numbers nothing while disconnected and answers offline", async () => {
    const { result } = renderRemote();
    const transport = lastTransport();

    let outcome = await result.current.commands.setPack(PACK_WARM);
    expect(outcome).toMatchObject({ ok: false, code: "offline" });
    expect(outcome.ok === false && outcome.errorKey).toMatch(/^vj:failure\./);
    expect(transport.sent).toHaveLength(0);

    attachTransport(transport);
    await act(async () => {
      await result.current.commands.goClip(CLIP_GRID);
    });
    expect(transport.sent[0]?.payload).toMatchObject({ commandSequence: 1 });

    reportConnection(transport, {
      status: "reconnecting",
      refusal: null,
      attach: null,
    });
    outcome = await result.current.commands.setEffects({ isBlackout: true });
    expect(outcome).toMatchObject({ ok: false, code: "offline" });
    expect(transport.sent).toHaveLength(1);

    attachTransport(transport);
    await act(async () => {
      await result.current.commands.setStrobe(true);
    });
    expect(transport.sent).toHaveLength(2);
    expect(transport.sent[1]?.payload).toEqual({
      isStrobing: true,
      clientId: result.current.clientId,
      commandSequence: 2,
    });
  });

  it("answers timeout when no ack comes back", async () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);
    transport.answers.push(new VjSendError("stage:goClip", "timeout"));

    const outcome = await result.current.commands.goClip(CLIP_GRID);

    expect(outcome).toEqual({
      ok: false,
      code: "timeout",
      errorKey: "vj:failure.timeout",
    });
  });
});

describe("useVjStage frames over a fake transport", () => {
  it("drops a stale frame and adopts a new stage epoch", () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);

    pushState(transport, stateAt(EPOCH_A, 3, { liveClipId: CLIP_GRID }));
    pushState(transport, stateAt(EPOCH_A, 2, { liveClipId: CLIP_HAZE }));
    expect(result.current.state?.revision).toBe(3);
    expect(result.current.state?.liveClipId).toBe(CLIP_GRID);

    pushState(transport, stateAt(EPOCH_A, 3, { liveClipId: CLIP_HAZE }));
    expect(result.current.state?.liveClipId).toBe(CLIP_GRID);

    pushState(transport, stateAt(EPOCH_B, 0, { liveClipId: null }), "attach");
    expect(result.current.state?.stageEpoch).toBe(EPOCH_B);
    expect(result.current.state?.revision).toBe(0);
    expect(result.current.state?.liveClipId).toBeNull();
    expect(result.current.lastCause).toBe("attach");

    pushState(transport, stateAt(EPOCH_B, 1, { liveClipId: CLIP_HAZE }));
    expect(result.current.state?.liveClipId).toBe(CLIP_HAZE);
  });

  it("snaps to the state a stale ack carries", async () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);
    pushState(transport, stateAt(EPOCH_A, 2));
    const newer = stateAt(EPOCH_A, 5, { liveClipId: CLIP_HAZE });
    transport.answers.push({
      ok: false,
      code: "vj_stale_command",
      message: "stale",
      state: newer,
      serverNow: 0,
    });

    let outcome = await act(() => result.current.commands.goClip(CLIP_GRID));

    expect(outcome).toEqual({
      ok: false,
      code: "vj_stale_command",
      errorKey: null,
    });
    // The ack's state is held for the frame of its revision; none comes here,
    // so it applies once the shortest quantize lead passes.
    expect(result.current.latestState).toEqual(newer);
    expect(result.current.state?.revision).toBe(2);
    await waitFor(() => {
      expect(result.current.state).toEqual(newer);
    });
    expect(result.current.lastCause).toBeNull();

    transport.answers.push({
      ok: false,
      code: "vj_stale_command",
      message: "stale",
      state: stateAt(EPOCH_A, 4),
      serverNow: 0,
    });
    outcome = await act(() => result.current.commands.goClip(CLIP_GRID));
    expect(outcome).toMatchObject({ ok: false, errorKey: null });
    expect(result.current.state?.revision).toBe(5);
  });

  it("names a refused command", async () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);
    pushState(transport, stateAt(EPOCH_A, 1));
    const ack = {
      ok: false,
      code: "vj_overlay_text_too_long",
      message: "too long",
      serverNow: 0,
    };
    transport.answers.push(ack);

    const outcome = await act(() =>
      result.current.commands.setOverlay({ text: "x".repeat(81) }),
    );

    expect(outcome).toEqual({
      ok: false,
      code: "vj_overlay_text_too_long",
      errorKey: vjErrorKeyOf(ack),
      // The refusal carries the limit its copy names.
      errorValues: { max: VJ_LIMITS.overlayTextMax },
    });
    expect(outcome.ok === false && outcome.errorKey).toBe(
      "vj:error.socket.overlayTextTooLong",
    );
    expect(result.current.state?.revision).toBe(1);
  });
});

describe("useVjStage screens over a fake transport", () => {
  it("attaches a screen with its restore state at every connect", () => {
    const firstRestore: VjStageRestore = stateAt(EPOCH_A, 4);
    const secondRestore: VjStageRestore = stateAt(EPOCH_A, 7);
    const getRestoreState = vi
      .fn<() => VjStageRestore | null>()
      .mockReturnValueOnce(firstRestore)
      .mockReturnValueOnce(secondRestore);
    const { rerender } = renderHook(
      (attach: VjStageAttach) => useVjStage(attach),
      {
        initialProps: { role: "screen", screenId: SCREEN_ID, getRestoreState },
      },
    );
    const transport = lastTransport();
    expect(transport.options.role).toBe("screen");

    expect(transport.options.buildAttachPayload()).toEqual({
      role: "screen",
      contractVersion: VJ_CONTRACT_VERSION,
      screenId: SCREEN_ID,
      restoreState: firstRestore,
    });
    expect(transport.options.buildAttachPayload()).toEqual({
      role: "screen",
      contractVersion: VJ_CONTRACT_VERSION,
      screenId: SCREEN_ID,
      restoreState: secondRestore,
    });
    expect(getRestoreState).toHaveBeenCalledTimes(2);

    const latestRestore = vi.fn(() => null);
    rerender({
      role: "screen",
      screenId: SCREEN_ID,
      getRestoreState: latestRestore,
    });
    expect(fakeTransports).toHaveLength(1);
    expect(transport.options.buildAttachPayload()).toEqual({
      role: "screen",
      contractVersion: VJ_CONTRACT_VERSION,
      screenId: SCREEN_ID,
      restoreState: null,
    });
    expect(latestRestore).toHaveBeenCalledTimes(1);
  });

  it("follows the lead flag from the attach ack and screen:role", () => {
    const { result } = renderHook(() =>
      useVjStage({
        role: "screen",
        screenId: SCREEN_ID,
        getRestoreState: () => null,
      }),
    );
    const transport = lastTransport();
    expect(result.current.isLead).toBe(false);

    attachTransport(transport, { role: "screen", isLead: true });
    expect(result.current.isLead).toBe(true);

    act(() =>
      transport.options.onFrame({
        event: "screen:role",
        payload: { isLead: false },
      }),
    );
    expect(result.current.isLead).toBe(false);

    act(() =>
      transport.options.onFrame({
        event: "screen:role",
        payload: { isLead: true },
      }),
    );
    expect(result.current.isLead).toBe(true);

    attachTransport(transport, { role: "screen", isLead: false });
    expect(result.current.isLead).toBe(false);
  });

  it("keeps the screen list from screens:update", () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);
    expect(result.current.screens).toEqual([]);

    const screens = [screenStatus(1, true), screenStatus(2, false)];
    act(() =>
      transport.options.onFrame({
        event: "screens:update",
        payload: { screens },
      }),
    );
    expect(result.current.screens).toEqual(screens);

    act(() =>
      transport.options.onFrame({
        event: "screens:update",
        payload: { screens: [screenStatus(2, true)] },
      }),
    );
    expect(result.current.screens.map((screen) => screen.number)).toEqual([2]);
  });
});

describe("useVjStage library, status and lifetime over a fake transport", () => {
  it("passes library changes to subscribers", () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);
    const firstListener = vi.fn();
    const secondListener = vi.fn();
    const unsubscribeFirst = result.current.subscribeLibrary(firstListener);
    result.current.subscribeLibrary(secondListener);
    const change: VjLibraryChange = {
      kind: "clip_deleted",
      packId: null,
      clipId: CLIP_GRID,
      packIds: [PACK_WARM],
      sceneId: null,
      setlistId: null,
      setlistIds: [],
      eventId: null,
    };

    act(() =>
      transport.options.onFrame({ event: "library:changed", payload: change }),
    );
    expect(firstListener).toHaveBeenCalledWith(change);
    expect(secondListener).toHaveBeenCalledWith(change);

    unsubscribeFirst();
    act(() =>
      transport.options.onFrame({ event: "library:changed", payload: change }),
    );
    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).toHaveBeenCalledTimes(2);
  });

  it("forwards screen status only while attached", () => {
    const { result } = renderHook(() =>
      useVjStage({
        role: "screen",
        screenId: SCREEN_ID,
        getRestoreState: () => null,
      }),
    );
    const transport = lastTransport();
    const status = {
      isFullscreen: true,
      preload: { packId: PACK_WARM, clips: [] },
    };

    result.current.sendStatus(status);
    expect(transport.statuses).toHaveLength(0);

    attachTransport(transport, { role: "screen", isLead: true });
    result.current.sendStatus(status);
    expect(transport.statuses).toEqual([status]);
  });

  it("sends the lead's shuffle report with the clip sequence it holds", async () => {
    const { result } = renderHook(() =>
      useVjStage({
        role: "screen",
        screenId: SCREEN_ID,
        getRestoreState: () => null,
      }),
    );
    const transport = lastTransport();
    attachTransport(transport, { role: "screen", isLead: true });
    pushState(transport, stateAt(EPOCH_A, 3, { clipSequence: 2 }));
    const snapped = stateAt(EPOCH_A, 4, { clipSequence: 3 });
    transport.answers.push({
      ok: false,
      code: "vj_stale_clip_sequence",
      message: "stale",
      state: snapped,
      serverNow: 0,
    });

    const outcome = await act(() => result.current.advance(2, CLIP_HAZE));

    expect(transport.sent).toEqual([
      {
        name: "screen:advance",
        payload: { expectedClipSequence: 2, clipId: CLIP_HAZE },
      },
    ]);
    expect(outcome).toEqual({
      ok: false,
      code: "vj_stale_clip_sequence",
      errorKey: null,
    });
    // The ack's state is held for the frame of its revision; none comes here,
    // so it applies once the shortest quantize lead passes.
    expect(result.current.latestState).toEqual(snapped);
    await waitFor(() => {
      expect(result.current.state).toEqual(snapped);
    });
  });

  it("reports the transport's refusal", async () => {
    const { result } = renderHook(() =>
      useVjStage({
        role: "screen",
        screenId: SCREEN_ID,
        getRestoreState: () => null,
      }),
    );
    const transport = lastTransport();
    attachTransport(transport, { role: "screen", isLead: true });

    reportConnection(transport, {
      status: "refused",
      refusal: "not_admin",
      attach: null,
    });
    expect(result.current.refusal).toBe("not_admin");
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isLead).toBe(false);
    expect(await result.current.commands.setPack(PACK_WARM)).toMatchObject({
      ok: false,
      code: "offline",
    });

    reportConnection(transport, {
      status: "refused",
      refusal: "screen_replaced",
      attach: null,
    });
    expect(result.current.refusal).toBe("screen_replaced");
    expect(await result.current.advance(1, CLIP_GRID)).toMatchObject({
      ok: false,
      code: "offline",
    });
    result.current.sendStatus({
      isFullscreen: false,
      preload: { packId: null, clips: [] },
    });
    expect(transport.sent).toHaveLength(0);
    expect(transport.statuses).toHaveLength(0);
  });

  it("disposes the transport on unmount and ignores its late callbacks", () => {
    const { result, unmount } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);
    pushState(transport, stateAt(EPOCH_A, 1));

    unmount();

    expect(transport.isDisposed).toBe(true);
    expect(() =>
      transport.options.onFrame({
        event: "stage:state",
        payload: {
          state: stateAt(EPOCH_A, 2),
          cause: "command",
          sourceClientId: null,
          applyAt: null,
        },
      }),
    ).not.toThrow();
    expect(result.current.state?.revision).toBe(1);
  });
});

describe("useVjStage connection loss and transport swaps", () => {
  it("names the refusal when a command is sent while refused", async () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);

    reportConnection(transport, {
      status: "refused",
      refusal: "session_revoked",
      attach: null,
    });

    expect(await result.current.commands.goClip(CLIP_GRID)).toEqual({
      ok: false,
      code: "offline",
      errorKey: "vj:connection.refused.sessionRevoked",
    });
    expect(await result.current.advance(1, CLIP_GRID)).toEqual({
      ok: false,
      code: "offline",
      errorKey: "vj:connection.refused.sessionRevoked",
    });

    reportConnection(transport, {
      status: "reconnecting",
      refusal: null,
      attach: null,
    });
    const outcome = await result.current.commands.goClip(CLIP_GRID);
    expect(outcome.ok === false && outcome.errorKey).toMatch(/^vj:failure\./);
    expect(transport.sent).toHaveLength(0);
  });

  it("clears the screen list when the remote detaches", () => {
    const { result } = renderRemote();
    const transport = lastTransport();
    attachTransport(transport);
    act(() =>
      transport.options.onFrame({
        event: "screens:update",
        payload: { screens: [screenStatus(1, true)] },
      }),
    );
    expect(result.current.screens).toHaveLength(1);

    reportConnection(transport, {
      status: "reconnecting",
      refusal: null,
      attach: null,
    });
    expect(result.current.screens).toEqual([]);

    attachTransport(transport);
    expect(result.current.screens).toEqual([]);
    act(() =>
      transport.options.onFrame({
        event: "screens:update",
        payload: { screens: [screenStatus(2, true)] },
      }),
    );
    expect(result.current.screens.map((screen) => screen.number)).toEqual([2]);
  });

  it("starts a new transport with no connection, lead flag, screens or state", () => {
    const { result, rerender } = renderHook(() =>
      useVjStage({
        role: "screen",
        screenId: SCREEN_ID,
        getRestoreState: () => null,
      }),
    );
    const firstTransport = lastTransport();
    attachTransport(firstTransport, { role: "screen", isLead: true });
    act(() =>
      firstTransport.options.onFrame({
        event: "screens:update",
        payload: { screens: [screenStatus(1, true)] },
      }),
    );
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isLead).toBe(true);
    expect(result.current.screens).toHaveLength(1);
    pushState(firstTransport, stateAt(EPOCH_A, 2));
    expect(result.current.state?.revision).toBe(2);

    harness.isDemoMode = true;
    rerender();

    expect(fakeTransports).toHaveLength(2);
    expect(firstTransport.isDisposed).toBe(true);
    expect(result.current.connection.status).toBe("connecting");
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isLead).toBe(false);
    expect(result.current.screens).toEqual([]);
    expect(result.current.state).toBeNull();
    expect(result.current.latestState).toBeNull();
  });
});

const DEMO_CLIP_IDS: ReadonlySet<string> = new Set([CLIP_GRID, CLIP_HAZE]);

const demoLibrary: VjDemoLibraryLookup = {
  hasPack: (packId) => packId === PACK_WARM,
  hasClip: (clipId) => DEMO_CLIP_IDS.has(clipId),
  isClipInPack: (packId, clipId) =>
    packId === PACK_WARM && DEMO_CLIP_IDS.has(clipId),
  readPackForStage: (packId) =>
    packId === PACK_WARM ? { eventId: null } : null,
  existingClipIds: (clipIds) =>
    new Set(clipIds.filter((clipId) => DEMO_CLIP_IDS.has(clipId))),
  clipIdsInPack: (packId, clipIds) =>
    new Set(
      packId === PACK_WARM
        ? clipIds.filter((clipId) => DEMO_CLIP_IDS.has(clipId))
        : [],
    ),
  readPackClipForAdvance: (packId, clipId) =>
    packId === PACK_WARM && DEMO_CLIP_IDS.has(clipId)
      ? { isFavorite: false }
      : null,
  readSceneLook: () => null,
  readSetlist: () => null,
  readSetlistFollow: () => null,
};

/** A Web Lock stand-in: the first request hosts at once, later ones wait. */
function createGrantFirstLock(): VjDemoLockSeam {
  let isHeld = false;
  return {
    request(onGranted) {
      if (isHeld) return () => undefined;
      isHeld = true;
      onGranted();
      return () => {
        isHeld = false;
      };
    },
  };
}

async function flushDemo(milliseconds = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(milliseconds);
    for (let round = 0; round < 20; round += 1) await Promise.resolve();
  });
}

describe("useVjStage over the demo transport", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "Date",
      ],
    });
    const hub = createVjDemoChannelHub();
    const lock = createGrantFirstLock();
    let tabCount = 0;
    harness.isDemoMode = true;
    harness.factory = (options) => {
      const { isDemoMode, ...transportOptions } = options as CapturedOptions;
      expect(isDemoMode).toBe(true);
      tabCount += 1;
      return new VjDemoTransport({
        ...transportOptions,
        tabId: `demo-tab-${tabCount}`,
        channelFactory: () => hub.open(),
        lock,
        library: demoLibrary,
      });
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("works the same over the demo transport", async () => {
    const screen = renderHook(() =>
      useVjStage({
        role: "screen",
        screenId: SCREEN_ID,
        getRestoreState: () => null,
      }),
    );
    const remote = renderHook(() => useVjStage({ role: "remote" }));
    await flushDemo(1_000);

    expect(screen.result.current.isDemo).toBe(true);
    expect(screen.result.current.isConnected).toBe(true);
    expect(remote.result.current.isConnected).toBe(true);
    expect(screen.result.current.isLead).toBe(true);
    expect(screen.result.current.state).not.toBeNull();
    expect(remote.result.current.state?.stageEpoch).toBe(
      screen.result.current.state?.stageEpoch,
    );
    await flushDemo(500);
    expect(remote.result.current.screens).toHaveLength(1);
    expect(remote.result.current.screens[0]?.screenId).toBe(SCREEN_ID);

    let outcome = await act(() =>
      remote.result.current.commands.goClip(CLIP_GRID),
    );
    await flushDemo();

    expect(outcome).toMatchObject({ ok: true, isNoop: false });
    expect(screen.result.current.state?.liveClipId).toBe(CLIP_GRID);
    expect(screen.result.current.state?.revision).toBe(
      remote.result.current.state?.revision,
    );
    expect(screen.result.current.lastCause).toBe("command");
    expect(screen.result.current.lastSourceClientId).toBe(
      remote.result.current.clientId,
    );

    const clipSequence = screen.result.current.state?.clipSequence ?? 0;
    outcome = await act(() =>
      screen.result.current.advance(clipSequence, CLIP_HAZE),
    );
    expect(outcome).toMatchObject({ ok: false, code: "vj_shuffle_off" });
    expect(outcome.ok === false && outcome.errorKey).toBe(
      "vj:error.socket.shuffleOff",
    );

    screen.unmount();
    remote.unmount();
  });
});
