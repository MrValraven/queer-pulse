import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { CheckinToolbar } from "./CheckinToolbar";

function renderToolbar(query: string) {
  const onQueryChange = vi.fn();
  render(
    <CheckinToolbar
      searchInputRef={createRef<HTMLInputElement>()}
      query={query}
      onQueryChange={onQueryChange}
      canScan={false}
      onScan={() => undefined}
      isFocusMode
      onToggleFocusMode={() => undefined}
    />,
    { wrapper: TestProviders },
  );
  return { onQueryChange };
}

describe("CheckinToolbar", () => {
  it("clears a filled search field on Escape and spends the key", async () => {
    const { onQueryChange } = renderToolbar("Robin");
    const searchField = await screen.findByRole("searchbox");
    const wasNotCancelled = fireEvent.keyDown(searchField, { key: "Escape" });
    expect(onQueryChange).toHaveBeenCalledWith("");
    expect(wasNotCancelled).toBe(false);
  });

  it("lets Escape on an empty field through to focus mode", async () => {
    const { onQueryChange } = renderToolbar("");
    const searchField = await screen.findByRole("searchbox");
    const wasNotCancelled = fireEvent.keyDown(searchField, { key: "Escape" });
    expect(onQueryChange).not.toHaveBeenCalled();
    expect(wasNotCancelled).toBe(true);
  });

  it("leaves Escape to an IME composition in progress", async () => {
    const { onQueryChange } = renderToolbar("Robin");
    const searchField = await screen.findByRole("searchbox");
    const wasNotCancelled = fireEvent.keyDown(searchField, {
      key: "Escape",
      isComposing: true,
    });
    expect(onQueryChange).not.toHaveBeenCalled();
    expect(wasNotCancelled).toBe(true);
  });
});
