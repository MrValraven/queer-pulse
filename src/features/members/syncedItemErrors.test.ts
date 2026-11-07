import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  createDraftErrorCopy,
  removeDraftErrorCopy,
  saveItemErrorCopy,
  unsaveItemErrorCopy,
} from "./syncedItemErrors";

const offline = new TypeError("Failed to fetch");

describe("saved item errors", () => {
  it("name the shared causes for a save and an unsave", () => {
    for (const copyFor of [saveItemErrorCopy, unsaveItemErrorCopy]) {
      expect(copyFor(offline).key).toBe("shared:apiError.noConnection");
      expect(copyFor(new ApiError(429, "x")).key).toBe(
        "shared:apiError.reasonRateLimited",
      );
      expect(copyFor(new ApiError(404, "x")).key).toBe(
        "shared:apiError.notFound",
      );
      expect(copyFor(new ApiError(500, "x")).key).toBe(
        "shared:apiError.serverFault",
      );
      expect(copyFor(new ApiError(401, "x")).key).toBe(
        "shared:apiError.signedOut",
      );
    }
  });
});

describe("draft errors", () => {
  it("names a draft id that already exists", () => {
    expect(createDraftErrorCopy(new ApiError(409, "x")).key).toBe(
      "members:drafts.error.idExists",
    );
  });

  it("names a draft that was already deleted", () => {
    expect(removeDraftErrorCopy(new ApiError(404, "x")).key).toBe(
      "members:drafts.error.gone",
    );
  });

  it("falls back to the shared causes", () => {
    expect(createDraftErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(createDraftErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(createDraftErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(removeDraftErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(removeDraftErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});
