import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
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
import { PieceTabsNav, type PieceRecordTabId } from "./desk/PieceTabsNav";
import { MoneyMiniCard } from "./desk/MoneyMiniCard";
import { BriefTab } from "./desk/BriefTab";
import { CareTab } from "./desk/CareTab";
import { MoneyTab } from "./desk/MoneyTab";
import { HistoryTab } from "./desk/HistoryTab";
import { AfterTab } from "./desk/AfterTab";
import styles from "./PieceRecordPage.module.css";

/**
 * The full piece record — brief, care & consent, money, history and reader
 * letters — behind `/magazine/editor/piece/:id`. "Open the draft" navigates
 * to the block-based article editor (`routes.magazineWrite`) for
 * article-format pieces (Phase 3), and to the deck editor
 * (`routes.deckEditor`) for deck-format pieces (Phase 4) — opening the
 * linked deck directly when `deckId` is set, otherwise a fresh deck. Publish
 * stays disabled while the publish gate has any open item — the gate is not
 * advisory (see `PublishGateCard`).
 */
export function PieceRecordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { record, isLoading, isError } = usePieceRecord(id!);
  const { markPaid, toggleLetterRunInLetters, addCorrection, savePayment } =
    useRecordMutations(id!);
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [tab, setTab] = useState<PieceRecordTabId>("brief");

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
  const hasOpenGateItems = openGateCount > 0;
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
  const publishStub = () => showToast(t("magazine:piece.header.publishToast"));
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
          <div className={styles.right}>
            <Button variant="ghost" size="sm" onClick={handleOpenDraft}>
              {t("magazine:piece.header.openDraft")}
            </Button>
            <Button
              variant="plum"
              size="sm"
              disabled={hasOpenGateItems}
              onClick={publishStub}
            >
              {t("magazine:piece.header.publish")}
            </Button>
          </div>
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
              onPublish={publishStub}
            />
            <StageStepper stage={pieceRecord.stage} />
            <MoneyMiniCard
              payment={pieceRecord.payment}
              onOpenMoney={() => setTab("money")}
            />
          </aside>
        </div>
      </div>
    </MagazineDeskShell>
  );
}
