import { act, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePersonaMotion } from "./usePersonaMotion";

/** An `IntersectionObserver` that reports every observed node as on screen,
 *  the way a real one reports a node already in view as soon as it's watched. */
class InViewObserver {
  private callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback(
      [{ target, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

let addSection: () => void = () => {};

/** A `.pp` page that starts with one section and can grow a second, like the
 *  editor preview when the first item lands in an empty section. */
function PersonaPage() {
  const rootRef = usePersonaMotion();
  const [hasCampaigns, setHasCampaigns] = useState(false);
  addSection = () => setHasCampaigns(true);
  return (
    <article className="pp" ref={rootRef}>
      <section className="pp-sec" data-testid="gallery" />
      {hasCampaigns && <section className="pp-sec" data-testid="campaigns" />}
    </article>
  );
}

describe("usePersonaMotion", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", InViewObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reveals the sections present on mount", () => {
    const { getByTestId } = render(<PersonaPage />);
    expect(getByTestId("gallery")).toHaveClass("is-in");
  });

  it("reveals a section that mounts later instead of leaving it hidden", async () => {
    const { findByTestId } = render(<PersonaPage />);
    act(() => addSection());
    const campaigns = await findByTestId("campaigns");
    // The MutationObserver callback runs as a microtask after the commit.
    await act(async () => {
      await Promise.resolve();
    });
    expect(campaigns).toHaveClass("is-in");
  });
});
