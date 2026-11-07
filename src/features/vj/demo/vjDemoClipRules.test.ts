import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  VJ_REFUSAL_CODES,
  type VjRefusalCode,
} from "../../../shared/contracts/vj";
import {
  checkVjClipLoopPoints,
  readVjClipDefaultsPatch,
} from "./vjDemoClipRules";
import { VJ_DEMO_REFUSALS, vjRefusal } from "./vjDemoRefusals";
import {
  isVjUuidList,
  normalizeVjSceneName,
  normalizeVjSetlistName,
  normalizeVjSetlistSceneIds,
} from "./vjDemoRules";

const SCENE_ID = "00000000-0000-4000-8000-0000000000d1";
const OTHER_SCENE_ID = "00000000-0000-4000-8000-0000000000d2";
const SETLIST_ID = "00000000-0000-4000-8000-0000000000e1";
const VIDEO_CLIP = { mediaKind: "video" as const, durationMs: 8000 };
const GIF_CLIP = { mediaKind: "gif" as const, durationMs: null };

interface RefusalBody {
  statusCode: number;
  message: string;
  code: VjRefusalCode;
  [extra: string]: unknown;
}

/** Runs a check that must refuse and answers the refusal's body. */
function refusalOf(run: () => unknown): RefusalBody {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    return (error as ApiError).data as RefusalBody;
  }
  throw new Error("expected a refusal");
}

describe("readVjClipDefaultsPatch", () => {
  it("refuses a favorite that is not a boolean before every later field", () => {
    const body = refusalOf(() =>
      readVjClipDefaultsPatch({
        isFavorite: "yes",
        defaultSpeed: 3.75,
        loopMode: "bounce",
        loopInMs: -1,
      }),
    );
    expect(body.code).toBe("VJ_CLIP_FAVORITE_INVALID");
    expect(body.statusCode).toBe(400);
  });

  it("refuses a speed outside the list before the loop mode", () => {
    expect(
      refusalOf(() =>
        readVjClipDefaultsPatch({ defaultSpeed: 3.75, loopMode: "bounce" }),
      ).code,
    ).toBe("VJ_CLIP_SPEED_INVALID");
    expect(
      refusalOf(() => readVjClipDefaultsPatch({ defaultSpeed: "1" })).code,
    ).toBe("VJ_CLIP_SPEED_INVALID");
  });

  it("refuses an unknown loop mode before the loop points", () => {
    expect(
      refusalOf(() =>
        readVjClipDefaultsPatch({ loopMode: "bounce", loopInMs: 1.5 }),
      ).code,
    ).toBe("VJ_CLIP_LOOP_MODE_INVALID");
  });

  it("refuses a loop point that is no safe integer of at least 0", () => {
    for (const loopPoint of [1.5, -1, "100", Number.MAX_SAFE_INTEGER + 1]) {
      expect(
        refusalOf(() => readVjClipDefaultsPatch({ loopInMs: loopPoint })).code,
      ).toBe("VJ_CLIP_LOOP_INVALID");
      expect(
        refusalOf(() => readVjClipDefaultsPatch({ loopOutMs: loopPoint })).code,
      ).toBe("VJ_CLIP_LOOP_INVALID");
    }
  });

  it("reads present fields and leaves absent ones out", () => {
    expect(
      readVjClipDefaultsPatch({
        isFavorite: true,
        defaultSpeed: 0.25,
        loopMode: "pingPong",
        loopInMs: null,
        loopOutMs: 4000,
      }),
    ).toEqual({
      isFavorite: true,
      defaultSpeed: 0.25,
      loopMode: "pingPong",
      loopInMs: null,
      loopOutMs: 4000,
    });
    expect(readVjClipDefaultsPatch({ title: "Neon grid" })).toEqual({});
  });
});

describe("checkVjClipLoopPoints", () => {
  it("refuses a GIF with a loop point", () => {
    expect(refusalOf(() => checkVjClipLoopPoints(GIF_CLIP, 0, null)).code).toBe(
      "VJ_CLIP_LOOP_INVALID",
    );
  });

  it("refuses a video without a duration once a point is set", () => {
    expect(
      refusalOf(() =>
        checkVjClipLoopPoints(
          { mediaKind: "video", durationMs: null },
          null,
          4000,
        ),
      ).code,
    ).toBe("VJ_CLIP_LOOP_INVALID");
  });

  it("refuses a span under 250 ms", () => {
    expect(
      refusalOf(() => checkVjClipLoopPoints(VIDEO_CLIP, 1000, 1249)).code,
    ).toBe("VJ_CLIP_LOOP_INVALID");
    expect(
      refusalOf(() => checkVjClipLoopPoints(VIDEO_CLIP, 7800, null)).code,
    ).toBe("VJ_CLIP_LOOP_INVALID");
    expect(() => checkVjClipLoopPoints(VIDEO_CLIP, 1000, 1250)).not.toThrow();
  });

  it("refuses a point out past the duration", () => {
    expect(
      refusalOf(() => checkVjClipLoopPoints(VIDEO_CLIP, null, 8001)).code,
    ).toBe("VJ_CLIP_LOOP_INVALID");
    expect(() => checkVjClipLoopPoints(VIDEO_CLIP, 0, 8000)).not.toThrow();
  });

  it("passes both points null for every clip", () => {
    expect(() => checkVjClipLoopPoints(GIF_CLIP, null, null)).not.toThrow();
    expect(() => checkVjClipLoopPoints(VIDEO_CLIP, null, null)).not.toThrow();
  });
});

describe("vjRefusal", () => {
  it("covers every refusal code with its status and message", () => {
    for (const code of VJ_REFUSAL_CODES) {
      const rule = VJ_DEMO_REFUSALS[code];
      expect(rule.message.length).toBeGreaterThan(0);
      const refusal = vjRefusal(code);
      expect(refusal.status).toBe(rule.status);
      expect(refusal.message).toBe(rule.message);
      expect(refusal.data).toEqual({
        statusCode: rule.status,
        message: rule.message,
        code,
      });
    }
  });

  it("answers the contract 5 status of every v2 code", () => {
    const v2Statuses: Partial<Record<VjRefusalCode, number>> = {
      VJ_CLIP_FAVORITE_INVALID: 400,
      VJ_CLIP_SPEED_INVALID: 400,
      VJ_CLIP_LOOP_MODE_INVALID: 400,
      VJ_CLIP_LOOP_INVALID: 400,
      VJ_EVENT_NOT_FOUND: 404,
      VJ_EVENT_NOT_LINKABLE: 409,
      VJ_SCENE_NOT_FOUND: 404,
      VJ_SCENE_NAME_REQUIRED: 400,
      VJ_SCENE_NAME_TOO_LONG: 400,
      VJ_SCENE_LIMIT_REACHED: 409,
      VJ_SCENE_LOOK_INVALID: 400,
      VJ_SCENE_CLIP_NOT_FOUND: 404,
      VJ_SCENE_REORDER_MISMATCH: 400,
      VJ_SETLIST_NOT_FOUND: 404,
      VJ_SETLIST_NAME_REQUIRED: 400,
      VJ_SETLIST_NAME_TOO_LONG: 400,
      VJ_SETLIST_NAME_TAKEN: 409,
      VJ_SETLIST_LIMIT_REACHED: 409,
      VJ_SETLIST_REORDER_MISMATCH: 400,
      VJ_SETLIST_ITEMS_INVALID: 400,
      VJ_SETLIST_FULL: 409,
    };
    expect(Object.keys(v2Statuses)).toHaveLength(21);
    for (const [code, status] of Object.entries(v2Statuses)) {
      expect(VJ_DEMO_REFUSALS[code as VjRefusalCode].status).toBe(status);
    }
  });

  it("copies only the extras each code carries", () => {
    expect(
      vjRefusal("VJ_SCENE_LOOK_INVALID", {
        lookField: "effects.settings.glitch.amount",
        packId: SCENE_ID,
      }).data,
    ).toEqual({
      statusCode: 400,
      message: VJ_DEMO_REFUSALS.VJ_SCENE_LOOK_INVALID.message,
      code: "VJ_SCENE_LOOK_INVALID",
      lookField: "effects.settings.glitch.amount",
    });
    expect(
      vjRefusal("VJ_UPLOAD_TOO_LARGE", {
        kind: "vj_preview",
        maxBytes: 524_288,
        field: "previewStorageKey",
      }).data,
    ).toMatchObject({
      kind: "vj_preview",
      maxBytes: 524_288,
      field: "previewStorageKey",
    });
    expect(vjRefusal("VJ_SETLIST_FULL", {}).data).not.toHaveProperty(
      "setlistId",
    );
  });

  it("carries no value from the refused input in any message", () => {
    const refusedInputs: Array<[() => unknown, string]> = [
      [() => readVjClipDefaultsPatch({ defaultSpeed: 3.75 }), "3.75"],
      [() => readVjClipDefaultsPatch({ loopInMs: 98765.5 }), "98765"],
      [() => checkVjClipLoopPoints(VIDEO_CLIP, null, 98765), "98765"],
      [() => checkVjClipLoopPoints(VIDEO_CLIP, 4321, 4400), "4321"],
      [() => normalizeVjSceneName("Glitter".repeat(9)), "Glitter"],
      [() => normalizeVjSetlistName("Saturday".repeat(8)), "Saturday"],
    ];
    for (const [run, refusedValue] of refusedInputs) {
      const body = refusalOf(run);
      expect(body.message).not.toContain(refusedValue);
    }
  });
});

describe("scene and set list names", () => {
  it("trims a scene name and counts code points", () => {
    expect(normalizeVjSceneName("  Warm up  ")).toBe("Warm up");
    const astralLetter = String.fromCodePoint(0x1d400);
    expect(normalizeVjSceneName(astralLetter.repeat(60))).toBe(
      astralLetter.repeat(60),
    );
    expect(refusalOf(() => normalizeVjSceneName("a".repeat(61))).code).toBe(
      "VJ_SCENE_NAME_TOO_LONG",
    );
  });

  it("refuses a missing, non-text or blank scene name", () => {
    for (const name of [undefined, null, 7, "   "]) {
      expect(refusalOf(() => normalizeVjSceneName(name)).code).toBe(
        "VJ_SCENE_NAME_REQUIRED",
      );
    }
  });

  it("answers the set list pair for set list names", () => {
    expect(normalizeVjSetlistName(" Friday set ")).toBe("Friday set");
    expect(refusalOf(() => normalizeVjSetlistName(" ")).code).toBe(
      "VJ_SETLIST_NAME_REQUIRED",
    );
    expect(refusalOf(() => normalizeVjSetlistName("b".repeat(61))).code).toBe(
      "VJ_SETLIST_NAME_TOO_LONG",
    );
  });
});

describe("uuid lists and set list items", () => {
  it("isVjUuidList reads an array of at most max uuids", () => {
    expect(isVjUuidList([SCENE_ID, OTHER_SCENE_ID], 2)).toBe(true);
    expect(isVjUuidList([], 0)).toBe(true);
    expect(isVjUuidList([SCENE_ID, OTHER_SCENE_ID], 1)).toBe(false);
    expect(isVjUuidList([SCENE_ID, "scene"], 5)).toBe(false);
    expect(isVjUuidList(SCENE_ID, 5)).toBe(false);
  });

  it("refuses unreadable items before an over-long list", () => {
    const tooManyWithJunk = [...Array<string>(101).fill(SCENE_ID), 4];
    expect(
      refusalOf(() => normalizeVjSetlistSceneIds(tooManyWithJunk, SETLIST_ID))
        .code,
    ).toBe("VJ_SETLIST_ITEMS_INVALID");
    expect(
      refusalOf(() => normalizeVjSetlistSceneIds({ sceneIds: [] }, null)).code,
    ).toBe("VJ_SETLIST_ITEMS_INVALID");
  });

  it("answers 101 items with VJ_SETLIST_FULL and the set list id", () => {
    const body = refusalOf(() =>
      normalizeVjSetlistSceneIds(Array<string>(101).fill(SCENE_ID), SETLIST_ID),
    );
    expect(body.code).toBe("VJ_SETLIST_FULL");
    expect(body.setlistId).toBe(SETLIST_ID);
    expect(
      refusalOf(() =>
        normalizeVjSetlistSceneIds(Array<string>(101).fill(SCENE_ID), null),
      ),
    ).not.toHaveProperty("setlistId");
  });

  it("lowercases the ids and keeps a scene twice in order", () => {
    expect(
      normalizeVjSetlistSceneIds(
        [SCENE_ID.toUpperCase(), OTHER_SCENE_ID, SCENE_ID],
        SETLIST_ID,
      ),
    ).toEqual([SCENE_ID, OTHER_SCENE_ID, SCENE_ID]);
  });
});
