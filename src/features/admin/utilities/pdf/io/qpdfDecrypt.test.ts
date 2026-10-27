// @vitest-environment node
import { createRequire } from "node:module";
import type { QpdfInstance } from "@neslinesli93/qpdf-wasm";
import { PDFDocument } from "pdf-lib";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makePdfBytes } from "../testing/pdfTestFixtures";
import { decryptRestrictedPdf } from "./qpdfDecrypt";

const wasmLocation = createRequire(import.meta.url).resolve(
  "@neslinesli93/qpdf-wasm/dist/qpdf.wasm",
);

interface QpdfTestFileSystem {
  writeFile(path: string, data: Uint8Array): void;
  readFile(path: string): Uint8Array;
}

function testFileSystem(instance: QpdfInstance): QpdfTestFileSystem {
  return instance.FS as QpdfInstance["FS"] & QpdfTestFileSystem;
}

async function encryptWithQpdf(
  bytes: Uint8Array,
  userPassword: string,
  layoutOptions: string[] = [],
): Promise<Uint8Array> {
  const { default: createModule } = await import("@neslinesli93/qpdf-wasm");
  const instance = await createModule({ locateFile: () => wasmLocation });
  const fileSystem = testFileSystem(instance);
  fileSystem.writeFile("/in.pdf", bytes);
  const exitCode = instance.callMain([
    "--encrypt",
    userPassword,
    "owner",
    "256",
    "--print=none",
    "--modify=none",
    "--",
    ...layoutOptions,
    "/in.pdf",
    "/out.pdf",
  ]);
  expect(exitCode).toBe(0);
  return fileSystem.readFile("/out.pdf");
}

const restrictedLayouts: Array<[layoutName: string, layoutOptions: string[]]> =
  [
    ["compressed object streams", []],
    ["plain object tables", ["--object-streams=disable"]],
  ];

describe("decryptRestrictedPdf", () => {
  // The qpdf build records each run's exit status on the Node process, so a
  // run that ends in status 2 would otherwise leak into the test worker.
  let previousExitCode: typeof process.exitCode;
  beforeEach(() => {
    previousExitCode = process.exitCode;
  });
  afterEach(() => {
    process.exitCode = previousExitCode;
  });

  it.each(restrictedLayouts)(
    "opens a print-restricted PDF that pdf-lib refuses (%s)",
    async (_layoutName, layoutOptions) => {
      const restricted = await encryptWithQpdf(
        await makePdfBytes({ pageCount: 2 }),
        "",
        layoutOptions,
      );
      await expect(PDFDocument.load(restricted)).rejects.toThrow(/encrypted/);

      const decrypted = await decryptRestrictedPdf(restricted, {
        wasmLocation,
      });
      const document = await PDFDocument.load(decrypted);
      expect(document.isEncrypted).toBe(false);
      expect(document.getPageCount()).toBe(2);
    },
  );

  it("names a PDF that needs a password to open", async () => {
    const locked = await encryptWithQpdf(
      await makePdfBytes({ pageCount: 1 }),
      "secret",
    );
    await expect(
      decryptRestrictedPdf(locked, { wasmLocation }),
    ).rejects.toMatchObject({ reason: "password-required" });
  });

  it("names a damaged file", async () => {
    const damaged = new TextEncoder().encode("%PDF-1.7\nthis is not a body");
    await expect(
      decryptRestrictedPdf(damaged, { wasmLocation }),
    ).rejects.toMatchObject({ reason: "damaged" });
  });

  it("names a damaged encrypted file as damaged once it opened without a password", async () => {
    const damagedEncrypted = new TextEncoder().encode(
      "%PDF-1.7\n1 0 obj\n<< /Encrypt 2 0 R /Broken\n",
    );
    await expect(
      decryptRestrictedPdf(damagedEncrypted, {
        wasmLocation,
        hasOpenedWithoutPassword: true,
      }),
    ).rejects.toMatchObject({ reason: "damaged" });
  });
});
