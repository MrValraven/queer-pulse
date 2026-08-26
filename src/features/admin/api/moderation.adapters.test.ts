import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { modReportClusterDtoToView } from "./moderation.adapters";
import type { ModReportClusterDTO } from "./moderation.api";
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
