import { afterEach, describe, expect, it, vi } from "vitest";
import {
  restoreFocusAfterSessionEnd,
  SESSION_END_FOCUS_ATTRIBUTE,
} from "./studioSessionEndFocus";

describe("restoreFocusAfterSessionEnd", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  function runAnimationFrameNow() {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
  }

  it("focuses the main heading when focus fell to the body", () => {
    runAnimationFrameNow();
    document.body.innerHTML = `<main id="main-content"><h1>Episode</h1></main>`;
    restoreFocusAfterSessionEnd();
    const heading = document.querySelector("h1");
    expect(document.activeElement).toBe(heading);
    expect(heading?.hasAttribute(SESSION_END_FOCUS_ATTRIBUTE)).toBe(true);
  });

  it("falls back to the main landmark when the page has no heading", () => {
    runAnimationFrameNow();
    document.body.innerHTML = `<main data-page-main><p>Hi</p></main>`;
    restoreFocusAfterSessionEnd();
    expect(document.activeElement).toBe(document.querySelector("main"));
  });

  it("leaves focus alone when it still sits on a real element", () => {
    runAnimationFrameNow();
    document.body.innerHTML = `<main><h1>Episode</h1></main><button>Keep</button>`;
    const button = document.querySelector("button");
    button?.focus();
    restoreFocusAfterSessionEnd();
    expect(document.activeElement).toBe(button);
  });

  it("clears the ring marker when focus leaves", () => {
    runAnimationFrameNow();
    document.body.innerHTML = `<main><h1>Episode</h1></main><button>Other</button>`;
    restoreFocusAfterSessionEnd();
    document.querySelector("button")?.focus();
    expect(
      document.querySelector("h1")?.hasAttribute(SESSION_END_FOCUS_ATTRIBUTE),
    ).toBe(false);
  });
});
