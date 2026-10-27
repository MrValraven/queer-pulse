import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { StudioLandingGallery } from "./StudioLandingGallery";

function renderGallery() {
  return render(
    <TestProviders>
      <StudioLandingGallery />
    </TestProviders>,
  );
}

/** Makes the landing's phone query match, as on a 390px screen. */
function stubPhoneViewport() {
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches: query === "(max-width: 719px)",
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

describe("StudioLandingGallery", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders six tabs in a labelled tablist", async () => {
    renderGallery();
    const tablist = await screen.findByRole("tablist", {
      name: "Studio screens",
    });
    expect(within(tablist).getAllByRole("tab")).toHaveLength(6);
    expect(within(tablist).getByRole("tab", { name: "Home" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("arrow keys move the selection", async () => {
    renderGallery();
    const homeTab = await screen.findByRole("tab", { name: "Home" });
    homeTab.focus();
    fireEvent.keyDown(homeTab, { key: "ArrowRight" });

    const artistTab = screen.getByRole("tab", { name: "Artist page" });
    expect(artistTab).toHaveAttribute("aria-selected", "true");
    expect(artistTab).toHaveFocus();

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", artistTab.id);
    expect(
      within(panel).getAllByRole("img", { name: /artist page/i }).length,
    ).toBeGreaterThan(0);
  });

  it("the heading is focusable for the See inside link", async () => {
    const { container } = renderGallery();
    await screen.findByRole("tablist", { name: "Studio screens" });
    const heading = container.querySelector("#studio-look-inside-heading");
    expect(heading).not.toBeNull();
    expect(heading).toHaveAttribute("tabindex", "-1");
  });

  it("shows the laptop shot in a laptop frame from 720px up", async () => {
    renderGallery();
    const panel = await screen.findByRole("tabpanel");
    expect(panel.querySelector('[data-device="laptop"]')).not.toBeNull();
    expect(
      panel.querySelector('img[data-shot-theme="light"]')?.getAttribute("src"),
    ).toMatch(/home-desktop-light\.webp$/);
  });

  it("shows every tab's phone shot in a phone frame below 720px", async () => {
    stubPhoneViewport();
    renderGallery();
    const panel = await screen.findByRole("tabpanel");
    expect(panel.querySelector('[data-device="laptop"]')).toBeNull();
    expect(panel.querySelector('[data-device="phone"]')).not.toBeNull();
    expect(
      panel.querySelector('img[data-shot-theme="light"]')?.getAttribute("src"),
    ).toMatch(/home-phone-light\.webp$/);

    const homeTab = screen.getByRole("tab", { name: "Home" });
    homeTab.focus();
    fireEvent.keyDown(homeTab, { key: "ArrowRight" });
    const artistPanel = screen.getByRole("tabpanel");
    expect(artistPanel.querySelector('[data-device="laptop"]')).toBeNull();
    // The outgoing figure may still be fading out, so look at every image.
    const sources = [
      ...artistPanel.querySelectorAll('img[data-shot-theme="light"]'),
    ].map((image) => image.getAttribute("src") ?? "");
    expect(
      sources.some((source) => /artist-phone-light\.webp$/.test(source)),
    ).toBe(true);
  });
});
