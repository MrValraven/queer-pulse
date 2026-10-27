import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { AUTH_STORAGE_KEY } from "../../cookies.data";
import type { PerformerTryKind } from "./performersSample.data";
import { PerformersTryIt } from "./PerformersTryIt";

const TODAY = new Date(2026, 9, 27, 10, 0);

/** The page holds the choice; this harness does the same. */
function TryItHarness() {
  const [activeKind, setActiveKind] = useState<PerformerTryKind>("drag");
  return (
    <PerformersTryIt
      activeKind={activeKind}
      onKindChange={setActiveKind}
      today={TODAY}
    />
  );
}

afterEach(() => {
  localStorage.clear();
});

describe("PerformersTryIt", () => {
  it("switching kind changes the page", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    const { container } = render(
      <TestProviders>
        <TryItHarness />
      </TestProviders>,
    );
    await waitFor(() =>
      expect(container.querySelector(".pp")?.getAttribute("data-kind")).toBe(
        "drag",
      ),
    );
    fireEvent.click(await screen.findByRole("tab", { name: "Comedian" }));
    await waitFor(() => {
      expect(
        container.querySelector('.pp[data-kind="comedian"]'),
      ).not.toBeNull();
      expect(container.querySelector('.pp[data-kind="drag"]')).toBeNull();
    });
  });

  it("arrow keys move through the crafts", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "false");
    render(
      <TestProviders>
        <TryItHarness />
      </TestProviders>,
    );
    const firstTab = await screen.findByRole("tab", { name: "Drag performer" });
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "DJ" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      screen.getByRole("tab", { name: "DJ" }).id,
    );
  });
});
