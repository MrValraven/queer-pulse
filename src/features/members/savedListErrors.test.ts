import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { savedListErrorCopy } from "./savedListErrors";

const offline = new TypeError("Failed to fetch");

describe("savedListErrorCopy: create", () => {
  it("tells the duplicate name from the list cap by the 409 sentence", () => {
    expect(
      savedListErrorCopy(
        "create",
        new ApiError(409, "You already have a list with that name."),
      ).key,
    ).toBe("members:savedLists.error.nameTaken");
    expect(
      savedListErrorCopy(
        "create",
        new ApiError(409, "You can keep up to 30 lists."),
      ).key,
    ).toBe("members:savedLists.error.listLimit");
  });

  it("falls back to the shared conflict line for a reworded 409", () => {
    expect(
      savedListErrorCopy("create", new ApiError(409, "Something else")).key,
    ).toBe("shared:apiError.reasonConflict");
  });

  it("names an unusable name for a 400", () => {
    expect(
      savedListErrorCopy("create", new ApiError(400, "Give the list a name"))
        .key,
    ).toBe("members:savedLists.error.nameInvalid");
  });
});

describe("savedListErrorCopy: other actions", () => {
  it("reads a rename 409 as a duplicate name without reading the sentence", () => {
    expect(savedListErrorCopy("rename", new ApiError(409, "x")).key).toBe(
      "members:savedLists.error.nameTaken",
    );
    expect(savedListErrorCopy("rename", new ApiError(400, "x")).key).toBe(
      "members:savedLists.error.nameInvalid",
    );
  });

  it("names the main list that cannot be deleted or unfiled", () => {
    expect(savedListErrorCopy("delete", new ApiError(400, "x")).key).toBe(
      "members:savedLists.error.defaultNotDeletable",
    );
    expect(savedListErrorCopy("unfile", new ApiError(400, "x")).key).toBe(
      "members:savedLists.error.unfileDefault",
    );
  });

  it.each([
    "rename",
    "delete",
    "share",
    "revokeShare",
    "file",
    "unfile",
  ] as const)("names a list that is gone for a 404 on %s", (action) => {
    expect(savedListErrorCopy(action, new ApiError(404, "x")).key).toBe(
      "members:savedLists.error.listGone",
    );
  });

  it.each([
    "create",
    "rename",
    "delete",
    "share",
    "revokeShare",
    "file",
    "unfile",
  ] as const)("falls back to the shared causes on %s", (action) => {
    expect(savedListErrorCopy(action, offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(savedListErrorCopy(action, new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(savedListErrorCopy(action, new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(savedListErrorCopy(action, new ApiError(401, "x")).key).toBe(
      "shared:apiError.signedOut",
    );
    expect(
      savedListErrorCopy(
        action,
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ).key,
    ).toBe("shared:apiError.notActive");
  });
});
