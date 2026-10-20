import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { LazyStudioShareCard } from "./LazyStudioShareCard";

// The card's chunk fails to load, the way it does offline: lazy chunks sit
// outside the service worker's precache.
vi.mock("./StudioShareCard", () => {
  throw new Error("Failed to fetch dynamically imported module");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LazyStudioShareCard", () => {
  it("paints the fixed frame before the card's chunk arrives", () => {
    const { container } = render(
      <TestProviders>
        <LazyStudioShareCard
          target={{ kind: "track", id: "t1", startAtSeconds: null }}
          surface="chat"
        />
      </TestProviders>,
    );
    const frame = container.querySelector('[data-studio-share-frame="chat"]');
    expect(frame).not.toBeNull();
    // The fallback paints the loading shapes, hidden from assistive tech.
    expect(frame?.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("paints the unavailable notice in the frame when the chunk fails to load, and the page around it stays", async () => {
    // React and the shared logger both report the caught error.
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const onRemove = vi.fn();
    const { container } = render(
      <TestProviders>
        <section>
          <p>The conversation around the card</p>
          <LazyStudioShareCard
            target={{ kind: "release", id: "r1", startAtSeconds: null }}
            surface="composer"
            onRemove={onRemove}
          />
        </section>
      </TestProviders>,
    );
    const notice = await screen.findByText("Not available");
    const frame = container.querySelector(
      '[data-studio-share-frame="composer"]',
    );
    expect(frame).not.toBeNull();
    expect(frame?.contains(notice)).toBe(true);
    // The frame keeps the composer's remove control.
    expect(frame?.hasAttribute("data-removable")).toBe(true);
    expect(
      screen.getByText("The conversation around the card"),
    ).toBeInTheDocument();
  });
});
