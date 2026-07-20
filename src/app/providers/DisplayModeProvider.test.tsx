import { render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DisplayModeProvider } from "./DisplayModeProvider";
import { useDisplayMode } from "./displayModeContext";

const INSTALLED_KEY = "qp-installed";

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

function setIosStandalone(value: boolean | undefined) {
  Object.defineProperty(window.navigator, "standalone", {
    value,
    configurable: true,
    writable: true,
  });
}

function reset() {
  localStorage.clear();
  delete document.documentElement.dataset.displayMode;
  setIosStandalone(undefined);
  window.history.replaceState({}, "", "/");
  vi.unstubAllGlobals();
}

beforeEach(reset);
afterEach(reset);

function Probe() {
  const { displayMode, isInstalled } = useDisplayMode();
  return <span>{`${displayMode}:${String(isInstalled)}`}</span>;
}

function renderProvider() {
  return render(
    <DisplayModeProvider>
      <Probe />
    </DisplayModeProvider>,
  );
}

describe("useDisplayMode (no provider)", () => {
  it("falls back to browser via the safe default context", () => {
    const { result } = renderHook(() => useDisplayMode());
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.displayMode).toBe("browser");
  });
});

describe("DisplayModeProvider signals", () => {
  it("reports browser when no signal fires", () => {
    stubMatchMedia([]);
    const { getByText } = renderProvider();
    expect(getByText("browser:false")).toBeInTheDocument();
    expect(document.documentElement.dataset.displayMode).toBe("browser");
  });

  it("reports standalone from the display-mode media query", () => {
    stubMatchMedia(["(display-mode: standalone), (display-mode: fullscreen)"]);
    const { getByText } = renderProvider();
    expect(getByText("standalone:true")).toBeInTheDocument();
    expect(document.documentElement.dataset.displayMode).toBe("standalone");
  });

  it("reports standalone from navigator.standalone on iOS", () => {
    stubMatchMedia([]);
    setIosStandalone(true);
    const { getByText } = renderProvider();
    expect(getByText("standalone:true")).toBeInTheDocument();
  });

  it("treats minimal-ui as browser, since it still renders browser chrome", () => {
    stubMatchMedia(["(display-mode: minimal-ui)"]);
    const { getByText } = renderProvider();
    expect(getByText("browser:false")).toBeInTheDocument();
  });
});

describe("DisplayModeProvider sticky fallback", () => {
  it("latches installed when the URL carries ?mode=standalone", () => {
    stubMatchMedia([]);
    window.history.replaceState({}, "", "/?mode=standalone");
    const { getByText } = renderProvider();
    expect(getByText("standalone:true")).toBeInTheDocument();
    expect(localStorage.getItem(INSTALLED_KEY)).toBe("true");
  });

  it("stays installed on a later visit with no query param", () => {
    stubMatchMedia([]);
    localStorage.setItem(INSTALLED_KEY, "true");
    const { getByText } = renderProvider();
    expect(getByText("standalone:true")).toBeInTheDocument();
  });

  it("clears the sticky flag on a positive browser signal", () => {
    stubMatchMedia(["(display-mode: browser)"]);
    localStorage.setItem(INSTALLED_KEY, "true");
    const { getByText } = renderProvider();
    expect(getByText("browser:false")).toBeInTheDocument();
    expect(localStorage.getItem(INSTALLED_KEY)).toBeNull();
  });
});
