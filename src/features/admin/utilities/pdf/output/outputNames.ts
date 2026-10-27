export type PdfExportKind = "single" | "split" | "every-page";

const UNSAFE_FILE_NAME_CHARACTERS = /[/\\:*?"<>|]/g;
const PDF_EXTENSION = /\.pdf$/i;
const FALLBACK_BASE_NAME = "document";

/** The file name without its .pdf extension, with characters that file systems refuse swapped for "-". */
export function baseNameOf(fileName: string): string {
  const baseName = fileName
    .replace(UNSAFE_FILE_NAME_CHARACTERS, "-")
    .trim()
    .replace(PDF_EXTENSION, "")
    .trim();
  return baseName === "" ? FALLBACK_BASE_NAME : baseName;
}

export function singleOutputName(
  firstFileName: string,
  isMerged: boolean,
): string {
  const suffix = isMerged ? "merged" : "edited";
  return `${baseNameOf(firstFileName)}-${suffix}.pdf`;
}

export function splitZipName(firstFileName: string): string {
  return `${baseNameOf(firstFileName)}-split.zip`;
}

/** Part names padded to the digit count of the total, so they sort in order. */
export function partFileNames(
  firstFileName: string,
  partCount: number,
): string[] {
  const baseName = baseNameOf(firstFileName);
  const digitCount = String(partCount).length;
  return Array.from(
    { length: Math.max(0, partCount) },
    (_unused, partIndex) => {
      const partNumber = String(partIndex + 1).padStart(digitCount, "0");
      return `${baseName}-part-${partNumber}.pdf`;
    },
  );
}
