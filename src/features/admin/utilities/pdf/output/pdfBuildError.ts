/**
 * The one error the output builders throw. The message is the failed step
 * only, so file names, page counts and sizes stay out of every error.
 */
export type PdfBuildStep = "pdf" | "zip";

const FAILURE_MESSAGE_KEYS: Record<PdfBuildStep, string> = {
  pdf: "admin:utilities.pdf.errors.buildPdf",
  zip: "admin:utilities.pdf.errors.buildZip",
};

export class PdfBuildError extends Error {
  readonly step: PdfBuildStep;

  constructor(step: PdfBuildStep, options?: { cause?: unknown }) {
    super(step, options);
    this.name = "PdfBuildError";
    this.step = step;
  }
}

export function buildFailureMessageKey(step: PdfBuildStep): string {
  return FAILURE_MESSAGE_KEYS[step];
}
