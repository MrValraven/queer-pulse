import { describe, expect, it } from "vitest";
import { formatVjCountdown } from "./vjCountdownFormat";

describe("formatVjCountdown", () => {
  it("formats 65 s as 1:05", () => {
    expect(formatVjCountdown(65_000)).toBe("1:05");
    expect(formatVjCountdown(64_200)).toBe("1:05");
    expect(formatVjCountdown(9_000)).toBe("0:09");
    expect(formatVjCountdown(3_599_000)).toBe("59:59");
  });

  it("formats an hour and a second as 1:00:01", () => {
    expect(formatVjCountdown(3_601_000)).toBe("1:00:01");
    expect(formatVjCountdown(3_600_000)).toBe("1:00:00");
    expect(formatVjCountdown(36_610_000)).toBe("10:10:10");
  });

  it("formats a past target as 0:00", () => {
    expect(formatVjCountdown(0)).toBe("0:00");
    expect(formatVjCountdown(-5_000)).toBe("0:00");
    expect(formatVjCountdown(Number.NaN)).toBe("0:00");
  });
});
