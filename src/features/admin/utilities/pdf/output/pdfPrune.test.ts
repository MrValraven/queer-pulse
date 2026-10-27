// @vitest-environment node
import type { PDFPage } from "pdf-lib";
import { PDFDict, PDFDocument, PDFName } from "pdf-lib";
import { describe, expect, it } from "vitest";
import {
  countFontObjects,
  countImageObjects,
  countPageObjects,
  makeSharedResourcesPdfBytes,
} from "../testing/pdfTestFixtures";
import {
  contentResourceNames,
  dropUnreachableObjects,
  pruneUnusedResources,
} from "./pdfPrune";

function resourceNames(page: PDFPage, category: "XObject" | "Font"): string[] {
  const resources = page.node.Resources();
  if (!resources) return [];
  const categoryDict = resources.lookupMaybe(PDFName.of(category), PDFDict);
  return categoryDict ? categoryDict.keys().map(String) : [];
}

/**
 * The shared-resources fixture with its middle page removed, saved and
 * loaded again: pdf-lib's removePage leaves its page cache stale, so the
 * removed page would still show up in getPages() on the same document.
 * The removed page stays in the file as an orphan object until the sweep.
 */
async function loadWithoutMiddlePage(): Promise<PDFDocument> {
  const source = await PDFDocument.load(await makeSharedResourcesPdfBytes());
  source.removePage(1);
  return PDFDocument.load(await source.save());
}

describe("contentResourceNames", () => {
  it("finds the images and fonts a content stream draws", () => {
    const names = contentResourceNames(
      new TextEncoder().encode("q /Im0 Do Q BT /F1 12 Tf (x) Tj ET /Im3 Do"),
    );
    expect([...names.xObjects]).toEqual(["Im0", "Im3"]);
    expect([...names.fonts]).toEqual(["F1"]);
  });

  it("reads names across line breaks and decimal font sizes", () => {
    const names = contentResourceNames(
      new TextEncoder().encode("BT\n/TT2 9.5 Tf\nET\n/Fm1\nDo\n/F3 .5 Tf"),
    );
    expect([...names.xObjects]).toEqual(["Fm1"]);
    expect([...names.fonts]).toEqual(["TT2", "F3"]);
  });

  it("finds nothing in a stream that draws no named resource", () => {
    const names = contentResourceNames(
      new TextEncoder().encode("0 0 100 100 re f"),
    );
    expect(names.xObjects.size).toBe(0);
    expect(names.fonts.size).toBe(0);
  });
});

describe("pruneUnusedResources", () => {
  it("gives each page its own resources with only what it draws", async () => {
    const output = await loadWithoutMiddlePage();
    expect(output.getPageCount()).toBe(2);
    pruneUnusedResources(output);
    const xObjectNames = output
      .getPages()
      .map((page) =>
        page.node
          .Resources()!
          .lookup(PDFName.of("XObject"), PDFDict)
          .keys()
          .map(String),
      );
    expect(xObjectNames).toEqual([["/Im0"], ["/Im2"]]);
    expect(
      output.getPages().map((page) => resourceNames(page, "Font")),
    ).toEqual([["/F0"], []]);
  });

  it("keeps every resource of a page whose content cannot be decoded", async () => {
    const output = await PDFDocument.load(await makeSharedResourcesPdfBytes());
    const [firstPage, , thirdPage] = output.getPages();
    if (!firstPage || !thirdPage) throw new Error("Expected three pages");
    const undecodableContentRef = output.context.register(
      output.context.stream(new Uint8Array([0, 1, 2, 3]), {
        Filter: "JBIG2Decode",
      }),
    );
    firstPage.node.set(PDFName.of("Contents"), undecodableContentRef);

    pruneUnusedResources(output);

    expect(resourceNames(firstPage, "XObject")).toEqual([
      "/Im0",
      "/Im1",
      "/Im2",
    ]);
    expect(resourceNames(firstPage, "Font")).toEqual(["/F0", "/F1"]);
    expect(resourceNames(thirdPage, "XObject")).toEqual(["/Im2"]);
  });

  it("keeps an image whose name and Do operator sit in two content streams", async () => {
    const output = await PDFDocument.load(await makeSharedResourcesPdfBytes());
    const [firstPage] = output.getPages();
    if (!firstPage) throw new Error("Expected a first page");
    const { context } = output;
    const splitContents = context.obj([
      context.register(context.stream("q 10 0 0 10 0 0 cm /Im0")),
      context.register(context.stream("Do Q")),
    ]);
    firstPage.node.set(PDFName.of("Contents"), splitContents);

    pruneUnusedResources(output);

    expect(resourceNames(firstPage, "XObject")).toEqual(["/Im0"]);
    expect(resourceNames(firstPage, "Font")).toEqual([]);
  });
});

describe("dropUnreachableObjects", () => {
  it("drops objects nothing points at any more", async () => {
    const output = await loadWithoutMiddlePage();
    expect(countImageObjects(output)).toBe(3);
    expect(countPageObjects(output)).toBe(3);
    pruneUnusedResources(output);
    dropUnreachableObjects(output);
    expect(countImageObjects(output)).toBe(2);
    expect(countPageObjects(output)).toBe(2);
    expect(countFontObjects(output)).toBe(1);
  });

  it("keeps the document saveable and readable after the sweep", async () => {
    const output = await loadWithoutMiddlePage();
    pruneUnusedResources(output);
    dropUnreachableObjects(output);
    const reloaded = await PDFDocument.load(await output.save());
    expect(reloaded.getPageCount()).toBe(2);
    expect(countImageObjects(reloaded)).toBe(2);
  });
});
