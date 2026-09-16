import { describe, expect, it } from "vitest";
import {
  provisionalSessionVerdictFor,
  refreshEvidenceFor,
  type RefreshEvidence,
} from "./provisionalSessionVerdict";

const PROBE_STARTED_AT = 1_800_000_000_000;

function verdictForUnauthorized(refresh: RefreshEvidence) {
  return provisionalSessionVerdictFor({
    kind: "httpError",
    status: 401,
    refresh,
  });
}

describe("provisionalSessionVerdictFor", () => {
  it("confirms the session when the probe returns a member", () => {
    expect(provisionalSessionVerdictFor({ kind: "user" })).toBe("confirmed");
  });

  it("treats a 401 with no refresh attempted as signed out", () => {
    expect(verdictForUnauthorized({ kind: "notAttempted" })).toBe("signedOut");
  });

  it("treats a 401 after the server rejected the refresh with 401 as signed out", () => {
    expect(
      verdictForUnauthorized({
        kind: "refreshedDuringProbe",
        outcome: { kind: "rejected", status: 401 },
      }),
    ).toBe("signedOut");
  });

  it("keeps the provisional member when the refresh failed on the network", () => {
    expect(
      verdictForUnauthorized({
        kind: "refreshedDuringProbe",
        outcome: { kind: "networkFailed" },
      }),
    ).toBe("unreachable");
  });

  it("keeps the provisional member when an earlier network-failed refresh may explain the 401", () => {
    expect(verdictForUnauthorized({ kind: "suspectNoSession" })).toBe(
      "unreachable",
    );
  });

  it("keeps the provisional member when the refresh was refused for another reason", () => {
    for (const status of [403, 500, 503]) {
      expect(
        verdictForUnauthorized({
          kind: "refreshedDuringProbe",
          outcome: { kind: "rejected", status },
        }),
      ).toBe("unreachable");
    }
  });

  it("keeps the provisional member when a refresh succeeded yet the retry still answered 401", () => {
    expect(
      verdictForUnauthorized({
        kind: "refreshedDuringProbe",
        outcome: { kind: "succeeded" },
      }),
    ).toBe("unreachable");
  });

  it("keeps the provisional member on a network fault", () => {
    expect(provisionalSessionVerdictFor({ kind: "networkError" })).toBe(
      "unreachable",
    );
  });

  it("keeps the provisional member on a timeout or a server fault", () => {
    for (const status of [403, 408, 500, 502, 503]) {
      expect(
        provisionalSessionVerdictFor({
          kind: "httpError",
          status,
          refresh: { kind: "notAttempted" },
        }),
      ).toBe("unreachable");
    }
  });
});

describe("refreshEvidenceFor", () => {
  it("reports no attempt before any refresh", () => {
    expect(refreshEvidenceFor(null, PROBE_STARTED_AT)).toEqual({
      kind: "notAttempted",
    });
  });

  it("uses a refresh that settled while the probe ran", () => {
    expect(
      refreshEvidenceFor(
        {
          outcome: { kind: "rejected", status: 401 },
          settledAt: PROBE_STARTED_AT,
        },
        PROBE_STARTED_AT,
      ),
    ).toEqual({
      kind: "refreshedDuringProbe",
      outcome: { kind: "rejected", status: 401 },
    });
  });

  it("trusts an earlier refresh the server rejected with 401", () => {
    expect(
      refreshEvidenceFor(
        {
          outcome: { kind: "rejected", status: 401 },
          settledAt: PROBE_STARTED_AT - 1,
        },
        PROBE_STARTED_AT,
      ),
    ).toEqual({ kind: "notAttempted" });
  });

  it("flags every other earlier refresh outcome as suspect", () => {
    const earlierOutcomes = [
      { kind: "networkFailed" as const },
      { kind: "lockTimedOut" as const },
      { kind: "rejected" as const, status: 403 },
      { kind: "rejected" as const, status: 500 },
      { kind: "succeeded" as const },
    ];
    for (const outcome of earlierOutcomes) {
      expect(
        refreshEvidenceFor(
          { outcome, settledAt: PROBE_STARTED_AT - 1 },
          PROBE_STARTED_AT,
        ),
      ).toEqual({ kind: "suspectNoSession" });
    }
  });
});

describe("a later 401 after an earlier refresh refusal", () => {
  // The real flow: a refresh answers 500 during a database outage (or 403),
  // the reconcile marks the session as gone, and the probe's /auth/me 401
  // then skips the refresh. That 401 must not purge the saved inbox.
  function verdictAfterEarlierRefusal(status: number) {
    return verdictForUnauthorized(
      refreshEvidenceFor(
        {
          outcome: { kind: "rejected", status },
          settledAt: PROBE_STARTED_AT - 1,
        },
        PROBE_STARTED_AT,
      ),
    );
  }

  it("keeps the provisional member after an earlier 403", () => {
    expect(verdictAfterEarlierRefusal(403)).toBe("unreachable");
  });

  it("keeps the provisional member after an earlier 500", () => {
    expect(verdictAfterEarlierRefusal(500)).toBe("unreachable");
  });

  it("keeps the provisional member when the refresh lock is abandoned during the probe", () => {
    expect(
      verdictForUnauthorized(
        refreshEvidenceFor(
          { outcome: { kind: "lockTimedOut" }, settledAt: PROBE_STARTED_AT },
          PROBE_STARTED_AT,
        ),
      ),
    ).toBe("unreachable");
  });

  it("still purges after an earlier refresh the server rejected with 401", () => {
    expect(verdictAfterEarlierRefusal(401)).toBe("signedOut");
  });
});
