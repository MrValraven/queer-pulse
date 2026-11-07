import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";
import {
  endorseErrorCopy,
  endorseErrorMessage,
  itemRevisionRestoreErrorMessage,
  personaDeleteErrorMessage,
  personaFallbackCauseMessage,
  personaOwnerPatchErrorMessage,
  personaReorderErrorMessage,
  reasonOrCauseMessage,
} from "./personaActionErrors";

const echoKey: TFunction = (key, options) =>
  options ? `${key} ${JSON.stringify(options)}` : key;
const offline = new TypeError("Failed to fetch");
const restricted = new ApiError(403, "Restricted", {
  code: "ACCOUNT_RESTRICTED",
});

describe("endorseErrorMessage", () => {
  it("says you cannot endorse a persona you own", () => {
    expect(
      endorseErrorMessage(
        new ApiError(400, "You cannot endorse your own persona"),
        echoKey,
      ),
    ).toBe("subprofiles:hero.endorse.errorOwnPersona");
  });

  it("says the persona is unavailable for the 404 without naming why", () => {
    expect(
      endorseErrorMessage(new ApiError(404, "Subprofile not found"), echoKey),
    ).toBe("subprofiles:hero.endorse.errorGone");
  });

  it("names a restriction, a rate limit, a fault and a lost connection", () => {
    expect(endorseErrorMessage(restricted, echoKey)).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(endorseErrorMessage(new ApiError(429, "Too Many"), echoKey)).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(endorseErrorMessage(new ApiError(500, "x"), echoKey)).toBe(
      "shared:apiError.serverFault",
    );
    expect(endorseErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
  });

  it("does not read the own-persona sentence on another status", () => {
    expect(
      endorseErrorCopy(
        new ApiError(409, "You cannot endorse your own persona"),
      ),
    ).toEqual({ key: "shared:apiError.reasonConflict" });
  });
});

describe("personaDeleteErrorMessage", () => {
  it("says only the creator can delete, and that it is already gone", () => {
    expect(
      personaDeleteErrorMessage(
        new ApiError(403, "Only the persona creator can delete it"),
        echoKey,
      ),
    ).toBe("subprofiles:mine.toastDeleteCreatorOnly");
    expect(
      personaDeleteErrorMessage(
        new ApiError(404, "Subprofile not found"),
        echoKey,
      ),
    ).toBe("subprofiles:mine.toastDeleteGone");
  });

  it("keeps a restriction ahead of the creator-only line", () => {
    expect(personaDeleteErrorMessage(restricted, echoKey)).toBe(
      "shared:apiError.accountRestricted",
    );
  });

  it("falls back to the shared lines", () => {
    expect(personaDeleteErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(personaDeleteErrorMessage(new ApiError(503, "x"), echoKey)).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("personaOwnerPatchErrorMessage", () => {
  it("names an edit conflict by its machine code", () => {
    expect(
      personaOwnerPatchErrorMessage(
        new ApiError(409, "Conflict", {
          code: "PERSONA_EDIT_CONFLICT",
          currentEditVersion: 4,
        }),
        echoKey,
      ),
    ).toBe("subprofiles:ownerAction.conflict");
  });

  it("keeps any other 409 on the shared conflict line", () => {
    expect(personaOwnerPatchErrorMessage(new ApiError(409, "x"), echoKey)).toBe(
      "shared:apiError.reasonConflict",
    );
  });

  it("says a persona you no longer own for the 403", () => {
    expect(personaOwnerPatchErrorMessage(new ApiError(403, "x"), echoKey)).toBe(
      "subprofiles:ownerAction.notOwner",
    );
    expect(personaOwnerPatchErrorMessage(restricted, echoKey)).toBe(
      "shared:apiError.accountRestricted",
    );
  });

  it("falls back to the shared lines", () => {
    expect(personaOwnerPatchErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
  });
});

describe("personaReorderErrorMessage", () => {
  it("says the list changed for the 400", () => {
    expect(
      personaReorderErrorMessage(
        new ApiError(400, "ids must not contain duplicates"),
        echoKey,
      ),
    ).toBe("subprofiles:mine.order.saveErrorStale");
  });

  it("falls back to the shared lines", () => {
    expect(personaReorderErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(personaReorderErrorMessage(new ApiError(500, "x"), echoKey)).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("itemRevisionRestoreErrorMessage", () => {
  it("says ownership lapsed for the 403 and the version is gone for the 404", () => {
    expect(
      itemRevisionRestoreErrorMessage(new ApiError(403, "x"), echoKey),
    ).toBe("subprofiles:ownerAction.notOwner");
    expect(
      itemRevisionRestoreErrorMessage(new ApiError(404, "x"), echoKey),
    ).toBe("subprofiles:history.restoreGone");
    expect(itemRevisionRestoreErrorMessage(restricted, echoKey)).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(itemRevisionRestoreErrorMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
  });
});

describe("reasonOrCauseMessage", () => {
  it("shows the server's reason for a 4xx that carries one", () => {
    expect(
      reasonOrCauseMessage(new ApiError(400, "Persona limit reached"), echoKey),
    ).toBe("Persona limit reached");
  });

  it("names the shared cause when there is no reason to show", () => {
    expect(reasonOrCauseMessage(offline, echoKey)).toBe(
      "shared:apiError.noConnection",
    );
    expect(reasonOrCauseMessage(new ApiError(404, "Not Found"), echoKey)).toBe(
      "shared:apiError.notFound",
    );
    expect(
      reasonOrCauseMessage(new ApiError(502, "Bad Gateway"), echoKey),
    ).toBe("shared:apiError.serverFault");
  });
});

describe("personaFallbackCauseMessage", () => {
  it("fills in the status for a refusal nothing names", () => {
    expect(
      personaFallbackCauseMessage(new ApiError(418, "teapot"), echoKey),
    ).toBe('shared:apiError.refused {"status":418}');
  });
});
