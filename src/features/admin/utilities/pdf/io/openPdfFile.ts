import { PDFDocument } from "pdf-lib";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  classifyFileSize,
  hasEncryptEntry,
  hasPdfHeader,
} from "./pdfFileChecks";
import { closePdfjsDocument, openPdfjsDocument } from "./pdfjsLoader";
import { PdfOpenError } from "./pdfOpenErrors";
import { isDigitallySigned } from "./pdfSignature";
import { decryptRestrictedPdf } from "./qpdfDecrypt";

export interface OpenedPdf {
  readonly pdfLibDocument: PDFDocument;
  readonly pdfjsDocument: PDFDocumentProxy;
  readonly pageCount: number;
  readonly isSigned: boolean;
  readonly isLarge: boolean;
}

function toPdfOpenError(error: unknown): PdfOpenError {
  return error instanceof PdfOpenError
    ? error
    : new PdfOpenError("damaged", { cause: error });
}

async function readFileBytes(file: File): Promise<Uint8Array> {
  try {
    return new Uint8Array(await file.arrayBuffer());
  } catch (error) {
    throw new PdfOpenError("unreadable", { cause: error });
  }
}

// Only reached after pdfjs opened the file without a password.
async function loadDecryptedDocument(bytes: Uint8Array): Promise<PDFDocument> {
  const decrypted = await decryptRestrictedPdf(bytes, {
    hasOpenedWithoutPassword: true,
  });
  try {
    return await PDFDocument.load(decrypted, { updateMetadata: false });
  } catch (error) {
    throw new PdfOpenError("damaged", { cause: error });
  }
}

/**
 * pdf-lib refuses encrypted files, and its EncryptedPDFError cannot be told
 * apart with instanceof (an ES5 Error subclass). Loading with
 * `ignoreEncryption` and reading `isEncrypted` names the case directly. A
 * parse failure on a file with an `/Encrypt` entry goes to the decrypter too,
 * since scrambled object streams can stop pdf-lib before that check.
 */
async function loadEditableDocument(bytes: Uint8Array): Promise<PDFDocument> {
  let document: PDFDocument;
  try {
    document = await PDFDocument.load(bytes, {
      ignoreEncryption: true,
      updateMetadata: false,
    });
  } catch (error) {
    if (hasEncryptEntry(bytes)) return loadDecryptedDocument(bytes);
    throw new PdfOpenError("damaged", { cause: error });
  }
  return document.isEncrypted ? loadDecryptedDocument(bytes) : document;
}

/** Opens one picked file for editing. Rejects only with a PdfOpenError. */
export async function openPdfFile(file: File): Promise<OpenedPdf> {
  const sizeClass = classifyFileSize(file.size);
  if (sizeClass === "too-large") throw new PdfOpenError("too-large");

  const bytes = await readFileBytes(file);
  if (!hasPdfHeader(bytes)) throw new PdfOpenError("not-pdf");

  let pdfjsDocument: PDFDocumentProxy;
  try {
    pdfjsDocument = await openPdfjsDocument(bytes);
  } catch (error) {
    throw toPdfOpenError(error);
  }

  try {
    const pdfLibDocument = await loadEditableDocument(bytes);
    const pageCount = pdfLibDocument.getPageCount();
    if (pageCount === 0) throw new PdfOpenError("damaged");
    return {
      pdfLibDocument,
      pdfjsDocument,
      pageCount,
      isSigned: isDigitallySigned(pdfLibDocument),
      isLarge: sizeClass === "large",
    };
  } catch (error) {
    closePdfjsDocument(pdfjsDocument);
    throw toPdfOpenError(error);
  }
}
