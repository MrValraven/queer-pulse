import { useState } from "react";
import { AppShell } from "../../shared/components/layout";
import { Avatar, EmptyState, SkeletonLine, type AvatarTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
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

/** `WriterIdentity.tint` includes "violet", which `<Avatar>` doesn't define —
 *  fall back to "default" rather than widen the shared `AvatarTint` union for
 *  one caller. */
function toAvatarTint(tint: string): AvatarTint {
  return tint === "coral" || tint === "jade" || tint === "plum" ? tint : "default";
}

/** "Sara Pinheiro" → "SP"; falls back to "?" for an empty name. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * The signed-in writer's own workspace at `/magazine/writer` — assignments,
 * pitches, and payments, all scoped server-side to this writer (never other
 * contributors' data, see `magazine-writer.controller.ts`). Chrome mirrors
 * `PieceRecordPage` (`.ebar` identity header, `.ework` tabs + `.erail`
 * sidebar); tab bodies and rail cards reuse `desk/pieceTabs.module.css`.
 */
export function WriterWorkspacePage() {
  const { t } = useTranslation();
  const { me, assignments, pitches, payments, isLoading, isError } = useWriterWorkspace();
  const { submitPitch, updateByline, fileDraft } = useWriterMutations();
  const [tab, setTab] = useState<WriterTab>("work");
  const [filingAssignment, setFilingAssignment] = useState<WriterAssignmentDto | null>(null);
  const [messagingAssignment, setMessagingAssignment] = useState<WriterAssignmentDto | null>(
    null,
  );
  const [briefAssignment, setBriefAssignment] = useState<WriterAssignmentDto | null>(null);
  // The rail's active assignment — the "Your work" list marks one (defaulting
  // to the first), and the rail cards + byline picker read it, instead of
  // always acting on `assignments[0]`. Falls back to the first assignment if
  // nothing is selected yet, or the selected id no longer exists in the list
  // (e.g. it was filed and dropped off after a refetch).
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const activeAssignment =
    assignments.find((assignment) => assignment.id === activeAssignmentId) ?? assignments[0];

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
            onSelectAssignment={(selected) => setActiveAssignmentId(selected.id)}
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

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.ebar}>
          <Avatar initials={initialsOf(me.name)} tint={toAvatarTint(me.tint)} name={me.name} />
          <div className={styles.title}>
            <b>{me.name}</b>
            <span className={styles.titleSub}>{me.role}</span>
          </div>
        </div>

        <div className={styles.ework}>
          <div>
            <nav className={styles.tabs} aria-label={t("magazine:writer.tabs.ariaLabel")}>
              {TAB_IDS.map((tabId) => (
                <button
                  key={tabId}
                  type="button"
                  className={cx(styles.tabButton, tab === tabId && styles.tabButtonActive)}
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
          onFile={(pieceId, blocks) => fileDraft.mutate({ pieceId, body: blocks ? { blocks } : undefined })}
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
