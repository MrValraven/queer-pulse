import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  VJ_LIMITS,
  type VjSetlistRead,
  type VjSetlistReadPosition,
  type VjStageFrame,
} from "../../../shared/contracts/vj";
import { VJ_DEMO_HEARTBEAT_MS } from "../vj.constants";
import { createVjDemoChannelHub, type VjDemoMessage } from "./vjDemoChannel";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import { vjRefusal } from "./vjDemoRefusals";
import type { VjDemoSetlistLoopingWrite } from "./vjDemoSceneCommands";
import { startVjDemoServer, writeVjDemoSetlistLooping } from "./vjDemoServer";
import { demoUpdateVjSetlist } from "./vjDemoStoreSetlists";

vi.mock("./vjDemoStoreSetlists", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./vjDemoStoreSetlists")>();
  return { ...actual, demoUpdateVjSetlist: vi.fn() };
});

const emptyLibrary: VjDemoLibraryLookup = {
  hasPack: () => false,
  hasClip: () => false,
  isClipInPack: () => false,
  readPackForStage: () => null,
  existingClipIds: () => new Set(),
  clipIdsInPack: () => new Set(),
  readPackClipForAdvance: () => null,
  readSceneLook: () => null,
  readSetlist: () => null,
  readSetlistFollow: () => null,
};

/** The hub delivers on microtasks; a client post and the server's answer take two hops. */
async function flushChannel(): Promise<void> {
  for (let hop = 0; hop < 5; hop += 1) await Promise.resolve();
}

function clientAlive(): VjDemoMessage {
  return {
    direction: "toServer",
    name: "demo:clientAlive",
    payload: null,
    tabId: "client-tab",
  };
}

describe("startVjDemoServer heartbeat", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the heartbeat going from client traffic while its interval is throttled", async () => {
    const hub = createVjDemoChannelHub();
    const client = hub.open();
    const heartbeats: VjDemoMessage[] = [];
    client.subscribe((message) => {
      if (message.name === "demo:heartbeat") heartbeats.push(message);
    });
    let nowMs = 10_000;
    const server = startVjDemoServer({
      channel: hub.open(),
      library: emptyLibrary,
      now: () => nowMs,
      serverId: "server-a",
      newEpoch: () => "epoch-a",
    });
    await flushChannel();
    expect(heartbeats).toHaveLength(1);

    // The interval never fires here, as in a hidden tab throttled to once a minute.
    nowMs += VJ_DEMO_HEARTBEAT_MS - 1;
    client.post(clientAlive());
    await flushChannel();
    expect(heartbeats).toHaveLength(1);

    nowMs += 1;
    client.post(clientAlive());
    await flushChannel();
    expect(heartbeats).toHaveLength(2);
    expect(heartbeats[1]?.payload).toEqual({ serverId: "server-a" });

    client.post(clientAlive());
    await flushChannel();
    expect(heartbeats).toHaveLength(2);

    server.stop();
    nowMs += VJ_DEMO_HEARTBEAT_MS * 5;
    client.post(clientAlive());
    await flushChannel();
    expect(heartbeats).toHaveLength(2);
  });
});

describe("startVjDemoServer sequence step timer (sequences contract 10.4)", () => {
  const SETLIST_ID = "55555555-5555-4555-8555-5555555555b1";
  const CLIENT_ID = "11111111-1111-4111-8111-111111111111";
  const CLIP_ONE = "00000000-0000-4000-8000-0000000000c1";
  const CLIP_TWO = "00000000-0000-4000-8000-0000000000c2";
  const STEP_MS = 8_000;
  const START_MS = 100_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Two clip steps on 8 s; `isReadFailing` makes every read throw. */
  function sequenceLibrary(shelf: {
    isReadFailing: boolean;
  }): VjDemoLibraryLookup {
    const steps = [
      { itemId: "77777777-7777-4777-8777-7777777777a1", clipId: CLIP_ONE },
      { itemId: "77777777-7777-4777-8777-7777777777a2", clipId: CLIP_TWO },
    ];
    const readSetlist = (
      setlistId: string,
      position: VjSetlistReadPosition,
    ): VjSetlistRead | null => {
      if (shelf.isReadFailing) throw new Error("storage unavailable");
      if (setlistId !== SETLIST_ID) return null;
      const index =
        position.kind === "index" && position.index < steps.length
          ? position.index
          : null;
      const step = index === null ? undefined : steps[index];
      const duration = { kind: "seconds", value: STEP_MS / 1000 } as const;
      return {
        setlistId,
        isLooping: false,
        stepDuration: duration,
        itemIds: steps.map((entry) => entry.itemId),
        step:
          step === undefined || index === null
            ? null
            : {
                kind: "clip",
                itemId: step.itemId,
                index,
                clipId: step.clipId,
                duration,
              },
      };
    };
    return {
      ...emptyLibrary,
      readSetlist,
      readSetlistFollow: (setlistId) => {
        const read = readSetlist(setlistId, { kind: "count" });
        return read === null
          ? null
          : { itemIds: read.itemIds, isLooping: false };
      },
    };
  }

  function startWithRemote(
    library: VjDemoLibraryLookup,
    writeSetlistLooping?: VjDemoSetlistLoopingWrite,
  ) {
    const hub = createVjDemoChannelHub();
    const client = hub.open();
    const frames: VjStageFrame[] = [];
    const acks: unknown[] = [];
    client.subscribe((message) => {
      if (message.name === "stage:state")
        frames.push(message.payload as VjStageFrame);
      if (message.name === "ack") acks.push(message.payload);
    });
    const server = startVjDemoServer({
      channel: hub.open(),
      library,
      writeSetlistLooping,
      serverId: "server-a",
      newEpoch: () => "epoch-a",
    });
    let commandSequence = 0;
    const send = (name: string, payload: Record<string, unknown>) => {
      commandSequence += 1;
      client.post({
        direction: "toServer",
        name,
        payload: { ...payload, clientId: CLIENT_ID, commandSequence },
        tabId: "remote-tab",
        requestId: `request-${commandSequence}`,
      });
    };
    client.post({
      direction: "toServer",
      name: "vj:attach",
      payload: { role: "remote", contractVersion: 2 },
      tabId: "remote-tab",
      requestId: "attach",
    });
    return { server, frames, acks, send };
  }

  it("advances on its own at the step end with cause setlist, step after step", async () => {
    const { server, frames, send } = startWithRemote(
      sequenceLibrary({ isReadFailing: false }),
    );
    await flushChannel();
    send("stage:setlistSelect", {
      setlistId: SETLIST_ID,
      index: null,
      isPlaying: true,
    });
    await flushChannel();
    expect(frames.at(-1)?.state.setlistPlayback).toMatchObject({
      status: "playing",
      stepEndsAt: START_MS + STEP_MS,
    });

    await vi.advanceTimersByTimeAsync(
      STEP_MS - VJ_LIMITS.quantizedAdvanceEarlyMs,
    );
    await flushChannel();
    const advanced = frames.at(-1);
    expect(advanced).toMatchObject({
      cause: "setlist",
      applyAt: START_MS + STEP_MS,
    });
    expect(advanced?.state.liveClipId).toBe(CLIP_TWO);
    expect(advanced?.state.setlistPlayback.stepEndsAt).toBe(
      START_MS + 2 * STEP_MS,
    );

    await vi.advanceTimersByTimeAsync(STEP_MS);
    await flushChannel();
    expect(frames.at(-1)?.state.setlistPlayback).toMatchObject({
      status: "finished",
      stepEndsAt: null,
    });
    server.stop();
  });

  it("a read that throws holds the step and tries again after setlistTimerRetryMs", async () => {
    const shelf = { isReadFailing: false };
    const { server, frames, send } = startWithRemote(sequenceLibrary(shelf));
    await flushChannel();
    send("stage:setlistSelect", {
      setlistId: SETLIST_ID,
      index: null,
      isPlaying: true,
    });
    await flushChannel();
    const framesBeforeFire = frames.length;
    shelf.isReadFailing = true;

    await vi.advanceTimersByTimeAsync(
      STEP_MS - VJ_LIMITS.quantizedAdvanceEarlyMs,
    );
    await flushChannel();
    expect(frames).toHaveLength(framesBeforeFire);

    shelf.isReadFailing = false;
    await vi.advanceTimersByTimeAsync(VJ_LIMITS.setlistTimerRetryMs - 1);
    await flushChannel();
    expect(frames).toHaveLength(framesBeforeFire);
    await vi.advanceTimersByTimeAsync(1);
    await flushChannel();
    expect(frames.at(-1)).toMatchObject({ cause: "setlist" });
    expect(frames.at(-1)?.state.liveClipId).toBe(CLIP_TWO);
    server.stop();
  });

  it("Loop goes through the writer it was given, then lands", async () => {
    const writeSetlistLooping = vi.fn<VjDemoSetlistLoopingWrite>(() => null);
    const { server, frames, send } = startWithRemote(
      sequenceLibrary({ isReadFailing: false }),
      writeSetlistLooping,
    );
    await flushChannel();
    send("stage:setlistSelect", { setlistId: SETLIST_ID, index: 0 });
    await flushChannel();
    send("stage:setlistSetLooping", { isLooping: true });
    await flushChannel();
    expect(writeSetlistLooping).toHaveBeenCalledWith(SETLIST_ID, true);
    expect(frames.at(-1)?.state.setlistPlayback.isLooping).toBe(true);
    server.stop();
  });
});

describe("writeVjDemoSetlistLooping (sequences contract 5.6)", () => {
  const SETLIST_ID = "55555555-5555-4555-8555-5555555555b1";

  beforeEach(() => {
    vi.mocked(demoUpdateVjSetlist).mockReset();
  });

  it("saves Loop through the demo PATCH and answers null", () => {
    expect(writeVjDemoSetlistLooping(SETLIST_ID, true)).toBeNull();
    expect(vi.mocked(demoUpdateVjSetlist)).toHaveBeenCalledWith(SETLIST_ID, {
      isLooping: true,
    });
  });

  it("a missing set list answers vj_setlist_not_found", () => {
    vi.mocked(demoUpdateVjSetlist).mockImplementation(() => {
      throw vjRefusal("VJ_SETLIST_NOT_FOUND");
    });
    expect(writeVjDemoSetlistLooping(SETLIST_ID, false)).toBe(
      "vj_setlist_not_found",
    );
  });

  it("any other failure answers vj_server_error", () => {
    for (const failure of [
      vjRefusal("VJ_SETLIST_LOOP_INVALID"),
      new Error("storage full"),
    ]) {
      vi.mocked(demoUpdateVjSetlist).mockImplementation(() => {
        throw failure;
      });
      expect(writeVjDemoSetlistLooping(SETLIST_ID, true)).toBe(
        "vj_server_error",
      );
    }
  });
});
