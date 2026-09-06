import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiArrowLeft } from "react-icons/fi";
import { MagazineDeskShell } from "../../shared/components/layout/MagazineDeskShell";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { routes } from "../../app/routeMap";
import { useIssueProduction } from "./api/useIssueProduction";
import { useIssueMutations } from "./api/useIssueMutations";
import { usePieces } from "./api/usePieces";
import { usePieceMutations } from "./api/usePieceMutations";
import { useDeskIssues } from "./api/useDeskIssues";
import { RunningOrderTab } from "./desk/issue/RunningOrderTab";
import { AddPiecesPanel } from "./desk/issue/AddPiecesPanel";
import { CoverContentsTab } from "./desk/issue/CoverContentsTab";
import { DigestSocialTab } from "./desk/issue/DigestSocialTab";
import { ArchiveTab } from "./desk/issue/ArchiveTab";
import { ShipIssueModal } from "./desk/issue/ShipIssueModal";
import { IssueTabsNav, type IssueTabId } from "./desk/issue/IssueTabsNav";
import { IssueProductionHeader } from "./desk/issue/IssueProductionHeader";
import { IssueRail } from "./desk/issue/IssueRail";
import styles from "./IssueProductionPage.module.css";

/**
 * The issue-production surface — running order, cover & contents, issue panel
 * & social, and archive — behind `/magazine/editor/issue/:number`. Composes
 * the Phase 5 tabs (Task 6/7) and data hooks (Task 4) into the live page;
 * shipping is a two-step confirm (`ShipChecklistCard` opens `ShipIssueModal`)
 * since pieces behind the publish gate hold and publish later rather than
 * blocking the ship action outright.
 */
export function IssueProductionPage() {
  const { number } = useParams();
  const navigate = useNavigate();
  const { issue, isLoading, isError } = useIssueProduction(number!);
  const {
    saveRunOrder,
    saveDigest,
    saveCover,
    saveContentsBlurb,
    saveSchedule,
    ship,
  } = useIssueMutations(number!);
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<IssueTabId>("runningOrder");
  const [shipModalOpen, setShipModalOpen] = useState(false);

  // The unfiled pool the "Add pieces" panel pulls from. `usePieces` is the
  // desk's own list hook, so this shares its `["magazine-pieces"]` cache
  // rather than opening a second query — assigning here invalidates that key
  // and the desk stays in step.
  const { pieces } = usePieces({});
  const { issues } = useDeskIssues();
  const { assignIssue } = usePieceMutations();
  const unassignedPieces = pieces.filter((piece) => piece.issueId === null);
  // `useIssueProduction` is keyed by display number; assignment needs the
  // issue's uuid, which only the switcher list carries.
  const issueId = issues.find((entry) => entry.number === number)?.id ?? null;

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
                  <FiArrowLeft aria-hidden />{" "}
                  {t("magazine:issue.header.backToDesk")}
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
  const readyCount = production.runOrder.filter(
    (entry) => entry.laidOut,
  ).length;
  const totalCount = production.runOrder.length;
  const contentsPieces = production.runOrder.map((entry) => entry.piece);

  function renderTabBody() {
    switch (tab) {
      case "runningOrder":
        return (
          <>
            <RunningOrderTab
              runOrder={production.runOrder}
              onReorder={(items) =>
                saveRunOrder.mutate({
                  items: items.map((entry) => ({
                    pieceId: entry.piece.id,
                    pages: entry.pages,
                  })),
                })
              }
              onOpen={(piece) =>
                void navigate(routes.magazinePiece.replace(":id", piece.id))
              }
            />
            {issueId && (
              <AddPiecesPanel
                unassignedPieces={unassignedPieces}
                issueNumber={production.number}
                isSaving={assignIssue.isPending}
                onAdd={(pieceIds) =>
                  assignIssue.mutate(
                    { pieceIds, issueId },
                    {
                      onSuccess: (result) => {
                        // The production record counts and orders by assigned
                        // pieces, so it has to refetch alongside the desk list
                        // the mutation already invalidates.
                        void queryClient.invalidateQueries({
                          queryKey: [
                            "magazine-issue-production",
                            production.number,
                          ],
                        });
                        showToast(
                          t("magazine:issue.addPieces.addedToast", {
                            count: result.assigned,
                            number: production.number,
                          }),
                          "success",
                        );
                      },
                      onError: () =>
                        showToast(
                          t("magazine:issue.addPieces.failedToast"),
                          "error",
                        ),
                    },
                  )
                }
              />
            )}
          </>
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
            issueNumber={production.number}
            digestSendOnPublish={production.digestSendOnPublish}
            digestSentAt={production.digestSentAt}
            onSaveDigest={(items) => saveDigest.mutate({ items })}
            onToggleSendOnPublish={(sendOnPublish) =>
              saveDigest.mutate({ items: production.digest, sendOnPublish })
            }
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
        <IssueProductionHeader
          number={production.number}
          theme={production.theme}
          readyCount={readyCount}
          totalCount={totalCount}
          onShip={() => setShipModalOpen(true)}
        />

        <div className={styles.ework}>
          <div>
            <IssueTabsNav tab={tab} onChange={setTab} />
            {renderTabBody()}
          </div>

          <aside className={styles.erail}>
            <IssueRail
              production={production}
              isSavingSchedule={saveSchedule.isPending}
              onShip={() => setShipModalOpen(true)}
              onSaveSchedule={(publishedOn, onSaved) =>
                saveSchedule.mutate({ publishedOn }, { onSuccess: onSaved })
              }
            />
          </aside>
        </div>
      </div>

      <ShipIssueModal
        open={shipModalOpen}
        issueNumber={production.number}
        publishesLabel={
          production.publishedOn
            ? formatDate(production.publishedOn)
            : undefined
        }
        publishesOn={production.publishedOn}
        lastShip={production.lastShip}
        onClose={() => setShipModalOpen(false)}
        onShip={() => ship.mutate()}
      />
    </MagazineDeskShell>
  );
}
