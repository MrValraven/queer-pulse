import { afterEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  CULTURAL_ASSIGNEE_REFUSAL_REASONS,
  CULTURAL_REASON_CODES,
} from "./api/culturalProduction.types";
import {
  CULTURAL_REASON_KEY,
  culturalErrorKeyOf,
  culturalErrorValuesOf,
} from "./culturalProductionErrors";

const refusalOf = (
  status: number,
  code: string,
  extra: Record<string, unknown> = {},
) =>
  new ApiError(status, "Refused", {
    statusCode: status,
    message: "Refused",
    code,
    ...extra,
  });

function setOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}

afterEach(() => {
  setOnline(true);
});

describe("culturalProductionErrors", () => {
  it("maps every reason code to a distinct key", () => {
    expect(CULTURAL_REASON_CODES).toHaveLength(39);
    const keys = CULTURAL_REASON_CODES.map((code) => CULTURAL_REASON_KEY[code]);
    expect(new Set(keys).size).toBe(39);
    keys.forEach((key) =>
      expect(key.startsWith("admin:culturalProduction.error.")).toBe(true),
    );
  });

  it.each(CULTURAL_ASSIGNEE_REFUSAL_REASONS)(
    "names the %s cause on a not-staff refusal",
    (reason) => {
      expect(
        culturalErrorKeyOf(
          refusalOf(400, "CULTURAL_ASSIGNEE_NOT_STAFF", {
            reason,
            userId: "user-7",
          }),
        ),
      ).toBe(`admin:culturalProduction.error.assigneeNotStaff.${reason}`);
    },
  );

  it("names a changed account when a not-staff body carries no known reason", () => {
    expect(
      culturalErrorKeyOf(
        refusalOf(400, "CULTURAL_ASSIGNEE_NOT_STAFF", { reason: "moon" }),
      ),
    ).toBe("admin:culturalProduction.error.assigneeNotStaff.unknownReason");
  });

  it("reads the section line for too many steps with an index and the total line without", () => {
    const withIndex = refusalOf(400, "CULTURAL_GUIDE_TOO_MANY_STEPS", {
      sectionIndex: 2,
    });
    const withoutIndex = refusalOf(400, "CULTURAL_GUIDE_TOO_MANY_STEPS");
    expect(culturalErrorKeyOf(withIndex)).toBe(
      "admin:culturalProduction.error.guideTooManySteps.section",
    );
    expect(culturalErrorValuesOf(withIndex)).toEqual({ max: 40, section: 3 });
    expect(culturalErrorKeyOf(withoutIndex)).toBe(
      "admin:culturalProduction.error.guideTooManySteps.total",
    );
    expect(culturalErrorValuesOf(withoutIndex)).toEqual({ max: 100 });
  });

  it("falls back to the sections line for a section code with no index", () => {
    const sectionsKey = "admin:culturalProduction.error.guideSectionsInvalid";
    expect(
      culturalErrorKeyOf(refusalOf(400, "CULTURAL_GUIDE_HEADING_REQUIRED")),
    ).toBe(sectionsKey);
    expect(
      culturalErrorKeyOf(
        refusalOf(400, "CULTURAL_GUIDE_STEP_TEXT_REQUIRED", {
          sectionIndex: 0,
        }),
      ),
    ).toBe(sectionsKey);
    expect(
      culturalErrorKeyOf(
        refusalOf(400, "CULTURAL_GUIDE_STEP_TEXT_REQUIRED", {
          sectionIndex: 0,
          stepIndex: 1,
        }),
      ),
    ).toBe("admin:culturalProduction.error.guideStepTextRequired");
    expect(
      culturalErrorKeyOf(
        refusalOf(400, "CULTURAL_GUIDE_HEADING_REQUIRED", { sectionIndex: 4 }),
      ),
    ).toBe("admin:culturalProduction.error.guideHeadingRequired");
  });

  it("numbers sections and steps from one", () => {
    expect(
      culturalErrorValuesOf(
        refusalOf(400, "CULTURAL_GUIDE_STEP_DAYS_INVALID", {
          sectionIndex: 0,
          stepIndex: 4,
        }),
      ),
    ).toEqual({ max: 365, min: -60, section: 1, step: 5 });
    expect(
      culturalErrorValuesOf(
        refusalOf(400, "CULTURAL_GUIDE_HEADING_TOO_LONG", { sectionIndex: 1 }),
      ),
    ).toEqual({ max: 120, section: 2 });
  });

  it("quotes each limit", () => {
    expect(
      culturalErrorValuesOf(refusalOf(400, "CULTURAL_TITLE_TOO_LONG")),
    ).toEqual({ max: 160 });
    expect(
      culturalErrorValuesOf(refusalOf(400, "CULTURAL_COMMENT_TOO_LONG")),
    ).toEqual({ max: 2000 });
    expect(
      culturalErrorValuesOf(refusalOf(409, "CULTURAL_TOO_MANY_ASSIGNEES")),
    ).toEqual({ max: 10 });
    expect(
      culturalErrorValuesOf(refusalOf(400, "CULTURAL_GUIDE_TOO_MANY_SECTIONS")),
    ).toEqual({ max: 30 });
  });

  it("names offline, server and forbidden without a reason code", () => {
    expect(culturalErrorKeyOf(new ApiError(500, "Internal Server Error"))).toBe(
      "admin:culturalProduction.failure.server",
    );
    expect(culturalErrorKeyOf(new ApiError(403, "Forbidden"))).toBe(
      "admin:culturalProduction.failure.forbidden",
    );
    setOnline(false);
    expect(culturalErrorKeyOf(new TypeError("Failed to fetch"))).toBe(
      "admin:culturalProduction.failure.offline",
    );
  });

  it("quotes nothing for a failure with no body", () => {
    expect(culturalErrorValuesOf(new Error("offline"))).toEqual({});
  });
});
