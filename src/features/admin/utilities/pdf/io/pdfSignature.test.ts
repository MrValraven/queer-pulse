// @vitest-environment node
import { PDFDocument, PDFName } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { makePdfBytes, makeSignedPdfBytes } from "../testing/pdfTestFixtures";
import { isDigitallySigned } from "./pdfSignature";

describe("isDigitallySigned", () => {
  it("flags a filled signature field", async () => {
    const document = await PDFDocument.load(await makeSignedPdfBytes());
    expect(isDigitallySigned(document)).toBe(true);
  });

  it("flags a signature whose field type is inherited from a parent field", async () => {
    const document = await PDFDocument.load(
      await makeSignedPdfBytes({ isNestedField: true }),
    );
    expect(isDigitallySigned(document)).toBe(true);
  });

  it("ignores an empty signature field and a plain file", async () => {
    const emptyField = await PDFDocument.load(
      await makeSignedPdfBytes({ isSignatureFilled: false }),
    );
    const plain = await PDFDocument.load(await makePdfBytes({ pageCount: 1 }));
    expect(isDigitallySigned(emptyField)).toBe(false);
    expect(isDigitallySigned(plain)).toBe(false);
  });

  it("returns false on a malformed form tree", async () => {
    const document = await PDFDocument.load(
      await makePdfBytes({ pageCount: 1 }),
    );
    document.catalog.set(
      PDFName.of("AcroForm"),
      document.context.obj({ Fields: PDFName.of("Broken") }),
    );
    expect(isDigitallySigned(document)).toBe(false);
  });
});
