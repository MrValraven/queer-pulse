import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadBlobFile } from "../../../../../shared/lib/downloadBlob";
import { appendFilePages, toggleCut } from "../model/pdfEditModel";
import type { OpenedFileInfo, PageItem } from "../model/pdfEditModel";
import { buildPdf, buildPdfSet } from "../output/buildPdf";
import type { PdfLibSourceLookup } from "../output/buildPdf";
import { buildZip } from "../output/buildZip";
import type { ZipEntry } from "../output/buildZip";
import { PdfBuildError } from "../output/pdfBuildError";
import { usePdfExport } from "./usePdfExport";

vi.mock("../output/buildPdf", () => ({
  buildPdf: vi.fn(),
  buildPdfSet: vi.fn(),
}));
vi.mock("../output/buildZip", () => ({ buildZip: vi.fn() }));
vi.mock("../../../../../shared/lib/downloadBlob", () => ({
  downloadBlobFile: vi.fn(),
}));

function fileInfo(id: string, name: string, pageCount: number): OpenedFileInfo {
  return { id, name, pageCount, toneIndex: 0, isSigned: false, isLarge: false };
}

const contract = fileInfo("file-1", "Contract.pdf", 3);
const annex = fileInfo("file-2", "Annex.pdf", 2);
const filesById: ReadonlyMap<string, OpenedFileInfo> = new Map([
  [contract.id, contract],
  [annex.id, annex],
]);
const contractPages = appendFilePages([], contract.id, contract.pageCount);
const mergedPages = appendFilePages(contractPages, annex.id, annex.pageCount);
const getSource = vi.fn<PdfLibSourceLookup>();
const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
const zipBytes = new Uint8Array([0x50, 0x4b]);

function renderExport(pages: readonly PageItem[]) {
  return renderHook(() => usePdfExport({ getSource, pages, filesById }));
}

function downloadedFile(): { fileName: string; blob: Blob } {
  const firstCall = vi.mocked(downloadBlobFile).mock.calls[0];
  if (!firstCall) throw new Error("Nothing was downloaded");
  const [fileName, blob] = firstCall;
  return { fileName, blob };
}

/** The source lookup the hook handed to the split build. */
function lookupPassedToSplit(): PdfLibSourceLookup {
  const firstCall = vi.mocked(buildPdfSet).mock.calls[0];
  if (!firstCall) throw new Error("No split was built");
  return firstCall[1];
}

/** A split build that waits until the test lets it finish. */
function pendingSplitBuild() {
  const pendingBuild: { resolve: (entries: ZipEntry[]) => void } = {
    resolve: () => undefined,
  };
  vi.mocked(buildPdfSet).mockReturnValueOnce(
    new Promise<ZipEntry[]>((resolve) => {
      pendingBuild.resolve = resolve;
    }),
  );
  return pendingBuild;
}

function entriesFor(fileNames: readonly string[]): ZipEntry[] {
  return fileNames.map((fileName) => ({ fileName, bytes: pdfBytes }));
}

describe("usePdfExport", () => {
  beforeEach(() => {
    vi.mocked(buildPdf).mockReset();
    vi.mocked(buildPdfSet).mockReset();
    vi.mocked(buildZip).mockReset();
    vi.mocked(downloadBlobFile).mockReset();
    getSource.mockReset();
  });

  it("downloads one edited PDF named after the first page's file", async () => {
    vi.mocked(buildPdf).mockResolvedValueOnce(pdfBytes);
    const { result } = renderExport(contractPages);

    await act(() => result.current.exportAs("single"));

    expect(buildPdf).toHaveBeenCalledWith(contractPages, expect.any(Function));
    expect(downloadBlobFile).toHaveBeenCalledWith(
      "Contract-edited.pdf",
      expect.any(Blob),
    );
    expect(downloadedFile().blob.type).toBe("application/pdf");
    expect(downloadedFile().blob.size).toBe(pdfBytes.length);
    expect(result.current.busyKind).toBeNull();
    expect(result.current.failedStep).toBeNull();
  });

  it("names a merge after the first page's file", async () => {
    vi.mocked(buildPdf).mockResolvedValueOnce(pdfBytes);
    const { result } = renderExport(mergedPages);

    await act(() => result.current.exportAs("single"));

    expect(downloadedFile().fileName).toBe("Contract-merged.pdf");
  });

  it("zips one part per chunk", async () => {
    const cutPages = toggleCut(contractPages, "file-1:0");
    const partNames = ["Contract-part-1.pdf", "Contract-part-2.pdf"];
    const entries = entriesFor(partNames);
    vi.mocked(buildPdfSet).mockResolvedValueOnce(entries);
    vi.mocked(buildZip).mockReturnValueOnce(zipBytes);
    const { result } = renderExport(cutPages);

    await act(() => result.current.exportAs("split"));

    expect(buildPdfSet).toHaveBeenCalledWith(
      [[cutPages[0]], [cutPages[1], cutPages[2]]],
      expect.any(Function),
      partNames,
    );
    expect(buildZip).toHaveBeenCalledWith(entries);
    expect(downloadedFile().fileName).toBe("Contract-split.zip");
    expect(downloadedFile().blob.type).toBe("application/zip");
    expect(buildPdf).not.toHaveBeenCalled();
  });

  it("zips one part per page", async () => {
    const partNames = [
      "Contract-part-1.pdf",
      "Contract-part-2.pdf",
      "Contract-part-3.pdf",
    ];
    vi.mocked(buildPdfSet).mockResolvedValueOnce(entriesFor(partNames));
    vi.mocked(buildZip).mockReturnValueOnce(zipBytes);
    const { result } = renderExport(contractPages);

    await act(() => result.current.exportAs("every-page"));

    expect(buildPdfSet).toHaveBeenCalledWith(
      contractPages.map((page) => [page]),
      expect.any(Function),
      partNames,
    );
    expect(downloadedFile().fileName).toBe("Contract-split.zip");
  });

  it("names the failed step and downloads nothing", async () => {
    vi.mocked(buildPdf).mockRejectedValueOnce(new PdfBuildError("pdf"));
    const { result } = renderExport(contractPages);

    await act(() => result.current.exportAs("single"));

    expect(result.current.failedStep).toBe("pdf");
    expect(result.current.busyKind).toBeNull();
    expect(downloadBlobFile).not.toHaveBeenCalled();
  });

  it("names the zip step when the zip fails", async () => {
    vi.mocked(buildPdfSet).mockResolvedValueOnce(entriesFor(["a.pdf"]));
    vi.mocked(buildZip).mockImplementationOnce(() => {
      throw new PdfBuildError("zip");
    });
    const { result } = renderExport(contractPages);

    await act(() => result.current.exportAs("split"));

    expect(result.current.failedStep).toBe("zip");
    expect(downloadBlobFile).not.toHaveBeenCalled();
  });

  it("counts an unexpected failure as the pdf step and clears it on dismiss", async () => {
    vi.mocked(buildPdf).mockRejectedValueOnce(new Error("x"));
    const { result } = renderExport(contractPages);

    await act(() => result.current.exportAs("single"));
    expect(result.current.failedStep).toBe("pdf");

    act(() => result.current.dismissFailure());
    expect(result.current.failedStep).toBeNull();
  });

  it("shows the kind in progress and ignores a second export meanwhile", async () => {
    const pendingBuild: { resolve: (bytes: Uint8Array) => void } = {
      resolve: () => undefined,
    };
    vi.mocked(buildPdf).mockReturnValueOnce(
      new Promise<Uint8Array>((resolve) => {
        pendingBuild.resolve = resolve;
      }),
    );
    const { result } = renderExport(contractPages);

    let exportDone: Promise<void> = Promise.resolve();
    act(() => {
      exportDone = result.current.exportAs("single");
    });
    expect(result.current.busyKind).toBe("single");

    await act(() => result.current.exportAs("every-page"));
    expect(buildPdfSet).not.toHaveBeenCalled();

    await act(async () => {
      pendingBuild.resolve(pdfBytes);
      await exportDone;
    });
    expect(result.current.busyKind).toBeNull();
    expect(downloadBlobFile).toHaveBeenCalledTimes(1);
  });

  it("does nothing with an empty grid", async () => {
    const { result } = renderExport([]);

    await act(() => result.current.exportAs("single"));

    expect(buildPdf).not.toHaveBeenCalled();
    expect(downloadBlobFile).not.toHaveBeenCalled();
    expect(result.current.failedStep).toBeNull();
  });

  it("looks each source up through the lookup it was given", async () => {
    vi.mocked(buildPdfSet).mockResolvedValueOnce(entriesFor(["a.pdf"]));
    vi.mocked(buildZip).mockReturnValueOnce(zipBytes);
    const { result } = renderExport(contractPages);

    await act(() => result.current.exportAs("every-page"));
    lookupPassedToSplit()("file-1");

    expect(getSource).toHaveBeenCalledWith("file-1");
  });

  it("stops between parts and downloads nothing once the toolkit closes", async () => {
    const pendingBuild = pendingSplitBuild();
    vi.mocked(buildZip).mockReturnValueOnce(zipBytes);
    const { result, unmount } = renderExport(contractPages);

    let exportDone: Promise<void> = Promise.resolve();
    act(() => {
      exportDone = result.current.exportAs("every-page");
    });
    const lookup = lookupPassedToSplit();
    unmount();

    expect(() => lookup("file-1")).toThrow();
    expect(getSource).not.toHaveBeenCalled();
    await act(async () => {
      pendingBuild.resolve(entriesFor(["a.pdf"]));
      await exportDone;
    });
    expect(downloadBlobFile).not.toHaveBeenCalled();
  });

  it("settles quietly when the build fails after the toolkit closed", async () => {
    const failingBuild: { reject: (error: Error) => void } = {
      reject: () => undefined,
    };
    vi.mocked(buildPdf).mockReturnValueOnce(
      new Promise<Uint8Array>((_resolve, reject) => {
        failingBuild.reject = reject;
      }),
    );
    const { result, unmount } = renderExport(contractPages);

    let exportDone: Promise<void> = Promise.resolve();
    act(() => {
      exportDone = result.current.exportAs("single");
    });
    unmount();

    failingBuild.reject(new PdfBuildError("pdf"));
    await expect(exportDone).resolves.toBeUndefined();
    expect(downloadBlobFile).not.toHaveBeenCalled();
  });
});
