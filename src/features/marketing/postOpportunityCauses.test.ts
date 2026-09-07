import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EMPTY, type PostOpportunityState } from "./postOpportunityState";
import { usePostOpportunityValidation } from "./usePostOpportunityValidation";
import { CAUSE_PICKER_CONTROL_ID } from "./postVolunteerOpportunity.data";

/** A form filled in well enough that only the field under test can block it. */
const filled = (overrides: Partial<PostOpportunityState> = {}) => ({
  ...EMPTY,
  org: "Casa Arco-Iris",
  role: "Peer supporter",
  causes: ["youth" as const],
  time: "2 hrs / week",
  location: "Lisbon",
  spotsTotal: "3",
  description: "Sit with someone who needs company.",
  ...overrides,
});

describe("the cause picker's validation", () => {
  it("blocks a submit when no cause is picked", () => {
    // `causes` starts empty on purpose, so this is the state a poster who never
    // scrolled to the field is actually in. The backend's `@ArrayNotEmpty`
    // would 400 it; catching it here names the field instead.
    const { result } = renderHook(() =>
      usePostOpportunityValidation(filled({ causes: [] })),
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.missingFields).toContainEqual(
      expect.objectContaining({
        key: "causes",
        controlId: CAUSE_PICKER_CONTROL_ID,
      }),
    );
  });

  it("allows a submit once one cause is picked", () => {
    const { result } = renderHook(() => usePostOpportunityValidation(filled()));

    expect(result.current.isValid).toBe(true);
  });

  it("lists the missing cause in page order, under the fields above it", () => {
    // The checklist is read as a walk down the form, and the picker sits third
    // (after org and role). Appending it would send a poster back upwards.
    const { result } = renderHook(() =>
      usePostOpportunityValidation({
        ...EMPTY,
        spotsTotal: "3",
      }),
    );

    const keys = result.current.missingFields.map((field) => field.key);
    expect(keys.indexOf("causes")).toBeGreaterThan(keys.indexOf("role"));
    expect(keys.indexOf("causes")).toBeLessThan(keys.indexOf("time"));
  });

  it("keeps the cause first in the list when the fields above it are filled", () => {
    // `role` is not in the missing list at all here, so a position anchored to
    // it would land wrong.
    const { result } = renderHook(() =>
      usePostOpportunityValidation(filled({ causes: [], location: "" })),
    );

    const keys = result.current.missingFields.map((field) => field.key);
    expect(keys).toEqual(["causes", "location"]);
  });
});
