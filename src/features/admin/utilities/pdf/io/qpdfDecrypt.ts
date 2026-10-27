import type { QpdfInstance } from "@neslinesli93/qpdf-wasm";
import { hasEncryptEntry } from "./pdfFileChecks";
import { PdfOpenError } from "./pdfOpenErrors";

/** The package typings leave out `writeFile`, which the runtime provides. */
interface QpdfFileSystem {
  writeFile(path: string, data: Uint8Array): void;
  readFile(path: string): Uint8Array;
}

type QpdfFactory = (options: {
  locateFile: () => string;
}) => Promise<QpdfInstance>;

interface QpdfRuntime {
  readonly createModule: QpdfFactory;
  readonly wasmLocation: string;
}

// Generic paths only: qpdf writes its stdout and stderr to the page log, and
// a real file name there would leave a trace of the document.
const INPUT_PATH = "/input.pdf";
const OUTPUT_PATH = "/output.pdf";

// `--requires-password` exits 0 when a password is needed and 3 when the file
// opens without one. This build reports a wrong password as a plain error
// (exit 2), the same code it uses for an unencrypted or broken file.
const PASSWORD_NEEDED_EXIT = 0;
const OPENS_WITHOUT_PASSWORD_EXIT = 3;
const SUCCESS_EXIT = 0;

async function resolveWasmLocation(wasmLocation?: string): Promise<string> {
  if (wasmLocation) return wasmLocation;
  const wasmAsset = await import("@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url");
  return wasmAsset.default;
}

async function loadQpdf(wasmLocation?: string): Promise<QpdfRuntime> {
  try {
    const [qpdfModule, resolvedLocation] = await Promise.all([
      import("@neslinesli93/qpdf-wasm"),
      resolveWasmLocation(wasmLocation),
    ]);
    const createModule: unknown = qpdfModule.default;
    if (typeof createModule !== "function") {
      throw new TypeError("qpdf module has no factory");
    }
    return {
      createModule: qpdfModule.default,
      wasmLocation: resolvedLocation,
    };
  } catch (error) {
    throw new PdfOpenError("decrypter-unavailable", { cause: error });
  }
}

function hasWritableFileSystem(
  fileSystem: QpdfInstance["FS"],
): fileSystem is QpdfInstance["FS"] & QpdfFileSystem {
  return (
    "writeFile" in fileSystem && typeof fileSystem.writeFile === "function"
  );
}

/** A fresh instance for every run: qpdf's main cannot be called twice. */
async function createFileSystem(
  runtime: QpdfRuntime,
): Promise<{ instance: QpdfInstance; fileSystem: QpdfFileSystem }> {
  let instance: QpdfInstance;
  try {
    instance = await runtime.createModule({
      locateFile: () => runtime.wasmLocation,
    });
  } catch (error) {
    throw new PdfOpenError("decrypter-unavailable", { cause: error });
  }
  const fileSystem = instance.FS;
  if (!hasWritableFileSystem(fileSystem)) {
    throw new PdfOpenError("decrypter-unavailable");
  }
  return { instance, fileSystem };
}

async function runQpdf(
  runtime: QpdfRuntime,
  bytes: Uint8Array,
  commandArguments: string[],
): Promise<{ exitCode: number; fileSystem: QpdfFileSystem }> {
  const { instance, fileSystem } = await createFileSystem(runtime);
  try {
    fileSystem.writeFile(INPUT_PATH, bytes);
    return { exitCode: instance.callMain(commandArguments), fileSystem };
  } catch (error) {
    // The module throws only when the WebAssembly run aborts on the input.
    throw new PdfOpenError("damaged", { cause: error });
  }
}

/**
 * Removes the encryption from a PDF that opens without a password but carries
 * an owner restriction such as a print or edit lock. A file that needs a password
 * to open is refused with `password-required`. When the caller has already
 * opened the file without a password, a qpdf failure means a damaged file, so
 * it is reported as `damaged`.
 */
export async function decryptRestrictedPdf(
  bytes: Uint8Array,
  options: { wasmLocation?: string; hasOpenedWithoutPassword?: boolean } = {},
): Promise<Uint8Array> {
  const runtime = await loadQpdf(options.wasmLocation);

  const check = await runQpdf(runtime, bytes, [
    "--requires-password",
    INPUT_PATH,
  ]);
  const isPasswordNeeded =
    !options.hasOpenedWithoutPassword &&
    (check.exitCode === PASSWORD_NEEDED_EXIT ||
      (check.exitCode !== OPENS_WITHOUT_PASSWORD_EXIT &&
        hasEncryptEntry(bytes)));
  if (isPasswordNeeded) throw new PdfOpenError("password-required");

  const decryption = await runQpdf(runtime, bytes, [
    "--no-warn",
    "--warning-exit-0",
    "--decrypt",
    INPUT_PATH,
    OUTPUT_PATH,
  ]);
  if (decryption.exitCode !== SUCCESS_EXIT) throw new PdfOpenError("damaged");
  try {
    return decryption.fileSystem.readFile(OUTPUT_PATH);
  } catch (error) {
    throw new PdfOpenError("damaged", { cause: error });
  }
}
