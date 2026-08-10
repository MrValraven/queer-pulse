import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { MagazineDeskShell } from "../../shared/components/layout/MagazineDeskShell";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { routes } from "../../app/routeMap";
import { useIssueProduction } from "./api/useIssueProduction";
import { useIssueMutations } from "./api/useIssueMutations";
import { RunningOrderTab } from "./desk/issue/RunningOrderTab";
import { CoverContentsTab } from "./desk/issue/CoverContentsTab";
import { DigestSocialTab } from "./desk/issue/DigestSocialTab";
import { ArchiveTab } from "./desk/issue/ArchiveTab";
import { ShipChecklistCard } from "./desk/issue/ShipChecklistCard";
import { ShipIssueModal } from "./desk/issue/ShipIssueModal";
import { IssueTabsNav, type IssueTabId } from "./desk/issue/IssueTabsNav";
import { PagesCard } from "./desk/issue/PagesCard";
import styles from "./IssueProductionPage.module.css";

/**
 * The issue-production surface — running order, cover & contents, digest &
 * social, and archive — behind `/magazine/editor/issue/:number`. Composes
 * the Phase 5 tabs (Task 6/7) and data hooks (Task 4) into the live page;
 * shipping is a two-step confirm (`ShipChecklistCard` opens `ShipIssueModal`)
 * since pieces behind the publish gate hold and publish later rather than
 * blocking the ship action outright.
 */
export function IssueProductionPage() {
  const { number } = useParams();
  const navigate = useNavigate();
  const { issue, isLoading, isError } = useIssueProduction(number!);
  const { saveRunOrder, saveDigest, saveCover, saveContentsBlurb, ship } = useIssueMutations(
    number!,
  );
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [tab, setTab] = useState<IssueTabId>("runningOrder");
  const [shipModalOpen, setShipModalOpen] = useState(false);

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

  if (isError || !issue) {
    return (
      <MagazineDeskShell>
        <div className={styles.page}>
          <EmptyState
            title={t("magazine:issue.header.notFoundTitle")}
            description={t("magazine:issue.header.notFoundDescription")}
            action={{
              label: (
                <>
                  <FiArrowLeft aria-hidden /> {t("magazine:issue.header.backToDesk")}
                </>
              ),
              to: routes.magazineEditor,
            }}
          />
        </div>
      </MagazineDeskShell>
    );
  }

  // Re-bind once — TS narrowing from the guard above doesn't persist into the
  // nested `renderTabBody` closure (same pattern as `PieceRecordPage`).
  const production = issue;
  const readyCount = production.runOrder.filter((entry) => entry.laidOut).length;
  const totalCount = production.runOrder.length;
  const contentsPieces = production.runOrder.map((entry) => entry.piece);

  function renderTabBody() {
    switch (tab) {
      case "runningOrder":
        return (
          <RunningOrderTab
            runOrder={production.runOrder}
            onReorder={(items) =>
              saveRunOrder.mutate({
                items: items.map((entry) => ({ pieceId: entry.piece.id, pages: entry.pages })),
              })
            }
            onOpen={(piece) => void navigate(routes.magazinePiece.replace(":id", piece.id))}
          />
        );
      case "coverContents":
        return (
          <CoverContentsTab
            number={production.number}
            theme={production.theme}
            coverUrl={production.coverUrl}
            coverlines={production.coverlines}
            contentsPieces={contentsPieces}
            onSaveCover={(patch) => saveCover.mutate(patch)}
            onSaveContentsBlurb={(pieceId, blurb) =>
              saveContentsBlurb.mutate({ pieceId, blurb })
            }
          />
        );
      case "digestSocial":
        return (
          <DigestSocialTab
            digest={production.digest}
            pieces={contentsPieces}
            onSaveDigest={(items) => saveDigest.mutate({ items })}
          />
        );
      case "archive":
        return <ArchiveTab />;
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
            aria-label={t("magazine:issue.header.backToDesk")}
          >
            <FiArrowLeft aria-hidden />
          </Button>
          <div className={styles.title}>
            <b>
              {t("magazine:issue.header.title", {
                number: production.number,
                theme: production.theme,
              })}
            </b>
            <span className={styles.titleSub}>
              {t("magazine:issue.header.laidOut", { ready: readyCount, total: totalCount })}
            </span>
          </div>
          <div className={styles.right}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => showToast(t("magazine:issue.header.proofToast"))}
            >
              {t("magazine:issue.header.proof")}
            </Button>
            <Button variant="plum" size="sm" onClick={() => setShipModalOpen(true)}>
              {t("magazine:issue.ship.cta")}
            </Button>
          </div>
        </div>

        <div className={styles.ework}>
          <div>
            <IssueTabsNav tab={tab} onChange={setTab} />
            {renderTabBody()}
          </div>

          <aside className={styles.erail}>
            <ShipChecklistCard
              checklist={production.shipChecklist}
              onShip={() => setShipModalOpen(true)}
            />
            <PagesCard pages={production.pages} />
          </aside>
        </div>
      </div>

      <ShipIssueModal
        open={shipModalOpen}
        issueNumber={production.number}
        publishesLabel={production.publishedOn ? formatDate(production.publishedOn) : undefined}
        onClose={() => setShipModalOpen(false)}
        onShip={() => ship.mutate()}
      />
    </MagazineDeskShell>
  );
}
