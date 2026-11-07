import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { ReportDTO } from "../safety/api/reports.api";
import { fileBlockReportBatch } from "./blockReportBatch";

const REPORT = {} as ReportDTO;

describe("fileBlockReportBatch", () => {
  it("counts every filing that lands", async () => {
    const createReport = vi.fn().mockResolvedValue(REPORT);
    const result = await fileBlockReportBatch(
      createReport,
      ["a", "b"],
      "harassment",
      false,
    );
    expect(result).toMatchObject({ succeeded: 2, failed: 0, skipped: 0 });
    expect(result.firstFailure).toBeUndefined();
  });

  it("keeps the error of the first message that was refused outright", async () => {
    const restricted = new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" });
    const createReport = vi
      .fn()
      .mockRejectedValueOnce(restricted)
      .mockRejectedValue(new ApiError(500, "x"));
    const result = await fileBlockReportBatch(
      createReport,
      ["a", "b"],
      "harassment",
      false,
    );
    expect(result.failed).toBe(2);
    expect(result.firstFailure).toBe(restricted);
  });

  it("treats the throttle as skipped and keeps no failure for it", async () => {
    const createReport = vi.fn().mockRejectedValue(new ApiError(429, "x"));
    const result = await fileBlockReportBatch(
      createReport,
      ["a", "b", "c", "d", "e"],
      "harassment",
      false,
    );
    expect(result.failed).toBe(0);
    expect(result.skipped).toBeGreaterThan(0);
    expect(result.firstFailure).toBeUndefined();
  });
});
