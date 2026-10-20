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
