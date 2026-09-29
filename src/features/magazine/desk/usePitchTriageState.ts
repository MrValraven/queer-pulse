/**
 * Page-level state for the pitch triage overlay: whether it is open, which
 * pitch it opened on, and which pitches were answered in a dialog stacked on
 * top of it. The overlay opens from three places (the focus bar's Pitches
 * chip, the rail's Pitches card, the "p" shortcut), so its state lives on the
 * page and every opener shares it.
 */

import { useCallback, useState } from "react";

export interface PitchTriageState {
  isOpen: boolean;
  /** The pitch the overlay opened on, or null for the newest. */
  initialPitchId: string | null;
  /**
   * Demo-mode stop-gap (see `PitchTriageProps.answeredPitchIds`): ids whose
   * pass note or commission was sent SUCCESSFULLY from a stacked dialog. A
   * failed request never lands here, so the pitch stays in view.
   */
  answeredPitchIds: string[];
  /** Opens the overlay, on one pitch when given. */
  open: (pitchId?: string | null) => void;
  close: () => void;
  /** Called once a pass or commission for this pitch has succeeded. */
  recordAnswered: (pitchId: string) => void;
}

export function usePitchTriageState(onClose?: () => void): PitchTriageState {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPitchId, setInitialPitchId] = useState<string | null>(null);
  const [answeredPitchIds, setAnsweredPitchIds] = useState<string[]>([]);

  const open = useCallback((pitchId?: string | null) => {
    setInitialPitchId(pitchId ?? null);
    setAnsweredPitchIds([]);
    setIsOpen(true);
  }, []);

  // The answered list only means something for one opening: the next opening
  // starts from whatever the pitch list holds by then. `onClose` clears any
  // pitch bulk selection left over from this opening, so it cannot ride along
  // into a later triage pass.
  const close = useCallback(() => {
    setIsOpen(false);
    setInitialPitchId(null);
    setAnsweredPitchIds([]);
    onClose?.();
  }, [onClose]);

  const recordAnswered = useCallback((pitchId: string) => {
    setAnsweredPitchIds((currentIds) =>
      currentIds.includes(pitchId) ? currentIds : [...currentIds, pitchId],
    );
  }, []);

  return {
    isOpen,
    initialPitchId,
    answeredPitchIds,
    open,
    close,
    recordAnswered,
  };
}
