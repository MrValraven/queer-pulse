/**
 * Reason codes for a PDF that could not be opened. An error carries the code
 * only: file names, sizes and page counts stay out of every message.
 */
export type PdfOpenFailure =
  | "not-pdf"
  | "password-required"
  | "damaged"
  | "too-large"
  | "unreadable"
  | "decrypter-unavailable"
  | "renderer-unavailable";

export class PdfOpenError extends Error {
  readonly reason: PdfOpenFailure;

  constructor(reason: PdfOpenFailure, options?: { cause?: unknown }) {
    super(reason, options);
    this.name = "PdfOpenError";
    this.reason = reason;
  }
}

/** One refused file in the intake list, shown with its reason. */
export interface OpenFailureNotice {
  readonly id: string;
  readonly fileName: string;
  readonly reason: PdfOpenFailure;
}

const MESSAGE_KEY_BY_REASON: Record<PdfOpenFailure, string> = {
  "not-pdf": "admin:utilities.pdf.errors.notPdf",
  "password-required": "admin:utilities.pdf.errors.passwordRequired",
  damaged: "admin:utilities.pdf.errors.damaged",
  "too-large": "admin:utilities.pdf.errors.tooLarge",
  unreadable: "admin:utilities.pdf.errors.unreadable",
  "decrypter-unavailable": "admin:utilities.pdf.errors.decrypterUnavailable",
  "renderer-unavailable": "admin:utilities.pdf.errors.rendererUnavailable",
};

export function openFailureMessageKey(reason: PdfOpenFailure): string {
  return MESSAGE_KEY_BY_REASON[reason];
}

/** pdfjs marks a locked file with a `PasswordException`; anything else it refuses is damaged. */
export function classifyPdfjsError(error: unknown): PdfOpenFailure {
  const isPasswordException =
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "PasswordException";
  return isPasswordException ? "password-required" : "damaged";
}
