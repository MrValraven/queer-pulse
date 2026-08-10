import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { MagazineDeskShell, useMagazineShellOverlay } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DEMO_SECTIONS,
  DEMO_STAGES,
  type Issue,
  type Piece,
  type Stage,
} from "./data/desk.data";
import { usePieces } from "./api/usePieces";
import { usePitches } from "./api/usePitches";
import { useDeskSummary } from "./api/useDeskSummary";
import { useMagazineEditors } from "./api/useMagazineEditors";
import { useCurrentIssue } from "./api/useCurrentIssue";
import { usePieceMutations } from "./api/usePieceMutations";
import { usePitchMutations } from "./api/usePitchMutations";
import { STAGE_VIEW_TO_DTO } from "./api/pieces.adapters";
import type { DeskLayout } from "./desk/DeskHeader";
import { useDeskState } from "./desk/useDeskState";
import { useDeskKeyboard } from "./desk/useDeskKeyboard";
import { useDeskModals } from "./desk/useDeskModals";
import { usePitchTriageActions } from "./desk/usePitchTriageActions";
import { DeskView } from "./desk/DeskView";
import { DeskModals } from "./desk/DeskModals";

/**
 * The magazine editor desk. Thin by design: owns the page shell, dual-mode
 * data hooks, local filter/sort/selection state, and overlay state (the
 * commission/pass/chase/handoff modal) — the visible layout lives in
 * `DeskView`. The ⌘K command palette and the "Since Friday" notifications
 * panel are now hoisted into `MagazineDeskShell` (they run on every editor
 * surface, not just this one) — `useMagazineShellOverlay` reads their open
 * state so this page's own j/k/o/c/y/n shortcuts stay disabled while either
 * is open.
 */
export function EditorDashboardPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isPaletteOpen, isNotificationsOpen } = useMagazineShellOverlay();

  const { pieces, isLoading: piecesLoading, isError: piecesError } = usePieces({});
  const { pitches, isLoading: pitchesLoading } = usePitches();
  const { summary } = useDeskSummary();
  const pieceMutations = usePieceMutations();
  const pitchMutations = usePitchMutations();

  // The editor directory backs both the "Viewing as" picker and the
  // sidebar's editor-load names — real names in live mode, not editorIds.
  const { editors } = useMagazineEditors();

  // Live mode's current-issue lookup is `null` until an issue exists — keep
  // the honest-blank header (no fabricated theme/dates, no Produce button)
  // in that case rather than deriving a fake issue from the piece count.
  const { issue: currentIssue } = useCurrentIssue();
  const issue: Issue = useMemo(
    () =>
      currentIssue ?? {
        number: "",
        theme: "",
        closes: "",
        publishes: "",
        daysLeft: 0,
        filled: 0,
        slots: 0,
      },
    [currentIssue],
  );

  // The `editorId` stamped on new commissions must be a real user UUID. In live
  // mode that's the signed-in editor (this desk is `magazine_editor`-guarded);
  // the "Viewing as" picker (`meState`) can override it. It must NOT fall back to
  // `editors[0]?.id` in live mode — the directory can be empty (or ordered
  // differently than "me") and stamping the wrong editor would misattribute
  // the commission. Demo mode keeps its slug identity (it never hits the API).
  const [meState, setMeState] = useState("");
  const activeMe = meState || (demoMode ? editors[0]?.id : user?.id) || "";
  const deskState = useDeskState(pieces, activeMe);

  const [layout, setLayout] = useState<DeskLayout>("list");

  const modals = useDeskModals({ activeMe, pieceMutations, pitchMutations });
  const triage = usePitchTriageActions({
    pitchMutations,
    selectedPitchIds: deskState.selected,
    clearSelectedPitchIds: deskState.clearSelected,
  });

  // The shell's global "New piece" (rail button + ⌘K palette row) reaches
  // this page's own commission modal via a `?commission=new` flag rather
  // than a shared modal instance — the modal needs this page's `editors`/
  // `sections` data, which only exists here. Consumed once, then stripped so
  // navigating back doesn't reopen it.
  useEffect(() => {
    if (searchParams.get("commission") !== "new") return;
    modals.openCommission();
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("commission");
    setSearchParams(nextParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // The piece record now exists (Phase 2). Live mode routes by the real
  // piece id; demo mode's record page ignores the id and always shows
  // DEMO_RECORD. "Open" always lands on the record. "Edit" is
  // format-aware: article-format pieces jump straight to the block-based
  // article editor (Phase 3, `routes.magazineWrite`); deck-format pieces
  // jump to the deck editor (Phase 4, `routes.deckEditor`) — the linked
  // deck when `piece.deckId` is set (live mode; `pieceDtoToView` now
  // projects `PieceListItemDto.deckId`), otherwise a fresh deck, same as
  // the "New deck" entry point in `EditorDecksSection`. Mirrors
  // `PieceRecordPage.handleOpenDraft`.
  const goToPieceRecord = (piece: Piece) =>
    void navigate(routes.magazinePiece.replace(":id", piece.id));
  const handleOpenPiece = (piece: Piece) => goToPieceRecord(piece);
  const handleEditPiece = (piece: Piece) => {
    if (piece.format === "article") {
      void navigate(routes.magazineWrite.replace(":id", piece.id));
      return;
    }
    void navigate(piece.deckId ? `${routes.deckEditor}?id=${piece.deckId}` : routes.deckEditor);
  };
  const handleMovePiece = (piece: Piece, stage: Stage) =>
    pieceMutations.moveStage.mutate({ id: piece.id, stage: STAGE_VIEW_TO_DTO[stage] });
  const handleProduceIssue = () =>
    void navigate(routes.magazineIssueProd.replace(":number", issue.number));

  useDeskKeyboard({
    visiblePieces: deskState.visiblePieces,
    focusId: deskState.focusId,
    setFocusId: deskState.setFocusId,
    onOpen: handleOpenPiece,
    onChase: modals.openChase,
    onShortcuts: modals.openShortcuts,
    topPitchId: pitches[0]?.id ?? null,
    onTriageTop: (verdict) => {
      const topPitch = pitches[0];
      if (!topPitch) return;
      if (verdict === "maybe") triage.maybe(topPitch.id);
      else triage.pass(topPitch.id);
    },
    enabled: modals.modal === null && !isPaletteOpen && !isNotificationsOpen,
  });

  const isLoading = piecesLoading || pitchesLoading;
  const isEmpty = !demoMode && !isLoading && !piecesError && pieces.length === 0 && pitches.length === 0;

  return (
    <MagazineDeskShell>
      <DeskView
        loading={isLoading}
        showError={piecesError}
        onRetry={() => void queryClient.invalidateQueries({ queryKey: ["magazine-pieces"] })}
        isEmpty={isEmpty}
        issue={issue}
        editors={editors}
        me={activeMe}
        onMe={setMeState}
        layout={layout}
        onLayout={setLayout}
        onCommission={modals.openCommission}
        onProduce={handleProduceIssue}
        pieces={pieces}
        visiblePieces={deskState.visiblePieces}
        focusId={deskState.focusId}
        pitches={pitches}
        pitchCount={pitches.length}
        stages={DEMO_STAGES}
        sections={DEMO_SECTIONS}
        q={deskState.q}
        onQ={deskState.setQ}
        fmt={deskState.fmt}
        onFmt={deskState.setFmt}
        mine={deskState.mine}
        onMine={deskState.setMine}
        sort={deskState.sort}
        onSort={deskState.setSort}
        onShortcuts={modals.openShortcuts}
        activeView={deskState.view}
        onToggleView={(id) => deskState.setView(deskState.view === id ? null : id)}
        onSaveView={() =>
          showToast(t("magazine:desk.page.savingViewsUnavailable"), "info")
        }
        onOpenPiece={handleOpenPiece}
        onEditPiece={handleEditPiece}
        onChasePiece={modals.openChase}
        onHandoffPiece={modals.openHandoff}
        onMovePiece={handleMovePiece}
        onCommissionSection={modals.openCommissionForSection}
        selectedPitchIds={deskState.selected}
        onTogglePitchSelect={deskState.toggleSelect}
        onCommissionPitch={modals.openCommissionFromPitch}
        onMaybePitch={triage.maybe}
        onPassPitch={modals.openPassFromPitch}
        leavingPitchIds={[...triage.leavingIds]}
        onBulkMaybe={triage.bulkMaybe}
        onBulkPass={triage.bulkPass}
        onClearBulkSelection={deskState.clearSelected}
        summary={summary}
      />

      <DeskModals
        modal={modals.modal}
        editors={editors}
        sections={DEMO_SECTIONS}
        onClose={modals.close}
        onCommission={modals.submitCommission}
        onPass={modals.submitPass}
        onHandoff={modals.confirmHandoff}
      />
    </MagazineDeskShell>
  );
}
