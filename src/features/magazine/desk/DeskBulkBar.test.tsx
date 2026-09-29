import type { ReactNode } from "react";
import {
  render,
  renderHook,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Piece, Stage } from "../data/desk.data";
import { DeskBulkBar, type DeskBulkBarProps } from "./DeskBulkBar";
import {
  chaseQueueForSelection,
  useDeskBulkActions,
  type UseDeskBulkActionsParams,
} from "./useDeskBulkActions";

// `desk.bulk.*`, `desk.reassign.*`, `desk.pieceRow.handOff` and
// `desk.stage.*` are all in the catalogs, so these assertions read the real
// English copy.

const showToast = vi.fn();
vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

// Toggled per test; DeskBulkBar folds every action (Change stage included)
// into the single "Actions" DeskMenu once this reports compact, the
// same mock-the-hook approach PieceRow/DeskWorkbar use for their own
// `useMediaQuery` checks.
let isCompactMock = false;
vi.mock("../../../shared/hooks/useMediaQuery", () => ({
  useMediaQuery: () => isCompactMock,
}));

const STAGES: Stage[] = [
  "Commissioned",
  "Drafting",
  "In review",
  "Edit",
  "Sensitivity read",
  "Layout",
  "Ready",
  "Published",
];

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A long feature on trans joy",
    format: "article",
    section: "Culture",
    kind: "Feature",
    byline: "Rita Faria",
    editorId: "ed-1",
    stage: "Drafting",
    due: "",
    art: "none",
    issueId: "issue-1",
    ...overrides,
  };
}

function renderBar(overrides: Partial<DeskBulkBarProps> = {}) {
  const props: DeskBulkBarProps = {
    selectedPieces: [makePiece()],
    stages: STAGES,
    hasAnyIssue: true,
    track: "issue",
    onAssignIssue: vi.fn(),
    onChangeStage: vi.fn(),
    onChaseAll: vi.fn(),
    onHandOff: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  };
  render(
    <TestProviders>
      <DeskBulkBar {...props} />
    </TestProviders>,
  );
  return props;
}

describe("DeskBulkBar", () => {
  beforeEach(() => {
    isCompactMock = false;
  });

  it("renders nothing when no pieces are selected", () => {
    renderBar({ selectedPieces: [] });
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("shows the selection count and clears it", async () => {
    const user = userEvent.setup();
    const props = renderBar({
      selectedPieces: [makePiece({ id: "p-1" }), makePiece({ id: "p-2" })],
    });
    expect(screen.getByRole("status")).toHaveTextContent("2 selected");
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(props.onClear).toHaveBeenCalledOnce();
  });

  it("hides the issue action once nothing in the selection is on an issue at all", () => {
    renderBar({ hasAnyIssue: false });
    expect(screen.queryByRole("button", { name: "Add to issue" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Move issue" })).toBeNull();
  });

  it('reads "Add to issue" on the unassigned track', () => {
    renderBar({
      track: "unassigned",
      selectedPieces: [makePiece({ issueId: null })],
    });
    expect(screen.getByRole("button", { name: "Add to issue" })).toBeVisible();
  });

  it('reads "Move issue" once every selected piece already has one', () => {
    renderBar({
      track: "everything",
      selectedPieces: [
        makePiece({ id: "p-1", issueId: "issue-1" }),
        makePiece({ id: "p-2", issueId: "issue-2" }),
      ],
    });
    expect(screen.getByRole("button", { name: "Move issue" })).toBeVisible();
  });

  it("shows Chase only while at least one selected piece waits on a writer, with its count", () => {
    const { rerender } = render(
      <TestProviders>
        <DeskBulkBar
          selectedPieces={[makePiece({ wait: "you" })]}
          stages={STAGES}
          hasAnyIssue
          track="issue"
          onAssignIssue={vi.fn()}
          onChangeStage={vi.fn()}
          onChaseAll={vi.fn()}
          onHandOff={vi.fn()}
          onClear={vi.fn()}
        />
      </TestProviders>,
    );
    expect(screen.queryByRole("button", { name: /^Chase/ })).toBeNull();

    rerender(
      <TestProviders>
        <DeskBulkBar
          selectedPieces={[
            makePiece({ id: "p-1", wait: "writer" }),
            makePiece({ id: "p-2", wait: "writer" }),
            makePiece({ id: "p-3", wait: "you" }),
          ]}
          stages={STAGES}
          hasAnyIssue
          track="issue"
          onAssignIssue={vi.fn()}
          onChangeStage={vi.fn()}
          onChaseAll={vi.fn()}
          onHandOff={vi.fn()}
          onClear={vi.fn()}
        />
      </TestProviders>,
    );
    expect(screen.getByRole("button", { name: "Chase 2" })).toBeVisible();
  });

  it("calls onChaseAll with the actual chase queue", async () => {
    const user = userEvent.setup();
    const waitingPiece = makePiece({ wait: "writer" });
    const props = renderBar({ selectedPieces: [waitingPiece] });
    await user.click(screen.getByRole("button", { name: "Chase 1" }));
    expect(props.onChaseAll).toHaveBeenCalledExactlyOnceWith([waitingPiece]);
  });

  it("Chase 2 queues exactly the two writer-waiting pieces, in table order", async () => {
    const user = userEvent.setup();
    const first = makePiece({ id: "p-1", wait: "writer" });
    const second = makePiece({ id: "p-2", wait: "writer" });
    const notWaiting = makePiece({ id: "p-3", wait: "you" });
    const props = renderBar({ selectedPieces: [first, notWaiting, second] });
    await user.click(screen.getByRole("button", { name: "Chase 2" }));
    expect(props.onChaseAll).toHaveBeenCalledExactlyOnceWith([first, second]);
  });

  it("shows Hand off always, disabled unless exactly one piece is selected", () => {
    const { rerender } = render(
      <TestProviders>
        <DeskBulkBar
          selectedPieces={[makePiece({ id: "p-1" }), makePiece({ id: "p-2" })]}
          stages={STAGES}
          hasAnyIssue
          track="issue"
          onAssignIssue={vi.fn()}
          onChangeStage={vi.fn()}
          onChaseAll={vi.fn()}
          onHandOff={vi.fn()}
          onClear={vi.fn()}
        />
      </TestProviders>,
    );
    // Past one piece it stays on screen, disabled (`HandoffModal`
    // only ever carries one piece).
    expect(screen.getByRole("button", { name: "Hand off" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    rerender(
      <TestProviders>
        <DeskBulkBar
          selectedPieces={[makePiece({ id: "p-1" })]}
          stages={STAGES}
          hasAnyIssue
          track="issue"
          onAssignIssue={vi.fn()}
          onChangeStage={vi.fn()}
          onChaseAll={vi.fn()}
          onHandOff={vi.fn()}
          onClear={vi.fn()}
        />
      </TestProviders>,
    );
    const handOffButton = screen.getByRole("button", { name: "Hand off" });
    expect(handOffButton).toBeVisible();
    expect(handOffButton).toHaveAttribute("aria-disabled", "false");
  });
});

describe("DeskBulkBar: Change stage menu", () => {
  it("offers every stage except Published, and calls onChangeStage on a pick", async () => {
    const user = userEvent.setup();
    const props = renderBar();
    await user.click(screen.getByRole("button", { name: "Change stage" }));

    expect(
      screen.queryByRole("menuitemradio", { name: "Published" }),
    ).toBeNull();
    const layoutItem = screen.getByRole("menuitemradio", { name: "Layout" });
    expect(layoutItem).toBeVisible();

    await user.click(layoutItem);
    expect(props.onChangeStage).toHaveBeenCalledExactlyOnceWith("Layout");
  });

  it("checks a stage only when the WHOLE selection already sits there", async () => {
    const user = userEvent.setup();
    renderBar({
      selectedPieces: [
        makePiece({ id: "p-1", stage: "Edit" }),
        makePiece({ id: "p-2", stage: "Layout" }),
      ],
    });
    await user.click(screen.getByRole("button", { name: "Change stage" }));
    expect(screen.getByRole("menuitemradio", { name: "Edit" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });
});

describe("DeskBulkBar: compact layout", () => {
  beforeEach(() => {
    isCompactMock = true;
  });

  it("folds Change stage and the rest into one Actions menu", async () => {
    const user = userEvent.setup();
    const waitingPiece = makePiece({ wait: "writer" });
    const props = renderBar({ selectedPieces: [waitingPiece] });

    expect(screen.queryByRole("button", { name: "Change stage" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Chase 1" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Actions" }));
    // The stage list sits under a "Change stage" heading inside the one menu.
    expect(screen.getByRole("group", { name: "Change stage" })).toBeVisible();
    expect(screen.getByRole("menuitemradio", { name: "Layout" })).toBeVisible();
    const chaseItem = screen.getByRole("menuitem", { name: "Chase 1" });
    await user.click(chaseItem);
    expect(props.onChaseAll).toHaveBeenCalledExactlyOnceWith([waitingPiece]);
  });

  it("still offers the stage list from Actions once nothing else can act, with Hand off disabled", async () => {
    const user = userEvent.setup();
    const props = renderBar({
      hasAnyIssue: false,
      selectedPieces: [makePiece({ id: "p-1" }), makePiece({ id: "p-2" })],
    });
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.queryByRole("menuitem", { name: /^Chase/ })).toBeNull();
    // Hand off stays in the menu, shown disabled.
    expect(screen.getByRole("menuitem", { name: "Hand off" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.click(screen.getByRole("menuitemradio", { name: "Edit" }));
    expect(props.onChangeStage).toHaveBeenCalledExactlyOnceWith("Edit");
  });

  it('offers "Select all {count}" from Actions once the page wires it', async () => {
    const user = userEvent.setup();
    const onSelectAll = vi.fn();
    renderBar({ selectableCount: 9, onSelectAll });
    await user.click(screen.getByRole("button", { name: "Actions" }));
    const selectAllItem = screen.getByRole("menuitem", {
      name: "Select all 9",
    });
    await user.click(selectAllItem);
    expect(onSelectAll).toHaveBeenCalledOnce();
  });

  it('hides "Select all" until both selectableCount and onSelectAll arrive', async () => {
    const user = userEvent.setup();
    renderBar({ selectableCount: 9 }); // onSelectAll left unwired
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.queryByRole("menuitem", { name: /^Select all/ })).toBeNull();
  });
});

describe("chaseQueueForSelection", () => {
  it("keeps only the pieces waiting on a writer, in the given order", () => {
    const first = makePiece({ id: "p-1", wait: "writer" });
    const notWaiting = makePiece({ id: "p-2", wait: "you" });
    const second = makePiece({ id: "p-3", wait: "writer" });

    expect(chaseQueueForSelection([first, notWaiting, second])).toEqual([
      first,
      second,
    ]);
  });

  it('excludes a Published piece even if it still carries wait: "writer"', () => {
    const stalePublished = makePiece({
      id: "p-1",
      wait: "writer",
      stage: "Published",
    });

    expect(chaseQueueForSelection([stalePublished])).toEqual([]);
  });

  it("is empty when nobody in the selection waits on a writer", () => {
    expect(chaseQueueForSelection([makePiece({ wait: "you" })])).toEqual([]);
  });
});

/**
 * `useDeskBulkActions` on its own: no `<DeskBulkBar>` involved, since these
 * are the helpers the INTEGRATION task calls from `onChangeStage` /
 * `onChaseAll` / `onHandOff`, the callbacks `DeskBulkBar` exposes for its
 * caller to wire up.
 */
function wrapper({ children }: { children: ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

/** A `moveStage` mutation double: only `mutateAsync` is exercised by
 *  `useDeskBulkActions`, so the rest of `usePieceMutations().moveStage`'s
 *  shape is cast away rather than stubbed field by field. */
function makeMoveStage(): UseDeskBulkActionsParams["moveStage"] {
  return {
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  } as unknown as UseDeskBulkActionsParams["moveStage"];
}

function makeParams(
  overrides: Partial<UseDeskBulkActionsParams> = {},
): UseDeskBulkActionsParams {
  return {
    moveStage: makeMoveStage(),
    openHandoff: vi.fn(),
    ...overrides,
  };
}

describe("useDeskBulkActions", () => {
  beforeEach(() => {
    showToast.mockClear();
  });

  it("changeStageForSelection moves everything except Published and pieces already there, one toast", async () => {
    const moveStage = makeMoveStage();
    const pieces = [
      makePiece({ id: "p-1", stage: "Drafting" }),
      makePiece({ id: "p-2", stage: "Edit" }),
      makePiece({ id: "p-3", stage: "Layout" }), // already at target
      makePiece({ id: "p-4", stage: "Published" }), // terminal, left alone
    ];
    const { result } = renderHook(
      () => useDeskBulkActions(makeParams({ moveStage })),
      { wrapper },
    );

    act(() => result.current.changeStageForSelection(pieces, "Layout"));

    // `changeStageForSelection` now waits on a real per-piece PATCH through
    // `mutateAsync`, so the toast only shows up once those settle.
    await waitFor(() => expect(showToast).toHaveBeenCalled());

    expect(moveStage.mutateAsync).toHaveBeenCalledTimes(2);
    expect(moveStage.mutateAsync).toHaveBeenCalledWith({
      id: "p-1",
      stage: "layout",
    });
    expect(moveStage.mutateAsync).toHaveBeenCalledWith({
      id: "p-2",
      stage: "layout",
    });
    expect(showToast).toHaveBeenCalledExactlyOnceWith(
      "2 pieces moved to Layout.",
      "success",
    );
  });

  it("changeStageForSelection is a no-op once nothing needs to move", () => {
    const moveStage = makeMoveStage();
    const pieces = [
      makePiece({ id: "p-1", stage: "Layout" }),
      makePiece({ id: "p-2", stage: "Published" }),
    ];
    const { result } = renderHook(
      () => useDeskBulkActions(makeParams({ moveStage })),
      { wrapper },
    );

    act(() => result.current.changeStageForSelection(pieces, "Layout"));

    expect(moveStage.mutateAsync).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it("handOffSelection opens the single-piece picker only for exactly one piece", () => {
    const openHandoff = vi.fn();
    const { result } = renderHook(
      () => useDeskBulkActions(makeParams({ openHandoff })),
      { wrapper },
    );
    const onlyPiece = makePiece({ id: "p-1" });

    act(() => result.current.handOffSelection([onlyPiece]));
    expect(openHandoff).toHaveBeenCalledExactlyOnceWith(onlyPiece);

    act(() =>
      result.current.handOffSelection([
        makePiece({ id: "p-2" }),
        makePiece({ id: "p-3" }),
      ]),
    );
    expect(openHandoff).toHaveBeenCalledOnce(); // still just the one call above
  });
});
