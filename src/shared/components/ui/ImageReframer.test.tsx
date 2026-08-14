import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TestProviders } from "../../../test/TestProviders";
import ImageReframer from "./ImageReframer";
import type { CropRect } from "./cropGeometry";

/**
 * `ImageReframer` reads `t()` for its labels (aria-label, alt text, chip
 * copy), which requires an `I18nProvider` in the tree, so every render here
 * goes through `TestProviders`, matching `Select.test.tsx`'s pattern. Task
 * E1 hasn't landed the real `reframe.*` catalog entries yet, so `t()` falls
 * through to its missing-key path and echoes the raw key back (see
 * `I18nProvider.tsx`'s `t` callback: unresolved key, logged warning,
 * `return key`). That's why the assertions below match on substrings like
 * /zoom/i and /reframe/i rather than exact copy: they pass whether the key
 * resolves to its future translated string ("Zoom", "Photo to reframe") or
 * to its raw echoed key ("shared:reframe.zoom", "shared:reframe.alt"), both
 * contain the same substring, so the test is correct on either side of E1.
 */
function renderReframer(onChange = vi.fn<(rect: CropRect) => void>()) {
  render(
    <ImageReframer
      src="blob:fake"
      aspect={1}
      aspectLabel="1:1"
      allowFreeform={false}
      minOutput={{ width: 200, height: 200 }}
      onChange={onChange}
    />,
    { wrapper: TestProviders },
  );
  // simulate the image loading with known natural dimensions
  const image = screen.getByAltText<HTMLImageElement>(/reframe/i);
  Object.defineProperty(image, "naturalWidth", { value: 2000, configurable: true });
  Object.defineProperty(image, "naturalHeight", { value: 1000, configurable: true });
  fireEvent.load(image);
  return onChange;
}

describe("ImageReframer", () => {
  it("emits a crop when zoom changes", () => {
    const onChange = renderReframer();
    const zoom = screen.getByRole("slider", { name: /zoom/i });
    fireEvent.change(zoom, { target: { value: "2" } });
    expect(onChange).toHaveBeenCalled();
    const lastRect = onChange.mock.calls.at(-1)![0];
    expect(lastRect.width).toBeLessThan(0.5); // zoomed in past the 1:1 base of a 2:1 source
  });
});
