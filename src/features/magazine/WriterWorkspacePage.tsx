import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useWriterWorkspace } from "./api/useWriterWorkspace";
import { useWriterMutations } from "./api/useWriterMutations";
import type { WriterAssignmentDto } from "./api/writerWorkspace.api";
import { cx } from "../../shared/lib/cx";
import { WRITER_TAB_PARAM, parseWriterTab, type WriterTab } from "./writerTabs";
import { WriterWorkspaceHeader } from "./desk/writer/WriterWorkspaceHeader";
import { WriterWorkspaceTabs } from "./desk/writer/WriterWorkspaceTabs";
import { WriterWorkTab } from "./desk/writer/WriterWorkTab";
import { WriterPitchesTab } from "./desk/writer/WriterPitchesTab";
import { WriterSubmissionsTab } from "./desk/writer/WriterSubmissionsTab";
import { WriterPaymentsTab } from "./desk/writer/WriterPaymentsTab";
import { WriterWorkspaceRail } from "./desk/writer/WriterWorkspaceRail";
import { FileDraftModal } from "./desk/writer/FileDraftModal";
import { MessageEditorModal } from "./desk/writer/MessageEditorModal";
import { BriefDetailModal } from "./desk/writer/BriefDetailModal";
import styles from "./WriterWorkspacePage.module.css";

/**
 * The signed-in writer's own workspace at `/magazine/writer`: assignments,
 * pitches, story submissions and payments. Chrome mirrors `PieceRecordPage`
 * (`.ebar` heading bar, `.ework` tabs + `.erail` sidebar); tab bodies and rail
 * cards reuse `desk/pieceTabs.module.css`.
 *
 * Assignments, pitches and payments come from the writer-workspace read, all
 * scoped server-side to this writer (see `magazine-writer.controller.ts`). The
 * Submissions tab (`WriterSubmissionsTab`, the member's own story submissions
 * from `GET /magazine/submissions/mine`) fetches for itself and owns its
 * loading and error states, yet the page's `isLoading` / `isError` gates on the
 * writer-workspace read still hold every tab, Submissions included. That tab
 * drops the assignment rail and caps its column at a reading width. The old
 * tracker at `/magazine/pitches` redirects onto that tab: the active tab lives
 * in the `?tab=` search param (`writerTabs.ts`), so it can be linked to.
 */
export function WriterWorkspacePage() {
  const { t } = useTranslation();
  const { assignments, pitches, payments, isLoading, isError } =
    useWriterWorkspace();
  const { submitPitch, updateByline, fileDraft } = useWriterMutations();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseWriterTab(searchParams.get(WRITER_TAB_PARAM));
  // `replace` so switching tabs does not stack history entries, and the
  // updater keeps any other params on the URL.
  function selectTab(nextTab: WriterTab) {
    setSearchParams(
      (previous) => {
        const nextParams = new URLSearchParams(previous);
        nextParams.set(WRITER_TAB_PARAM, nextTab);
        return nextParams;
      },
      { replace: true },
    );
  }
  const [filingAssignment, setFilingAssignment] =
    useState<WriterAssignmentDto | null>(null);
  const [messagingAssignment, setMessagingAssignment] =
    useState<WriterAssignmentDto | null>(null);
  const [briefAssignment, setBriefAssignment] =
    useState<WriterAssignmentDto | null>(null);
  // The rail's active assignment: the "Your work" list marks one (defaulting
  // to the first), and the rail cards + byline picker read it, instead of
  // always acting on `assignments[0]`. Falls back to the first assignment if
  // nothing is selected yet, or the selected id no longer exists in the list
  // (e.g. it was filed and dropped off after a refetch).
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(
    null,
  );
  const activeAssignment =
    assignments.find((assignment) => assignment.id === activeAssignmentId) ??
    assignments[0];
  // The rail describes an assignment; story submissions have none.
  const hasRail = tab !== "submissions";

  if (isLoading) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.center} aria-hidden>
            <SkeletonLine width="45%" height={22} />
            <SkeletonLine width="65%" height={14} />
            <SkeletonLine width="30%" height={14} />
          </div>
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell>
        <div className={styles.page}>
          <EmptyState
            title={t("magazine:writer.page.errorTitle")}
            description={t("magazine:writer.page.errorDescription")}
          />
        </div>
      </AppShell>
    );
  }

  function renderTabBody() {
    switch (tab) {
      case "work":
        return (
          <WriterWorkTab
            assignments={assignments}
            activeAssignmentId={activeAssignment?.id}
            onSelectAssignment={(selected) =>
              setActiveAssignmentId(selected.id)
            }
            onFileDraft={setFilingAssignment}
            onMessageEditor={setMessagingAssignment}
            onReadBrief={setBriefAssignment}
          />
        );
      case "pitches":
        return (
          <WriterPitchesTab
            pitches={pitches}
            isSubmitting={submitPitch.isPending}
            onSubmitPitch={(payload) => submitPitch.mutate(payload)}
          />
        );
      case "submissions":
        return <WriterSubmissionsTab />;
      case "payments":
        return <WriterPaymentsTab payments={payments} />;
      default:
        return null;
    }
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <WriterWorkspaceHeader assignments={assignments} />

        <div className={cx(styles.ework, !hasRail && styles.eworkWithoutRail)}>
          <div className={styles.eworkMain}>
            <WriterWorkspaceTabs activeTab={tab} onSelectTab={selectTab} />
            {renderTabBody()}
          </div>

          {hasRail && (
            <WriterWorkspaceRail
              assignment={activeAssignment}
              onOpenThread={setMessagingAssignment}
              onUpdateByline={(pieceId, byline) =>
                updateByline.mutate({ pieceId, body: { byline } })
              }
            />
          )}
        </div>
      </div>

      {filingAssignment && (
        <FileDraftModal
          assignment={filingAssignment}
          onClose={() => setFilingAssignment(null)}
          // `mutateAsync`, with the promise RETURNED: that is
          // what lets the modal hold the writer's text on screen until the
          // filing lands and render the 409 conflict state instead of closing
          // over a failure. Returning nothing here would silently disable both.
          //
          // `options` carries `expectedVersion` (read from the writer's own
          // draft GET, so a filing cannot overwrite an editor who saved in the
          // meantime) and `mode` (append or replace). Dropping them here would
          // leave the modal's controls inert while still looking live.
          onFile={(pieceId, blocks, options) =>
            fileDraft.mutateAsync({
              pieceId,
              body: { ...(blocks ? { blocks } : {}), ...options },
            })
          }
        />
      )}

      {messagingAssignment && (
        <MessageEditorModal
          assignment={messagingAssignment}
          onClose={() => setMessagingAssignment(null)}
        />
      )}

      {briefAssignment && (
        <BriefDetailModal
          assignment={briefAssignment}
          onClose={() => setBriefAssignment(null)}
        />
      )}
    </AppShell>
  );
}
