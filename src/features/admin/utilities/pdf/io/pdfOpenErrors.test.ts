import { describe, expect, it } from "vitest";
import {
  classifyPdfjsError,
  openFailureMessageKey,
  PdfOpenError,
  type PdfOpenFailure,
} from "./pdfOpenErrors";

describe("pdfOpenErrors", () => {
  it("maps every failure to its own errors key", () => {
    const reasons: PdfOpenFailure[] = [
      "not-pdf",
      "password-required",
      "damaged",
      "too-large",
      "unreadable",
      "decrypter-unavailable",
      "renderer-unavailable",
    ];
    const keys = reasons.map(openFailureMessageKey);
    expect(new Set(keys).size).toBe(reasons.length);
    for (const key of keys) {
      expect(key.startsWith("admin:utilities.pdf.errors.")).toBe(true);
    }
    expect(openFailureMessageKey("password-required")).toBe(
      "admin:utilities.pdf.errors.passwordRequired",
    );
  });

  it("reads pdfjs errors by name", () => {
    expect(classifyPdfjsError({ name: "PasswordException" })).toBe(
      "password-required",
    );
    expect(classifyPdfjsError({ name: "InvalidPDFException" })).toBe("damaged");
    expect(classifyPdfjsError(new Error("anything"))).toBe("damaged");
    expect(classifyPdfjsError(undefined)).toBe("damaged");
  });

  it("keeps the reason as the whole error message", () => {
    const cause = new Error("inner detail");
    const error = new PdfOpenError("damaged", { cause });
    expect(error.message).toBe("damaged");
    expect(error.reason).toBe("damaged");
    expect(error.cause).toBe(cause);
    expect(error).toBeInstanceOf(PdfOpenError);
    expect(error).toBeInstanceOf(Error);
  });
});
