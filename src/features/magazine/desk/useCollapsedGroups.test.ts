import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Piece } from "../data/desk.data";
import type { DeskPieceGroup } from "./pipelineGroups";
import {
  COLLAPSED_GROUPS_STORAGE_KEY,
  useCollapsedGroups,
} from "./useCollapsedGroups";

function makePiece(id: string): Piece {
  return {
    id,
    title: `Piece ${id}`,
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
  };
}

function makeGroup(overrides: Partial<DeskPieceGroup> = {}): DeskPieceGroup {
  return {
    id: "published",
    labelKey: "magazine:desk.groups.published",
    pieces: [],
    isCollapsedByDefault: true,
    ...overrides,
  };
}

describe("useCollapsedGroups focus mode", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("folds Published by its stored default without focus", () => {
    const group = makeGroup();
    const { result } = renderHook(() => useCollapsedGroups([group], null));

    expect(result.current.isCollapsed(group)).toBe(true);
  });

  it("unfolds every group while focus is active, ignoring the stored default", () => {
    const group = makeGroup();
    const { result } = renderHook(() =>
      useCollapsedGroups([group], null, true),
    );

    expect(result.current.isCollapsed(group)).toBe(false);
  });

  it("leaves localStorage untouched when a fold is toggled during focus", () => {
    const group = makeGroup();
    const { result } = renderHook(() =>
      useCollapsedGroups([group], null, true),
    );
    const storedBefore = window.localStorage.getItem(
      COLLAPSED_GROUPS_STORAGE_KEY,
    );

    act(() => {
      result.current.toggleCollapsed(group);
    });

    expect(result.current.isCollapsed(group)).toBe(true);
    expect(window.localStorage.getItem(COLLAPSED_GROUPS_STORAGE_KEY)).toBe(
      storedBefore,
    );
  });

  it("restores the stored fold once focus clears", () => {
    const group = makeGroup();
    const { result, rerender } = renderHook(
      ({ isFocusActive }: { isFocusActive: boolean }) =>
        useCollapsedGroups([group], null, isFocusActive),
      { initialProps: { isFocusActive: true } },
    );

    act(() => {
      result.current.toggleCollapsed(group);
    });
    expect(result.current.isCollapsed(group)).toBe(true);

    rerender({ isFocusActive: false });

    expect(result.current.isCollapsed(group)).toBe(group.isCollapsedByDefault);
  });

  it("opens a hand-folded group during focus once the current row moves into it", () => {
    const piece = makePiece("p1");
    const group = makeGroup({ pieces: [piece] });
    const initialProps: { revealPieceId: string | null } = {
      revealPieceId: null,
    };
    const { result, rerender } = renderHook(
      ({ revealPieceId }: { revealPieceId: string | null }) =>
        useCollapsedGroups([group], revealPieceId, true),
      { initialProps },
    );

    act(() => {
      result.current.toggleCollapsed(group);
    });
    expect(result.current.isCollapsed(group)).toBe(true);

    rerender({ revealPieceId: piece.id });

    expect(result.current.isCollapsed(group)).toBe(false);
  });
});
