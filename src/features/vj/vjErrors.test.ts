import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  VJ_CLIENT_UPLOAD_CODES,
  VJ_REFUSAL_CODES,
  VJ_SOCKET_ERROR_CODES,
} from "../../shared/contracts/vj";
import { loadNamespace } from "../../shared/i18n/catalogs";
import { VjSendError } from "./realtime/vjTransport";
import { VjUploadFailure } from "./upload/vjUploadFailure";
import {
  isVjSilentSocketCode,
  VJ_CONNECTION_REFUSAL_KEY,
  VJ_FAILURE_KEY,
  VJ_PREVIEW_TOO_LARGE_KEY,
  VJ_REASON_KEY,
  VJ_SOCKET_REASON_KEY,
  VJ_THUMBNAIL_TOO_LARGE_KEY,
  vjErrorKeyOf,
  vjErrorValuesOf,
  vjReasonOf,
} from "./vjErrors";

function refusal(code: string, extra: Record<string, unknown> = {}): ApiError {
  return new ApiError(400, "x", {
    statusCode: 400,
    message: "x",
    code,
    ...extra,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("vjErrors", () => {
  it.each(VJ_REFUSAL_CODES)("names the cause for %s", (code) => {
    expect(vjErrorKeyOf(refusal(code))).toBe(VJ_REASON_KEY[code]);
  });

  it.each(VJ_CLIENT_UPLOAD_CODES)(
    "names the cause for the browser-side %s",
    (code) => {
      expect(vjErrorKeyOf(new VjUploadFailure(code))).toBe(VJ_REASON_KEY[code]);
    },
  );

  it("gives every code its own line", () => {
    expect(new Set(Object.values(VJ_REASON_KEY)).size).toBe(53);
    expect(new Set(Object.values(VJ_SOCKET_REASON_KEY)).size).toBe(
      VJ_SOCKET_ERROR_CODES.length,
    );
    expect(VJ_SOCKET_ERROR_CODES).toHaveLength(72);
  });

  it("spells keys the contract way", () => {
    expect(VJ_REASON_KEY.VJ_UPLOAD_FORMAT_MOV).toBe("vj:error.uploadFormatMov");
    expect(VJ_REASON_KEY.VJ_PACK_CLIPS_REORDER_MISMATCH).toBe(
      "vj:error.packClipsReorderMismatch",
    );
    expect(VJ_SOCKET_REASON_KEY.vj_overlay_text_too_long).toBe(
      "vj:error.socket.overlayTextTooLong",
    );
  });

  it("names a failed storage PUT as an upload that never reached the server", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const failure = new VjUploadFailure("VJ_UPLOAD_PUT_FAILED", {
      cause: new ApiError(403, "x"),
    });
    expect(vjReasonOf(failure)).toBe("VJ_UPLOAD_MISSING");
    expect(vjErrorKeyOf(failure)).toBe("vj:error.uploadMissing");
    expect(vjErrorValuesOf(failure)).toEqual({});
  });

  it("names a missing network for a storage PUT that failed offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const failure = new VjUploadFailure("VJ_UPLOAD_PUT_FAILED", {
      cause: new TypeError("Failed to fetch"),
    });
    expect(vjErrorKeyOf(failure)).toBe("vj:failure.offline");
    expect(vjErrorValuesOf(failure)).toEqual({});
  });

  it("names a full pack and a full library raised before any request", () => {
    expect(vjErrorKeyOf(new VjUploadFailure("VJ_PACK_FULL"))).toBe(
      "vj:error.packFull",
    );
    expect(vjErrorValuesOf(new VjUploadFailure("VJ_PACK_FULL"))).toEqual({
      max: 200,
    });
    expect(vjErrorKeyOf(new VjUploadFailure("VJ_LIBRARY_FULL"))).toBe(
      "vj:error.libraryFull",
    );
    expect(vjErrorValuesOf(new VjUploadFailure("VJ_LIBRARY_FULL"))).toEqual({
      max: 1000,
    });
  });

  it("names the file size and the cap for a big file", () => {
    const failure = new VjUploadFailure("VJ_UPLOAD_TOO_LARGE", {
      byteSize: 146800640,
    });
    expect(vjErrorKeyOf(failure)).toBe("vj:error.uploadTooLarge");
    expect(vjErrorValuesOf(failure)).toEqual({
      sizeLabel: "140 MB",
      max: "100 MB",
    });
  });

  it("takes the file size from the caller when the server refused the file", () => {
    const refused = refusal("VJ_UPLOAD_TOO_LARGE");
    expect(vjErrorValuesOf(refused, { fileByteSize: 146800640 })).toEqual({
      sizeLabel: "140 MB",
      max: "100 MB",
    });
    expect(vjErrorValuesOf(refused)).toEqual({ max: "100 MB" });
  });

  it("gives an oversized thumbnail its own line", () => {
    const refused = refusal("VJ_UPLOAD_TOO_LARGE", {
      field: "thumbnailStorageKey",
    });
    expect(vjErrorKeyOf(refused)).toBe(VJ_THUMBNAIL_TOO_LARGE_KEY);
    expect(vjErrorValuesOf(refused)).toEqual({ max: "256 KB" });
    expect(
      vjErrorKeyOf(refusal("VJ_UPLOAD_TOO_LARGE", { kind: "vj_thumbnail" })),
    ).toBe(VJ_THUMBNAIL_TOO_LARGE_KEY);
  });

  it("passes the limit a reason names", () => {
    expect(vjErrorValuesOf(refusal("VJ_PACK_NAME_TOO_LONG"))).toEqual({
      max: 60,
    });
    expect(vjErrorValuesOf(refusal("VJ_PACK_LIMIT_REACHED"))).toEqual({
      max: 50,
    });
    expect(vjErrorValuesOf(refusal("VJ_PACK_FULL"))).toEqual({ max: 200 });
    expect(vjErrorValuesOf(refusal("VJ_CLIP_TITLE_TOO_LONG"))).toEqual({
      max: 120,
    });
    expect(vjErrorValuesOf(refusal("VJ_LIBRARY_FULL"))).toEqual({ max: 1000 });
    expect(
      vjErrorValuesOf({
        ok: false,
        code: "vj_overlay_text_too_long",
        message: "x",
      }),
    ).toEqual({ max: 80 });
    expect(vjErrorValuesOf(refusal("VJ_PACK_NOT_FOUND"))).toEqual({});
  });

  it("reads a socket ack failure", () => {
    const ack = { ok: false, code: "vj_bpm_out_of_range", message: "x" };
    expect(vjReasonOf(ack)).toBe("vj_bpm_out_of_range");
    expect(vjErrorKeyOf(ack)).toBe("vj:error.socket.bpmOutOfRange");
  });

  it("keeps stale and lead acks silent", () => {
    expect(isVjSilentSocketCode("vj_stale_command")).toBe(true);
    expect(isVjSilentSocketCode("vj_stale_clip_sequence")).toBe(true);
    expect(isVjSilentSocketCode("vj_not_lead")).toBe(true);
    expect(isVjSilentSocketCode("vj_rate_limited")).toBe(false);
  });

  it("names missing access for a 403 with no code", () => {
    expect(vjErrorKeyOf(new ApiError(403, "Forbidden"))).toBe(
      "vj:failure.forbidden",
    );
  });

  it("ignores an error code that is not a VJ code", () => {
    expect(vjReasonOf(refusal("SOMETHING_ELSE"))).toBeNull();
    expect(vjReasonOf(new Error("x"))).toBeNull();
    expect(vjReasonOf({ ok: true })).toBeNull();
  });

  it("names an unreachable server for a send with no socket", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    expect(vjErrorKeyOf(new VjSendError("stage:goClip", "disconnected"))).toBe(
      "vj:failure.unreachable",
    );
  });

  it("names a missing network for a send while the device is offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(vjErrorKeyOf(new VjSendError("stage:goClip", "timeout"))).toBe(
      "vj:failure.offline",
    );
  });

  it("has EN and PT copy for every key it can return", async () => {
    const keys = [
      ...Object.values(VJ_REASON_KEY),
      ...Object.values(VJ_SOCKET_REASON_KEY),
      ...Object.values(VJ_FAILURE_KEY),
      ...Object.values(VJ_CONNECTION_REFUSAL_KEY),
      VJ_THUMBNAIL_TOO_LARGE_KEY,
      VJ_PREVIEW_TOO_LARGE_KEY,
    ];
    for (const language of ["en", "pt"] as const) {
      const catalog = await loadNamespace(language, "vj");
      for (const key of keys) {
        const value = catalog[key.replace(/^vj:/, "")];
        expect(typeof value, `${language} ${key}`).toBe("string");
        expect(value?.length ?? 0, `${language} ${key}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("vjErrors v2 codes", () => {
  it("maps every v2 refusal and socket code to its catalog key", () => {
    const lowerCamelOf = (code: string, prefix: string) =>
      code
        .slice(prefix.length)
        .toLowerCase()
        .replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
    for (const code of [...VJ_REFUSAL_CODES, ...VJ_CLIENT_UPLOAD_CODES]) {
      expect(VJ_REASON_KEY[code]).toBe(`vj:error.${lowerCamelOf(code, "VJ_")}`);
    }
    for (const code of VJ_SOCKET_ERROR_CODES) {
      expect(VJ_SOCKET_REASON_KEY[code]).toBe(
        `vj:error.socket.${lowerCamelOf(code, "vj_")}`,
      );
    }
    expect(VJ_REASON_KEY.VJ_SETLIST_NAME_TAKEN).toBe(
      "vj:error.setlistNameTaken",
    );
    expect(VJ_REASON_KEY.VJ_PREVIEW_UNSUPPORTED).toBe(
      "vj:error.previewUnsupported",
    );
    expect(VJ_SOCKET_REASON_KEY.vj_event_card_no_event).toBe(
      "vj:error.socket.eventCardNoEvent",
    );
  });

  it("names client_outdated", () => {
    expect(VJ_CONNECTION_REFUSAL_KEY.client_outdated).toBe(
      "vj:connection.refused.clientOutdated",
    );
    expect(
      vjErrorKeyOf({ ok: false, code: "vj_client_outdated", message: "x" }),
    ).toBe("vj:error.socket.clientOutdated");
  });

  it("a preview over its cap reads the preview line and 512 KB", () => {
    const byKind = refusal("VJ_UPLOAD_TOO_LARGE", { kind: "vj_preview" });
    const byField = refusal("VJ_UPLOAD_TOO_LARGE", {
      field: "previewStorageKey",
    });
    for (const refused of [byKind, byField]) {
      expect(vjErrorKeyOf(refused)).toBe(VJ_PREVIEW_TOO_LARGE_KEY);
      expect(vjErrorValuesOf(refused, { fileByteSize: 600000 })).toEqual({
        max: "512 KB",
      });
    }
    expect(VJ_PREVIEW_TOO_LARGE_KEY).toBe("vj:error.uploadPreviewTooLarge");
  });

  it("a loop refusal carries min 250", () => {
    const refused = refusal("VJ_CLIP_LOOP_INVALID");
    expect(vjErrorKeyOf(refused)).toBe("vj:error.clipLoopInvalid");
    expect(vjErrorValuesOf(refused)).toEqual({ min: 250 });
  });

  it("effects too many carries max 8", () => {
    expect(
      vjErrorValuesOf({ ok: false, code: "vj_effects_too_many", message: "x" }),
    ).toEqual({ max: 8 });
  });

  it("passes the limit each v2 scene, set list, override and countdown reason names", () => {
    expect(vjErrorValuesOf(refusal("VJ_SCENE_NAME_TOO_LONG"))).toEqual({
      max: 60,
    });
    expect(vjErrorValuesOf(refusal("VJ_SCENE_LIMIT_REACHED"))).toEqual({
      max: 200,
    });
    expect(vjErrorValuesOf(refusal("VJ_SETLIST_NAME_TOO_LONG"))).toEqual({
      max: 60,
    });
    expect(vjErrorValuesOf(refusal("VJ_SETLIST_LIMIT_REACHED"))).toEqual({
      max: 50,
    });
    expect(vjErrorValuesOf(refusal("VJ_SETLIST_FULL"))).toEqual({ max: 100 });
    expect(
      vjErrorValuesOf({
        ok: false,
        code: "vj_overrides_too_many",
        message: "x",
      }),
    ).toEqual({ max: 16 });
    expect(
      vjErrorValuesOf({
        ok: false,
        code: "vj_countdown_label_too_long",
        message: "x",
      }),
    ).toEqual({ max: 40 });
  });

  it("the three new silent codes are silent", () => {
    expect(isVjSilentSocketCode("vj_clip_excluded")).toBe(true);
    expect(isVjSilentSocketCode("vj_clip_not_favorite")).toBe(true);
    expect(isVjSilentSocketCode("vj_stale_setlist")).toBe(true);
    expect(isVjSilentSocketCode("vj_setlist_end")).toBe(false);
  });
});
