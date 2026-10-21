import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { useStudioPlayerShortcuts } from "../useStudioPlayerShortcuts";
import { StudioSyncedLyrics } from "./StudioSyncedLyrics";

const LINES = [
  { ms: 0, text: "First line" },
  { ms: 4000, text: "" },
  { ms: 8000, text: "Second line" },
  { ms: 12000, text: "Third line" },
];
const scrollTo = vi.fn();

beforeEach(() => {
  scrollTo.mockClear();
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    value: scrollTo,
    configurable: true,
  });
});
afterEach(() => vi.useRealTimers());

function renderLyrics(activeIndex: number | null, onSeekLine = vi.fn()) {
  const view = render(
    <TestProviders>
      <StudioSyncedLyrics
        lines={LINES}
        activeIndex={activeIndex}
        onSeekLine={onSeekLine}
        label="Lyrics"
      />
    </TestProviders>,
  );
  const rerender = (nextIndex: number | null) =>
    view.rerender(
      <TestProviders>
        <StudioSyncedLyrics
          lines={LINES}
          activeIndex={nextIndex}
          onSeekLine={onSeekLine}
          label="Lyrics"
        />
      </TestProviders>,
    );
  return { ...view, rerender, onSeekLine };
}

describe("StudioSyncedLyrics", () => {
  it("marks the current line and seeks to a pressed line", async () => {
    const { onSeekLine } = renderLyrics(2);
    expect(
      await screen.findByRole("button", { name: "Second line" }),
    ).toHaveAttribute("aria-current", "true");
    fireEvent.click(screen.getByRole("button", { name: "Third line" }));
    expect(onSeekLine).toHaveBeenCalledWith(12000);
  });

  it("renders an instrumental gap as a hidden spacer", async () => {
    renderLyrics(0);
    await screen.findByRole("button", { name: "First line" });
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("follows the current line until the person scrolls", async () => {
    const { rerender } = renderLyrics(0);
    await screen.findByRole("button", { name: "First line" });
    rerender(2);
    expect(scrollTo).toHaveBeenCalled();
    scrollTo.mockClear();
    fireEvent.wheel(screen.getByRole("list", { name: "Lyrics" }));
    rerender(3);
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(
      await screen.findByRole("button", { name: "Back to current line" }),
    );
    expect(scrollTo).toHaveBeenCalled();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Back to current line" }),
      ).toBeNull(),
    );
  });

  it("pauses on a scroll key and resumes after four seconds", async () => {
    const { rerender } = renderLyrics(0);
    const firstLine = await screen.findByRole("button", { name: "First line" });
    vi.useFakeTimers();
    fireEvent.keyDown(firstLine, { key: "PageDown" });
    scrollTo.mockClear();
    rerender(2);
    expect(scrollTo).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(scrollTo).toHaveBeenCalled();
  });

  it("pauses when the scrollbar is pressed but not when a line is", async () => {
    renderLyrics(0);
    const list = screen.getByRole("list", { name: "Lyrics" });
    fireEvent.pointerDown(
      await screen.findByRole("button", { name: "First line" }),
    );
    expect(
      screen.queryByRole("button", { name: "Back to current line" }),
    ).toBeNull();
    fireEvent.pointerDown(list);
    expect(
      await screen.findByRole("button", { name: "Back to current line" }),
    ).toBeInTheDocument();
  });

  it("moves focus to the current line after Back to current line", async () => {
    renderLyrics(2);
    await screen.findByRole("button", { name: "Second line" });
    fireEvent.wheel(screen.getByRole("list", { name: "Lyrics" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Back to current line" }),
    );
    expect(screen.getByRole("button", { name: "Second line" })).toHaveFocus();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Back to current line" }),
      ).toBeNull(),
    );
  });

  it("moves between lines with the arrows, skipping gaps, and pauses the follow", async () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    renderLyrics(0);
    const firstLine = await screen.findByRole("button", { name: "First line" });
    firstLine.focus();
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      firstLine.dispatchEvent(event);
    });
    expect(onShortcut).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole("button", { name: "Second line" })).toHaveFocus();
    expect(
      await screen.findByRole("button", { name: "Back to current line" }),
    ).toBeInTheDocument();
  });

  it("is one Tab stop, held by the current line", () => {
    renderLyrics(2);
    const tabStops = screen
      .getAllByRole("button")
      .filter((button) => button.tabIndex === 0);
    expect(tabStops.map((button) => button.textContent)).toEqual([
      "Second line",
    ]);
  });

  it.each([
    // Shown part runs 600 to 800, so the line centres 100px into the box.
    { isInPageFlow: true, expectedTop: 300 - 100 + 20 },
    // A list in its own pane centres on the whole 400px box.
    { isInPageFlow: false, expectedTop: 300 - 200 + 20 },
  ])(
    "centres the line in the box part on screen when in page flow: $isInPageFlow",
    async ({ isInPageFlow, expectedTop }) => {
      const realInnerHeight = window.innerHeight;
      Object.defineProperty(window, "innerHeight", {
        value: 800,
        configurable: true,
      });
      const renderAt = (activeIndex: number) => (
        <TestProviders>
          <StudioSyncedLyrics
            lines={LINES}
            activeIndex={activeIndex}
            onSeekLine={vi.fn()}
            label="Lyrics"
            isInPageFlow={isInPageFlow}
          />
        </TestProviders>
      );
      const view = render(renderAt(0));
      const list = await screen.findByRole("list", { name: "Lyrics" });
      Object.defineProperty(list, "clientHeight", {
        value: 400,
        configurable: true,
      });
      vi.spyOn(list, "getBoundingClientRect").mockReturnValue({
        top: 600,
      } as DOMRect);
      const thirdLine = list.querySelector(
        '[data-line-index="3"]',
      ) as HTMLElement;
      Object.defineProperty(thirdLine, "offsetTop", {
        value: 300,
        configurable: true,
      });
      Object.defineProperty(thirdLine, "offsetHeight", {
        value: 40,
        configurable: true,
      });
      scrollTo.mockClear();
      view.rerender(renderAt(3));
      Object.defineProperty(window, "innerHeight", {
        value: realInnerHeight,
        configurable: true,
      });
      expect(scrollTo).toHaveBeenLastCalledWith(
        expect.objectContaining({ top: expectedTop }),
      );
      expect(list.parentElement?.hasAttribute("data-page-flow")).toBe(
        isInPageFlow,
      );
    },
  );
});

describe("StudioSyncedLyrics styles on the track page", () => {
  const css = readFileSync(
    "src/features/studio/player/ui/StudioSyncedLyrics.module.css",
    "utf8",
  );
  const ruleBody = (selector: string) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const body = new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(
      css,
    )?.[1];
    if (body === undefined) throw new Error(`No rule for ${selector}`);
    return body;
  };

  it("caps the box to the space above the player bar", () => {
    const list = ruleBody(".root[data-page-flow] .list");
    expect(list).toMatch(/max-block-size:\s*min\(/);
    expect(list).toMatch(/100dvh/);
    expect(list).toMatch(/var\(--studio-player-inset, 0px\)/);
    expect(list).toMatch(/var\(--bottom-inset, 0px\)/);
  });

  it("keeps Back to current line above the player bar", () => {
    const back = ruleBody(".root[data-page-flow] .back");
    expect(back).toMatch(/position:\s*sticky/);
    expect(back).toMatch(
      /inset-block-end:\s*calc\(\s*var\(--studio-player-inset, 0px\)/,
    );
  });
});
