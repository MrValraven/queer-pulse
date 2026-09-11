import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminResourceGuideDTO } from "../api/adminResourceGuides.api";
import { adminResourceGuideKey } from "../api/useAdminResourceGuides";
import { moveSection } from "./guideDocumentOps";
import { guideDraftStorageKey } from "./guideDraftStorage";
import { copyEnglishStructure, sectionHasProse } from "./guideTranslation";
import { GuideCardPreviews } from "./GuideCardPreviews";
import { GuideDetailsPanel } from "./GuideDetailsPanel";
import { GuideDocument } from "./GuideDocument";
import { GuideOutline } from "./GuideOutline";
import { GuideStatusCard } from "./GuideStatusCard";
import {
  GuideConflictBanner,
  GuideRecoveryBanner,
} from "./GuideWorkspaceBanners";
import {
  GuideWorkspaceHeader,
  type GuideSaveStatus,
} from "./GuideWorkspaceHeader";
import { GuideWorkspaceLinks } from "./GuideWorkspaceLinks";
import { GuideWorkspacePreview } from "./GuideWorkspacePreview";
import { useGuideDraftRecovery } from "./useGuideDraftRecovery";
import { useGuideSave, useSaveShortcut } from "./useGuideSave";
import { useGuideWorkspace } from "./useGuideWorkspace";
import { useGuideWorkspaceView } from "./useGuideWorkspaceView";
import styles from "./AdminGuideWorkspacePage.module.css";

/** The workspace for one guide, or a new one when `guide` is null. Mounted
 *  with `key` set to the guide id, so a different guide starts fresh. */
export function GuideWorkspaceScreen({
  guide,
  breadcrumb,
}: {
  guide: AdminResourceGuideDTO | null;
  breadcrumb: { label: string; to?: string }[];
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const workspace = useGuideWorkspace(guide);
  const { draft, language, baseline } = workspace;
  const recovery = useGuideDraftRecovery({
    storageKey: guideDraftStorageKey(guide?.id ?? null),
    draft,
    cleanDraft: workspace.cleanDraft,
    isDirty: workspace.isDirty,
    baseUpdatedAt: baseline?.updatedAt ?? null,
  });
  const [createdGuideId, setCreatedGuideId] = useState<string | null>(null);
  const saving = useGuideSave({
    workspace,
    onSaved: recovery.clear,
    onCreated: (created) => {
      recovery.clear();
      queryClient.setQueryData(
        adminResourceGuideKey(created.id, demoMode),
        created,
      );
      setCreatedGuideId(created.id);
    },
  });
  const view = useGuideWorkspaceView({
    language,
    setLanguage: workspace.setLanguage,
  });
  useSaveShortcut(() => {
    if (!saving.isSaving) void saving.save();
  });
  useUnsavedChangesGuard({
    active: workspace.isDirty,
    confirmMessage: t("admin:guideWorkspace.leaveConfirm"),
    guardBackButton: true,
  });

  // No leave prompt on the /new to /edit/:id move: the guard's own effect is
  // declared earlier, so it re-runs first in this commit with the clean draft.
  useEffect(() => {
    if (!createdGuideId || workspace.isDirty) return;
    void navigate(`${routes.adminResourceGuideEdit}/${createdGuideId}`, {
      replace: true,
    });
  }, [createdGuideId, workspace.isDirty, navigate]);

  const sections = language === "en" ? draft.sections : draft.sectionsPt;
  const englishSections = language === "pt" ? draft.sections : null;
  const storedMeta = baseline?.meta ?? null;
  // Mirrors which sections the backend serves (`servedSections` in
  // guideTranslation.ts): a heading alone is enough to take over the page.
  const isTakingOverPage =
    baseline !== null &&
    baseline.sections.length === 0 &&
    draft.sections.some(
      (section) => section.heading !== "" || sectionHasProse(section),
    );
  const saveStatus: GuideSaveStatus = saving.isSaving
    ? "saving"
    : workspace.isDirty
      ? "dirty"
      : saving.lastSavedAt
        ? "saved"
        : "idle";

  return (
    <AdminShell
      title={draft.title || t("admin:guideWorkspace.untitled")}
      breadcrumb={breadcrumb}
      isFullBleed
    >
      <GuideWorkspaceHeader
        language={language}
        onLanguageChange={workspace.setLanguage}
        viewMode={view.viewMode}
        canSplit={view.canSplit}
        onViewModeChange={view.setViewMode}
        saveStatus={saveStatus}
        lastSavedAt={saving.lastSavedAt}
        issueCount={saving.issues.length}
        onShowIssues={() => view.showIssues(saving.issues)}
        isSaving={saving.isSaving}
        onSave={() => void saving.save()}
        links={<GuideWorkspaceLinks guide={baseline} />}
      />
      {recovery.pending && (
        <GuideRecoveryBanner
          storedAt={recovery.pending.storedAt}
          isOlderBase={recovery.pending.isOlderBase}
          onRestore={() => {
            const restored = recovery.restore();
            if (restored) workspace.replaceDraft(restored);
          }}
          onDiscard={recovery.discard}
        />
      )}
      {saving.conflict && (
        <GuideConflictBanner
          savedAt={saving.conflict.serverGuide.updatedAt}
          isSaving={saving.isSaving}
          onLoadTheirs={() => {
            if (!saving.isSaving) saving.loadTheirs();
          }}
          onSaveMine={() => void saving.saveMineAnyway()}
        />
      )}
      <div className={styles.layout} data-view={view.viewMode}>
        <aside className={styles.rail}>
          <GuideStatusCard
            guide={baseline}
            isDirty={workspace.isDirty || saving.isSaving}
            isTakingOverPage={isTakingOverPage}
            onGuideUpdated={workspace.acceptStatusUpdate}
          />
          <GuideDetailsPanel
            draft={draft}
            language={language}
            isNew={workspace.isNew}
            storedMeta={storedMeta}
            issues={saving.issues}
            onChange={workspace.updateDraft}
          />
          <GuideCardPreviews
            draft={draft}
            guide={baseline}
            storedMeta={storedMeta}
          />
          <GuideOutline
            sections={sections}
            englishSections={englishSections}
            activeSectionKey={view.activeSectionKey}
            onJump={view.jumpToSection}
            onReorder={(fromIndex, toIndex) =>
              workspace.updateSections(language, (current) =>
                moveSection(current, fromIndex, toIndex),
              )
            }
          />
        </aside>
        {view.viewMode !== "preview" && (
          <div className={styles.editorColumn}>
            <GuideDocument
              key={language}
              sections={sections}
              englishSections={englishSections}
              issues={saving.issues.filter(
                (issue) => issue.language === language,
              )}
              onSectionsChange={(update) =>
                workspace.updateSections(language, update)
              }
              onActiveSectionChange={view.setActiveSectionKey}
              onCopyEnglishStructure={() =>
                workspace.updateSections("pt", (current) =>
                  copyEnglishStructure(draft.sections, current),
                )
              }
            />
          </div>
        )}
        {view.viewMode !== "edit" && (
          <div className={styles.previewColumn}>
            <GuideWorkspacePreview
              draft={draft}
              language={language}
              activeSectionKey={view.activeSectionKey}
              onEditSection={view.jumpToSection}
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
