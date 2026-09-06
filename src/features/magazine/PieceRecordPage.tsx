import { useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";
import { MagazineDeskShell } from "../../shared/components/layout/MagazineDeskShell";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { usePieceRecord } from "./api/usePieceRecord";
import { useRecordMutations } from "./api/useRecordMutations";
import { STAGE_DTO_TO_VIEW } from "./api/pieces.adapters";
import { StagePill } from "./desk/StagePill";
import { StageStepper } from "./desk/StageStepper";
import { PublishGateCard } from "./desk/PublishGateCard";
import { PiecePublishModal } from "./desk/PiecePublishModal";
import {
  usePiecePublishAction,
  type PiecePublishAction,
} from "./desk/usePiecePublishAction";
import { PieceTabsNav, type PieceRecordTabId } from "./desk/PieceTabsNav";
import { MoneyMiniCard } from "./desk/MoneyMiniCard";
import { BriefTab } from "./desk/BriefTab";
import { CareTab } from "./desk/CareTab";
import { MoneyTab } from "./desk/MoneyTab";
import { HistoryTab } from "./desk/HistoryTab";
import { AfterTab } from "./desk/AfterTab";
import styles from "./PieceRecordPage.module.css";

interface PieceRecordActionsProps {
  action: PiecePublishAction;
  title: string;
  openGateCount: number;
  onOpenDraft: () => void;
}

/**
 * The sticky header's right-hand action group: open the draft, view the live
 * page, and publish or unpublish. A sibling component of the page rather than
 * inline JSX so `PieceRecordPage` stays inside the 200-line budget.
 */
function PieceRecordActions({
  action,
  title,
  openGateCount,
  onOpenDraft,
}: PieceRecordActionsProps) {
  const { t } = useTranslation();
  const publishReasonId = useId();
  const hasOpenGateItems = openGateCount > 0;

  return (
    <div className={styles.right}>
      <Button variant="ghost" size="sm" onClick={onOpenDraft}>
        {t("magazine:piece.header.openDraft")}
      </Button>
      {action.isPublished && action.publicHref && (
        <Button
          variant="ghost"
          size="sm"
          to={action.publicHref}
          aria-label={t("magazine:piece.publish.viewLiveAria", { title })}
        >
          <FiExternalLink aria-hidden />
          {t("magazine:piece.publish.viewLive")}
        </Button>
      )}
      {action.isPublished || action.isScheduled ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={action.askToUnpublish}
          disabled={action.isPending}
        >
          {t("magazine:piece.publish.unpublish")}
        </Button>
      ) : (
        <Button
          variant="plum"
          size="sm"
          // `aria-disabled`, never `disabled`: the button keeps its place in
          // the tab order so a screen reader can reach the reason below, and
          // the server is the gate that actually counts.
          aria-disabled={hasOpenGateItems || action.isPending}
          aria-describedby={hasOpenGateItems ? publishReasonId : undefined}
          onClick={action.askToPublish}
        >
          {t("magazine:piece.header.publish")}
        </Button>
      )}
      {hasOpenGateItems && (
        <span id={publishReasonId} className="visuallyHidden">
          {t("magazine:piece.publish.blockedByGate", { count: openGateCount })}
        </span>
      )}
    </div>
  );
}

/**
 * The full piece record — brief, care & consent, money, history and reader
 * letters — behind `/magazine/editor/piece/:id`. "Open the draft" navigates
 * to the block-based article editor (`routes.magazineWrite`) for
 * article-format pieces (Phase 3), and to the deck editor
 * (`routes.deckEditor`) for deck-format pieces (Phase 4) — opening the
 * linked deck directly when `deckId` is set, otherwise a fresh deck.
 *
 * Publish and Unpublish are real (PRD-119/PRD-120) and both confirm first;
 * `usePiecePublishAction` owns the whole action so the header button and the
 * rail's `PublishGateCard` can never disagree. Publish reads as blocked while
 * the care gate has an open item, though the gate that counts is the server's:
 * it re-checks every attempt and its refusal is rendered item by item.
 * Unpublish is never gated.
 */
export function PieceRecordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { record, isLoading, isError } = usePieceRecord(id!);
  const {
    markPaid,
    toggleLetterRunInLetters,
    addCorrection,
    savePayment,
    publish,
    unpublish,
  } = useRecordMutations(id!);
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [tab, setTab] = useState<PieceRecordTabId>("brief");
  // Above the early returns: hooks cannot run conditionally, so the action
  // hook tolerates an undefined record while the page is still loading.
  const publishAction = usePiecePublishAction({ record, publish, unpublish });

  if (isLoading) {
    return (
      <MagazineDeskShell>
        <div className={styles.page}>
          <div className={styles.center} aria-hidden>
            <SkeletonLine width="45%" height={22} />
            <SkeletonLine width="65%" height={14} />
            <SkeletonLine width="30%" height={14} />
          </div>
        </div>
      </MagazineDeskShell>
    );
  }

  if (isError || !record) {
    return (
      <MagazineDeskShell>
        <div className={styles.page}>
          <EmptyState
            title={t("magazine:piece.header.notFoundTitle")}
            description={t("magazine:piece.header.notFoundDescription")}
            action={{
              label: (
                <>
                  <FiArrowLeft aria-hidden />{" "}
                  {t("magazine:piece.header.backToDesk")}
                </>
              ),
              to: routes.magazineEditor,
            }}
          />
        </div>
      </MagazineDeskShell>
    );
  }

  // A fresh, non-nullable binding — TS narrowing from the guard above doesn't
  // persist into the nested closures below (`handleRunInLetters`,
  // `renderTabBody`), so re-bind once here instead of asserting repeatedly.
  const pieceRecord = record;
  const displayStage =
    STAGE_DTO_TO_VIEW[pieceRecord.stage] ?? pieceRecord.stage;
  const openGateCount = pieceRecord.publishGate.filter(
    (item) => !item.done,
  ).length;
  const formatLabel =
    pieceRecord.format === "article"
      ? t("magazine:piece.header.formatArticle")
      : t("magazine:piece.header.formatDeck");
  // Never render the raw `issueId` UUID — a human-readable issue number needs
  // backend work (Phase 5). Until then, show a neutral scheduled/unscheduled
  // label instead.
  const issueLabel = pieceRecord.issueId
    ? t("magazine:piece.header.inAnIssue")
    : t("magazine:piece.header.notScheduled");
  // Live mode routes by the real piece id; demo mode's article editor ignores
  // the id and always shows DEMO_ARTICLE (fine — there's only one demo draft
  // fixture today). Deck-format pieces open the deck editor: the linked
  // deck when `deckId` is set, otherwise a fresh deck (same fallback the
  // desk's "New deck" entry point uses).
  const handleOpenDraft = () => {
    if (pieceRecord.format === "article") {
      void navigate(routes.magazineWrite.replace(":id", id!));
      return;
    }
    void navigate(
      pieceRecord.deckId
        ? `${routes.deckEditor}?id=${pieceRecord.deckId}`
        : routes.deckEditor,
    );
  };

  function renderTabBody() {
    switch (tab) {
      case "brief":
        return <BriefTab record={pieceRecord} />;
      case "care":
        return <CareTab record={pieceRecord} onToast={showToast} />;
      case "money":
        return (
          <MoneyTab
            record={pieceRecord}
            onSavePayment={(payload) => savePayment.mutate(payload)}
            onMarkPaid={() => markPaid.mutate()}
          />
        );
      case "history":
        return <HistoryTab record={pieceRecord} />;
      case "after":
        return (
          <AfterTab
            record={pieceRecord}
            onToggleRunInLetters={(letterId, runInLetters) =>
              toggleLetterRunInLetters.mutate({ letterId, runInLetters })
            }
            onAddCorrection={(text) => addCorrection.mutate({ text })}
          />
        );
      default:
        return null;
    }
  }

  return (
    <MagazineDeskShell>
      <div className={styles.page}>
        <div className={styles.ebar}>
          <Button
            variant="ghost"
            size="sm"
            to={routes.magazineEditor}
            aria-label={t("magazine:piece.header.backToDesk")}
          >
            <FiArrowLeft aria-hidden />
          </Button>
          <div className={styles.title}>
            <b>{pieceRecord.title}</b>
            <span className={styles.titleSub}>
              {formatLabel} · {pieceRecord.section} · {issueLabel} ·{" "}
              {pieceRecord.byline}
            </span>
          </div>
          <StagePill stage={displayStage} />
          <PieceRecordActions
            action={publishAction}
            title={pieceRecord.title}
            openGateCount={openGateCount}
            onOpenDraft={handleOpenDraft}
          />
        </div>

        <div className={styles.ework}>
          <div>
            <PieceTabsNav
              tab={tab}
              onChange={setTab}
              openGateCount={openGateCount}
            />
            {renderTabBody()}
          </div>

          <aside className={styles.erail}>
            <PublishGateCard
              publishGate={pieceRecord.publishGate}
              action={publishAction}
              onOpenCare={() => setTab("care")}
            />
            <StageStepper stage={pieceRecord.stage} />
            <MoneyMiniCard
              payment={pieceRecord.payment}
              onOpenMoney={() => setTab("money")}
            />
          </aside>
        </div>
      </div>

      <PiecePublishModal
        intent={publishAction.confirmIntent}
        title={pieceRecord.title}
        isPending={publishAction.isPending}
        onClose={publishAction.closeConfirm}
        onConfirm={
          publishAction.confirmIntent === "unpublish"
            ? publishAction.confirmUnpublish
            : publishAction.confirmPublish
        }
      />
    </MagazineDeskShell>
  );
}
