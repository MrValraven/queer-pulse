/**
 * Owns the desk's single overlay slot (`DeskModal`) plus the id of whichever
 * piece/pitch it was opened from (most `DeskModal` variants carry only
 * display copy, so the id travels alongside them),
 * and the mutation calls each overlay's submit resolves to. The bulk bar's
 * chase queue runs through the same slot, one `ChaseModal` per piece.
 */

import { useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Piece, Pitch } from "../data/desk.data";
import type { usePieceMutations } from "../api/usePieceMutations";
import type { usePitchMutations } from "../api/usePitchMutations";
import type { DeskModal } from "./DeskModals";
import type { CommissionPayload } from "./CommissionModal";
import type { PassPayload } from "./PassModal";
import { chaseModalFor, useChaseQueue } from "./useChaseQueue";
import { deletePieceWithOutcome } from "./deskPieceDelete";

type TriageBody = Parameters<
  ReturnType<typeof usePitchMutations>["triage"]["mutateAsync"]
>[0]["body"];

export interface UseDeskModalsParams {
  /** Currently-viewing editor id, stamped as `editorId` on new commissions. */
  activeMe: string;
  /** The current issue's id (or `""` when none), stamped on issue-track
   *  commissions. */
  currentIssueId: string;
  pieceMutations: ReturnType<typeof usePieceMutations>;
  pitchMutations: ReturnType<typeof usePitchMutations>;
  /** Called once a pass note or a commission from a pitch has SUCCEEDED, so
   *  the triage overlay can move on from that pitch (demo mode keeps serving
   *  it). A failed request never calls it. Each answer waits on its own
   *  request, so two answers in quick succession both report. */
  onPitchAnswered?: (pitchId: string) => void;
}

export function useDeskModals({
  activeMe,
  currentIssueId,
  pieceMutations,
  pitchMutations,
  onPitchAnswered,
}: UseDeskModalsParams) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [modal, setModal] = useState<DeskModal>(null);
  const [contextId, setContextId] = useState<string | null>(null);
  // A pitch suggested as a deck is commissioned as a deck (else an article).
  const [sourcePitchFormat, setSourcePitchFormat] = useState<
    "deck" | undefined
  >(undefined);
  const chase = useChaseQueue((step) => {
    setModal(chaseModalFor(step));
    setContextId(step.piece.id);
  });

  // Every non-chase overlay drops a chase queue, so a stale queue can never
  // take over a later close.
  function openFor(nextModal: DeskModal, id: string): void {
    chase.stop();
    setModal(nextModal);
    setContextId(id);
  }
  function clearSlot(nextModal: DeskModal): void {
    chase.stop();
    setModal(nextModal);
    setContextId(null);
    setSourcePitchFormat(undefined);
  }

  /** X and Escape end the whole chase queue; Skip moves on (`skipChase`). */
  function close(): void {
    clearSlot(null);
  }
  function skipChase(): void {
    if (!chase.advance()) clearSlot(null);
  }
  function openCommission(): void {
    clearSlot({ kind: "commission" });
  }
  function openCommissionForSection(sectionName: string): void {
    clearSlot({ kind: "commission", sectionName });
  }
  function openCommissionFromPitch(pitch: Pitch): void {
    const { title, byline, note } = pitch;
    openFor({ kind: "commission", pitch: { title, byline, note } }, pitch.id);
    setSourcePitchFormat(pitch.suggest === "deck" ? "deck" : undefined);
  }
  function openPassFromPitch(pitch: Pitch): void {
    openFor({ kind: "pass", pitch: { title: pitch.title } }, pitch.id);
  }
  function openHandoff(piece: Piece): void {
    openFor({ kind: "handoff", piece: { title: piece.title } }, piece.id);
  }
  function openDeletePiece(piece: Piece): void {
    openFor({ kind: "deletePiece", piece: { title: piece.title } }, piece.id);
  }
  function openShortcuts(): void {
    clearSlot({ kind: "shortcuts" });
  }
  /** Answers a pitch through its OWN request (`mutateAsync`): a per-call
   *  `onSuccess` fires only for the latest call on the mutation. A failure
   *  is already toasted app-wide. */
  function answerPitch(pitchId: string, body: TriageBody): void {
    void pitchMutations.triage.mutateAsync({ id: pitchId, body }).then(
      () => onPitchAnswered?.(pitchId),
      () => undefined,
    );
  }

  /** Commissioning from a pitch triages it; from scratch, creates a piece directly. */
  function submitCommission(payload: CommissionPayload): void {
    // `editorId` must be a real user UUID, so wait out the window before the
    // session (and `activeMe`) resolves. Same wording as Write's guard.
    if (!activeMe) {
      showToast(t("magazine:desk.write.editorNotReady"), "error");
      return;
    }
    if (modal?.kind === "commission" && modal.pitch && contextId) {
      answerPitch(contextId, {
        verdict: "commission",
        editorId: activeMe,
        section: payload.section,
        dueOn: payload.dueDate || undefined,
        wordTarget: payload.words ?? undefined,
      });
      return;
    }
    const pitchTitle =
      modal?.kind === "commission" ? modal.pitch?.title : undefined;
    // The commission form has no title field (Task 22): fall back to the
    // sourcing pitch's title, then the angle text, then a generic label.
    pieceMutations.commission.mutate({
      format: sourcePitchFormat ?? "article",
      title:
        pitchTitle ??
        (payload.angle.trim().slice(0, 120) ||
          t("magazine:desk.write.untitledTitle")),
      section: payload.section,
      editorId: activeMe,
      dueOn: payload.dueDate || undefined,
      wordTarget: payload.words ?? undefined,
      // Issue-track commissions bind to the current issue; highlights stay
      // standalone (`issueId` omitted → null). Guard the id so an "issue"
      // choice can never send an empty string the backend would reject.
      issueId:
        payload.track === "issue" && currentIssueId
          ? currentIssueId
          : undefined,
    });
  }

  function submitPass(payload: PassPayload): void {
    if (contextId) {
      answerPitch(contextId, { verdict: "pass", passNote: payload.body });
    }
  }

  function confirmHandoff(editorId: string): void {
    if (contextId) pieceMutations.assign.mutate({ id: contextId, editorId });
  }

  /** See `deletePieceWithOutcome` for why delete reports its own result. */
  async function confirmDeletePiece(): Promise<void> {
    if (!contextId) return;
    await deletePieceWithOutcome({
      pieceId: contextId,
      remove: pieceMutations.remove.mutateAsync,
      closeDialog: close,
      showToast,
      translate: t,
    });
  }

  return {
    modal,
    close,
    openCommission,
    openCommissionForSection,
    openCommissionFromPitch,
    openPassFromPitch,
    openChase: chase.openChase,
    /** The bulk bar's "Chase {count}": one `ChaseModal` per queued piece. */
    openChaseQueue: chase.openChaseQueue,
    /** Skip in a queued chase: moves on to the next writer. */
    skipChase,
    openHandoff,
    openDeletePiece,
    openShortcuts,
    submitCommission,
    submitPass,
    confirmHandoff,
    confirmDeletePiece,
    isDeletingPiece: pieceMutations.remove.isPending,
  };
}
