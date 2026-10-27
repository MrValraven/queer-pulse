import {
  degrees,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFPage,
  PDFRawStream,
  PDFRef,
  PDFString,
  StandardFonts,
} from "pdf-lib";

/** Test helpers for *.test.ts files. App code does not import this file. */

const PAGE_HEIGHT = 300;
const DEFAULT_FIRST_WIDTH = 200;
const WIDTH_STEP = 10;

function requirePage(pages: PDFPage[], pageIndex: number): PDFPage {
  const page = pages[pageIndex];
  if (!page)
    throw new Error(`Fixture document has no page at index ${pageIndex}`);
  return page;
}

export async function makePdfBytes(options: {
  pageCount: number;
  firstWidth?: number;
  rotations?: number[];
}): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const firstWidth = options.firstWidth ?? DEFAULT_FIRST_WIDTH;
  for (let pageIndex = 0; pageIndex < options.pageCount; pageIndex += 1) {
    const page = document.addPage([
      firstWidth + pageIndex * WIDTH_STEP,
      PAGE_HEIGHT,
    ]);
    page.setRotation(degrees(options.rotations?.[pageIndex] ?? 0));
  }
  return document.save();
}

export async function makeSignedPdfBytes(
  options: { isSignatureFilled?: boolean; isNestedField?: boolean } = {},
): Promise<Uint8Array> {
  const isSignatureFilled = options.isSignatureFilled ?? true;
  const isNestedField = options.isNestedField ?? false;
  const document = await PDFDocument.create();
  const page = document.addPage([200, PAGE_HEIGHT]);
  const { context } = document;

  const signatureRef = context.register(
    context.obj({
      Type: "Sig",
      Filter: "Adobe.PPKLite",
      ByteRange: [0, 0, 0, 0],
    }),
  );

  const widgetEntries: Record<string, unknown> = {
    Type: "Annot",
    Subtype: "Widget",
    Rect: [10, 10, 110, 40],
    P: page.ref,
  };
  if (isSignatureFilled) widgetEntries.V = signatureRef;

  let topFieldRef: PDFRef;
  let widgetRef: PDFRef;
  if (isNestedField) {
    const parentRef = context.nextRef();
    widgetEntries.Parent = parentRef;
    widgetRef = context.register(context.obj(widgetEntries as never));
    context.assign(
      parentRef,
      context.obj({
        FT: "Sig",
        T: PDFString.of("signature"),
        Kids: [widgetRef],
      }),
    );
    topFieldRef = parentRef;
  } else {
    widgetEntries.FT = "Sig";
    widgetEntries.T = PDFString.of("signature");
    widgetRef = context.register(context.obj(widgetEntries as never));
    topFieldRef = widgetRef;
  }

  page.node.set(PDFName.of("Annots"), context.obj([widgetRef]));
  const acroFormRef = context.register(
    context.obj({ Fields: [topFieldRef], SigFlags: isSignatureFilled ? 3 : 0 }),
  );
  document.catalog.set(PDFName.of("AcroForm"), acroFormRef);
  return document.save();
}

export async function makeFakeRestrictedPdfBytes(): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.addPage([200, PAGE_HEIGHT]);
  document.context.trailerInfo.Encrypt = document.context.obj({
    Filter: "Standard",
    V: 1,
    R: 2,
    O: PDFString.of("owner"),
    U: PDFString.of("user"),
    P: -4,
  });
  return document.save();
}

export async function makeCrossLinkedPdfBytes(): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const pages = [0, 1, 2, 3].map((pageIndex) =>
    document.addPage([
      DEFAULT_FIRST_WIDTH + pageIndex * WIDTH_STEP,
      PAGE_HEIGHT,
    ]),
  );
  const { context } = document;
  const pageOne = requirePage(pages, 0);
  const pageThree = requirePage(pages, 2);
  const catalogRef = context.trailerInfo.Root;
  if (!catalogRef)
    throw new Error("Fixture document has no catalog reference in its trailer");

  const linkRef = context.register(
    context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [0, 0, 50, 20],
      Dest: [pageThree.ref, "Fit"],
    }),
  );

  const fieldRef = context.nextRef();
  const firstWidgetRef = context.register(
    context.obj({
      Type: "Annot",
      Subtype: "Widget",
      Rect: [0, 30, 50, 50],
      P: pageOne.ref,
      Parent: fieldRef,
    }),
  );
  const thirdWidgetRef = context.register(
    context.obj({
      Type: "Annot",
      Subtype: "Widget",
      Rect: [0, 30, 50, 50],
      P: pageThree.ref,
      Parent: fieldRef,
    }),
  );
  context.assign(
    fieldRef,
    context.obj({
      FT: "Tx",
      T: PDFString.of("name"),
      Kids: [firstWidgetRef, thirdWidgetRef],
    }),
  );
  pageThree.node.set(PDFName.of("Annots"), context.obj([thirdWidgetRef]));

  const signatureRef = context.register(
    context.obj({
      Type: "Sig",
      Filter: "Adobe.PPKLite",
      ByteRange: [0, 0, 0, 0],
      Reference: [{ TransformMethod: "DocMDP", Data: catalogRef }],
    }),
  );
  const signatureWidgetRef = context.register(
    context.obj({
      Type: "Annot",
      Subtype: "Widget",
      FT: "Sig",
      T: PDFString.of("sig"),
      Rect: [0, 60, 50, 80],
      P: pageOne.ref,
      V: signatureRef,
    }),
  );

  pageOne.node.set(
    PDFName.of("Annots"),
    context.obj([linkRef, firstWidgetRef, signatureWidgetRef]),
  );
  document.catalog.set(
    PDFName.of("AcroForm"),
    context.obj({ Fields: [fieldRef, signatureWidgetRef] }),
  );
  return document.save();
}

export async function makeSharedResourcesPdfBytes(): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const { context } = document;

  const imageRefs = [0, 1, 2].map((imageIndex) =>
    context.register(
      context.stream(new Uint8Array([40 + imageIndex * 60]), {
        Type: "XObject",
        Subtype: "Image",
        Width: 1,
        Height: 1,
        ColorSpace: "DeviceGray",
        BitsPerComponent: 8,
      }),
    ),
  );
  const fontRefs = [StandardFonts.Helvetica, StandardFonts.Courier].map(
    (baseFont) =>
      context.register(
        context.obj({ Type: "Font", Subtype: "Type1", BaseFont: baseFont }),
      ),
  );

  const resourcesRef = context.register(
    context.obj({
      XObject: { Im0: imageRefs[0], Im1: imageRefs[1], Im2: imageRefs[2] },
      Font: { F0: fontRefs[0], F1: fontRefs[1] },
    }),
  );

  for (let pageIndex = 0; pageIndex < 3; pageIndex += 1) {
    const page = document.addPage([
      DEFAULT_FIRST_WIDTH + pageIndex * WIDTH_STEP,
      PAGE_HEIGHT,
    ]);
    const textOperators =
      pageIndex === 0 ? " BT /F0 12 Tf 10 10 Td (Hello) Tj ET" : "";
    const contentRef = context.register(
      context.stream(`q 10 0 0 10 0 0 cm /Im${pageIndex} Do Q${textOperators}`),
    );
    page.node.set(PDFName.of("Resources"), resourcesRef);
    page.node.set(PDFName.of("Contents"), contentRef);
  }
  return document.save();
}

export function countPageObjects(document: PDFDocument): number {
  return document.context
    .enumerateIndirectObjects()
    .filter(
      ([, object]) =>
        object instanceof PDFDict &&
        object.get(PDFName.of("Type")) === PDFName.of("Page"),
    ).length;
}

export function countImageObjects(document: PDFDocument): number {
  return document.context
    .enumerateIndirectObjects()
    .filter(
      ([, object]) =>
        object instanceof PDFRawStream &&
        object.dict.get(PDFName.of("Subtype")) === PDFName.of("Image"),
    ).length;
}

export function countFontObjects(document: PDFDocument): number {
  return document.context
    .enumerateIndirectObjects()
    .filter(
      ([, object]) =>
        object instanceof PDFDict &&
        object.get(PDFName.of("Type")) === PDFName.of("Font"),
    ).length;
}

export function pageWidths(document: PDFDocument): number[] {
  return document.getPages().map((page) => page.getWidth());
}
