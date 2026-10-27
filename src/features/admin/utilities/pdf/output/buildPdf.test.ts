// @vitest-environment node
import { PDFDocument, PDFName } from "pdf-lib";
import { beforeEach, describe, expect, it } from "vitest";
import {
  countFontObjects,
  countImageObjects,
  countPageObjects,
  makeCrossLinkedPdfBytes,
  makePdfBytes,
  makeSharedResourcesPdfBytes,
  pageWidths,
} from "../testing/pdfTestFixtures";
import type { OutputPage } from "./buildPdf";
import { buildPdf, buildPdfSet, normalizeQuarterTurn } from "./buildPdf";
import { PdfBuildError } from "./pdfBuildError";

const sources = new Map<string, PDFDocument>();

function getSource(fileId: string): PDFDocument {
  const source = sources.get(fileId);
  if (!source) throw new Error("Test source is missing");
  return source;
}

function pageOf(fileId: string, sourceIndex: number): OutputPage {
  return { fileId, sourceIndex, rotation: 0 };
}

const SECOND_PAGE_MARKER = "second-page-only-text";

/** Two pages where the first page's /PieceInfo points at the second page and its content stream. */
async function makePieceInfoPdfBytes(): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const firstPage = document.addPage([200, 300]);
  const secondPage = document.addPage([210, 300]);
  const { context } = document;
  const secondContentRef = context.register(
    context.stream(`BT (${SECOND_PAGE_MARKER}) Tj ET`),
  );
  secondPage.node.set(PDFName.of("Contents"), secondContentRef);
  firstPage.node.set(
    PDFName.of("PieceInfo"),
    context.obj({
      Illustrator: {
        Private: { Artboard: secondContentRef, Page: secondPage.ref },
      },
    }),
  );
  return document.save();
}

function containsText(bytes: Uint8Array, text: string): boolean {
  return new TextDecoder().decode(bytes).includes(text);
}

describe("buildPdf", () => {
  beforeEach(() => {
    sources.clear();
  });

  it("builds the four-page file without page three", async () => {
    sources.set(
      "a",
      await PDFDocument.load(await makePdfBytes({ pageCount: 4 })),
    );
    const output = await PDFDocument.load(
      await buildPdf(
        [0, 1, 3].map((sourceIndex) => pageOf("a", sourceIndex)),
        getSource,
      ),
    );
    expect(pageWidths(output)).toEqual([200, 210, 230]);
    expect(countPageObjects(output)).toBe(3);
  });

  it("merges two files in grid order", async () => {
    sources.set(
      "a",
      await PDFDocument.load(
        await makePdfBytes({ pageCount: 2, firstWidth: 200 }),
      ),
    );
    sources.set(
      "b",
      await PDFDocument.load(
        await makePdfBytes({ pageCount: 2, firstWidth: 300 }),
      ),
    );
    const output = await PDFDocument.load(
      await buildPdf(
        [pageOf("a", 0), pageOf("b", 0), pageOf("a", 1)],
        getSource,
      ),
    );
    expect(pageWidths(output)).toEqual([200, 300, 210]);
  });

  it("adds the edit rotation to the page's own rotation", async () => {
    sources.set(
      "r",
      await PDFDocument.load(
        await makePdfBytes({ pageCount: 3, rotations: [90, -90, 0] }),
      ),
    );
    const output = await PDFDocument.load(
      await buildPdf(
        [
          { fileId: "r", sourceIndex: 0, rotation: 90 },
          { fileId: "r", sourceIndex: 1, rotation: 90 },
          { fileId: "r", sourceIndex: 2, rotation: 270 },
        ],
        getSource,
      ),
    );
    expect(output.getPages().map((page) => page.getRotation().angle)).toEqual([
      180, 0, 270,
    ]);
  });

  it("leaves a removed page out of the file even when a kept page points at it", async () => {
    sources.set("x", await PDFDocument.load(await makeCrossLinkedPdfBytes()));
    const output = await PDFDocument.load(
      await buildPdf([pageOf("x", 0)], getSource),
    );
    expect(countPageObjects(output)).toBe(1);
    expect(pageWidths(output)).toEqual([200]);
  });

  it("leaves a removed page out of the file when a kept page reaches it through application data", async () => {
    const sourceBytes = await makePieceInfoPdfBytes();
    expect(containsText(sourceBytes, SECOND_PAGE_MARKER)).toBe(true);
    sources.set("p", await PDFDocument.load(sourceBytes));
    const outputBytes = await buildPdf([pageOf("p", 0)], getSource);
    const output = await PDFDocument.load(outputBytes);
    expect(countPageObjects(output)).toBe(1);
    expect(
      output.getPages()[0]?.node.get(PDFName.of("PieceInfo")),
    ).toBeUndefined();
    expect(containsText(outputBytes, SECOND_PAGE_MARKER)).toBe(false);
  });

  it("leaves a removed page's image out of the file when pages share one resource bundle", async () => {
    sources.set(
      "s",
      await PDFDocument.load(await makeSharedResourcesPdfBytes()),
    );
    const output = await PDFDocument.load(
      await buildPdf(
        [0, 2].map((sourceIndex) => pageOf("s", sourceIndex)),
        getSource,
      ),
    );
    expect(countImageObjects(output)).toBe(2);
    expect(countFontObjects(output)).toBe(1);
  });

  it("can build again from the same sources", async () => {
    sources.set(
      "a",
      await PDFDocument.load(await makePdfBytes({ pageCount: 4 })),
    );
    const pages = [0, 2, 3].map((sourceIndex) => pageOf("a", sourceIndex));
    const firstOutput = await PDFDocument.load(
      await buildPdf(pages, getSource),
    );
    const secondOutput = await PDFDocument.load(
      await buildPdf(pages, getSource),
    );
    expect(firstOutput.getPageCount()).toBe(3);
    expect(secondOutput.getPageCount()).toBe(3);
    expect(pageWidths(secondOutput)).toEqual([200, 220, 230]);
  });

  it("reports a failed build as the PDF step", async () => {
    const failingBuild = buildPdf([pageOf("missing", 0)], () => {
      throw new Error("gone");
    });
    await expect(failingBuild).rejects.toBeInstanceOf(PdfBuildError);
    await expect(failingBuild).rejects.toMatchObject({ step: "pdf" });
  });

  it("reports a page index past the end of its file as the PDF step", async () => {
    sources.set(
      "a",
      await PDFDocument.load(await makePdfBytes({ pageCount: 2 })),
    );
    await expect(buildPdf([pageOf("a", 5)], getSource)).rejects.toMatchObject({
      step: "pdf",
    });
  });
});

describe("buildPdfSet", () => {
  beforeEach(() => {
    sources.clear();
  });

  it("builds one PDF per chunk under the given names", async () => {
    sources.set(
      "a",
      await PDFDocument.load(await makePdfBytes({ pageCount: 3 })),
    );
    const pageA0 = pageOf("a", 0);
    const pageA1 = pageOf("a", 1);
    const pageA2 = pageOf("a", 2);
    const entries = await buildPdfSet([[pageA0], [pageA1, pageA2]], getSource, [
      "a-part-1.pdf",
      "a-part-2.pdf",
    ]);
    expect(entries.map((entry) => entry.fileName)).toEqual([
      "a-part-1.pdf",
      "a-part-2.pdf",
    ]);
    const [firstEntry, secondEntry] = entries;
    if (!firstEntry || !secondEntry) throw new Error("Expected two entries");
    expect(pageWidths(await PDFDocument.load(firstEntry.bytes))).toEqual([200]);
    const secondOutput = await PDFDocument.load(secondEntry.bytes);
    expect(secondOutput.getPageCount()).toBe(2);
    expect(pageWidths(secondOutput)).toEqual([210, 220]);
  });

  it("reports a name count that differs from the chunk count as the PDF step", async () => {
    sources.set(
      "a",
      await PDFDocument.load(await makePdfBytes({ pageCount: 2 })),
    );
    await expect(
      buildPdfSet([[pageOf("a", 0)], [pageOf("a", 1)]], getSource, [
        "a-part-1.pdf",
      ]),
    ).rejects.toMatchObject({ step: "pdf" });
  });
});

describe("normalizeQuarterTurn", () => {
  it("normalises odd page rotations", () => {
    expect([-90, 450, 360, 0].map(normalizeQuarterTurn)).toEqual([
      270, 90, 0, 0,
    ]);
  });

  it("turns every multiple of a full turn back to zero", () => {
    expect([-360, 720, -720].map(normalizeQuarterTurn)).toEqual([0, 0, 0]);
    expect([-180, 540, -450].map(normalizeQuarterTurn)).toEqual([
      180, 180, 270,
    ]);
  });
});
