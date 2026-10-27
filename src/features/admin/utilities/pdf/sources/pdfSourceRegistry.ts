import type { PDFDocument } from "pdf-lib";
import type { OpenedPdf } from "../io/openPdfFile";
import { closePdfjsDocument } from "../io/pdfjsLoader";
import {
  renderPdfjsThumbnail,
  THUMBNAIL_RENDER_WIDTH_PX,
} from "./thumbnailRenderer";
import type { ThumbnailRenderer } from "./thumbnailRenderer";

const MAX_CONCURRENT_RENDERS = 2;

type PdfSource = Pick<OpenedPdf, "pdfLibDocument" | "pdfjsDocument">;

/** Every member is a closure, so each one can be passed around unbound. */
export interface PdfSourceRegistry {
  add: (fileId: string, source: PdfSource) => void;
  /** Throws Error("unknown-file") for an id it never received. */
  getPdfLibDocument: (fileId: string) => PDFDocument;
  /**
   * Cached per page. A failed render stays cached as a rejection. Once every
   * caller that passed a signal has aborted, a still-queued render is
   * withdrawn and its cache entry dropped, so a later call queues it again.
   */
  getThumbnailUrl: (
    fileId: string,
    sourceIndex: number,
    signal?: AbortSignal,
  ) => Promise<string>;
  /** Closes every document and frees every URL. The registry stays usable. */
  dispose: () => void;
}

export interface PdfSourceRegistryOptions {
  renderThumbnail?: ThumbnailRenderer;
  createObjectUrl?: (blob: Blob) => string;
  revokeObjectUrl?: (url: string) => void;
}

interface RenderRequest {
  cacheKey: string;
  source: PdfSource;
  sourceIndex: number;
  resolve: (url: string) => void;
  reject: (error: unknown) => void;
  /** Set by a caller without a signal, who can never withdraw. */
  hasLastingInterest: boolean;
  /** Callers with a signal that has yet to abort. */
  abortableInterestCount: number;
}

/**
 * The one place that holds the open pdfjs documents. Thumbnails render at
 * most two at a time, since every render decodes a full page on the worker.
 * The newest request renders first: after a long scroll the tiles on screen
 * asked last, and the pages scrolled past can wait.
 */
export function createPdfSourceRegistry(
  options: PdfSourceRegistryOptions = {},
): PdfSourceRegistry {
  const renderThumbnail = options.renderThumbnail ?? renderPdfjsThumbnail;
  const createObjectUrl =
    options.createObjectUrl ?? ((blob: Blob) => URL.createObjectURL(blob));
  const revokeObjectUrl =
    options.revokeObjectUrl ?? ((url: string) => URL.revokeObjectURL(url));

  const sources = new Map<string, PdfSource>();
  const thumbnailUrls = new Map<string, Promise<string>>();
  const objectUrls = new Set<string>();
  let queuedRequests: RenderRequest[] = [];
  let activeRenderCount = 0;
  // Bumped by dispose, so renders still in flight from before it are dropped.
  let generation = 0;

  async function runRender(request: RenderRequest): Promise<void> {
    const renderGeneration = generation;
    activeRenderCount += 1;
    try {
      const blob = await renderThumbnail(
        request.source.pdfjsDocument,
        request.sourceIndex,
        THUMBNAIL_RENDER_WIDTH_PX,
      );
      if (renderGeneration !== generation) {
        request.reject(new Error("registry-disposed"));
        return;
      }
      const url = createObjectUrl(blob);
      objectUrls.add(url);
      request.resolve(url);
    } catch (error) {
      request.reject(
        renderGeneration === generation
          ? new Error("thumbnail-render-failed", { cause: error })
          : new Error("registry-disposed"),
      );
    } finally {
      if (renderGeneration === generation) {
        activeRenderCount -= 1;
        startQueuedRenders();
      }
    }
  }

  function startQueuedRenders(): void {
    while (
      activeRenderCount < MAX_CONCURRENT_RENDERS &&
      queuedRequests.length > 0
    ) {
      const nextRequest = queuedRequests.pop();
      if (nextRequest) void runRender(nextRequest);
    }
  }

  function getPdfLibDocument(fileId: string): PDFDocument {
    const source = sources.get(fileId);
    if (!source) throw new Error("unknown-file");
    return source.pdfLibDocument;
  }

  function withdrawIfUnwanted(request: RenderRequest): void {
    if (request.hasLastingInterest || request.abortableInterestCount > 0) {
      return;
    }
    const queuePosition = queuedRequests.indexOf(request);
    if (queuePosition === -1) return;
    queuedRequests.splice(queuePosition, 1);
    thumbnailUrls.delete(request.cacheKey);
    request.reject(new Error("thumbnail-withdrawn"));
  }

  function registerInterest(request: RenderRequest, signal?: AbortSignal) {
    if (!signal) {
      request.hasLastingInterest = true;
      return;
    }
    if (signal.aborted) return;
    request.abortableInterestCount += 1;
    signal.addEventListener(
      "abort",
      () => {
        request.abortableInterestCount -= 1;
        withdrawIfUnwanted(request);
      },
      { once: true },
    );
  }

  function getThumbnailUrl(
    fileId: string,
    sourceIndex: number,
    signal?: AbortSignal,
  ): Promise<string> {
    const cacheKey = `${fileId}:${sourceIndex}`;
    const cachedUrl = thumbnailUrls.get(cacheKey);
    if (cachedUrl) {
      const queuedRequest = queuedRequests.find(
        (request) => request.cacheKey === cacheKey,
      );
      if (queuedRequest) registerInterest(queuedRequest, signal);
      return cachedUrl;
    }

    const source = sources.get(fileId);
    if (!source) return Promise.reject(new Error("unknown-file"));

    if (signal?.aborted) {
      return Promise.reject(new Error("thumbnail-withdrawn"));
    }

    let resolveUrl: (url: string) => void = () => undefined;
    let rejectUrl: (error: unknown) => void = () => undefined;
    const thumbnailUrl = new Promise<string>((resolve, reject) => {
      resolveUrl = resolve;
      rejectUrl = reject;
    });
    // A tile that unmounts before its render settles leaves no listener.
    thumbnailUrl.catch(() => undefined);
    const request: RenderRequest = {
      cacheKey,
      source,
      sourceIndex,
      resolve: resolveUrl,
      reject: rejectUrl,
      hasLastingInterest: false,
      abortableInterestCount: 0,
    };
    registerInterest(request, signal);
    queuedRequests.push(request);
    thumbnailUrls.set(cacheKey, thumbnailUrl);
    startQueuedRenders();
    return thumbnailUrl;
  }

  function add(fileId: string, source: PdfSource): void {
    sources.set(fileId, source);
  }

  function dispose(): void {
    generation += 1;
    activeRenderCount = 0;
    const abandonedRequests = queuedRequests;
    queuedRequests = [];
    for (const request of abandonedRequests) {
      request.reject(new Error("registry-disposed"));
    }
    for (const source of sources.values()) {
      closePdfjsDocument(source.pdfjsDocument);
    }
    sources.clear();
    for (const url of objectUrls) revokeObjectUrl(url);
    objectUrls.clear();
    thumbnailUrls.clear();
  }

  return { add, getPdfLibDocument, getThumbnailUrl, dispose };
}
