// @vitest-environment node
import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { buildZip } from "./buildZip";
import type { ZipEntry } from "./buildZip";
import { PdfBuildError } from "./pdfBuildError";

function zipFailure(entries: readonly ZipEntry[]): unknown {
  try {
    buildZip(entries);
  } catch (error) {
    return error;
  }
  throw new Error("Expected buildZip to throw");
}

describe("buildZip", () => {
  it("stores each PDF under its name", () => {
    const unzipped = unzipSync(
      buildZip([
        { fileName: "a-part-1.pdf", bytes: new Uint8Array([1, 2]) },
        { fileName: "a-part-2.pdf", bytes: new Uint8Array([3]) },
      ]),
    );
    expect(Object.keys(unzipped)).toEqual(["a-part-1.pdf", "a-part-2.pdf"]);
    expect([...(unzipped["a-part-1.pdf"] ?? [])]).toEqual([1, 2]);
    expect([...(unzipped["a-part-2.pdf"] ?? [])]).toEqual([3]);
  });

  it("reports a failed zip as the zip step", () => {
    const failure = zipFailure([
      { fileName: "a.pdf", bytes: null as unknown as Uint8Array },
    ]);
    expect(failure).toBeInstanceOf(PdfBuildError);
    expect(failure).toMatchObject({ step: "zip" });
  });

  it("reports two entries with the same name as the zip step", () => {
    const failure = zipFailure([
      { fileName: "a.pdf", bytes: new Uint8Array([1]) },
      { fileName: "a.pdf", bytes: new Uint8Array([2]) },
    ]);
    expect(failure).toBeInstanceOf(PdfBuildError);
    expect(failure).toMatchObject({ step: "zip" });
  });
});
