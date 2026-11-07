import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useVjGridTop, VJ_GRID_TOP_PROPERTY } from "./useVjGridTop";

function GridBand() {
  const gridTopRef = useVjGridTop();
  return (
    <main>
      <header />
      <div />
      <section ref={gridTopRef} data-testid="grid-band" />
    </main>
  );
}

function stubTop(top: number) {
  return vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({
      top,
      bottom: top + 100,
      left: 0,
      right: 354,
      width: 354,
      height: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    });
}

function setScrollY(scrollY: number) {
  Object.defineProperty(window, "scrollY", {
    value: scrollY,
    configurable: true,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  setScrollY(0);
});

describe("useVjGridTop", () => {
  it("writes the grid band's document top as --vj-grid-top", () => {
    stubTop(255);
    const { getByTestId } = render(<GridBand />);
    expect(
      getByTestId("grid-band").style.getPropertyValue(VJ_GRID_TOP_PROPERTY),
    ).toBe("255px");
  });

  it("measures from the top of the document, so a scrolled page gives the same value", () => {
    setScrollY(120);
    stubTop(135);
    const { getByTestId } = render(<GridBand />);
    expect(
      getByTestId("grid-band").style.getPropertyValue(VJ_GRID_TOP_PROPERTY),
    ).toBe("255px");
  });

  it("measures again when the window resizes", () => {
    const spy = stubTop(214);
    const { getByTestId } = render(<GridBand />);
    spy.mockReturnValue({
      top: 255,
      bottom: 355,
      left: 0,
      right: 354,
      width: 354,
      height: 100,
      x: 0,
      y: 255,
      toJSON: () => ({}),
    });
    window.dispatchEvent(new Event("resize"));
    expect(
      getByTestId("grid-band").style.getPropertyValue(VJ_GRID_TOP_PROPERTY),
    ).toBe("255px");
  });

  it("clears the property when the band unmounts", () => {
    stubTop(214);
    const { getByTestId, unmount } = render(<GridBand />);
    const band = getByTestId("grid-band");
    unmount();
    expect(band.style.getPropertyValue(VJ_GRID_TOP_PROPERTY)).toBe("");
  });
});
