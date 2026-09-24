import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { classifySaveError } from "./emailTemplateSaveError";

describe("classifySaveError", () => {
  it("keeps the validator's named messages", () => {
    const error = new ApiError(400, "Bad Request", {
      message: [
        "en.blocks[0].href: must be an https:// address or a single placeholder",
      ],
    });
    expect(classifySaveError(error)).toEqual({
      kind: "validation",
      messages: [
        "en.blocks[0].href: must be an https:// address or a single placeholder",
      ],
    });
  });

  it("maps 404 and 409", () => {
    expect(classifySaveError(new ApiError(404, "x"))).toEqual({
      kind: "notFound",
    });
    expect(classifySaveError(new ApiError(409, "x"))).toEqual({
      kind: "labelTaken",
    });
  });

  it("passes anything else through", () => {
    const cause = new Error("offline");
    expect(classifySaveError(cause)).toEqual({ kind: "other", cause });
  });
});
