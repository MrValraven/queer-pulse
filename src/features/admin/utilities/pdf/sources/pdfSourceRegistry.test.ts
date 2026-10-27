import type { PDFDocument } from "pdf-lib";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { createPdfSourceRegistry } from "./pdfSourceRegistry";
import type { ThumbnailRenderer } from "./thumbnailRenderer";

interface FakeSource {
  pdfLibDocument: PDFDocument;
  pdfjsDocument: PDFDocumentProxy;
  destroyLoadingTask: Mock<() => Promise<void>>;
}

function createFakeSource(): FakeSource {
  const destroyLoadingTask = vi.fn(() => Promise.resolve());
  return {
    pdfLibDocument: {} as PDFDocument,
    pdfjsDocument: {
      loadingTask: { destroy: destroyLoadingTask },
    } as unknown as PDFDocumentProxy,
    destroyLoadingTask,
  };
}

interface Deferred {
  promise: Promise<Blob>;
  resolve: (blob: Blob) => void;
  reject: (error: unknown) => void;
}

function createDeferred(): Deferred {
  let resolve: (blob: Blob) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<Blob>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

/** Hands out the deferred renders in call order. */
function createQueuedRenderer(deferredRenders: Deferred[]) {
  const remainingRenders = [...deferredRenders];
  return vi.fn<ThumbnailRenderer>(() => {
    const nextRender = remainingRenders.shift();
    if (!nextRender) throw new Error("unexpected-render");
    return nextRender.promise;
  });
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function createUrlFakes() {
  let createdCount = 0;
  const createObjectUrl = vi.fn(() => {
    createdCount += 1;
    return `blob:${createdCount}`;
  });
  const revokeObjectUrl = vi.fn();
  return { createObjectUrl, revokeObjectUrl };
}

const pageBlob = new Blob(["page"], { type: "image/png" });

describe("createPdfSourceRegistry", () => {
  it("renders each page once and reuses its URL", async () => {
    const renderThumbnail = vi.fn<ThumbnailRenderer>(() =>
      Promise.resolve(pageBlob),
    );
    const registry = createPdfSourceRegistry({
      renderThumbnail,
      ...createUrlFakes(),
    });
    const source = createFakeSource();
    registry.add("f", source);

    const firstUrl = await registry.getThumbnailUrl("f", 0);
    const secondUrl = await registry.getThumbnailUrl("f", 0);

    expect(renderThumbnail).toHaveBeenCalledTimes(1);
    expect(renderThumbnail).toHaveBeenCalledWith(source.pdfjsDocument, 0, 320);
    expect(firstUrl).toBe("blob:1");
    expect(secondUrl).toBe(firstUrl);
  });

  it("renders at most two thumbnails at a time", async () => {
    const firstRender = createDeferred();
    const secondRender = createDeferred();
    const thirdRender = createDeferred();
    const renderThumbnail = createQueuedRenderer([
      firstRender,
      secondRender,
      thirdRender,
    ]);
    const registry = createPdfSourceRegistry({
      renderThumbnail,
      ...createUrlFakes(),
    });
    registry.add("f", createFakeSource());

    const firstUrl = registry.getThumbnailUrl("f", 0);
    const secondUrl = registry.getThumbnailUrl("f", 1);
    const thirdUrl = registry.getThumbnailUrl("f", 2);
    expect(renderThumbnail).toHaveBeenCalledTimes(2);

    firstRender.resolve(pageBlob);
    await flushPromises();
    expect(renderThumbnail).toHaveBeenCalledTimes(3);
    expect(renderThumbnail).toHaveBeenLastCalledWith(expect.anything(), 2, 320);

    secondRender.resolve(pageBlob);
    thirdRender.resolve(pageBlob);
    await expect(Promise.all([firstUrl, secondUrl, thirdUrl])).resolves.toEqual(
      ["blob:1", "blob:2", "blob:3"],
    );
  });

  it("reports a failed render", async () => {
    const renderThumbnail = vi.fn<ThumbnailRenderer>(() =>
      Promise.reject(new Error("broken page")),
    );
    const registry = createPdfSourceRegistry({
      renderThumbnail,
      ...createUrlFakes(),
    });
    registry.add("f", createFakeSource());

    await expect(registry.getThumbnailUrl("f", 0)).rejects.toBeTruthy();
    await expect(registry.getThumbnailUrl("f", 0)).rejects.toThrow(
      "thumbnail-render-failed",
    );
    expect(renderThumbnail).toHaveBeenCalledTimes(1);
  });

  it("frees a render slot after a failure", async () => {
    let callCount = 0;
    const renderThumbnail = vi.fn<ThumbnailRenderer>(() => {
      callCount += 1;
      return callCount === 1
        ? Promise.reject(new Error("broken page"))
        : Promise.resolve(pageBlob);
    });
    const registry = createPdfSourceRegistry({
      renderThumbnail,
      ...createUrlFakes(),
    });
    registry.add("f", createFakeSource());

    const failedUrl = registry.getThumbnailUrl("f", 0);
    const secondUrl = registry.getThumbnailUrl("f", 1);
    const thirdUrl = registry.getThumbnailUrl("f", 2);

    await expect(failedUrl).rejects.toThrow("thumbnail-render-failed");
    await expect(secondUrl).resolves.toBe("blob:1");
    await expect(thirdUrl).resolves.toBe("blob:2");
    expect(renderThumbnail).toHaveBeenCalledTimes(3);
  });

  it("rejects a thumbnail for a file it never received", async () => {
    const registry = createPdfSourceRegistry({
      renderThumbnail: vi.fn<ThumbnailRenderer>(),
      ...createUrlFakes(),
    });

    await expect(registry.getThumbnailUrl("nope", 0)).rejects.toThrow(
      "unknown-file",
    );
  });

  it("closes every document and frees every URL on dispose", async () => {
    const urlFakes = createUrlFakes();
    const registry = createPdfSourceRegistry({
      renderThumbnail: vi.fn<ThumbnailRenderer>(() =>
        Promise.resolve(pageBlob),
      ),
      ...urlFakes,
    });
    const source = createFakeSource();
    registry.add("f", source);
    const renderedUrl = await registry.getThumbnailUrl("f", 0);

    registry.dispose();

    expect(source.destroyLoadingTask).toHaveBeenCalledTimes(1);
    expect(urlFakes.revokeObjectUrl).toHaveBeenCalledWith(renderedUrl);
    expect(() => registry.getPdfLibDocument("f")).toThrow("unknown-file");
  });

  it("rejects queued renders on dispose and drops a render that lands late", async () => {
    const firstRender = createDeferred();
    const secondRender = createDeferred();
    const urlFakes = createUrlFakes();
    const renderThumbnail = createQueuedRenderer([firstRender, secondRender]);
    const registry = createPdfSourceRegistry({ renderThumbnail, ...urlFakes });
    registry.add("f", createFakeSource());

    const firstUrl = registry.getThumbnailUrl("f", 0);
    const secondUrl = registry.getThumbnailUrl("f", 1);
    const queuedUrl = registry.getThumbnailUrl("f", 2);
    registry.dispose();

    await expect(queuedUrl).rejects.toThrow("registry-disposed");
    firstRender.resolve(pageBlob);
    secondRender.resolve(pageBlob);
    await expect(firstUrl).rejects.toThrow("registry-disposed");
    await expect(secondUrl).rejects.toThrow("registry-disposed");
    expect(urlFakes.createObjectUrl).not.toHaveBeenCalled();
    expect(renderThumbnail).toHaveBeenCalledTimes(2);
  });

  it("accepts new files and renders again after dispose", async () => {
    const renderThumbnail = vi.fn<ThumbnailRenderer>(() =>
      Promise.resolve(pageBlob),
    );
    const registry = createPdfSourceRegistry({
      renderThumbnail,
      ...createUrlFakes(),
    });
    registry.add("f", createFakeSource());
    await registry.getThumbnailUrl("f", 0);

    registry.dispose();
    const reopenedSource = createFakeSource();
    registry.add("g", reopenedSource);
    const reopenedUrl = await registry.getThumbnailUrl("g", 0);

    expect(reopenedUrl).toBe("blob:2");
    expect(registry.getPdfLibDocument("g")).toBe(reopenedSource.pdfLibDocument);
    expect(renderThumbnail).toHaveBeenLastCalledWith(
      reopenedSource.pdfjsDocument,
      0,
      320,
    );
  });

  it("returns the pdf-lib document of a known file through an unbound method", () => {
    const registry = createPdfSourceRegistry();
    const source = createFakeSource();
    registry.add("f", source);
    const { getPdfLibDocument } = registry;

    expect(getPdfLibDocument("f")).toBe(source.pdfLibDocument);
  });

  it("throws for a file it never received", () => {
    expect(() => createPdfSourceRegistry().getPdfLibDocument("nope")).toThrow(
      "unknown-file",
    );
  });
});

describe("createPdfSourceRegistry queue", () => {
  it("renders the newest queued request first", async () => {
    const firstRender = createDeferred();
    const secondRender = createDeferred();
    const renderThumbnail = createQueuedRenderer([
      firstRender,
      secondRender,
      createDeferred(),
    ]);
    const registry = createPdfSourceRegistry({
      renderThumbnail,
      ...createUrlFakes(),
    });
    registry.add("f", createFakeSource());
    const pageA = 2;
    const pageB = 3;
    const pageC = 4;

    void registry.getThumbnailUrl("f", 0);
    void registry.getThumbnailUrl("f", 1);
    void registry.getThumbnailUrl("f", pageA);
    void registry.getThumbnailUrl("f", pageB);
    void registry.getThumbnailUrl("f", pageC);
    expect(renderThumbnail).toHaveBeenCalledTimes(2);

    firstRender.resolve(pageBlob);
    await flushPromises();

    expect(renderThumbnail).toHaveBeenCalledTimes(3);
    expect(renderThumbnail).toHaveBeenLastCalledWith(
      expect.anything(),
      pageC,
      320,
    );
  });

  it("withdraws a queued render when its caller aborts and queues it again later", async () => {
    const firstRender = createDeferred();
    const renderThumbnail = createQueuedRenderer([
      firstRender,
      createDeferred(),
      createDeferred(),
    ]);
    const registry = createPdfSourceRegistry({
      renderThumbnail,
      ...createUrlFakes(),
    });
    registry.add("f", createFakeSource());
    void registry.getThumbnailUrl("f", 0);
    void registry.getThumbnailUrl("f", 1);
    const withdrawal = new AbortController();
    const withdrawnUrl = registry.getThumbnailUrl("f", 2, withdrawal.signal);

    withdrawal.abort();
    await expect(withdrawnUrl).rejects.toThrow("thumbnail-withdrawn");
    firstRender.resolve(pageBlob);
    await flushPromises();
    expect(renderThumbnail).toHaveBeenCalledTimes(2);

    const requeuedUrl = registry.getThumbnailUrl("f", 2);
    expect(requeuedUrl).not.toBe(withdrawnUrl);
    expect(renderThumbnail).toHaveBeenCalledTimes(3);
    expect(renderThumbnail).toHaveBeenLastCalledWith(expect.anything(), 2, 320);
  });

  it("keeps a queued render that another caller still waits for", async () => {
    const firstRender = createDeferred();
    const thirdRender = createDeferred();
    const renderThumbnail = createQueuedRenderer([
      firstRender,
      createDeferred(),
      thirdRender,
    ]);
    const registry = createPdfSourceRegistry({
      renderThumbnail,
      ...createUrlFakes(),
    });
    registry.add("f", createFakeSource());
    void registry.getThumbnailUrl("f", 0);
    void registry.getThumbnailUrl("f", 1);
    const withdrawal = new AbortController();
    void registry.getThumbnailUrl("f", 2, withdrawal.signal);
    const waitingUrl = registry.getThumbnailUrl("f", 2);

    withdrawal.abort();
    firstRender.resolve(pageBlob);
    await flushPromises();
    thirdRender.resolve(pageBlob);

    expect(renderThumbnail).toHaveBeenLastCalledWith(expect.anything(), 2, 320);
    await expect(waitingUrl).resolves.toBe("blob:2");
  });
});
