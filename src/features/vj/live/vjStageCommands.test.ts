import { describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  VJ_LIMITS,
  type VjSocketErrorCode,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { createVjCommandStamper } from "../realtime/vjCommandStamp";
import type { VjClientFrameName } from "../realtime/vjFrames";
import { VjSendError, type VjTransport } from "../realtime/vjTransport";
import { VJ_FAILURE_KEY, VJ_SOCKET_REASON_KEY } from "../vjErrors";
import { createVjStageCommands, type VjStageCommands } from "./vjStageCommands";

const EPOCH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CLIENT_ID = "11111111-1111-4111-8111-111111111111";
const SCREEN_ID = "22222222-2222-4222-8222-22222222222a";
const PACK_ID = "00000000-0000-4000-8000-0000000000a1";
const CLIP_ID = "00000000-0000-4000-8000-0000000000c1";
const SCENE_ID = "00000000-0000-4000-8000-0000000000e1";
const SETLIST_ID = "00000000-0000-4000-8000-0000000000f1";

interface SentFrame {
  name: VjClientFrameName;
  payload: Record<string, unknown>;
}

const OK_ACK = {
  ok: true,
  serverNow: 5_000,
  revision: 7,
  isNoop: false,
  applyAt: 5_250,
};

interface Harness {
  commands: VjStageCommands;
  sent: SentFrame[];
  answers: unknown[];
  appliedStates: VjStageState[];
  setAttached: (isAttached: boolean) => void;
}

/** A fake transport that records every send and answers from `answers` in
 *  order (an Error rejects); with no answer queued it answers OK_ACK. */
function createHarness(): Harness {
  const sent: SentFrame[] = [];
  const answers: unknown[] = [];
  const appliedStates: VjStageState[] = [];
  let isAttached = true;
  const transport: Pick<VjTransport, "send"> = {
    send: ((name: VjClientFrameName, payload: Record<string, unknown>) => {
      sent.push({ name, payload });
      const answer = answers.shift() ?? OK_ACK;
      return answer instanceof Error
        ? Promise.reject(answer)
        : Promise.resolve(answer);
    }) as VjTransport["send"],
  };
  const commands = createVjStageCommands(
    transport,
    createVjCommandStamper(() => CLIENT_ID),
    (state) => appliedStates.push(state),
    () => isAttached,
  );
  return {
    commands,
    sent,
    answers,
    appliedStates,
    setAttached: (nextIsAttached) => {
      isAttached = nextIsAttached;
    },
  };
}

function failedAck(code: VjSocketErrorCode, state?: VjStageState) {
  return {
    ok: false,
    code,
    message: code,
    serverNow: 5_000,
    ...(state === undefined ? {} : { state }),
  };
}

interface CommandCase {
  name: VjClientFrameName;
  call: (commands: VjStageCommands) => Promise<unknown>;
  fields: Record<string, unknown>;
}

const COMMAND_CASES: CommandCase[] = [
  {
    name: "stage:setPack",
    call: (commands) => commands.setPack(PACK_ID),
    fields: { packId: PACK_ID },
  },
  {
    name: "stage:goClip",
    call: (commands) => commands.goClip(CLIP_ID),
    fields: { clipId: CLIP_ID },
  },
  {
    name: "stage:goGenerator",
    call: (commands) => commands.goGenerator("plasma"),
    fields: { generatorId: "plasma" },
  },
  {
    name: "stage:setTransition",
    call: (commands) =>
      commands.setTransition({ mode: "cut", length: undefined }),
    fields: { mode: "cut" },
  },
  {
    name: "stage:setOverlay",
    call: (commands) =>
      commands.setOverlay({ isVisible: true, hideAfterMs: null }),
    fields: { isVisible: true, hideAfterMs: null },
  },
  {
    name: "stage:setEffects",
    call: (commands) =>
      commands.setEffects({ speed: 2, isBlackout: undefined }),
    fields: { speed: 2 },
  },
  {
    name: "stage:setStrobe",
    call: (commands) => commands.setStrobe(true),
    fields: { isStrobing: true },
  },
  {
    name: "stage:setShuffle",
    call: (commands) => commands.setShuffle({ isOn: true, source: undefined }),
    fields: { isOn: true },
  },
  {
    name: "stage:setTempo",
    call: (commands) => commands.setTempo({ bpm: 128, quantize: "bar" }),
    fields: { bpm: 128, quantize: "bar" },
  },
  {
    name: "stage:setMix",
    call: (commands) => commands.setMix({ clipId: null, amount: undefined }),
    fields: { clipId: null },
  },
  {
    name: "stage:swapMix",
    call: (commands) => commands.swapMix(),
    fields: {},
  },
  {
    name: "stage:setScreenOverride",
    call: (commands) => commands.setScreenOverride(SCREEN_ID, null),
    fields: { screenId: SCREEN_ID, override: null },
  },
  {
    name: "stage:resetLook",
    call: (commands) => commands.resetLook(),
    fields: {},
  },
  {
    name: "stage:recallScene",
    call: (commands) => commands.recallScene(SCENE_ID),
    fields: { sceneId: SCENE_ID },
  },
  {
    name: "stage:setlistSelect",
    call: (commands) => commands.setlistSelect(SETLIST_ID, null),
    fields: { setlistId: SETLIST_ID, index: null },
  },
  {
    name: "stage:setlistNext",
    call: (commands) => commands.setlistNext(),
    fields: {},
  },
  {
    name: "stage:setlistPrevious",
    call: (commands) => commands.setlistPrevious(),
    fields: {},
  },
  {
    name: "stage:setlistSetPlaying",
    call: (commands) => commands.setlistSetPlaying(true),
    fields: { isPlaying: true },
  },
  {
    name: "stage:setlistSetLooping",
    call: (commands) => commands.setlistSetLooping(false),
    fields: { isLooping: false },
  },
  {
    name: "stage:setCountdown",
    call: (commands) =>
      commands.setCountdown({ isVisible: true, durationMs: 60_000 }),
    fields: { isVisible: true, durationMs: 60_000 },
  },
  {
    name: "stage:setLogo",
    call: (commands) => commands.setLogo({ corner: "topLeft" }),
    fields: { corner: "topLeft" },
  },
  {
    name: "stage:setEventCard",
    call: (commands) => commands.setEventCard({ isVisible: true, kind: "qr" }),
    fields: { isVisible: true, kind: "qr" },
  },
];

describe("createVjStageCommands", () => {
  it("covers the 22 stamped commands in the table", () => {
    expect(
      new Set(COMMAND_CASES.map((commandCase) => commandCase.name)).size,
    ).toBe(22);
  });

  it.each(COMMAND_CASES)(
    "every v2 command emits its frame with a stamp and only the fields it sets ($name)",
    async ({ name, call, fields }) => {
      const harness = createHarness();
      await call(harness.commands);
      expect(harness.sent).toEqual([
        {
          name,
          payload: { ...fields, clientId: CLIENT_ID, commandSequence: 1 },
        },
      ]);
    },
  );

  it("raises the command sequence by one per emitted command", async () => {
    const harness = createHarness();
    await harness.commands.swapMix();
    await harness.commands.setlistNext();
    expect(harness.sent.map((frame) => frame.payload.commandSequence)).toEqual([
      1, 2,
    ]);
  });

  it("setlistSelect sends isPlaying and isFlashConfirmed only when given", async () => {
    const harness = createHarness();
    await harness.commands.setlistSelect(SETLIST_ID, 2, {
      isPlaying: true,
      isFlashConfirmed: true,
    });
    await harness.commands.setlistSelect(SETLIST_ID, 0, { isPlaying: false });
    await harness.commands.setlistSelect(SETLIST_ID, null, {});
    expect(harness.sent.map((frame) => frame.payload)).toStrictEqual([
      {
        setlistId: SETLIST_ID,
        index: 2,
        isPlaying: true,
        isFlashConfirmed: true,
        clientId: CLIENT_ID,
        commandSequence: 1,
      },
      {
        setlistId: SETLIST_ID,
        index: 0,
        isPlaying: false,
        clientId: CLIENT_ID,
        commandSequence: 2,
      },
      {
        setlistId: SETLIST_ID,
        index: null,
        clientId: CLIENT_ID,
        commandSequence: 3,
      },
    ]);
    expect(harness.sent[2]?.payload).not.toHaveProperty("isPlaying");
    expect(harness.sent[2]?.payload).not.toHaveProperty("isFlashConfirmed");
    expect(harness.sent[1]?.payload).not.toHaveProperty("isFlashConfirmed");
  });

  it("setlistSetPlaying sends isFlashConfirmed only when given", async () => {
    const harness = createHarness();
    await harness.commands.setlistSetPlaying(true, true);
    await harness.commands.setlistSetPlaying(false);
    expect(harness.sent.map((frame) => frame.payload)).toStrictEqual([
      {
        isPlaying: true,
        isFlashConfirmed: true,
        clientId: CLIENT_ID,
        commandSequence: 1,
      },
      { isPlaying: false, clientId: CLIENT_ID, commandSequence: 2 },
    ]);
    expect(harness.sent[1]?.payload).not.toHaveProperty("isFlashConfirmed");
  });

  it("setlistNext and setlistPrevious send isFlashConfirmed only when given", async () => {
    const harness = createHarness();
    await harness.commands.setlistNext({ isFlashConfirmed: true });
    await harness.commands.setlistPrevious({ isFlashConfirmed: false });
    await harness.commands.setlistNext({});
    await harness.commands.setlistPrevious();
    expect(harness.sent).toStrictEqual([
      {
        name: "stage:setlistNext",
        payload: {
          isFlashConfirmed: true,
          clientId: CLIENT_ID,
          commandSequence: 1,
        },
      },
      {
        name: "stage:setlistPrevious",
        payload: {
          isFlashConfirmed: false,
          clientId: CLIENT_ID,
          commandSequence: 2,
        },
      },
      {
        name: "stage:setlistNext",
        payload: { clientId: CLIENT_ID, commandSequence: 3 },
      },
      {
        name: "stage:setlistPrevious",
        payload: { clientId: CLIENT_ID, commandSequence: 4 },
      },
    ]);
    expect(harness.sent[2]?.payload).not.toHaveProperty("isFlashConfirmed");
    expect(harness.sent[3]?.payload).not.toHaveProperty("isFlashConfirmed");
  });

  it("setlistSetLooping sends isLooping and the stamp only", async () => {
    const harness = createHarness();
    await harness.commands.setlistSetLooping(true);
    expect(harness.sent).toStrictEqual([
      {
        name: "stage:setlistSetLooping",
        payload: { isLooping: true, clientId: CLIENT_ID, commandSequence: 1 },
      },
    ]);
  });

  it("goGenerator sends the variant only when given", async () => {
    const harness = createHarness();
    await harness.commands.goGenerator("prideFlagWave", "trans");
    await harness.commands.goGenerator(null, null);
    expect(harness.sent[0]?.payload).toMatchObject({
      generatorId: "prideFlagWave",
      variant: "trans",
    });
    expect(harness.sent[1]?.payload).toMatchObject({
      generatorId: null,
      variant: null,
    });
  });

  it("setEffects strips undefined inside settings and keeps null resets", async () => {
    const harness = createHarness();
    await harness.commands.setEffects({
      speed: undefined,
      settings: {
        invert: { isOn: true, amount: undefined, variant: "beat" },
        monochrome: null,
        saturate: undefined,
      },
    });
    const payload = harness.sent[0]?.payload;
    expect(payload).toEqual({
      settings: {
        invert: { isOn: true, variant: "beat" },
        monochrome: null,
      },
      clientId: CLIENT_ID,
      commandSequence: 1,
    });
    expect(Object.keys(payload ?? {})).not.toContain("speed");
  });

  it("setEffects sends isImmediate on a blackout-only patch and drops it on any other patch", async () => {
    const harness = createHarness();
    await harness.commands.setEffects({ isBlackout: true, isImmediate: true });
    await harness.commands.setEffects({
      isBlackout: true,
      speed: 2,
      isImmediate: true,
    });
    expect(harness.sent[0]?.payload).toMatchObject({
      isBlackout: true,
      isImmediate: true,
    });
    expect(Object.keys(harness.sent[1]?.payload ?? {})).not.toContain(
      "isImmediate",
    );
  });

  it("setStrobe and resetLook send isImmediate only when asked", async () => {
    const harness = createHarness();
    await harness.commands.setStrobe(false);
    await harness.commands.setStrobe(false, { isImmediate: true });
    await harness.commands.setStrobe(true, { isImmediate: true });
    await harness.commands.resetLook();
    await harness.commands.resetLook({ isImmediate: true });
    const payloads = harness.sent.map((frame) => frame.payload);
    expect(Object.keys(payloads[0] ?? {})).not.toContain("isImmediate");
    expect(payloads[1]).toMatchObject({ isStrobing: false, isImmediate: true });
    // The server lets only a stopping strobe skip the beat.
    expect(Object.keys(payloads[2] ?? {})).not.toContain("isImmediate");
    expect(Object.keys(payloads[3] ?? {})).not.toContain("isImmediate");
    expect(payloads[4]).toMatchObject({ isImmediate: true });
  });
});

describe("createVjStageCommands outcomes", () => {
  it("success carries applyAt", async () => {
    const harness = createHarness();
    harness.answers.push(OK_ACK, { ...OK_ACK, isNoop: true, applyAt: null });
    await expect(harness.commands.goClip(CLIP_ID)).resolves.toEqual({
      ok: true,
      revision: 7,
      isNoop: false,
      applyAt: 5_250,
    });
    await expect(harness.commands.goClip(CLIP_ID)).resolves.toEqual({
      ok: true,
      revision: 7,
      isNoop: true,
      applyAt: null,
    });
  });

  it("a refusal with a max carries errorValues", async () => {
    const harness = createHarness();
    harness.answers.push(failedAck("vj_effects_too_many"));
    await expect(
      harness.commands.setEffects({ settings: { invert: { isOn: true } } }),
    ).resolves.toEqual({
      ok: false,
      code: "vj_effects_too_many",
      errorKey: VJ_SOCKET_REASON_KEY.vj_effects_too_many,
      errorValues: { max: VJ_LIMITS.effectsOnMax },
    });
    expect(VJ_LIMITS.effectsOnMax).toBe(8);
  });

  it("a refusal without a number carries no errorValues", async () => {
    const harness = createHarness();
    harness.answers.push(failedAck("vj_immediate_not_allowed"));
    const outcome = await harness.commands.resetLook({ isImmediate: true });
    expect(outcome).toEqual({
      ok: false,
      code: "vj_immediate_not_allowed",
      errorKey: VJ_SOCKET_REASON_KEY.vj_immediate_not_allowed,
    });
  });

  it.each([
    "vj_clip_excluded",
    "vj_clip_not_favorite",
    "vj_stale_setlist",
  ] as const)(
    "the three new silent codes carry no errorKey and apply the ack state (%s)",
    async (code) => {
      const harness = createHarness();
      const ackState = createVjStageState(EPOCH, 1_000);
      harness.answers.push(failedAck(code, ackState));
      await expect(harness.commands.setlistNext()).resolves.toEqual({
        ok: false,
        code,
        errorKey: null,
      });
      expect(harness.appliedStates).toEqual([ackState]);
    },
  );

  it("maps a timeout and a dropped socket", async () => {
    const harness = createHarness();
    harness.answers.push(
      new VjSendError("stage:swapMix", "timeout"),
      new VjSendError("stage:swapMix", "disconnected"),
    );
    await expect(harness.commands.swapMix()).resolves.toEqual({
      ok: false,
      code: "timeout",
      errorKey: VJ_FAILURE_KEY.timeout,
    });
    await expect(harness.commands.swapMix()).resolves.toMatchObject({
      ok: false,
      code: "offline",
    });
  });

  it("takes no stamp while detached", async () => {
    const harness = createHarness();
    harness.setAttached(false);
    await expect(harness.commands.recallScene(SCENE_ID)).resolves.toMatchObject(
      {
        ok: false,
        code: "offline",
      },
    );
    harness.setAttached(true);
    await harness.commands.recallScene(SCENE_ID);
    expect(harness.sent).toHaveLength(1);
    expect(harness.sent[0]?.payload.commandSequence).toBe(1);
  });

  it("identifyScreen sends no stamp and answers identifiedCount", async () => {
    const harness = createHarness();
    harness.answers.push({ ok: true, serverNow: 5_000, identifiedCount: 3 });
    await expect(harness.commands.identifyScreen(null)).resolves.toEqual({
      ok: true,
      identifiedCount: 3,
    });
    expect(harness.sent).toEqual([
      { name: "screen:identify", payload: { screenId: null } },
    ]);
    // The next stamped command still starts the sequence at 1.
    await harness.commands.swapMix();
    expect(harness.sent[1]?.payload.commandSequence).toBe(1);
  });

  it("identifyScreen maps a refusal to its line", async () => {
    const harness = createHarness();
    harness.answers.push(failedAck("vj_screen_not_attached"));
    await expect(harness.commands.identifyScreen(SCREEN_ID)).resolves.toEqual({
      ok: false,
      code: "vj_screen_not_attached",
      errorKey: VJ_SOCKET_REASON_KEY.vj_screen_not_attached,
    });
  });

  it("setRenderMode sends no stamp and answers reachedCount", async () => {
    const harness = createHarness();
    harness.answers.push({ ok: true, serverNow: 5_000, reachedCount: 2 });
    await expect(harness.commands.setRenderMode("simple")).resolves.toEqual({
      ok: true,
      reachedCount: 2,
    });
    expect(harness.sent).toEqual([
      { name: "screens:setRenderMode", payload: { mode: "simple" } },
    ]);
    // The next stamped command still starts the sequence at 1.
    await harness.commands.swapMix();
    expect(harness.sent[1]?.payload.commandSequence).toBe(1);
  });

  it("setRenderMode names vj_no_screens_connected", async () => {
    const harness = createHarness();
    harness.answers.push(failedAck("vj_no_screens_connected"));
    await expect(harness.commands.setRenderMode("effects")).resolves.toEqual({
      ok: false,
      code: "vj_no_screens_connected",
      errorKey: VJ_SOCKET_REASON_KEY.vj_no_screens_connected,
    });
  });

  it("setRenderMode answers offline while detached", async () => {
    const harness = createHarness();
    harness.setAttached(false);
    await expect(
      harness.commands.setRenderMode("simple"),
    ).resolves.toMatchObject({
      ok: false,
      code: "offline",
    });
    expect(harness.sent).toHaveLength(0);
  });

  it("identifyScreen answers offline while detached", async () => {
    const harness = createHarness();
    harness.setAttached(false);
    await expect(
      harness.commands.identifyScreen(SCREEN_ID),
    ).resolves.toMatchObject({
      ok: false,
      code: "offline",
    });
    expect(harness.sent).toHaveLength(0);
  });
});

describe("createVjStageCommands with a refusal", () => {
  it("names the refusal in the offline outcome", async () => {
    const send = vi.fn();
    const commands = createVjStageCommands(
      { send } as Pick<VjTransport, "send">,
      createVjCommandStamper(() => CLIENT_ID),
      () => undefined,
      () => false,
      () => "client_outdated",
    );
    await expect(commands.swapMix()).resolves.toEqual({
      ok: false,
      code: "offline",
      errorKey: "vj:connection.refused.clientOutdated",
    });
    expect(send).not.toHaveBeenCalled();
  });
});
