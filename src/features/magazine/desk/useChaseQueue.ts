/**
 * The bulk bar's "Chase {count}" works through its queue one writer at a
 * time: a chase is a message the editor writes in that piece's own thread,
 * so there is no single send for the whole selection. This hook remembers
 * the queue and where the editor is in it, and hands each step to
 * `useDeskModals`, which opens `ChaseModal` for it with
 * "Chase {current} of {total}". Skip moves on; closing ends the queue.
 */

import { useState } from "react";
import type { Piece } from "../data/desk.data";

/** 1-based position in the queue, for "Chase {current} of {total}". */
export interface ChaseProgress {
  current: number;
  total: number;
}

export interface ChaseStep {
  piece: Piece;
  progress: ChaseProgress;
}

interface QueueState {
  pieces: Piece[];
  index: number;
}

/** The step at `index`, or null past the end of the queue. */
export function chaseStepAt(pieces: Piece[], index: number): ChaseStep | null {
  const piece = pieces[index];
  if (!piece) return null;
  return { piece, progress: { current: index + 1, total: pieces.length } };
}

/**
 * The desk overlay for one step. The whole `piece` rides along (see
 * `DeskModal`'s doc comment) so `ChaseModal` can open the real `PieceThread`
 * and seed its chase draft from the piece's own due fields. A single chase
 * carries no progress, so it reads exactly as it did before the queue.
 */
export function chaseModalFor({ piece, progress }: ChaseStep) {
  return {
    kind: "chase" as const,
    piece,
    progress: progress.total > 1 ? progress : undefined,
  };
}

export interface ChaseQueue {
  /** One chase from a row, the keyboard or the peek; drops any queue. */
  openChase: (piece: Piece) => void;
  /** Starts the bulk queue on its first piece. An empty queue does nothing. */
  openChaseQueue: (pieces: Piece[]) => void;
  /** Skip: shows the next queued piece and returns true, or forgets the
   *  queue and returns false once it has run out (or when none is running). */
  advance: () => boolean;
  /** Ends the queue where it stands: closing a queued chase (X, Escape) and
   *  opening any other desk overlay both call it. */
  stop: () => void;
}

export function useChaseQueue(show: (step: ChaseStep) => void): ChaseQueue {
  const [queue, setQueue] = useState<QueueState | null>(null);

  function openChase(piece: Piece): void {
    setQueue(null);
    show({ piece, progress: { current: 1, total: 1 } });
  }

  function openChaseQueue(pieces: Piece[]): void {
    const firstStep = chaseStepAt(pieces, 0);
    if (!firstStep) return;
    setQueue({ pieces, index: 0 });
    show(firstStep);
  }

  function advance(): boolean {
    if (!queue) return false;
    const nextIndex = queue.index + 1;
    const nextStep = chaseStepAt(queue.pieces, nextIndex);
    if (!nextStep) {
      setQueue(null);
      return false;
    }
    setQueue({ pieces: queue.pieces, index: nextIndex });
    show(nextStep);
    return true;
  }

  function stop(): void {
    setQueue(null);
  }

  return { openChase, openChaseQueue, advance, stop };
}
