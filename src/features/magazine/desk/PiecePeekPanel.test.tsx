import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Viewer } from "../api/useDeskPresence";
import { DEMO_PIECES, type Piece } from "../data/desk.data";
import { PiecePeekPanel, type PiecePeekPanelProps } from "./PiecePeekPanel";

const peekViewers: Viewer[] = [
  { userId: "sara", name: "Sara Pinheiro", initials: "SP" },
];

const firstDemoPiece = DEMO_PIECES[0];
if (!firstDemoPiece) throw new Error("DEMO_PIECES is empty");

/** A piece the writer holds at Edit, so the next action is "Chase". */
const peekedPiece: Piece = {
  ...firstDemoPiece,
  stage: "Edit",
  wait: "writer",
};

function renderPanel(overrides: Partial<PiecePeekPanelProps> = {}) {
  const props: PiecePeekPanelProps = {
    piece: peekedPiece,
    track: "issue",
    onClose: vi.fn(),
    onOpenFullRecord: vi.fn(),
    onNextAction: vi.fn(),
    hasPrevious: false,
    hasNext: true,
    ...overrides,
  };
  const view = render(
    <TestProviders>
      <PiecePeekPanel {...props} />
    </TestProviders>,
  );
  return { ...view, props };
}

describe("PiecePeekPanel", () => {
  it("renders nothing while no piece is peeked", () => {
    renderPanel({ piece: null });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is a non-modal dialog named by the piece title", async () => {
    renderPanel();
    const dialog = await screen.findByRole("dialog", {
      name: peekedPiece.title,
    });
    expect(dialog).toHaveAttribute("aria-modal", "false");
  });

  it("moves focus into the panel when it opens", async () => {
    renderPanel();
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const { props } = renderPanel();
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("hands focus back to the element that opened it on close", async () => {
    const props: PiecePeekPanelProps = {
      piece: null,
      track: "issue",
      onClose: vi.fn(),
      onOpenFullRecord: vi.fn(),
      onNextAction: vi.fn(),
      hasPrevious: false,
      hasNext: false,
    };
    // One client across rerenders, so the providers keep their state.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const renderWithOpener = (piece: Piece | null) => (
      <TestProviders queryClient={queryClient}>
        <button type="button">Open peek</button>
        <PiecePeekPanel {...props} piece={piece} />
      </TestProviders>
    );
    const { rerender } = render(renderWithOpener(null));
    const opener = screen.getByRole("button", { name: "Open peek" });
    opener.focus();

    rerender(renderWithOpener(peekedPiece));
    expect(await screen.findByRole("dialog")).toHaveFocus();

    rerender(renderWithOpener(null));
    expect(opener).toHaveFocus();
  });

  it("runs the next action for the piece", async () => {
    const { props } = renderPanel();
    fireEvent.click(await screen.findByRole("button", { name: "Chase" }));
    expect(props.onNextAction).toHaveBeenCalledWith(
      peekedPiece,
      expect.objectContaining({ kind: "chase" }),
    );
  });

  it("opens the full record from the footer", async () => {
    const { props } = renderPanel();
    fireEvent.click(
      await screen.findByRole("button", { name: /open full record/i }),
    );
    expect(props.onOpenFullRecord).toHaveBeenCalledWith(peekedPiece);
  });

  it("steps to the next piece and holds the previous one at the top", async () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    renderPanel({ onPrevious, onNext, hasPrevious: false, hasNext: true });

    const previousButton = await screen.findByRole("button", {
      name: /previous piece/i,
    });
    expect(previousButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(previousButton);
    expect(onPrevious).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /next piece/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("hides the step pair when the desk wires no handlers", async () => {
    renderPanel();
    await screen.findByRole("dialog");
    expect(
      screen.queryByRole("button", { name: /next piece/i }),
    ).not.toBeInTheDocument();
  });

  it("loads the brief from the piece record", async () => {
    renderPanel();
    expect(
      await screen.findByRole("heading", { name: "Brief" }),
    ).toBeInTheDocument();
  });

  it("shows a presence stack for an editor already viewing the piece", async () => {
    renderPanel({ viewers: peekViewers });
    await screen.findByRole("dialog");

    // PiecePeekHeader renders exactly one instance, chosen by the `isSheet`
    // boolean, so getByRole would throw here if it were ever rendered twice.
    expect(
      screen.getByRole("img", { name: "Sara Pinheiro viewing" }),
    ).toBeInTheDocument();
  });

  it("renders no presence stack without viewers", async () => {
    renderPanel();
    await screen.findByRole("dialog");

    expect(
      screen.queryByRole("img", { name: /viewing/ }),
    ).not.toBeInTheDocument();
  });

  it("leaves Escape to a control outside the panel", async () => {
    const onClose = vi.fn();
    render(
      <TestProviders>
        <button type="button">Outside control</button>
        <PiecePeekPanel
          piece={peekedPiece}
          track="issue"
          onClose={onClose}
          onOpenFullRecord={vi.fn()}
          onNextAction={vi.fn()}
          hasPrevious={false}
          hasNext={false}
        />
      </TestProviders>,
    );
    await screen.findByRole("dialog");
    const outsideControl = screen.getByRole("button", {
      name: "Outside control",
    });
    outsideControl.focus();
    fireEvent.keyDown(outsideControl, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("PiecePeekPanel as a phone sheet", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("max-width: 767px"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    // jsdom does no layout, so every element reports a null offsetParent,
    // which the Tab trap reads to skip hidden controls.
    vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(
      function (this: HTMLElement) {
        return this.parentElement;
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("is a modal dialog", async () => {
    renderPanel();
    expect(await screen.findByRole("dialog")).toHaveAttribute(
      "aria-modal",
      "true",
    );
  });

  it("keeps Tab inside the sheet from the moment it opens", async () => {
    // Fix round 1: the toolbar (close/step) now sits after `.scroll` in the
    // DOM, matching where it paints, so the record's own first control
    // ("Chase", from PiecePeekStatus) leads the trap.
    renderPanel();
    expect(await screen.findByRole("dialog")).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(
      screen.getByRole("button", { name: /open full record/i }),
    ).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Chase" })).toHaveFocus();
  });

  it("moves the presence stack to its own line, still shown once", async () => {
    renderPanel({ viewers: peekViewers });
    await screen.findByRole("dialog");

    expect(
      screen.getByRole("img", { name: "Sara Pinheiro viewing" }),
    ).toBeInTheDocument();
  });
});
