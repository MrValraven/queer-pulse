import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { PostKind } from "./composeThread.types";

// ── Where each kind chip sits inside its row ────────────────────────────────
// The sliding pill in ComposeKindChips is drawn by clipping a plum layer to
// one chip's box, so it needs every chip's box in the row's own coordinates.
// Measured before paint and again whenever the row or a chip changes size (a
// wrap, a font arriving, a language switch).

export interface KindChipBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface KindChipLayout {
  rowWidth: number;
  rowHeight: number;
  chips: Partial<Record<PostKind, KindChipBox>>;
}

function measureRow(
  row: HTMLElement,
  chips: ReadonlyMap<PostKind, HTMLElement>,
): KindChipLayout {
  const rowRect = row.getBoundingClientRect();
  // Divides out any scale an ancestor is animating through, so the boxes are
  // in the row's untransformed pixels, the same ones the clip path uses.
  const scale = row.offsetWidth > 0 ? rowRect.width / row.offsetWidth : 1;
  const boxes: Partial<Record<PostKind, KindChipBox>> = {};
  chips.forEach((chip, kind) => {
    const chipRect = chip.getBoundingClientRect();
    boxes[kind] = {
      left: (chipRect.left - rowRect.left) / scale,
      top: (chipRect.top - rowRect.top) / scale,
      width: chipRect.width / scale,
      height: chipRect.height / scale,
    };
  });
  return {
    rowWidth: rowRect.width / scale,
    rowHeight: rowRect.height / scale,
    chips: boxes,
  };
}

function isSameLayout(previous: KindChipLayout | null, next: KindChipLayout) {
  if (!previous) return false;
  return JSON.stringify(previous) === JSON.stringify(next);
}

export function useKindChipLayout() {
  const rowRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef(new Map<PostKind, HTMLElement>());
  const [layout, setLayout] = useState<KindChipLayout | null>(null);

  const registerChip = useCallback(
    (kind: PostKind) => (chip: HTMLElement | null) => {
      if (chip) chipsRef.current.set(kind, chip);
      else chipsRef.current.delete(kind);
    },
    [],
  );

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const chips = chipsRef.current;
    const remeasure = () => {
      const next = measureRow(row, chips);
      setLayout((previous) => (isSameLayout(previous, next) ? previous : next));
    };
    remeasure();
    const observer = new ResizeObserver(remeasure);
    observer.observe(row);
    chips.forEach((chip) => observer.observe(chip));
    return () => observer.disconnect();
  }, []);

  return { rowRef, registerChip, layout };
}
