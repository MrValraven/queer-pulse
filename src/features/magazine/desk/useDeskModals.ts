/**
 * Owns the desk's single overlay slot (`DeskModal`) plus the id of whichever
 * piece/pitch it was opened from (the `DeskModal` variants only carry
 * display copy, not an id, so the id has to travel alongside separately),
 * and the mutation calls each overlay's submit resolves to.
 */

import { useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import type { Piece, Pitch } from "../data/desk.data";
import type { usePieceMutations } from "../api/usePieceMutations";
import type { usePitchMutations } from "../api/usePitchMutations";
import type { DeskModal } from "./DeskModals";
import type { CommissionPayload } from "./CommissionModal";
import type { PassPayload } from "./PassModal";

export interface UseDeskModalsParams {
  /** Currently-viewing editor id, stamped as `editorId` on new commissions. */
  activeMe: string;
  pieceMutations: ReturnType<typeof usePieceMutations>;
  pitchMutations: ReturnType<typeof usePitchMutations>;
}

export function useDeskModals({ activeMe, pieceMutations, pitchMutations }: UseDeskModalsParams) {
  const { showToast } = useToast();
  const [modal, setModal] = useState<DeskModal>(null);
  const [contextId, setContextId] = useState<string | null>(null);
  // The commissioning pitch's `suggest` hint (e.g. "deck"), so submitCommission
  // can default the new piece's format to match instead of always "article".
  const [sourcePitchFormat, setSourcePitchFormat] = useState<"deck" | undefined>(undefined);

  function close(): void {
    setModal(null);
    setContextId(null);
    setSourcePitchFormat(undefined);
  }
  function openCommission(): void {
    setModal({ kind: "commission" });
    setContextId(null);
    setSourcePitchFormat(undefined);
  }
  function openCommissionForSection(sectionName: string): void {
    setModal({ kind: "commission", sectionName });
    setContextId(null);
    setSourcePitchFormat(undefined);
  }
  function openCommissionFromPitch(pitch: Pitch): void {
    setModal({ kind: "commission", pitch: { title: pitch.title, byline: pitch.byline, note: pitch.note } });
    setContextId(pitch.id);
    setSourcePitchFormat(pitch.suggest === "deck" ? "deck" : undefined);
  }
  function openPassFromPitch(pitch: Pitch): void {
    setModal({ kind: "pass", pitch: { title: pitch.title } });
    setContextId(pitch.id);
  }
  function openChase(piece: Piece): void {
    // `id` rides on `modal.piece` itself here (see `DeskModal`'s doc comment)
    // so `ChaseModal` can open the real `PieceThread` for it directly.
    setModal({ kind: "chase", piece: { id: piece.id, title: piece.title, byline: piece.byline } });
    setContextId(piece.id);
  }
  function openHandoff(piece: Piece): void {
    setModal({ kind: "handoff", piece: { title: piece.title } });
    setContextId(piece.id);
  }
  function openShortcuts(): void {
    setModal({ kind: "shortcuts" });
  }

  /** Commissioning from a pitch triages it; from scratch, creates a piece directly. */
  function submitCommission(payload: CommissionPayload): void {
    // `editorId` must be a real user UUID; guard the window where the session
    // (and thus `activeMe`) hasn't resolved yet rather than firing a request the
    // backend rejects with "editorId must be a UUID".
    if (!activeMe) {
      showToast("Still loading your editor profile — try again in a moment.", "error");
      return;
    }
    if (modal?.kind === "commission" && modal.pitch && contextId) {
      pitchMutations.triage.mutate({
        id: contextId,
        body: {
          verdict: "commission",
          editorId: activeMe,
          section: payload.section,
          dueOn: payload.dueDate || undefined,
          wordTarget: payload.words ?? undefined,
        },
      });
      return;
    }
    const pitchTitle = modal?.kind === "commission" ? modal.pitch?.title : undefined;
    // The commission form has no title field (Task 22) — fall back to the
    // sourcing pitch's title, then the angle text, then a generic label.
    pieceMutations.commission.mutate({
      format: sourcePitchFormat ?? "article",
      title: pitchTitle ?? (payload.angle.trim().slice(0, 120) || "Untitled piece"),
      section: payload.section,
      editorId: activeMe,
      dueOn: payload.dueDate || undefined,
      wordTarget: payload.words ?? undefined,
    });
  }

  function submitPass(payload: PassPayload): void {
    if (contextId) {
      pitchMutations.triage.mutate({ id: contextId, body: { verdict: "pass", passNote: payload.body } });
    }
  }

  function confirmHandoff(editorId: string): void {
    if (contextId) pieceMutations.assign.mutate({ id: contextId, editorId });
  }

  return {
    modal,
    close,
    openCommission,
    openCommissionForSection,
    openCommissionFromPitch,
    openPassFromPitch,
    openChase,
    openHandoff,
    openShortcuts,
    submitCommission,
    submitPass,
    confirmHandoff,
  };
}
