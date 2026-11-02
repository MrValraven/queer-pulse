import { describe, expect, it } from "vitest";
import {
  IS_EVENT_BATCH_LAUNCHED,
  isAddEventMonthAvailable,
} from "./useCanAddEventMonth";

describe("isAddEventMonthAvailable", () => {
  it("opens the feature in demo mode for everyone", () => {
    expect(
      isAddEventMonthAvailable({ isDemoMode: true, hasEarlyAccess: false }),
    ).toBe(true);
  });

  it("opens the feature to a live member who holds the eventBatch grant", () => {
    expect(
      isAddEventMonthAvailable({ isDemoMode: false, hasEarlyAccess: true }),
    ).toBe(true);
  });

  it("keeps the feature closed to a live member without the grant before launch", () => {
    expect(IS_EVENT_BATCH_LAUNCHED).toBe(false);
    expect(
      isAddEventMonthAvailable({ isDemoMode: false, hasEarlyAccess: false }),
    ).toBe(false);
  });
});
