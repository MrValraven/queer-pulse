import { act, renderHook } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { useFocusMode } from "./useFocusMode";

const wrapper = (initialEntry: string) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    );
  };

describe("useFocusMode", () => {
  it("reads and writes the focus flag, keeping the tab", () => {
    const { result } = renderHook(
      () => ({ focus: useFocusMode(), params: useSearchParams()[0] }),
      { wrapper: wrapper("/gatherings/x/manage?tab=checkin") },
    );
    expect(result.current.focus.isFocusMode).toBe(false);
    act(() => result.current.focus.enterFocusMode());
    expect(result.current.focus.isFocusMode).toBe(true);
    expect(result.current.params.get("tab")).toBe("checkin");
    act(() => result.current.focus.exitFocusMode());
    expect(result.current.params.get("focus")).toBeNull();
  });

  it("leaves focus mode on Escape", () => {
    const { result } = renderHook(() => useFocusMode(), {
      wrapper: wrapper("/gatherings/x/manage?tab=checkin&focus=1"),
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isFocusMode).toBe(false);
  });

  it("keeps focus mode when Escape belongs to an open dialog", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("aria-modal", "true");
    document.body.appendChild(dialog);
    const { result } = renderHook(() => useFocusMode(), {
      wrapper: wrapper("/gatherings/x/manage?tab=checkin&focus=1"),
    });
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isFocusMode).toBe(true);
    dialog.remove();
  });

  it("keeps focus mode when a dialog that already closed spent Escape", () => {
    // Stands in for useDismiss on the scanner: it closes the dialog and calls
    // preventDefault on the document, and the dialog can be gone from the DOM
    // by the time the window listener runs.
    const spendEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") event.preventDefault();
    };
    document.addEventListener("keydown", spendEscape);
    const { result } = renderHook(() => useFocusMode(), {
      wrapper: wrapper("/gatherings/x/manage?tab=checkin&focus=1"),
    });
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(result.current.isFocusMode).toBe(true);
    document.removeEventListener("keydown", spendEscape);
  });

  it("keeps focus mode when the search field spends Escape on clearing", async () => {
    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.value = "Robin";
    // Stands in for CheckinToolbar, which clears a filled field on Escape.
    searchInput.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || searchInput.value === "") return;
      event.preventDefault();
      searchInput.value = "";
    });
    document.body.appendChild(searchInput);
    const { result } = renderHook(() => useFocusMode(), {
      wrapper: wrapper("/gatherings/x/manage?tab=checkin&focus=1"),
    });
    const pressEscape = async () => {
      await act(async () => {
        searchInput.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
            cancelable: true,
          }),
        );
        await Promise.resolve();
      });
    };
    await pressEscape();
    expect(searchInput.value).toBe("");
    expect(result.current.isFocusMode).toBe(true);
    await pressEscape();
    expect(result.current.isFocusMode).toBe(false);
    searchInput.remove();
  });
});
