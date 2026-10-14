import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { studioErrorMessageKeyOf } from "./studioErrors.data";

const refusal = (status: number, code: string) =>
  new ApiError(status, "refused", { statusCode: status, code });

describe("studioErrorMessageKeyOf", () => {
  it("gives a restricted member the shared restriction line", () => {
    expect(studioErrorMessageKeyOf(refusal(403, "ACCOUNT_RESTRICTED"))).toBe(
      "shared:apiError.accountRestricted",
    );
  });

  it("gives a Studio code its own line", () => {
    expect(
      studioErrorMessageKeyOf(refusal(403, "studio_not_persona_owner")),
    ).toBe("studio:errors.notPersonaOwner");
    expect(
      studioErrorMessageKeyOf(refusal(422, "studio_publish_missing_cover")),
    ).toBe("studio:uploadFlow.publish.gap.cover");
  });

  it("falls back to the generic line for anything else", () => {
    expect(studioErrorMessageKeyOf(refusal(403, "SOMETHING_ELSE"))).toBe(
      "studio:errors.generic",
    );
    expect(studioErrorMessageKeyOf(new Error("network"))).toBe(
      "studio:errors.generic",
    );
    expect(studioErrorMessageKeyOf(undefined)).toBe("studio:errors.generic");
  });

  it("gives chapters outside the audio their own line", () => {
    expect(
      studioErrorMessageKeyOf(refusal(422, "studio_chapters_out_of_range")),
    ).toBe("studio:chapters.error.outOfRange");
  });
});
