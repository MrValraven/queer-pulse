import { fireEvent, render, screen, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { DiscreetGate } from "./DiscreetGate";

// DiscreetGate calls useTranslation(), which throws without an I18nProvider
// in the tree (see StaffBadge.test.tsx / ComingSoon.test.tsx for the same
// pattern elsewhere in the repo).
function renderGate(onVisibilityChange = vi.fn()) {
  render(
    <DiscreetGate onVisibilityChange={onVisibilityChange}>
      <p>card contents</p>
    </DiscreetGate>,
    { wrapper: I18nProvider },
  );
  return onVisibilityChange;
}

describe("DiscreetGate", () => {
  it("keeps the card covered until the member reveals it", () => {
    renderGate();
    expect(screen.queryByText("card contents")).not.toBeInTheDocument();
  });

  it("reveals the card on request", async () => {
    renderGate();
    fireEvent.click(await screen.findByRole("button", { name: /show/i }));
    expect(await screen.findByText("card contents")).toBeInTheDocument();
  });

  it("reports its visibility so the token hook can stop minting", async () => {
    const onVisibilityChange = renderGate();
    fireEvent.click(await screen.findByRole("button", { name: /show/i }));
    expect(onVisibilityChange).toHaveBeenCalledWith(true);
  });

  it("hides again on the quick-hide control", async () => {
    renderGate();
    fireEvent.click(await screen.findByRole("button", { name: /show/i }));
    fireEvent.click(await screen.findByRole("button", { name: /hide/i }));
    expect(screen.queryByText("card contents")).not.toBeInTheDocument();
  });

  it("re-covers itself when the tab is backgrounded", async () => {
    renderGate();
    fireEvent.click(await screen.findByRole("button", { name: /show/i }));
    expect(await screen.findByText("card contents")).toBeInTheDocument();
    act(() => {
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.queryByText("card contents")).not.toBeInTheDocument();
  });

  it("re-covers itself when Escape is pressed", async () => {
    renderGate();
    fireEvent.click(await screen.findByRole("button", { name: /show/i }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("card contents")).not.toBeInTheDocument();
  });
});
