import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiInbox } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad, usePrefersReducedMotion } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import {
  visiblePieces,
  filterPitches,
  PITCHES,
  PITCH_TOTAL,
  type Piece,
  type Editor,
} from "./editorDashboard.data";
import { useEditorDashboard, type TriageVerdict } from "./useEditorDashboard";
import { useEditorKeyboard } from "./useEditorKeyboard";
import { EditorDashboardHeader } from "./EditorDashboardHeader";
import { EditorNeedsStrip } from "./EditorNeedsStrip";
import { EditorStats } from "./EditorStats";
import { EditorToolbar } from "./EditorToolbar";
import { EditorPiecesTable } from "./EditorPiecesTable";
import { EditorPitchInbox } from "./EditorPitchInbox";
import { EditorBulkBar } from "./EditorBulkBar";
import { EditorSidebar } from "./EditorSidebar";
import type { PieceRowHandlers } from "./EditorPieceRow";
import { ChaseModal, HandoffModal, ShortcutsModal } from "./EditorModals";
import styles from "./EditorDashboardPage.module.css";

type ModalState =
  | { kind: "chase"; piece: Piece }
  | { kind: "handoff"; piece: Piece }
  | { kind: "shortcuts" }
  | null;

const HIDDEN_PITCHES = PITCH_TOTAL - PITCHES.length;

export function EditorDashboardPage() {
  const loading = useSimulatedLoad();
  const reduced = usePrefersReducedMotion();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dash = useEditorDashboard();
  const { state } = dash;

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>(null);

  const visible = useMemo(
    () =>
      visiblePieces(state.pieces, {
        q: state.q,
        fEditor: state.fEditor,
        fStatus: state.fStatus,
        fSection: state.fSection,
        sort: state.sort,
        myQueue: state.myQueue,
        me: state.me,
      }),
    [state],
  );
  const pieceIds = useMemo(() => visible.map((p) => p.id), [visible]);
  const visiblePitches = useMemo(
    () => filterPitches(state.pitches, state.q),
    [state.pitches, state.q],
  );
  const loads = useMemo<Record<Editor, number>>(
    () => ({
      Marta: state.pieces.filter((p) => p.editor === "Marta").length,
      Sara: state.pieces.filter((p) => p.editor === "Sara").length,
    }),
    [state.pieces],
  );
  // `HIDDEN_PITCHES` is mock-only backlog — only real in demo mode.
  const pitchesInInbox = demoMode
    ? HIDDEN_PITCHES + state.pitches.length
    : state.pitches.length;
  const isEmpty = state.pieces.length === 0 && state.pitches.length === 0;

  function runTriage(ids: string[], commit: () => void) {
    if (reduced || !ids.length) {
      commit();
      return;
    }
    setLeaving((prev) => new Set([...prev, ...ids]));
    window.setTimeout(() => {
      commit();
      setLeaving((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, 220);
  }
  const handleTriage = (id: string, verdict: TriageVerdict) =>
    runTriage([id], () => dash.triage(id, verdict));
  const handleBulk = (verdict: TriageVerdict) =>
    runTriage([...state.selPitches], () => dash.bulkTriage(verdict));

  const stub = (msg: string) => showToast(msg, "info");
  const openChase = (piece: Piece) => setModal({ kind: "chase", piece });

  const handlers: PieceRowHandlers = {
    loads,
    onSetStage: dash.setStage,
    onAssign: dash.assign,
    onHandoff: (piece) => setModal({ kind: "handoff", piece }),
    onChase: openChase,
    onDuplicate: () => showToast("Brief duplicated to drafts", "info"),
  };

  useEditorKeyboard({
    enabled: modal === null,
    pieceIds,
    focusedId,
    setFocusedId,
    onOpen: () => navigate(routes.issue),
    onChase: (id) => {
      const piece = state.pieces.find((p) => p.id === id);
      if (piece) openChase(piece);
    },
    topPitchId: visiblePitches[0]?.id ?? null,
    onTriage: handleTriage,
    onShortcuts: () => setModal({ kind: "shortcuts" }),
  });

  return (
    <AppShell>
      <div className={styles.page}>
        {loading ? (
          <EditorDashboardSkeleton />
        ) : isEmpty ? (
          <EmptyState
            icon={<FiInbox />}
            title="The desk is clear"
            description="No pieces in flight and no pitches waiting. When writers pitch or you commission a piece, it'll show up here to triage and edit."
          />
        ) : (
          <>
            <FadeIn>
              <EditorDashboardHeader me={state.me} onMeChange={dash.setMe} />
            </FadeIn>
            <FadeIn delay={60}>
              <EditorNeedsStrip
                pieces={state.pieces}
                me={state.me}
                onOpen={() => navigate(routes.issue)}
                onChase={openChase}
              />
            </FadeIn>
            <FadeIn delay={120}>
              <EditorStats
                pieces={state.pieces}
                pitchesInInbox={pitchesInInbox}
              />
            </FadeIn>
            <FadeIn delay={180}>
              <EditorToolbar
                q={state.q}
                fEditor={state.fEditor}
                fStatus={state.fStatus}
                fSection={state.fSection}
                sort={state.sort}
                myQueue={state.myQueue}
                onQuery={dash.setQuery}
                onFilter={dash.setFilter}
                onToggleMyQueue={dash.toggleMyQueue}
                onShortcuts={() => setModal({ kind: "shortcuts" })}
              />
            </FadeIn>
            <div className={styles.edGrid}>
              <main>
                <EditorPiecesTable
                  pieces={visible}
                  totalPieces={state.pieces.length}
                  me={state.me}
                  sort={state.sort}
                  focusedId={focusedId}
                  handlers={handlers}
                  onReset={dash.reset}
                />
                <EditorPitchInbox
                  pitches={visiblePitches}
                  query={state.q}
                  selected={new Set(state.selPitches)}
                  leaving={leaving}
                  onToggleSelect={dash.toggleSelect}
                  onTriage={handleTriage}
                  onShowMore={() =>
                    stub("That’s every pitch loaded in this prototype")
                  }
                />
              </main>
              <EditorSidebar
                pieces={state.pieces}
                me={state.me}
                query={state.q}
                onStub={stub}
              />
            </div>
          </>
        )}
      </div>

      <EditorBulkBar
        count={state.selPitches.length}
        onBulk={handleBulk}
        onClear={dash.clearSelect}
      />

      {modal?.kind === "chase" && (
        <ChaseModal
          piece={modal.piece}
          onClose={() => setModal(null)}
          onSend={dash.chaseSent}
        />
      )}
      {modal?.kind === "handoff" && (
        <HandoffModal
          piece={modal.piece}
          onClose={() => setModal(null)}
          onHandoff={(editor) => dash.handoff(modal.piece, editor)}
        />
      )}
      {modal?.kind === "shortcuts" && (
        <ShortcutsModal onClose={() => setModal(null)} />
      )}
    </AppShell>
  );
}

function EditorDashboardSkeleton() {
  return (
    <div aria-hidden>
      <SkeletonLine width="42%" height={44} />
      <SkeletonLine width="60%" height={16} style={{ marginTop: 14 }} />
      <div className={styles.edStats} style={{ marginTop: 28 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skelCard}>
            <SkeletonLine width="40%" height={30} />
            <SkeletonLine width="70%" height={12} style={{ marginTop: 10 }} />
          </div>
        ))}
      </div>
      <div className={styles.skelGrid} style={{ marginTop: 22 }}>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skelCard}>
              <SkeletonLine width="55%" height={18} />
              <SkeletonLine width="35%" height={12} style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skelCard}>
              <SkeletonLine width="50%" height={14} />
              <SkeletonLine
                width="100%"
                height={8}
                style={{ marginTop: 12, borderRadius: 4 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
