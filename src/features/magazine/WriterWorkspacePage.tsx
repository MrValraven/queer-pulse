import { useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import { formatDate } from "../../shared/lib/date";
import { useWriterWorkspace } from "./api/useWriterWorkspace";
import { useWriterMutations } from "./api/useWriterMutations";
import type { WriterAssignmentDto } from "./api/writerWorkspace.api";
import { WriterWorkTab } from "./desk/writer/WriterWorkTab";
import { WriterPitchesTab } from "./desk/writer/WriterPitchesTab";
import { WriterPaymentsTab } from "./desk/writer/WriterPaymentsTab";
import { AgreedTermsCard } from "./desk/writer/AgreedTermsCard";
import { BylineSafetyCard } from "./desk/writer/BylineSafetyCard";
import { EditorMessageCard } from "./desk/writer/EditorMessageCard";
import { FileDraftModal } from "./desk/writer/FileDraftModal";
import { MessageEditorModal } from "./desk/writer/MessageEditorModal";
import { BriefDetailModal } from "./desk/writer/BriefDetailModal";
import styles from "./WriterWorkspacePage.module.css";

type WriterTab = "work" | "pitches" | "payments";

const TAB_LABEL_KEYS: Record<WriterTab, string> = {
  work: "magazine:writer.tabs.work",
  pitches: "magazine:writer.tabs.pitches",
  payments: "magazine:writer.tabs.payments",
};

const TAB_IDS: WriterTab[] = ["work", "pitches", "payments"];

/** A bare `yyyy-mm-dd`, which is what live `due` values are (`magazine_piece.due_on`
 *  is a Postgres `date`) — and what the demo fixture's free text ("4 Aug") is not. */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The soonest deadline across the writer's open assignments, as its raw `due`
 * value. ISO values sort lexically, so live mode gets a real "next up"; the demo
 * fixture's free-text dates can't be ordered, so those fall back to the first
 * assignment that carries one. Returns `null` when nothing has a date set.
 */
function nextDueValue(assignments: WriterAssignmentDto[]): string | null {
  const dueValues = assignments
    .map((assignment) => assignment.due)
    .filter((due): due is string => Boolean(due));
  const isoValues = dueValues
    .filter((due) => ISO_DATE_PATTERN.test(due))
    .sort();
  return isoValues[0] ?? dueValues[0] ?? null;
}

/**
 * The signed-in writer's own workspace at `/magazine/writer` — assignments,
 * pitches, and payments, all scoped server-side to this writer (never other
 * contributors' data, see `magazine-writer.controller.ts`). Chrome mirrors
 * `PieceRecordPage` (`.ebar` heading bar, `.ework` tabs + `.erail` sidebar);
 * tab bodies and rail cards reuse `desk/pieceTabs.module.css`.
 *
 * The `.ebar` names the surface and summarises the writer's open workload. It
 * deliberately does NOT restate who you are: the meganav already carries the
 * signed-in avatar and name a few pixels above, so a second identity block
 * would spend a sticky header on nothing.
 */
export function WriterWorkspacePage() {
  const { t, language } = useTranslation();
  const { assignments, pitches, payments, isLoading, isError } =
    useWriterWorkspace();
  const { submitPitch, updateByline, fileDraft } = useWriterMutations();
  const [tab, setTab] = useState<WriterTab>("work");
  const [filingAssignment, setFilingAssignment] =
    useState<WriterAssignmentDto | null>(null);
  const [messagingAssignment, setMessagingAssignment] =
    useState<WriterAssignmentDto | null>(null);
  const [briefAssignment, setBriefAssignment] =
    useState<WriterAssignmentDto | null>(null);
  // The rail's active assignment — the "Your work" list marks one (defaulting
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
      case "payments":
        return <WriterPaymentsTab payments={payments} />;
      default:
        return null;
    }
  }

  const nextDue = nextDueValue(assignments);
  // "2 assignments open · next due 29 Aug", collapsing to a quiet line when the
  // desk is clear. `formatDate` returns an unparseable value unchanged, so the
  // demo fixture's "4 Aug" passes straight through.
  const workloadSummary =
    assignments.length === 0
      ? t("magazine:writer.page.nothingOpen")
      : [
          t("magazine:writer.page.openCount", { count: assignments.length }),
          nextDue
            ? t("magazine:writer.page.nextDue", {
                date: formatDate(nextDue, language, {
                  day: "numeric",
                  month: "short",
                }),
              })
            : null,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.ebar}>
          <div className={styles.title}>
            <h1>{t("magazine:writer.page.heading")}</h1>
            <span className={styles.titleSub}>{workloadSummary}</span>
          </div>
        </div>

        <div className={styles.ework}>
          <div>
            <nav
              className={styles.tabs}
              aria-label={t("magazine:writer.tabs.ariaLabel")}
            >
              {TAB_IDS.map((tabId) => (
                <button
                  key={tabId}
                  type="button"
                  className={cx(
                    styles.tabButton,
                    tab === tabId && styles.tabButtonActive,
                  )}
                  aria-current={tab === tabId}
                  onClick={() => setTab(tabId)}
                >
                  {t(TAB_LABEL_KEYS[tabId])}
                </button>
              ))}
            </nav>
            {renderTabBody()}
          </div>

          <aside className={styles.erail}>
            <EditorMessageCard
              assignment={activeAssignment}
              onOpenThread={setMessagingAssignment}
            />
            <AgreedTermsCard assignment={activeAssignment} />
            <BylineSafetyCard
              assignment={activeAssignment}
              onUpdateByline={(pieceId, byline) =>
                updateByline.mutate({ pieceId, body: { byline } })
              }
            />
          </aside>
        </div>
      </div>

      {filingAssignment && (
        <FileDraftModal
          assignment={filingAssignment}
          onClose={() => setFilingAssignment(null)}
          onFile={(pieceId, blocks) =>
            fileDraft.mutate({ pieceId, body: blocks ? { blocks } : undefined })
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
