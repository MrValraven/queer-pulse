import { describe, expect, it } from "vitest";
import { buildFailureMessageKey, PdfBuildError } from "./pdfBuildError";

describe("pdfBuildError", () => {
  it("maps each build step to its own errors key", () => {
    expect(buildFailureMessageKey("pdf")).toBe(
      "admin:utilities.pdf.errors.buildPdf",
    );
    expect(buildFailureMessageKey("zip")).toBe(
      "admin:utilities.pdf.errors.buildZip",
    );
  });

  it("carries its step as the message and keeps the cause", () => {
    const cause = new Error("inner");
    const error = new PdfBuildError("zip", { cause });
    expect(error).toBeInstanceOf(Error);
    expect(error.step).toBe("zip");
    expect(error.message).toBe("zip");
    expect(error.cause).toBe(cause);
  });
});
