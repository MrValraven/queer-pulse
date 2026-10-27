import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { openPdfFile } from "../io/openPdfFile";
import type { OpenedPdf } from "../io/openPdfFile";
import { PdfOpenError } from "../io/pdfOpenErrors";
import { FILE_TONE_COUNT } from "../model/pdfEditModel";
import type { OpenedFileInfo } from "../model/pdfEditModel";
import { usePdfFileIntake } from "./usePdfFileIntake";

vi.mock("../io/openPdfFile", () => ({ openPdfFile: vi.fn() }));

function pdfFile(name: string): File {
  return new File(["%PDF-1.7"], name, { type: "application/pdf" });
}

function openedPdf(
  overrides: Partial<Pick<OpenedPdf, "pageCount" | "isSigned" | "isLarge">>,
): OpenedPdf {
  return {
    pdfLibDocument: {},
    pdfjsDocument: { loadingTask: { destroy: () => Promise.resolve() } },
    pageCount: 1,
    isSigned: false,
    isLarge: false,
    ...overrides,
  } as unknown as OpenedPdf;
}

function renderIntake() {
  const sink = { add: vi.fn<(fileId: string, source: OpenedPdf) => void>() };
  const onFileOpened = vi.fn<(info: OpenedFileInfo) => void>();
  const rendered = renderHook(() => usePdfFileIntake({ sink, onFileOpened }));
  return { ...rendered, sink, onFileOpened };
}

function openedIds(onFileOpened: { mock: { calls: [OpenedFileInfo][] } }) {
  return onFileOpened.mock.calls.map(([info]) => info.id);
}

describe("usePdfFileIntake", () => {
  beforeEach(() => {
    vi.mocked(openPdfFile).mockReset();
  });

  it("opens files in order and reports the ones that fail", async () => {
    const opened = openedPdf({ pageCount: 3, isLarge: true });
    vi.mocked(openPdfFile)
      .mockResolvedValueOnce(opened)
      .mockRejectedValueOnce(new PdfOpenError("password-required"));
    const { result, sink, onFileOpened } = renderIntake();

    await act(async () => {
      await result.current.openFiles([pdfFile("a.pdf"), pdfFile("b.pdf")]);
    });

    expect(
      vi.mocked(openPdfFile).mock.calls.map(([file]) => file.name),
    ).toEqual(["a.pdf", "b.pdf"]);
    expect(onFileOpened).toHaveBeenCalledTimes(1);
    expect(onFileOpened).toHaveBeenCalledWith({
      id: "file-1",
      name: "a.pdf",
      pageCount: 3,
      toneIndex: 0,
      isSigned: false,
      isLarge: true,
    });
    expect(sink.add).toHaveBeenCalledTimes(1);
    expect(sink.add).toHaveBeenCalledWith("file-1", opened);
    expect(result.current.notices).toEqual([
      expect.objectContaining({
        fileName: "b.pdf",
        reason: "password-required",
      }),
    ]);
    expect(result.current.openingCount).toBe(0);
  });

  it("hands the source to the sink before the file reaches the grid", async () => {
    const callOrder: string[] = [];
    vi.mocked(openPdfFile).mockResolvedValueOnce(openedPdf({}));
    const sink = { add: vi.fn(() => callOrder.push("sink")) };
    const onFileOpened = vi.fn(() => callOrder.push("grid"));
    const { result } = renderHook(() =>
      usePdfFileIntake({ sink, onFileOpened }),
    );

    await act(async () => {
      await result.current.openFiles([pdfFile("a.pdf")]);
    });

    expect(callOrder).toEqual(["sink", "grid"]);
  });

  it("gives the same file opened twice two file ids", async () => {
    vi.mocked(openPdfFile).mockResolvedValue(openedPdf({ pageCount: 2 }));
    const { result, sink, onFileOpened } = renderIntake();
    const file = pdfFile("Contract.pdf");

    await act(async () => {
      await result.current.openFiles([file, file]);
    });

    expect(openedIds(onFileOpened)).toEqual(["file-1", "file-2"]);
    expect(onFileOpened.mock.calls.map(([info]) => info.toneIndex)).toEqual([
      0, 1,
    ]);
    expect(sink.add.mock.calls.map(([fileId]) => fileId)).toEqual([
      "file-1",
      "file-2",
    ]);
  });

  it("keeps counting file ids and tones across separate picks", async () => {
    vi.mocked(openPdfFile).mockResolvedValue(openedPdf({}));
    const { result, onFileOpened } = renderIntake();
    const picks = Array.from(
      { length: FILE_TONE_COUNT + 1 },
      (_unused, index) => pdfFile(`page-${index}.pdf`),
    );

    await act(async () => {
      await result.current.openFiles(picks.slice(0, 2));
    });
    await act(async () => {
      await result.current.openFiles(picks.slice(2));
    });

    expect(openedIds(onFileOpened)).toEqual(
      picks.map((_file, index) => `file-${index + 1}`),
    );
    expect(onFileOpened.mock.calls.map(([info]) => info.toneIndex)).toEqual([
      0, 1, 2, 3, 4, 5, 0,
    ]);
  });

  it("gives a failed file no tone", async () => {
    vi.mocked(openPdfFile)
      .mockRejectedValueOnce(new PdfOpenError("not-pdf"))
      .mockResolvedValueOnce(openedPdf({}));
    const { result, onFileOpened } = renderIntake();

    await act(async () => {
      await result.current.openFiles([pdfFile("a.txt"), pdfFile("b.pdf")]);
    });

    expect(onFileOpened).toHaveBeenCalledWith(
      expect.objectContaining({ name: "b.pdf", toneIndex: 0 }),
    );
  });

  it("reports an unexpected failure as a damaged file", async () => {
    vi.mocked(openPdfFile).mockRejectedValueOnce(new Error("x"));
    const { result, onFileOpened } = renderIntake();

    await act(async () => {
      await result.current.openFiles([pdfFile("odd.pdf")]);
    });

    expect(onFileOpened).not.toHaveBeenCalled();
    expect(result.current.notices).toEqual([
      expect.objectContaining({ fileName: "odd.pdf", reason: "damaged" }),
    ]);
  });

  it("gives each notice its own id and dismisses one or all", async () => {
    vi.mocked(openPdfFile).mockRejectedValue(new PdfOpenError("too-large"));
    const { result } = renderIntake();

    await act(async () => {
      await result.current.openFiles([
        pdfFile("one.pdf"),
        pdfFile("two.pdf"),
        pdfFile("three.pdf"),
      ]);
    });
    const noticeIds = result.current.notices.map((notice) => notice.id);
    expect(new Set(noticeIds).size).toBe(3);

    act(() => result.current.dismissNotice(noticeIds[1] ?? ""));
    expect(result.current.notices.map((notice) => notice.fileName)).toEqual([
      "one.pdf",
      "three.pdf",
    ]);

    act(() => result.current.clearNotices());
    expect(result.current.notices).toEqual([]);
  });

  it("counts the files still opening", async () => {
    const pendingOpen: { resolve: (opened: OpenedPdf) => void } = {
      resolve: () => undefined,
    };
    vi.mocked(openPdfFile)
      .mockReturnValueOnce(
        new Promise<OpenedPdf>((resolve) => {
          pendingOpen.resolve = resolve;
        }),
      )
      .mockResolvedValueOnce(openedPdf({}));
    const { result } = renderIntake();

    let openingDone: Promise<void> = Promise.resolve();
    act(() => {
      openingDone = result.current.openFiles([
        pdfFile("a.pdf"),
        pdfFile("b.pdf"),
      ]);
    });
    expect(result.current.openingCount).toBe(2);

    await act(async () => {
      pendingOpen.resolve(openedPdf({}));
      await openingDone;
    });
    expect(result.current.openingCount).toBe(0);
  });

  it("stops the batch and frees the open file when the toolkit unmounts", async () => {
    const destroy = vi.fn(() => Promise.resolve());
    const lateOpened = {
      ...openedPdf({}),
      pdfjsDocument: { loadingTask: { destroy } },
    } as unknown as OpenedPdf;
    const pendingOpen: { resolve: (opened: OpenedPdf) => void } = {
      resolve: () => undefined,
    };
    vi.mocked(openPdfFile)
      .mockReturnValueOnce(
        new Promise<OpenedPdf>((resolve) => {
          pendingOpen.resolve = resolve;
        }),
      )
      .mockResolvedValue(openedPdf({}));
    const { result, sink, onFileOpened, unmount } = renderIntake();

    let openingDone: Promise<void> = Promise.resolve();
    act(() => {
      openingDone = result.current.openFiles([
        pdfFile("a.pdf"),
        pdfFile("b.pdf"),
        pdfFile("c.pdf"),
      ]);
    });
    unmount();
    pendingOpen.resolve(lateOpened);
    await openingDone;

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(sink.add).not.toHaveBeenCalled();
    expect(onFileOpened).not.toHaveBeenCalled();
    expect(openPdfFile).toHaveBeenCalledTimes(1);
  });
});
