import { afterEach, describe, expect, it, vi } from "vitest";
import { COPY_MAX_SIDE, copyPicturePreview } from "./quizshowPicturePreview";

/** An image stand-in with fixed natural dimensions that decodes at once. */
function stubImage(naturalWidth: number, naturalHeight: number) {
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      naturalWidth = naturalWidth;
      naturalHeight = naturalHeight;
      decode() {
        return Promise.resolve();
      }
    },
  );
}

/** Stubs the canvas: records the draw and the canvas size, encodes a tiny blob. */
function stubCanvas() {
  const drawImage = vi.fn();
  const sizes: { width: number; height: number }[] = [];
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      sizes.push({ width: this.width, height: this.height });
      return { drawImage } as unknown as CanvasRenderingContext2D;
    } as never,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback: BlobCallback) => callback(new Blob(["copy"])),
  );
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:draft-copy");
  return { drawImage, sizes };
}

describe("copyPicturePreview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("caps the copy's longest side for a large photo", async () => {
    stubImage(4000, 3000);
    const { drawImage, sizes } = stubCanvas();

    await expect(copyPicturePreview("blob:field-preview")).resolves.toBe(
      "blob:draft-copy",
    );

    expect(COPY_MAX_SIDE).toBe(1600);
    expect(sizes).toEqual([{ width: 1600, height: 1200 }]);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1600, 1200);
  });

  it("keeps a small picture at its own size", async () => {
    stubImage(800, 1200);
    const { drawImage, sizes } = stubCanvas();

    await copyPicturePreview("blob:field-preview");

    expect(sizes).toEqual([{ width: 800, height: 1200 }]);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 800, 1200);
  });
});
