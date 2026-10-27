import { PDFArray, PDFDict, PDFName } from "pdf-lib";
import type { PDFDocument, PDFObject } from "pdf-lib";

/**
 * Keys that let an annotation reach other pages or the document catalog:
 * its page, its form field (whose other widgets sit on other pages), its
 * actions, the annotation it replies to and a field or signature value.
 * Annotations never hold /Kids, so a stray one goes as well.
 */
const ANNOTATION_LINK_KEYS = [
  "P",
  "Parent",
  "A",
  "AA",
  "IRT",
  "V",
  "DV",
  "Kids",
];

/**
 * Page keys that can reach other pages: article beads, page actions,
 * application data (Illustrator keeps every artboard under the first page's
 * /PieceInfo), separation data, document parts and presentation steps.
 */
const PAGE_LINK_KEYS = [
  "B",
  "AA",
  "PieceInfo",
  "SeparationInfo",
  "DPart",
  "PresSteps",
];

const sanitizedDocuments = new WeakSet<PDFDocument>();

function sanitizeAnnotations(document: PDFDocument, pageNode: PDFDict): void {
  const annotationsKey = PDFName.of("Annots");
  const annotations = document.context.lookup(pageNode.get(annotationsKey));
  if (annotations === undefined) return;
  if (!(annotations instanceof PDFArray)) {
    pageNode.delete(annotationsKey);
    return;
  }

  const keptEntries: PDFObject[] = [];
  for (let position = 0; position < annotations.size(); position += 1) {
    const annotation = annotations.lookup(position);
    if (!(annotation instanceof PDFDict)) continue;
    // Internal links point at other pages, so they are left out of the copy.
    if (annotation.get(PDFName.of("Subtype")) === PDFName.of("Link")) continue;
    for (const key of ANNOTATION_LINK_KEYS) annotation.delete(PDFName.of(key));
    // The appearance stream (/AP) stays, so the page looks the same.
    keptEntries.push(annotations.get(position));
  }

  if (keptEntries.length === 0) pageNode.delete(annotationsKey);
  else pageNode.set(annotationsKey, document.context.obj(keptEntries));
}

/**
 * Makes every page a plain page copy that cannot drag other pages into an
 * output file: the page keys above and every annotation reference to another
 * page or the catalog go. Mutates the source and runs once per
 * document.
 */
export function sanitizeForPageCopy(document: PDFDocument): void {
  if (sanitizedDocuments.has(document)) return;
  for (const page of document.getPages()) {
    for (const key of PAGE_LINK_KEYS) page.node.delete(PDFName.of(key));
    sanitizeAnnotations(document, page.node);
  }
  sanitizedDocuments.add(document);
}
