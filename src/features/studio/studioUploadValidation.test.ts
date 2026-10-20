import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { StudioAudioUploadError } from "./api/studioAudioUpload";
import {
  audioContentTypeOf,
  audioMaxBytesFor,
  conversionFailureOf,
  fileRejectionKeyOf,
  isRetryableUploadError,
  removeErrorKeyOf,
  titleFromFileName,
  uploadErrorKeyOf,
  validateAudioFiles,
} from "./studioUploadValidation";

const fileOf = (name: string, type: string) =>
  new File([new Uint8Array(1)], name, { type });

function sized(name: string, type: string, size: number): File {
  const file = new File([new Uint8Array(1)], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("audio file validation", () => {
  it("accepts MP3 and M4A by type, and by extension when the browser sends no type", () => {
    expect(audioContentTypeOf(fileOf("a.mp3", "audio/mpeg"))).toBe(
      "audio/mpeg",
    );
    expect(audioContentTypeOf(fileOf("a.m4a", "audio/mp4"))).toBe("audio/mp4");
    expect(audioContentTypeOf(fileOf("a.m4a", ""))).toBe("audio/mp4");
    expect(audioContentTypeOf(fileOf("a.MP3", ""))).toBe("audio/mpeg");
    expect(audioContentTypeOf(fileOf("a.wav", "audio/wav"))).toBeNull();
    expect(audioContentTypeOf(fileOf("a.flac", ""))).toBeNull();
  });

  it("rejects a wrong type, a file over 50 MB and anything past 50 tracks", () => {
    const result = validateAudioFiles(
      [
        sized("ok.mp3", "audio/mpeg", 1000),
        sized("big.mp3", "audio/mpeg", 52428801),
        sized("cover.png", "image/png", 10),
        sized("last.mp3", "audio/mpeg", 1000),
      ],
      49,
    );
    expect(result.accepted.map((entry) => entry.file.name)).toEqual(["ok.mp3"]);
    expect(result.rejected).toEqual([
      { fileName: "big.mp3", reason: "size" },
      { fileName: "cover.png", reason: "type" },
      { fileName: "last.mp3", reason: "limit" },
    ]);
  });

  it("titles a track from its file name", () => {
    expect(titleFromFileName("01 - Tide.mp3")).toBe("Tide");
    expect(titleFromFileName("02_o_regresso.m4a")).toBe("o regresso");
    expect(titleFromFileName("Pier.mp3")).toBe("Pier");
    expect(titleFromFileName(".mp3")).toBe("Untitled");
  });

  it("names each upload failure and says whether Retry can fix it", () => {
    const tooLarge = new StudioAudioUploadError("presign", 413);
    const stoppedPut = new StudioAudioUploadError("put", 500);
    const restricted = new ApiError(403, "restricted", {
      code: "ACCOUNT_RESTRICTED",
    });
    const wrongOwner = new ApiError(422, "refused", {
      statusCode: 422,
      code: "studio_audio_wrong_owner",
      message: "refused",
    });
    expect(uploadErrorKeyOf(tooLarge)).toBe(
      "studio:uploadFlow.files.errorTooLarge",
    );
    expect(uploadErrorKeyOf(stoppedPut)).toBe(
      "studio:uploadFlow.files.errorUpload",
    );
    expect(uploadErrorKeyOf(restricted)).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(uploadErrorKeyOf(wrongOwner)).toBe("studio:errors.audioWrongOwner");
    expect(isRetryableUploadError(tooLarge)).toBe(false);
    expect(isRetryableUploadError(wrongOwner)).toBe(false);
    expect(isRetryableUploadError(stoppedPut)).toBe(true);
    expect(isRetryableUploadError(restricted)).toBe(false);
    for (const code of ["studio_release_not_draft", "studio_track_limit"]) {
      const refusal = new ApiError(409, "refused", {
        statusCode: 409,
        code,
        message: "refused",
      });
      expect(isRetryableUploadError(refusal)).toBe(false);
    }
    expect(isRetryableUploadError(new Error("network"))).toBe(true);
    expect(removeErrorKeyOf(restricted)).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(removeErrorKeyOf(new Error("network"))).toBe(
      "studio:uploadFlow.files.errorRemove",
    );
    expect(
      removeErrorKeyOf(
        new ApiError(409, "refused", {
          statusCode: 409,
          code: "studio_release_needs_playable_track",
          message: "refused",
        }),
      ),
    ).toBe("studio:errors.releaseNeedsPlayableTrack");
  });

  it("names a refused presign by its cause and never offers Retry", () => {
    const refusedBy = (code: string) =>
      new StudioAudioUploadError(
        "presign",
        403,
        false,
        new ApiError(403, "refused", { statusCode: 403, code }),
      );
    const notOwner = refusedBy("studio_not_persona_owner");
    const restricted = refusedBy("ACCOUNT_RESTRICTED");
    const uncoded = refusedBy("SOMETHING_ELSE");
    expect(notOwner.cause).toBeInstanceOf(ApiError);
    expect(uploadErrorKeyOf(notOwner)).toBe("studio:errors.notPersonaOwner");
    expect(uploadErrorKeyOf(restricted)).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(uploadErrorKeyOf(uncoded)).toBe("studio:errors.generic");
    for (const refusal of [notOwner, restricted, uncoded])
      expect(isRetryableUploadError(refusal)).toBe(false);
    const presignOutage = new StudioAudioUploadError("presign", 500);
    expect(uploadErrorKeyOf(presignOutage)).toBe(
      "studio:uploadFlow.files.errorUpload",
    );
    expect(isRetryableUploadError(presignOutage)).toBe(true);
  });
});

describe("the audio cap by format", () => {
  it("takes 250 MB for a podcast and 50 MB otherwise", () => {
    const big = sized("episode.mp3", "audio/mpeg", 100 * 1024 * 1024);
    expect(
      validateAudioFiles([big], 0, audioMaxBytesFor("podcast")).accepted,
    ).toHaveLength(1);
    expect(
      validateAudioFiles([big], 0, audioMaxBytesFor("music")).rejected[0]
        ?.reason,
    ).toBe("size");
    expect(fileRejectionKeyOf("size", "podcast")).toBe(
      "studio:uploadFlow.files.rejectSizePodcast",
    );
    expect(fileRejectionKeyOf("size", "music")).toBe(
      "studio:uploadFlow.files.rejectSize",
    );
  });
});

describe("WAV and AIFF files", () => {
  it("accepts them by extension or type, to convert to MP3", () => {
    const { accepted, rejected } = validateAudioFiles(
      [
        fileOf("take.wav", "audio/wav"),
        fileOf("take.WAV", ""),
        fileOf("mix.aif", "application/octet-stream"),
        fileOf("mix.aiff", "audio/x-aiff"),
        fileOf("demo.aifc", ""),
        fileOf("noext", "audio/vnd.wave"),
      ],
      0,
    );
    expect(rejected).toEqual([]);
    expect(
      accepted.map((entry) => [entry.contentType, entry.needsConversion]),
    ).toEqual(Array.from({ length: 6 }, () => ["audio/mpeg", true]));
  });

  it("skips the size check, because the cap applies to the MP3", () => {
    const master = sized("master.wav", "audio/wav", 300 * 1024 * 1024);
    expect(validateAudioFiles([master], 0).accepted[0]?.needsConversion).toBe(
      true,
    );
  });

  it("keeps MP3 and M4A as they were", () => {
    const { accepted } = validateAudioFiles(
      [fileOf("a.mp3", "audio/mpeg"), fileOf("a.m4a", "")],
      0,
    );
    expect(
      accepted.map((entry) => [entry.contentType, entry.needsConversion]),
    ).toEqual([
      ["audio/mpeg", false],
      ["audio/mp4", false],
    ]);
  });

  it("lets a recognised MP3 name win over a WAV type from the browser", () => {
    const { accepted } = validateAudioFiles(
      [new File([], "song.mp3", { type: "audio/wav" })],
      0,
    );
    expect(
      accepted.map((entry) => [entry.contentType, entry.needsConversion]),
    ).toEqual([["audio/mpeg", false]]);
  });

  it("names each conversion failure and whether Retry can fix it", () => {
    expect(conversionFailureOf({ reason: "tooLong", maxMinutes: 53 })).toEqual({
      errorKey: "studio:uploadFlow.files.errorTooLong",
      errorValues: { maxMinutes: 53 },
      isRetryable: false,
    });
    expect(conversionFailureOf({ reason: "unsupported" })).toEqual({
      errorKey: "studio:uploadFlow.files.errorUnsupported",
      errorValues: null,
      isRetryable: false,
    });
    expect(conversionFailureOf({ reason: "failed" }).isRetryable).toBe(true);
  });
});
