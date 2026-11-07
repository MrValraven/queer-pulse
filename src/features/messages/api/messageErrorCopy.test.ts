import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  conversationClaimCause,
  firstFailureCause,
  identityBlockCause,
  identityEnquiryCause,
  mailboxAttributionCause,
} from "./messageErrorCopy";

function coded(status: number, code: string): ApiError {
  return new ApiError(status, "x", { code });
}

const OFFLINE = new TypeError("Failed to fetch");

describe("identityEnquiryCause", () => {
  it.each([
    "IDENTITY_BLOCKED",
    "IDENTITY_HAS_NO_STAFF",
    "IDENTITY_IS_YOUR_OWN",
    "IDENTITY_CANNOT_INITIATE",
    "IDENTITY_REMOVED",
  ])("reads %s as an unreachable mailbox", (code) => {
    expect(identityEnquiryCause(coded(403, code))).toEqual({
      key: "messages:mailbox.contact.error.unavailable",
    });
  });

  it("names the enquiry cap for a 429", () => {
    expect(identityEnquiryCause(new ApiError(429, "x"))).toEqual({
      key: "messages:mailbox.contact.error.rateLimited",
    });
  });

  it("says the mailbox is gone for a 404", () => {
    expect(identityEnquiryCause(new ApiError(404, "x"))).toEqual({
      key: "messages:mailbox.contact.error.notFound",
    });
  });

  it("falls back to the shared causes", () => {
    expect(identityEnquiryCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(identityEnquiryCause(coded(403, "ACCOUNT_RESTRICTED")).key).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(identityEnquiryCause(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(identityEnquiryCause(new ApiError(400, "x")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
    expect(identityEnquiryCause(new ApiError(401, "x")).key).toBe(
      "shared:apiError.signedOut",
    );
  });
});

describe("conversationClaimCause", () => {
  it.each([
    ["IDENTITY_NOT_STAFF", 403, "messages:mailbox.claim.error.notStaff"],
    ["IDENTITY_REMOVED", 403, "messages:mailbox.claim.error.removed"],
    [
      "CONVERSATION_NOT_A_MAILBOX",
      400,
      "messages:mailbox.claim.error.notMailbox",
    ],
  ])("names %s", (code, status, key) => {
    expect(conversationClaimCause(coded(status, code))).toEqual({ key });
  });

  it("says the thread is gone for a 404", () => {
    expect(conversationClaimCause(new ApiError(404, "x"))).toEqual({
      key: "messages:mailbox.claim.error.gone",
    });
  });

  it("falls back to the shared causes", () => {
    expect(conversationClaimCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(conversationClaimCause(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(conversationClaimCause(new ApiError(503, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("mailboxAttributionCause", () => {
  it.each([
    ["IDENTITY_NOT_OWNER", "messages:mailbox.settings.error.notOwner"],
    ["IDENTITY_NOT_STAFF", "messages:mailbox.settings.error.notStaff"],
    ["IDENTITY_REMOVED", "messages:mailbox.settings.error.removed"],
    [
      "IDENTITY_STAFF_NAMES_LOCKED",
      "messages:mailbox.settings.unlinkedPersonaError",
    ],
  ])("names %s", (code, key) => {
    expect(mailboxAttributionCause(coded(403, code))).toEqual({ key });
  });

  it("falls back to the shared causes", () => {
    expect(mailboxAttributionCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(mailboxAttributionCause(new ApiError(403, "x")).key).toBe(
      "shared:apiError.forbidden",
    );
    expect(mailboxAttributionCause(new ApiError(404, "x")).key).toBe(
      "shared:apiError.notFound",
    );
  });
});

describe("identityBlockCause", () => {
  it("names a mailbox the member answers for", () => {
    expect(identityBlockCause(coded(400, "IDENTITY_BLOCK_OWN"))).toEqual({
      key: "messages:mailbox.block.error.own",
    });
  });

  it("names a person, who is blocked from their profile", () => {
    expect(identityBlockCause(coded(400, "IDENTITY_BLOCK_PERSON"))).toEqual({
      key: "messages:mailbox.block.error.person",
    });
  });

  it("says the identity is gone for a 404", () => {
    expect(identityBlockCause(new ApiError(404, "x"))).toEqual({
      key: "messages:mailbox.block.error.gone",
    });
  });

  it("falls back to the shared causes", () => {
    expect(identityBlockCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(identityBlockCause(new ApiError(400, "x")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
    expect(identityBlockCause(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("firstFailureCause", () => {
  it("lets the first failure speak for the batch", () => {
    expect(
      firstFailureCause([new ApiError(429, "x"), new ApiError(500, "x")]).key,
    ).toBe("shared:apiError.reasonRateLimited");
  });

  it("reads an empty batch as no answer at all", () => {
    expect(firstFailureCause([]).key).toBe("shared:apiError.noConnection");
  });
});
