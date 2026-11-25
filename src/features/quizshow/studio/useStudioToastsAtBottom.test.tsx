import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  TOAST_PLACEMENT_ATTRIBUTE,
  useStudioToastsAtBottom,
} from "./useStudioToastsAtBottom";

const root = document.documentElement;

afterEach(() => {
  root.removeAttribute(TOAST_PLACEMENT_ATTRIBUTE);
});

describe("useStudioToastsAtBottom", () => {
  it("rests the toast stack on the bottom edge while the studio is mounted", () => {
    const { unmount } = renderHook(() => useStudioToastsAtBottom());
    expect(root.getAttribute(TOAST_PLACEMENT_ATTRIBUTE)).toBe("bottom");
    unmount();
    expect(root.hasAttribute(TOAST_PLACEMENT_ATTRIBUTE)).toBe(false);
  });

  it("keeps the attribute until the last studio leaves", () => {
    const outgoing = renderHook(() => useStudioToastsAtBottom());
    const incoming = renderHook(() => useStudioToastsAtBottom());
    outgoing.unmount();
    expect(root.getAttribute(TOAST_PLACEMENT_ATTRIBUTE)).toBe("bottom");
    incoming.unmount();
    expect(root.hasAttribute(TOAST_PLACEMENT_ATTRIBUTE)).toBe(false);
  });
});
