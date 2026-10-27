import type { PDFDocumentProxy } from "pdfjs-dist";

export const THUMBNAIL_RENDER_WIDTH_PX = 320;

export type ThumbnailRenderer = (
  document: PDFDocumentProxy,
  sourceIndex: number,
  targetWidth: number,
) => Promise<Blob>;

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("thumbnail-encode-failed"));
    }, "image/png");
  });
}

/**
 * Draws one page at `targetWidth` CSS pixels wide. The viewport keeps the
 * page's own /Rotate, so a scanned page that already carries one renders
 * upright. The canvas is emptied afterwards to free its memory on iOS.
 */
export const renderPdfjsThumbnail: ThumbnailRenderer = async (
  pdfjsDocument,
  sourceIndex,
  targetWidth,
) => {
  const page = await pdfjsDocument.getPage(sourceIndex + 1);
  const canvas = document.createElement("canvas");
  try {
    const naturalViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({
      scale: targetWidth / naturalViewport.width,
    });
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    await page.render({ canvas, viewport }).promise;
    return await canvasToPngBlob(canvas);
  } finally {
    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }
};
