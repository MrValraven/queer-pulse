// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  makeFakeRestrictedPdfBytes,
  makePdfBytes,
} from "../testing/pdfTestFixtures";
import {
  classifyFileSize,
  hasEncryptEntry,
  hasPdfHeader,
  LARGE_FILE_WARNING_BYTES,
  MAX_FILE_BYTES,
  MAX_FILE_MEGABYTES,
} from "./pdfFileChecks";

describe("pdfFileChecks", () => {
  it("finds the PDF header at the start or after a few junk bytes", () => {
    expect(hasPdfHeader(new TextEncoder().encode("%PDF-1.7\n"))).toBe(true);
    expect(hasPdfHeader(new TextEncoder().encode("﻿\r\n%PDF-1.4"))).toBe(true);
    expect(
      hasPdfHeader(new TextEncoder().encode(" ".repeat(1019) + "%PDF-1.7")),
    ).toBe(true);
  });

  it("rejects an HTML page saved with a .pdf name, an empty file and a late header", () => {
    expect(
      hasPdfHeader(new TextEncoder().encode("<!DOCTYPE html><html>")),
    ).toBe(false);
    expect(hasPdfHeader(new Uint8Array())).toBe(false);
    expect(
      hasPdfHeader(new TextEncoder().encode(" ".repeat(1024) + "%PDF-1.7")),
    ).toBe(false);
    expect(hasPdfHeader(new TextEncoder().encode("%PDF"))).toBe(false);
  });

  it("classifies sizes at both thresholds", () => {
    expect(classifyFileSize(0)).toBe("ok");
    expect(classifyFileSize(LARGE_FILE_WARNING_BYTES - 1)).toBe("ok");
    expect(classifyFileSize(LARGE_FILE_WARNING_BYTES)).toBe("large");
    expect(classifyFileSize(MAX_FILE_BYTES)).toBe("large");
    expect(classifyFileSize(MAX_FILE_BYTES + 1)).toBe("too-large");
  });

  it("keeps the fixed byte values", () => {
    expect(LARGE_FILE_WARNING_BYTES).toBe(100 * 1024 * 1024);
    expect(MAX_FILE_BYTES).toBe(400 * 1024 * 1024);
    expect(MAX_FILE_MEGABYTES).toBe(400);
  });

  it("spots an /Encrypt entry in the file", async () => {
    expect(hasEncryptEntry(await makeFakeRestrictedPdfBytes())).toBe(true);
    expect(hasEncryptEntry(await makePdfBytes({ pageCount: 3 }))).toBe(false);
    expect(hasEncryptEntry(new TextEncoder().encode("/Encryp"))).toBe(false);
    expect(hasEncryptEntry(new TextEncoder().encode("//Encrypt"))).toBe(true);
  });
});
