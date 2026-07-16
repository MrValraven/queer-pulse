import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AccessibilityProvider } from "./AccessibilityProvider";
import { useReduceMotion } from "./accessibilityContext";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";

const KEY = "qp:a11y:reduce-motion";

function reset() {
  localStorage.clear();
  delete document.documentElement.dataset.reduceMotion;
}

beforeEach(reset);
afterEach(reset);

describe("useReduceMotion (no provider)", () => {
  it("reports motion as full via the safe default context", () => {
    const { result } = renderHook(() => useReduceMotion());
    expect(result.current.reduceMotion).toBe(false);
  });
});

describe("AccessibilityProvider", () => {
  it("stamps data-reduce-motion=false on <html> by default", () => {
    render(
      <AccessibilityProvider>
        <span>x</span>
      </AccessibilityProvider>,
    );
    expect(document.documentElement.dataset.reduceMotion).toBe("false");
  });

  it("reflects a persisted preference on mount", () => {
    localStorage.setItem(KEY, "true");
    render(
      <AccessibilityProvider>
        <span>x</span>
      </AccessibilityProvider>,
    );
    expect(document.documentElement.dataset.reduceMotion).toBe("true");
  });

  it("toggling persists to localStorage and updates the <html> attribute", () => {
    function Probe() {
      const { reduceMotion, toggleReduceMotion } = useReduceMotion();
      return (
        <button onClick={toggleReduceMotion}>
          {reduceMotion ? "on" : "off"}
        </button>
      );
    }
    render(
      <AccessibilityProvider>
        <Probe />
      </AccessibilityProvider>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("off");

    act(() => btn.click());

    expect(btn).toHaveTextContent("on");
    expect(document.documentElement.dataset.reduceMotion).toBe("true");
    expect(localStorage.getItem(KEY)).toBe("true");
  });
});

describe("usePrefersReducedMotion integration", () => {
  it("is true when the in-app toggle is on", async () => {
    localStorage.setItem(KEY, "true");
    function Probe() {
      return <span>{usePrefersReducedMotion() ? "reduced" : "full"}</span>;
    }
    render(
      <AccessibilityProvider>
        <Probe />
      </AccessibilityProvider>,
    );
    await waitFor(() =>
      expect(screen.getByText("reduced")).toBeInTheDocument(),
    );
  });

  it("reacts live when the toggle flips", async () => {
    function Probe() {
      const { toggleReduceMotion } = useReduceMotion();
      return (
        <>
          <span>{usePrefersReducedMotion() ? "reduced" : "full"}</span>
          <button onClick={toggleReduceMotion}>flip</button>
        </>
      );
    }
    render(
      <AccessibilityProvider>
        <Probe />
      </AccessibilityProvider>,
    );
    expect(screen.getByText("full")).toBeInTheDocument();

    // Async act so the MutationObserver microtask (which fires the state update)
    // is flushed inside act.
    await act(async () => {
      screen.getByRole("button").click();
    });

    expect(screen.getByText("reduced")).toBeInTheDocument();
  });
});
