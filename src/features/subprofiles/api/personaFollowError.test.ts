import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  PERSONA_NOT_FOLLOWABLE_CODE,
  PERSONA_SELF_FOLLOW_CODE,
  personaFollowErrorCopy,
} from "./personaFollowError";

describe("personaFollowErrorCopy", () => {
  it("names the viewer's own persona and a persona that takes no follows", () => {
    expect(
      personaFollowErrorCopy(
        new ApiError(400, "x", { code: PERSONA_SELF_FOLLOW_CODE }),
      ),
    ).toEqual({ key: "subprofiles:directory.card.followError.ownPersona" });
    expect(
      personaFollowErrorCopy(
        new ApiError(404, "x", { code: PERSONA_NOT_FOLLOWABLE_CODE }),
      ),
    ).toEqual({ key: "subprofiles:directory.card.followError.notFollowable" });
  });

  it("names a restriction and the shared causes", () => {
    expect(
      personaFollowErrorCopy(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ),
    ).toEqual({ key: "shared:apiError.accountRestricted" });
    expect(personaFollowErrorCopy(new TypeError("Failed to fetch"))).toEqual({
      key: "shared:apiError.noConnection",
    });
    expect(personaFollowErrorCopy(new ApiError(429, "x"))).toEqual({
      key: "shared:apiError.reasonRateLimited",
    });
    expect(personaFollowErrorCopy(new ApiError(500, "x"))).toEqual({
      key: "shared:apiError.serverFault",
    });
  });
});
