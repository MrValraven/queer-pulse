import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { messageRequestErrorKey } from "./firstContactError";

describe("messageRequestErrorKey", () => {
  it("explains that a business, persona or company mailbox only replies", () => {
    const error = new ApiError(403, "Cannot initiate", {
      code: "IDENTITY_CANNOT_INITIATE",
    });
    expect(messageRequestErrorKey(error)).toBe(
      "messages:mailbox.failure.cannotStart",
    );
  });

  it("keeps the caller's generic copy for an uncoded refusal", () => {
    expect(messageRequestErrorKey(new ApiError(403, "Forbidden"))).toBeNull();
  });
});
