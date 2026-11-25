import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  QUIZSHOW_FRAMELESS_ATTRIBUTE,
  useQuizshowFramelessPage,
} from "./useQuizshowFramelessPage";

describe("useQuizshowFramelessPage", () => {
  afterEach(() => {
    document.documentElement.removeAttribute(QUIZSHOW_FRAMELESS_ATTRIBUTE);
  });

  it("paints html and body with the stage base only on request, and restores them", () => {
    const root = document.documentElement;
    root.style.background = "rgb(1, 2, 3)";
    const plainPage = renderHook(() => useQuizshowFramelessPage());
    expect(root.style.background).toBe("rgb(1, 2, 3)");
    plainPage.unmount();

    const darkPage = renderHook(() =>
      useQuizshowFramelessPage({ shouldPaintStageBase: true }),
    );
    expect(root.style.background).not.toBe("rgb(1, 2, 3)");
    darkPage.unmount();
    expect(root.style.background).toBe("rgb(1, 2, 3)");
    expect(document.body.style.background).toBe("");
    root.style.background = "";
  });

  it("the frameless page attribute is set and removed", () => {
    const root = document.documentElement;
    expect(root.hasAttribute(QUIZSHOW_FRAMELESS_ATTRIBUTE)).toBe(false);

    const { unmount } = renderHook(() => useQuizshowFramelessPage());
    expect(root.getAttribute("data-quizshow-frameless")).toBe("true");

    unmount();
    expect(root.hasAttribute("data-quizshow-frameless")).toBe(false);
  });

  it("two frameless pages overlapping keep the attribute until both leave", () => {
    const root = document.documentElement;
    const outgoingPage = renderHook(() => useQuizshowFramelessPage());
    const incomingPage = renderHook(() => useQuizshowFramelessPage());
    expect(root.getAttribute("data-quizshow-frameless")).toBe("true");

    // The outgoing plane unmounts after the incoming page has mounted.
    outgoingPage.unmount();
    expect(root.getAttribute("data-quizshow-frameless")).toBe("true");

    incomingPage.unmount();
    expect(root.hasAttribute("data-quizshow-frameless")).toBe(false);
  });
});
