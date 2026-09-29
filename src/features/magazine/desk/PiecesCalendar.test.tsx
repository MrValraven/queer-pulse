import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Piece } from "../data/desk.data";
import { PiecesCalendar, type PiecesCalendarProps } from "./PiecesCalendar";

/** Wednesday 12 Aug 2026 at local noon; the grid opens on Monday 10 Aug. */
const TODAY = new Date(2026, 7, 12, 12, 0, 0);

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone Writer",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    issueId: "issue-7",
    ...overrides,
  };
}

function renderCalendar(overrides: Partial<PiecesCalendarProps> = {}) {
  const onOpen = vi.fn();
  const onNextAction = vi.fn();
  const view = render(
    <TestProviders>
      <PiecesCalendar
        pieces={[]}
        today={TODAY}
        closesOn="2026-08-19"
        publishesOn="2026-08-22"
        me="marta"
        track="issue"
        onOpen={onOpen}
        onNextAction={onNextAction}
        {...overrides}
      />
    </TestProviders>,
  );
  return { ...view, onOpen, onNextAction };
}

function cellFor(container: HTMLElement, isoDate: string): HTMLElement {
  const cell = container.querySelector<HTMLElement>(
    `td[data-date="${isoDate}"]`,
  );
  if (!cell) throw new Error(`No cell for ${isoDate}`);
  return cell;
}

/** Renders as a phone: the agenda query matches. */
function stubPhoneWidth() {
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
}

describe("PiecesCalendar grid", () => {
  it("is a table with a caption, seven weekday columns and week rows", () => {
    renderCalendar();
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("columnheader")).toHaveLength(7);
    expect(table.querySelector("caption")).not.toBeNull();
    // Close on Wed 19 Aug: this week and the next.
    expect(within(table).getAllByRole("row")).toHaveLength(3);
  });

  it("heads each day with its full date", () => {
    const { container } = renderCalendar();
    const heading = within(cellFor(container, "2026-08-14")).getByRole(
      "heading",
      { level: 3 },
    );
    expect(heading.textContent).toMatch(/14/);
    expect(heading.textContent).toMatch(/August/);
  });

  it("opens a piece from its chip", () => {
    const piece = makePiece({ title: "Night buses", dueDate: "2026-08-14" });
    const { container, onOpen } = renderCalendar({ pieces: [piece] });
    const cell = cellFor(container, "2026-08-14");
    fireEvent.click(within(cell).getByRole("button", { name: /Night buses/ }));
    expect(onOpen).toHaveBeenCalledWith(piece);
  });

  it("folds a busy day behind a toggle that opens it in place", () => {
    const pieces = Array.from({ length: 5 }, (_, index) =>
      makePiece({
        id: `piece-${index}`,
        title: `Busy piece ${index}`,
        dueDate: "2026-08-18",
      }),
    );
    const { container } = renderCalendar({ pieces });
    const cell = cellFor(container, "2026-08-18");
    expect(within(cell).getAllByRole("listitem")).toHaveLength(3);
    const toggle = within(cell).getByRole("button", { expanded: false });
    fireEvent.click(toggle);
    expect(within(cell).getAllByRole("listitem")).toHaveLength(5);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });

  it("marks today, the close day and the publish day", () => {
    const { container } = renderCalendar();
    expect(cellFor(container, "2026-08-12").className).toMatch(/dayToday/);
    expect(cellFor(container, "2026-08-19").className).toMatch(/dayClose/);
    expect(cellFor(container, "2026-08-20").className).toMatch(/dayAfterClose/);
    expect(cellFor(container, "2026-08-19").textContent).toMatch(/Closes/);
    expect(cellFor(container, "2026-08-22").textContent).toMatch(/Publishes/);
  });

  it("labels work due after close", () => {
    const { container } = renderCalendar({
      pieces: [makePiece({ title: "Too late", dueDate: "2026-08-21" })],
    });
    expect(cellFor(container, "2026-08-21").textContent).toMatch(/After close/);
  });

  it("lists undated pieces in a lane above the grid", () => {
    const piece = makePiece({ title: "Someday essay", due: "" });
    const { onOpen } = renderCalendar({ pieces: [piece] });
    const lane = screen.getByRole("region", { name: /No date yet/ });
    fireEvent.click(within(lane).getByRole("button", { name: /Someday/ }));
    expect(onOpen).toHaveBeenCalledWith(piece);
  });
});

/** A scheduled piece going live on Fri 14 Aug at 10:00 local, with the
 *  clock pinned to TODAY so the chip's go-live line reads it as scheduled. */
function makeScheduledPiece(overrides: Partial<Piece> = {}): Piece {
  return makePiece({
    title: "Harbour lights",
    stage: "Ready",
    publishedAt: new Date(2026, 7, 14, 10, 0, 0).toISOString(),
    ...overrides,
  });
}

describe("PiecesCalendar scheduled pieces", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("files an undated scheduled piece on its go-live day with a clock line", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(TODAY);
    const { container } = renderCalendar({ pieces: [makeScheduledPiece()] });
    const cell = cellFor(container, "2026-08-14");
    const chip = within(cell).getByRole("button", { name: /Harbour lights/ });
    expect(chip).toHaveTextContent(/Goes live \S/);
    expect(screen.queryByRole("region", { name: /No date yet/ })).toBeNull();
  });

  it("shows the go-live line in the phone agenda, with no action button", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(TODAY);
    stubPhoneWidth();
    renderCalendar({ pieces: [makeScheduledPiece()] });
    const chip = screen.getByRole("button", { name: /Harbour lights/ });
    expect(chip).toHaveTextContent(/Goes live \S/);
    expect(screen.queryByRole("button", { name: "Publish" })).toBeNull();
  });

  it("dates a scheduled piece past the grid through its go-live line", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(TODAY);
    renderCalendar({
      pieces: [
        makeScheduledPiece({
          publishedAt: new Date(2026, 11, 1, 9, 0, 0).toISOString(),
        }),
      ],
    });
    const lane = screen.getByRole("region", { name: /Due after/ });
    expect(
      within(lane).getByRole("button", { name: /Harbour lights/ }),
    ).toHaveTextContent(/Goes live \S/);
  });
});

describe("PiecesCalendar on a phone", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists only the days with work plus the close day", () => {
    stubPhoneWidth();
    renderCalendar({
      pieces: [makePiece({ title: "Night buses", dueDate: "2026-08-14" })],
    });
    expect(screen.queryByRole("table")).toBeNull();
    const days = screen.getAllByRole("heading", { level: 3 });
    expect(days).toHaveLength(2);
    expect(days[1]?.textContent).toMatch(/Closes/);
  });

  it("offers each piece's next step", () => {
    stubPhoneWidth();
    const piece = makePiece({
      title: "Night buses",
      stage: "Edit",
      dueDate: "2026-08-14",
    });
    const { onNextAction } = renderCalendar({ pieces: [piece] });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onNextAction).toHaveBeenCalledWith(
      piece,
      expect.objectContaining({ kind: "edit" }),
    );
  });
});
