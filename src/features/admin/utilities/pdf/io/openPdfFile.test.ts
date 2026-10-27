// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  makeFakeRestrictedPdfBytes,
  makePdfBytes,
  makeSignedPdfBytes,
} from "../testing/pdfTestFixtures";
import { openPdfFile } from "./openPdfFile";
import { LARGE_FILE_WARNING_BYTES, MAX_FILE_BYTES } from "./pdfFileChecks";
import { openPdfjsDocument } from "./pdfjsLoader";
import { PdfOpenError } from "./pdfOpenErrors";
import { decryptRestrictedPdf } from "./qpdfDecrypt";

vi.mock("./pdfjsLoader", async () => {
  const actual =
    await vi.importActual<typeof import("./pdfjsLoader")>("./pdfjsLoader");
  return {
    openPdfjsDocument: vi.fn(),
    closePdfjsDocument: actual.closePdfjsDocument,
  };
});
vi.mock("./qpdfDecrypt", () => ({ decryptRestrictedPdf: vi.fn() }));

function pdfFile(bytes: Uint8Array, name: string): File {
  return new File([new Uint8Array(bytes)], name);
}

/** pdfjs 6 closes a document through its loading task. */
function makePreviewDocument(pageCount: number) {
  return {
    numPages: pageCount,
    loadingTask: { destroy: vi.fn(() => Promise.resolve()) },
  };
}

describe("openPdfFile", () => {
  beforeEach(() => {
    vi.mocked(openPdfjsDocument).mockReset();
    vi.mocked(decryptRestrictedPdf).mockReset();
    vi.mocked(openPdfjsDocument).mockResolvedValue(
      makePreviewDocument(4) as never,
    );
  });

  it("opens a plain PDF and counts its pages", async () => {
    const opened = await openPdfFile(
      pdfFile(await makePdfBytes({ pageCount: 4 }), "Contract.pdf"),
    );
    expect(opened).toMatchObject({
      pageCount: 4,
      isSigned: false,
      isLarge: false,
    });
    expect(opened.pdfLibDocument.getPageCount()).toBe(4);
    expect(opened.pdfjsDocument.numPages).toBe(4);
    expect(decryptRestrictedPdf).not.toHaveBeenCalled();
  });

  it("refuses a file that is not a PDF", async () => {
    const opening = openPdfFile(new File(["<!DOCTYPE html>"], "invoice.pdf"));
    await expect(opening).rejects.toMatchObject({ reason: "not-pdf" });
    await expect(opening).rejects.toThrow(/^not-pdf$/);
    expect(openPdfjsDocument).not.toHaveBeenCalled();
  });

  it("refuses an oversized file before reading it", async () => {
    const file = new File([], "huge.pdf");
    Object.defineProperty(file, "size", { value: MAX_FILE_BYTES + 1 });
    const readSpy = vi.spyOn(file, "arrayBuffer");
    await expect(openPdfFile(file)).rejects.toMatchObject({
      reason: "too-large",
    });
    expect(readSpy).not.toHaveBeenCalled();
  });

  it("marks a file above the warning size as large", async () => {
    const file = pdfFile(await makePdfBytes({ pageCount: 4 }), "scan.pdf");
    Object.defineProperty(file, "size", { value: LARGE_FILE_WARNING_BYTES });
    const opened = await openPdfFile(file);
    expect(opened.isLarge).toBe(true);
    expect(opened.pageCount).toBe(4);
  });

  it("names a file the browser cannot read", async () => {
    const file = pdfFile(await makePdfBytes({ pageCount: 1 }), "gone.pdf");
    vi.spyOn(file, "arrayBuffer").mockRejectedValueOnce(
      new DOMException("The file was moved", "NotReadableError"),
    );
    await expect(openPdfFile(file)).rejects.toMatchObject({
      reason: "unreadable",
    });
    expect(openPdfjsDocument).not.toHaveBeenCalled();
  });

  it("passes on a password failure from the renderer", async () => {
    vi.mocked(openPdfjsDocument).mockRejectedValueOnce(
      new PdfOpenError("password-required"),
    );
    await expect(
      openPdfFile(pdfFile(await makePdfBytes({ pageCount: 1 }), "id.pdf")),
    ).rejects.toMatchObject({ reason: "password-required" });
  });

  it("reports an unexpected renderer failure as a damaged file", async () => {
    vi.mocked(openPdfjsDocument).mockRejectedValueOnce(
      new Error("worker died"),
    );
    const opening = openPdfFile(
      pdfFile(await makePdfBytes({ pageCount: 1 }), "odd.pdf"),
    );
    await expect(opening).rejects.toBeInstanceOf(PdfOpenError);
    await expect(opening).rejects.toMatchObject({ reason: "damaged" });
  });

  it("decrypts a restricted PDF and opens the result", async () => {
    vi.mocked(decryptRestrictedPdf).mockResolvedValueOnce(
      await makePdfBytes({ pageCount: 2 }),
    );
    const opened = await openPdfFile(
      pdfFile(await makeFakeRestrictedPdfBytes(), "bank.pdf"),
    );
    expect(opened.pageCount).toBe(2);
    expect(opened.pdfLibDocument.isEncrypted).toBe(false);
    expect(decryptRestrictedPdf).toHaveBeenCalledTimes(1);
    expect(decryptRestrictedPdf).toHaveBeenCalledWith(expect.anything(), {
      hasOpenedWithoutPassword: true,
    });
  });

  it("closes the preview document when the decrypter cannot load", async () => {
    const preview = makePreviewDocument(1);
    vi.mocked(openPdfjsDocument).mockResolvedValueOnce(preview as never);
    vi.mocked(decryptRestrictedPdf).mockRejectedValueOnce(
      new PdfOpenError("decrypter-unavailable"),
    );
    await expect(
      openPdfFile(pdfFile(await makeFakeRestrictedPdfBytes(), "gov.pdf")),
    ).rejects.toMatchObject({ reason: "decrypter-unavailable" });
    expect(preview.loadingTask.destroy).toHaveBeenCalled();
  });

  it("closes the preview document when pdf-lib finds no pages", async () => {
    const preview = makePreviewDocument(1);
    vi.mocked(openPdfjsDocument).mockResolvedValueOnce(preview as never);
    await expect(
      openPdfFile(new File(["%PDF-1.7\nthis is not a body"], "broken.pdf")),
    ).rejects.toMatchObject({ reason: "damaged" });
    expect(preview.loadingTask.destroy).toHaveBeenCalled();
  });

  it("flags a signed PDF", async () => {
    const opened = await openPdfFile(
      pdfFile(await makeSignedPdfBytes(), "signed.pdf"),
    );
    expect(opened.isSigned).toBe(true);
  });
});
