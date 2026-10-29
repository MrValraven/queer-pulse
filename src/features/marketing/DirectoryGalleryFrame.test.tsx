import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { PointerEventStub } from "../../test/pointerEventStub";
import type { ListingPhotoFraming } from "./api/directory.api";
import {
  DirectoryGalleryFrame,
  type DirectoryGalleryFrameProps,
} from "./DirectoryGalleryFrame";

const ALT = "The bar at A Farinha";
const CENTRED: ListingPhotoFraming = { focusX: 0.5, focusY: 0.5, zoom: 1 };

function renderFrame(overrides: Partial<DirectoryGalleryFrameProps> = {}) {
  const onOpen = vi.fn();
  const onFramingChange = vi.fn<(framing: ListingPhotoFraming) => void>();
  const frameWith = (props: Partial<DirectoryGalleryFrameProps>) => (
    <I18nProvider>
      <DirectoryGalleryFrame
        shot={{ url: "https://img/bar.jpg", alt: ALT }}
        index={0}
        count={3}
        variant="hero"
        framing={CENTRED}
        isEditing={false}
        isLocked={false}
        onOpen={onOpen}
        onFramingChange={onFramingChange}
        {...props}
      />
    </I18nProvider>
  );
  const { rerender } = render(frameWith(overrides));
  const rerenderWith = (props: Partial<DirectoryGalleryFrameProps>) =>
    rerender(frameWith({ ...overrides, ...props }));
  return { onOpen, onFramingChange, rerenderWith };
}

/** Gives the edit frame a 400 by 200 box and the image a square source of the given side (0 reads as not loaded yet). */
function measureEditFrame(naturalSize: number) {
  const frame = screen.getByRole("group");
  frame.getBoundingClientRect = () => ({
    width: 400,
    height: 200,
    top: 0,
    left: 0,
    right: 400,
    bottom: 200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  const image = screen.getByAltText(ALT);
  Object.defineProperty(image, "naturalWidth", {
    value: naturalSize,
    configurable: true,
  });
  Object.defineProperty(image, "naturalHeight", {
    value: naturalSize,
    configurable: true,
  });
  return frame;
}

beforeEach(() => {
  vi.stubGlobal("PointerEvent", PointerEventStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DirectoryGalleryFrame view mode", () => {
  it("view mode opens the lightbox from a button named by the alt text", () => {
    const { onOpen } = renderFrame();
    fireEvent.click(screen.getByRole("button", { name: ALT }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("names the photo once, on the button, and hides the image from assistive tech", () => {
    renderFrame();
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByAltText(ALT).parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("view mode writes the framing as custom properties on the image", () => {
    renderFrame({ framing: { focusX: 0.25, focusY: 0.8, zoom: 1.5 } });
    const image = screen.getByAltText(ALT);
    expect(image.style.getPropertyValue("--frame-x")).toBe("25%");
    expect(image.style.getPropertyValue("--frame-y")).toBe("80%");
    expect(image.style.getPropertyValue("--frame-zoom")).toBe("1.5");
  });
});

describe("DirectoryGalleryFrame edit mode", () => {
  it("edit mode drops the lightbox button and names the frame and its zoom slider", () => {
    renderFrame({ isEditing: true });
    expect(screen.queryByRole("button", { name: ALT })).toBeNull();
    expect(
      screen.getByRole("group", { name: `Photo 1 of 3: ${ALT}` }),
    ).toHaveAttribute("tabindex", "0");
    const slider = screen.getByRole("slider", { name: "Zoom photo 1" });
    expect(slider).toHaveAttribute("min", "1");
    expect(slider).toHaveAttribute("max", "3");
  });

  it("keeps the lightbox button mounted and hidden while editing", () => {
    renderFrame({ isEditing: true });
    const hiddenButton = screen.getByRole("button", {
      name: ALT,
      hidden: true,
    });
    expect(hiddenButton).not.toBeVisible();
  });

  it("moves focus to the hero frame when edit mode starts", () => {
    const { rerenderWith } = renderFrame();
    expect(document.body).toHaveFocus();
    rerenderWith({ isEditing: true });
    expect(
      screen.getByRole("group", { name: `Photo 1 of 3: ${ALT}` }),
    ).toHaveFocus();
  });

  it("leaves focus alone when a frame mounts already editing", () => {
    renderFrame({ isEditing: true });
    expect(screen.getByRole("group")).not.toHaveFocus();
  });

  it("names a frame without alt text by its position", () => {
    renderFrame({
      isEditing: true,
      index: 1,
      shot: { url: "https://img/door.jpg", alt: "" },
    });
    expect(screen.getByRole("group", { name: "Photo 2 of 3" })).toBeTruthy();
  });

  it("arrow keys move the picture their way and plus zooms the focused frame", () => {
    const { onFramingChange } = renderFrame({
      isEditing: true,
      framing: { focusX: 0.5, focusY: 0.5, zoom: 2 },
    });
    const frame = measureEditFrame(1000);
    fireEvent.keyDown(frame, { key: "ArrowRight" });
    const moved = onFramingChange.mock.calls.at(-1)![0];
    expect(moved.focusX).toBeCloseTo(0.45);
    expect(moved.focusY).toBeCloseTo(0.5);
    expect(moved.zoom).toBeCloseTo(2);
    fireEvent.keyDown(frame, { key: "ArrowDown" });
    expect(onFramingChange.mock.calls.at(-1)![0].focusY).toBeCloseTo(0.45);
    fireEvent.keyDown(frame, { key: "+" });
    expect(onFramingChange.mock.calls.at(-1)![0].zoom).toBeCloseTo(2.1);
  });

  it("an arrow on an axis the frame shows in full changes nothing", () => {
    // A 1000 by 1000 photo covers a 400 by 200 frame at 400 by 400, so at
    // zoom 1 the whole width is on screen and only the height can travel.
    const { onFramingChange } = renderFrame({ isEditing: true });
    const frame = measureEditFrame(1000);
    fireEvent.keyDown(frame, { key: "ArrowLeft" });
    fireEvent.keyDown(frame, { key: "ArrowRight" });
    expect(onFramingChange).not.toHaveBeenCalled();
    fireEvent.keyDown(frame, { key: "ArrowUp" });
    const moved = onFramingChange.mock.calls.at(-1)![0];
    expect(moved.focusX).toBe(0.5);
    expect(moved.focusY).toBeCloseTo(0.55);
  });

  it("arrows wait for the image to load while plus and minus still zoom", () => {
    const { onFramingChange } = renderFrame({ isEditing: true });
    const frame = measureEditFrame(0);
    fireEvent.keyDown(frame, { key: "ArrowDown" });
    expect(onFramingChange).not.toHaveBeenCalled();
    fireEvent.keyDown(frame, { key: "+" });
    expect(onFramingChange.mock.calls.at(-1)![0]).toEqual({
      focusX: 0.5,
      focusY: 0.5,
      zoom: 1.1,
    });
  });

  it("arrow keys on the zoom slider leave the focal point alone", () => {
    const { onFramingChange } = renderFrame({ isEditing: true });
    const slider = screen.getByRole("slider", { name: "Zoom photo 1" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    for (const [framing] of onFramingChange.mock.calls) {
      expect(framing.focusX).toBe(0.5);
    }
  });

  it("a diagonal drag reports focusX and focusY together", () => {
    const { onFramingChange } = renderFrame({
      isEditing: true,
      framing: { focusX: 0.5, focusY: 0.5, zoom: 2 },
    });
    const frame = measureEditFrame(1000);
    fireEvent.pointerDown(frame, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 60, clientY: 80 });
    const last = onFramingChange.mock.calls.at(-1)![0];
    expect(last.focusX).toBeGreaterThan(0.5);
    expect(last.focusY).toBeGreaterThan(0.5);
  });

  it("a drag before the image has loaded leaves the framing unchanged", () => {
    const { onFramingChange } = renderFrame({
      isEditing: true,
      framing: { focusX: 0.5, focusY: 0.5, zoom: 2 },
    });
    const frame = measureEditFrame(0);
    fireEvent.pointerDown(frame, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 60, clientY: 80 });
    expect(onFramingChange).not.toHaveBeenCalled();
  });

  it("a locked frame ignores drags and keys and disables its slider", () => {
    const { onFramingChange } = renderFrame({
      isEditing: true,
      isLocked: true,
      framing: { focusX: 0.5, focusY: 0.5, zoom: 2 },
    });
    const frame = measureEditFrame(1000);
    fireEvent.pointerDown(frame, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 60, clientY: 80 });
    fireEvent.keyDown(frame, { key: "ArrowRight" });
    expect(onFramingChange).not.toHaveBeenCalled();
    expect(screen.getByRole("slider", { name: "Zoom photo 1" })).toBeDisabled();
  });
});
