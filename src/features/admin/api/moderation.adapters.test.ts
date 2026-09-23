import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  modReportClusterDtoToView,
  modReportDetailFrom,
} from "./moderation.adapters";
import type { ModReportClusterDTO, ModReportDTO } from "./moderation.api";
import type { ReportSubjectType } from "../../safety/reportReasons";

/**
 * `ModReportDTO.subjectType` is DECLARED as `ReportSubjectType`, but a DTO type
 * is a claim about JSON rather than a check on it. When the backend enum grew
 * `listing_public_question` and the frontend union did not, the value travelled
 * to the drawer with the compiler perfectly satisfied. A missing union member
 * became a silent runtime lie instead of a type error.
 *
 * `toSubjectType` is the guard that now sits in front of that. It passes the
 * value through unchanged (coercing a moderation report's subject would be a
 * worse lie, and dropping the row would hide a real report) and says so in dev.
 */

function clusterDto(subjectType: string): ModReportClusterDTO {
  return {
    subjectType: subjectType as ReportSubjectType,
    subjectId: "listing-abc",
    openCount: 3,
    distinctReporterCount: 2,
    overdueCount: 0,
    highestSeverity: "high",
    firstReportedAt: "2026-08-01T10:00:00.000Z",
    lastReportedAt: "2026-08-02T10:00:00.000Z",
    isSurge: false,
    reportIds: ["r1", "r2", "r3"],
  };
}

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

describe("modReportClusterDtoToView subject types", () => {
  it("passes a known subject type through in silence", () => {
    expect(modReportClusterDtoToView(clusterDto("member")).subjectType).toBe(
      "member",
    );
    expect(warn).not.toHaveBeenCalled();
  });

  // The subject type this whole thread started from. It must now be ordinary.
  it("passes a public listing question through in silence", () => {
    expect(
      modReportClusterDtoToView(clusterDto("listing_public_question"))
        .subjectType,
    ).toBe("listing_public_question");
    expect(warn).not.toHaveBeenCalled();
  });

  it("still carries a subject type it cannot represent, rather than rewriting it", () => {
    expect(
      modReportClusterDtoToView(clusterDto("some_future_subject")).subjectType,
    ).toBe("some_future_subject");
  });

  // `import.meta.env.DEV` is true under vitest (see
  // `simulations/routes.test.tsx`), so the warning path is the one exercised.
  it("names the fix in dev when the union cannot represent the value", () => {
    modReportClusterDtoToView(clusterDto("another_future_subject"));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("another_future_subject"),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("ReportSubjectType"),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("reportReasons.ts"),
    );
  });

  // A queue page of forty rows sharing one unknown type should warn once, not
  // forty times, or the real message drowns in its own repeats.
  it("warns once per distinct value however many rows carry it", () => {
    modReportClusterDtoToView(clusterDto("repeated_future_subject"));
    modReportClusterDtoToView(clusterDto("repeated_future_subject"));
    modReportClusterDtoToView(clusterDto("repeated_future_subject"));
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

/**
 * Business mailboxes, design section 9 (I2 fix): `ModReportDetail.sentAsIdentity`
 * must reach the drawer's view model unchanged, so `AdminReportDrawerContext`
 * can render "Sent as <business>" beside the human sender. Before this fix
 * `modReportDetailFrom` never read the field at all. The backend has sent it
 * since `sent-as-identity.ts` shipped, and nothing in `src` consumed it.
 */
function reportDto(detail: NonNullable<ModReportDTO["detail"]>): ModReportDTO {
  return {
    id: "r-1",
    severity: "medium",
    reasonCode: "harassment",
    subjectType: "message",
    subjectId: "msg-1",
    reporter: { anonymous: true },
    reported: { id: "u-1", handle: "@nightowl", priorReports: 0 },
    community: null,
    createdAt: "2026-09-01T10:00:00.000Z",
    slaDueAt: "2026-09-02T10:00:00.000Z",
    status: "open",
    detail,
  };
}

describe("modReportDetailFrom sentAsIdentity", () => {
  it("carries a present sentAsIdentity through to the view model", () => {
    const detail = modReportDetailFrom(
      reportDto({
        contentAuthor: "@nightowl",
        excerpt: "we don't do refunds",
        thread: [],
        people: [],
        sentAsIdentity: {
          identityId: "identity-cafe-lisboa",
          kind: "listing",
          displayName: "Café Lisboa",
          handle: "cafe-lisboa",
        },
      }),
    );
    expect(detail?.sentAsIdentity).toEqual({
      identityId: "identity-cafe-lisboa",
      kind: "listing",
      displayName: "Café Lisboa",
      handle: "cafe-lisboa",
    });
  });

  it("omits sentAsIdentity from the view model for a personal message", () => {
    const detail = modReportDetailFrom(
      reportDto({
        contentAuthor: "@nightowl",
        excerpt: "hey",
        thread: [],
        people: [],
      }),
    );
    expect(detail?.sentAsIdentity).toBeUndefined();
  });

  it("carries a deleted identity's null fields through unchanged", () => {
    const detail = modReportDetailFrom(
      reportDto({
        contentAuthor: "@nightowl",
        excerpt: "we don't do refunds",
        thread: [],
        people: [],
        sentAsIdentity: {
          identityId: "identity-gone",
          kind: null,
          displayName: null,
          handle: null,
        },
      }),
    );
    expect(detail?.sentAsIdentity).toEqual({
      identityId: "identity-gone",
      kind: null,
      displayName: null,
      handle: null,
    });
  });
});
