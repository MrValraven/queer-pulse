import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TestProviders } from "../../../test/TestProviders";
import PhotoReframeModal from "./PhotoReframeModal";

/**
 * `PhotoReframeModal` (and the `ImageReframer`/`Modal` it composes) reads
 * `t()`, so every render here goes through `TestProviders`, matching
 * `ImageReframer.test.tsx`'s pattern.
 */
beforeAll(() => {
  // jsdom has no real object-URL support; the modal only needs a stable string.
  URL.createObjectURL = vi.fn(() => "blob:fake");
  URL.revokeObjectURL = vi.fn();
});

function loadImage() {
  const image = screen.getByAltText<HTMLImageElement>(/reframe/i);
  Object.defineProperty(image, "naturalWidth", { value: 1000, configurable: true });
  Object.defineProperty(image, "naturalHeight", { value: 1000, configurable: true });
  fireEvent.load(image);
}

describe("PhotoReframeModal", () => {
  it("confirms with a crop rect", () => {
    const onConfirm = vi.fn();
    render(
      <PhotoReframeModal
        file={new File(["x"], "p.jpg", { type: "image/jpeg" })}
        kind="avatar"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
      { wrapper: TestProviders },
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    loadImage();

    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ width: expect.any(Number), aspect: expect.any(String) }),
    );
  });

  it("cancels without confirming", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <PhotoReframeModal
        file={new File(["x"], "p.jpg", { type: "image/jpeg" })}
        kind="avatar"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
      { wrapper: TestProviders },
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("disables save until the image has loaded a first crop", () => {
    render(
      <PhotoReframeModal
        file={new File(["x"], "p.jpg", { type: "image/jpeg" })}
        kind="avatar"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
      { wrapper: TestProviders },
    );

    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
    loadImage();
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
  });
});
