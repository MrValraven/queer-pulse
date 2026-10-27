import { describe, expect, it } from "vitest";
import {
  baseNameOf,
  partFileNames,
  singleOutputName,
  splitZipName,
} from "./outputNames";

describe("outputNames", () => {
  it("strips the pdf extension in any case", () => {
    expect(baseNameOf("Contract.pdf")).toBe("Contract");
    expect(baseNameOf("Report.PDF")).toBe("Report");
    expect(baseNameOf("scan")).toBe("scan");
    expect(baseNameOf("minutes.v2.final.pdf")).toBe("minutes.v2.final");
    expect(baseNameOf("")).toBe("document");
    expect(baseNameOf("a:b*c?.pdf")).toBe("a-b-c-");
  });

  it("falls back to document when only the extension or spaces remain", () => {
    expect(baseNameOf(".pdf")).toBe("document");
    expect(baseNameOf("   ")).toBe("document");
    expect(baseNameOf("  Notes.pdf  ")).toBe("Notes");
  });

  it("names single, merged and split outputs", () => {
    expect(singleOutputName("Contract.pdf", false)).toBe("Contract-edited.pdf");
    expect(singleOutputName("Contract.pdf", true)).toBe("Contract-merged.pdf");
    expect(splitZipName("Contract.pdf")).toBe("Contract-split.zip");
    expect(partFileNames("Contract.pdf", 3)).toEqual([
      "Contract-part-1.pdf",
      "Contract-part-2.pdf",
      "Contract-part-3.pdf",
    ]);
  });

  it("pads part numbers so the files sort in order", () => {
    const names = partFileNames("Contract.pdf", 12);
    expect(names).toHaveLength(12);
    expect(names[0]).toBe("Contract-part-01.pdf");
    expect(names[11]).toBe("Contract-part-12.pdf");
  });
});
