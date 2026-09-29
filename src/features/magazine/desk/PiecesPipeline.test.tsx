import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Piece } from "../data/desk.data";
import { PiecesPipeline, type PiecesPipelineProps } from "./PiecesPipeline";
import { COLLAPSED_GROUPS_STORAGE_KEY } from "./useCollapsedGroups";

const ME = "marta";

function makePiece(overrides: Partial<Piece> & { id: string }): Piece {
  return {
    title: `Piece ${overrides.id}`,
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Rui Sol",
    editorId: ME,
    stage: "Edit",
    due: "",
    art: "in",
    wait: "nobody",
    issueId: "issue-1",
    ...overrides,
  };
}

const yourTurnPiece = makePiece({
  id: "turn",
  title: "My turn piece",
  wait: "you",
});
const writerPiece = makePiece({
  id: "writer",
  title: "With the writer",
  stage: "Drafting",
  wait: "writer",
});
const publishedPiece = makePiece({
  id: "shipped",
  title: "Already out",
  stage: "Published",
  due: "ready",
});

function renderPipeline(overrides: Partial<PiecesPipelineProps> = {}) {
  const props: PiecesPipelineProps = {
    pieces: [yourTurnPiece, writerPiece, publishedPiece],
    focusId: null,
    track: "issue",
    hasAnyIssue: true,
    selectedPieceIds: [],
    areAllSelected: false,
    onToggleSelect: vi.fn(),
    onToggleSelectAll: vi.fn(),
    onOpen: vi.fn(),
    onEdit: vi.fn(),
    onChase: vi.fn(),
    onHandoff: vi.fn(),
    onAssignIssue: vi.fn(),
    onDelete: vi.fn(),
    me: ME,
    ...overrides,
  };
  const view = render(
    <TestProviders>
      <PiecesPipeline {...props} />
    </TestProviders>,
  );
  return { ...view, props };
}

function groupToggle(name: RegExp): HTMLElement {
  return screen.getByRole("button", { name });
}

afterEach(() => {
  window.localStorage.removeItem(COLLAPSED_GROUPS_STORAGE_KEY);
});

describe("PiecesPipeline", () => {
  it("draws one flat list with no group headers by default", () => {
    renderPipeline();

    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Already out" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state when no piece matches", () => {
    renderPipeline({ pieces: [] });

    expect(screen.getByText("The desk is clear")).toBeInTheDocument();
  });

  it("groups by who the piece waits on, under folding headers", () => {
    renderPipeline({ groupBy: "waiting" });

    const toggle = groupToggle(/^Your turn/);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const bodyId = toggle.getAttribute("aria-controls");
    expect(bodyId && document.getElementById(bodyId)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "My turn piece" }),
    ).toBeInTheDocument();
  });

  it("folds Published by default and keeps its header in view", () => {
    renderPipeline({ groupBy: "waiting" });

    expect(groupToggle(/^Published/)).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("button", { name: "Already out" }),
    ).not.toBeInTheDocument();
  });

  it("folds a group on click and remembers the choice", () => {
    const { unmount } = renderPipeline({ groupBy: "waiting" });

    fireEvent.click(groupToggle(/^With writers/));

    expect(
      screen.queryByRole("button", { name: "With the writer" }),
    ).not.toBeInTheDocument();
    const stored = JSON.parse(
      window.localStorage.getItem(COLLAPSED_GROUPS_STORAGE_KEY) ?? "{}",
    ) as Record<string, boolean>;
    expect(stored["with-writers"]).toBe(true);

    unmount();
    renderPipeline({ groupBy: "waiting" });
    expect(groupToggle(/^With writers/)).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens a folded group while the keyboard's current row is inside", () => {
    renderPipeline({ groupBy: "waiting", focusId: publishedPiece.id });

    expect(
      screen.getByRole("button", { name: "Already out" }),
    ).toBeInTheDocument();
  });

  it("says nothing waits on you when there is no turn and nothing late", () => {
    renderPipeline({ groupBy: "waiting", pieces: [writerPiece] });

    expect(screen.getByText("Nothing is waiting on you")).toBeInTheDocument();
  });

  it("keeps the all clear note away while it is your turn", () => {
    renderPipeline({ groupBy: "waiting" });

    expect(
      screen.queryByText("Nothing is waiting on you"),
    ).not.toBeInTheDocument();
  });

  it("hides the all clear note while a filter narrows the list", () => {
    renderPipeline({
      groupBy: "waiting",
      pieces: [writerPiece],
      isFiltered: true,
    });

    expect(
      screen.queryByText("Nothing is waiting on you"),
    ).not.toBeInTheDocument();
  });

  it("falls back to each group's default fold when storage throws", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    try {
      renderPipeline({ groupBy: "waiting" });

      expect(groupToggle(/^With writers/)).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      expect(groupToggle(/^Published/)).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    } finally {
      getItem.mockRestore();
    }
  });

  it("gives pieces with no section a header that folds", () => {
    renderPipeline({
      groupBy: "section",
      pieces: [writerPiece, makePiece({ id: "loose", section: "" })],
    });

    expect(groupToggle(/^No section/)).toHaveAttribute("aria-expanded", "true");
  });

  it("follows fold state handed in by the page", () => {
    const toggleCollapsed = vi.fn();
    renderPipeline({
      groupBy: "waiting",
      collapsedGroups: {
        isCollapsed: (group) => group.id === "your-turn",
        toggleCollapsed,
        collapsedGroupIds: new Set(["your-turn"]),
      },
    });

    expect(
      screen.queryByRole("button", { name: "My turn piece" }),
    ).not.toBeInTheDocument();
    fireEvent.click(groupToggle(/^Your turn/));
    expect(toggleCollapsed).toHaveBeenCalledWith(
      expect.objectContaining({ id: "your-turn" }),
    );
  });

  it("offers select all as a checkbox, partly checked for a partial pick", () => {
    const { props } = renderPipeline({ selectedPieceIds: [writerPiece.id] });

    const selectAll = screen.getByRole<HTMLInputElement>("checkbox", {
      name: "Select every piece shown",
    });
    expect(selectAll.indeterminate).toBe(true);

    fireEvent.click(selectAll);
    expect(props.onToggleSelectAll).toHaveBeenCalledTimes(1);
  });

  it("marks the row whose peek panel is open", () => {
    renderPipeline({ openPieceId: writerPiece.id });

    expect(
      screen.getByRole("button", { name: "With the writer" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("tells a group header about its chip's pieces under an earlier group", () => {
    renderPipeline({
      groupBy: "waiting",
      pieces: [
        writerPiece,
        makePiece({
          id: "late-writer",
          title: "Late with the writer",
          stage: "Drafting",
          wait: "writer",
          late: true,
        }),
      ],
    });

    expect(groupToggle(/^With writers/)).toHaveAccessibleName(
      "With writers, 1 piece, 1 more under Late",
    );
    expect(screen.getByText("1 more under Late")).toBeInTheDocument();
  });

  it("carries the density for the rows to read", () => {
    const { container } = renderPipeline({ density: "compact" });

    expect(container.querySelector('[data-density="compact"]')).not.toBeNull();
  });
});
