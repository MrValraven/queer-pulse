import { zipSync } from "fflate";
import type { Zippable } from "fflate";
import { PdfBuildError } from "./pdfBuildError";

export interface ZipEntry {
  readonly fileName: string;
  readonly bytes: Uint8Array;
}

/** Level 0 stores each file as is: PDF streams are already compressed. */
export function buildZip(entries: readonly ZipEntry[]): Uint8Array {
  try {
    const files: Zippable = {};
    for (const entry of entries) {
      const isBytes = ArrayBuffer.isView(entry.bytes);
      const isNameTaken = Object.hasOwn(files, entry.fileName);
      if (!isBytes || isNameTaken) throw new PdfBuildError("zip");
      files[entry.fileName] = [entry.bytes, { level: 0 }];
    }
    return zipSync(files, { level: 0 });
  } catch (cause) {
    if (cause instanceof PdfBuildError) throw cause;
    throw new PdfBuildError("zip", { cause });
  }
}
