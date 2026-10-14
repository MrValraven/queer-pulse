import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { STUDIO_PLAYER_SHORTCUTS } from "./player/studioShortcuts.data";
import { StudioAccessibilityPage } from "./StudioAccessibilityPage";

const showcase = vi.hoisted(() => ({ isOn: false }));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

function renderPage() {
  render(
    <TestProviders initialEntries={["/studio/accessibility"]}>
      <StudioAccessibilityPage />
    </TestProviders>,
  );
}

beforeEach(() => {
  showcase.isOn = false;
});

describe("Studio accessibility (live)", () => {
  it("lists only what works today, and says captions are not there yet", async () => {
    renderPage();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "What works today",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A keyboard seek bar" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Not yet")).toHaveLength(1);
    // Listening: the player's real shortcuts show in live too.
    expect(
      screen.getByRole("heading", { name: /keyboard shortcuts/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/last audited/i)).not.toBeInTheDocument();
  });

  it("sends a barrier report to the contact form's accessibility topic", async () => {
    renderPage();
    expect(
      await screen.findByRole("link", {
        name: "Report an accessibility problem",
      }),
    ).toHaveAttribute("href", "/about/contact?topic=accessibility");
  });
});

describe("Studio accessibility (demo)", () => {
  it("adds the audit line and keeps the shortcuts list", async () => {
    showcase.isOn = true;
    renderPage();
    expect(
      await screen.findByRole("heading", { name: /keyboard shortcuts/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/last audited/i)).toBeInTheDocument();
  });
});

const CHIP_TEXT_BY_KEY: Record<string, string> = {
  "studio:shortcuts.key.space": "Space",
  "studio:shortcuts.key.shift": "Shift",
  "\u2190": "\u2190Left arrow",
  "\u2192": "\u2192Right arrow",
  "\u2191": "\u2191Up arrow",
  "\u2193": "\u2193Down arrow",
};

describe("Studio accessibility shortcuts (Listening)", () => {
  it("lists the shortcuts the player has and none it lacks, in both modes", async () => {
    for (const isOn of [false, true]) {
      showcase.isOn = isOn;
      const view = render(
        <TestProviders initialEntries={["/studio/accessibility"]}>
          <StudioAccessibilityPage />
        </TestProviders>,
      );
      expect(await screen.findByText("Mute or unmute")).toBeInTheDocument();
      expect(screen.getByText("Open the queue")).toBeInTheDocument();
      for (const gone of [
        "Tip the current artist",
        "Save to library",
        "Open search",
      ])
        expect(screen.queryByText(gone)).toBeNull();
      expect(
        screen.getAllByRole("heading", { name: /keyboard shortcuts/i }),
      ).toHaveLength(1);
      // Chip text is the visible glyph plus its spoken name for arrows.
      const chipTexts = new Set(
        Array.from(document.querySelectorAll("kbd")).map(
          (chip) => chip.textContent,
        ),
      );
      const expectedTexts = new Set(
        STUDIO_PLAYER_SHORTCUTS.flatMap((shortcut) =>
          shortcut.keys.map((key) => CHIP_TEXT_BY_KEY[key] ?? key),
        ),
      );
      expect(chipTexts).toEqual(expectedTexts);
      for (const absentKey of ["T", "C", "/"])
        expect(chipTexts.has(absentKey)).toBe(false);
      view.unmount();
    }
  });
});
