import { useId, useRef, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { VjDockPopover } from "./VjDockPopover";

const ANCHOR_RECT = {
  top: 600,
  bottom: 644,
  left: 100,
  right: 144,
  width: 44,
  height: 44,
  x: 100,
  y: 600,
  toJSON: () => ({}),
} as DOMRect;
const PANEL_WIDTH = 200;
const PANEL_HEIGHT = 120;

/** jsdom lays nothing out: give every element the panel's size. */
function stubLayout() {
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(
    PANEL_WIDTH,
  );
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(
    PANEL_HEIGHT,
  );
}

function PopoverHarness({ onClose }: { onClose: () => void }) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <button
        type="button"
        ref={(element) => {
          anchorRef.current = element;
          if (element) element.getBoundingClientRect = () => ANCHOR_RECT;
        }}
        onClick={() => setIsOpen((current) => !current)}
      >
        Tune strobe
      </button>
      <button type="button">Somewhere else</button>
      <VjDockPopover
        anchorRef={anchorRef}
        isOpen={isOpen}
        labelledBy={titleId}
        onClose={() => {
          onClose();
          setIsOpen(false);
        }}
      >
        <p id={titleId}>Tune the pad</p>
        <button type="button">Turn off</button>
      </VjDockPopover>
    </>
  );
}

/** The flash warning's case: a switch in a modal sheet opens a popover
 *  anchored on the dock that the sheet covers. */
function OverSheetHarness({
  onClose,
  onScrimPress,
}: {
  onClose: () => void;
  onScrimPress: () => void;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        ref={(element) => {
          anchorRef.current = element;
          if (element) element.getBoundingClientRect = () => ANCHOR_RECT;
        }}
      >
        Invert pad
      </button>
      <div role="presentation" onPointerDown={onScrimPress}>
        <div role="dialog" aria-modal="true" aria-label="All effects">
          <button type="button" onClick={() => setIsOpen(true)}>
            Flip Invert
          </button>
        </div>
      </div>
      <VjDockPopover
        anchorRef={anchorRef}
        isOpen={isOpen}
        labelledBy={titleId}
        isOverSheets
        onClose={() => {
          onClose();
          setIsOpen(false);
        }}
      >
        <p id={titleId}>Flashing light</p>
        <button type="button">Keep it off</button>
      </VjDockPopover>
    </>
  );
}

function renderOverSheet() {
  const onClose = vi.fn();
  const onScrimPress = vi.fn();
  const view = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <OverSheetHarness onClose={onClose} onScrimPress={onScrimPress} />
      </LazyMotion>
    </TestProviders>,
  );
  const opener = screen.getByRole("button", { name: "Flip Invert" });
  opener.focus();
  fireEvent.click(opener);
  return { ...view, onClose, onScrimPress, opener };
}

function renderPopover(onClose: () => void = vi.fn()) {
  return render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <PopoverHarness onClose={onClose} />
      </LazyMotion>
    </TestProviders>,
  );
}

describe("VjDockPopover", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens above the anchor and focuses its first control", async () => {
    stubLayout();
    renderPopover();
    const dialog = screen.getByRole("dialog", { name: "Tune the pad" });
    expect(dialog).toHaveAttribute("data-placement", "above");
    expect(dialog).toHaveAttribute("data-theme", "dark");
    // 600 (anchor top) - 8 (gap) - 120 (panel height)
    expect(dialog.style.top).toBe("472px");
    // Centred on the anchor: 100 + 22 - 100
    expect(dialog.style.left).toBe("22px");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Turn off" })).toHaveFocus(),
    );
  });

  it("centres a dock-wide panel in the viewport on a phone", () => {
    const viewportWidth = window.innerWidth;
    // The phone rule: the viewport less an 18px gutter on each side.
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(
      viewportWidth - 36,
    );
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(
      PANEL_HEIGHT,
    );
    renderPopover();
    const dialog = screen.getByRole("dialog", { name: "Tune the pad" });
    expect(dialog.style.left).toBe("18px");
  });

  it("closes on Escape and returns focus", async () => {
    stubLayout();
    const onClose = vi.fn();
    renderPopover(onClose);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Turn off" })).toHaveFocus(),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Tune strobe" })).toHaveFocus();
  });

  it("closes on an outside press", () => {
    stubLayout();
    const onClose = vi.fn();
    renderPopover(onClose);
    fireEvent.pointerDown(
      screen.getByRole("button", { name: "Somewhere else" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("leaves the DOM after the exit", async () => {
    stubLayout();
    renderPopover();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("marks only an over-sheets popover for the layer above the sheets", () => {
    stubLayout();
    renderPopover();
    expect(
      screen.getByRole("dialog", { name: "Tune the pad" }),
    ).not.toHaveAttribute("data-over-sheets");
  });

  describe("over a sheet", () => {
    it("takes the layer above the sheets and focuses its first control", async () => {
      stubLayout();
      renderOverSheet();
      const popover = screen.getByRole("dialog", { name: "Flashing light" });
      expect(popover).toHaveAttribute("data-over-sheets", "true");
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Keep it off" }),
        ).toHaveFocus(),
      );
    });

    it("a press inside the popover dismisses nothing", async () => {
      stubLayout();
      const { onClose, onScrimPress } = renderOverSheet();
      const keepOff = await screen.findByRole("button", {
        name: "Keep it off",
      });
      fireEvent.pointerDown(keepOff);
      fireEvent.pointerDown(
        screen.getByRole("dialog", { name: "Flashing light" }),
      );
      expect(onClose).not.toHaveBeenCalled();
      expect(onScrimPress).not.toHaveBeenCalled();
    });

    it("Escape closes the popover alone and focus returns to the switch in the sheet", async () => {
      stubLayout();
      const sheetEscape = vi.fn();
      const onDocumentKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") sheetEscape();
      };
      document.addEventListener("keydown", onDocumentKeyDown);
      try {
        const { onClose, opener } = renderOverSheet();
        const keepOff = await screen.findByRole("button", {
          name: "Keep it off",
        });
        await waitFor(() => expect(keepOff).toHaveFocus());
        fireEvent.keyDown(keepOff, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(sheetEscape).not.toHaveBeenCalled();
        expect(opener).toHaveFocus();
        expect(
          screen.getByRole("button", { name: "Invert pad" }),
        ).not.toHaveFocus();
      } finally {
        document.removeEventListener("keydown", onDocumentKeyDown);
      }
    });
  });
});
