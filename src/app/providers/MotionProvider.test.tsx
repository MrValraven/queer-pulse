import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MotionProvider, useMotionPrefs } from "./MotionProvider";

/** Stub matchMedia so only the listed queries match. */
function stubMatchMedia(matchingQueries: string[]) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: matchingQueries.includes(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function Probe() {
  const { reducedMotion } = useMotionPrefs();
  return <span>{`reducedMotion:${String(reducedMotion)}`}</span>;
}

describe("MotionProvider", () => {
  it("reads reducedMotion as false by default", () => {
    stubMatchMedia([]);
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    expect(screen.getByText("reducedMotion:false")).toBeInTheDocument();
  });

  it("reads reducedMotion as true when the OS preference is set", () => {
    stubMatchMedia(["(prefers-reduced-motion: reduce)"]);
    render(
      <MotionProvider>
        <Probe />
      </MotionProvider>,
    );
    expect(screen.getByText("reducedMotion:true")).toBeInTheDocument();
  });
});
