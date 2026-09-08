import { useMemo, useState } from "react";
import {
  Button,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useLocalStorage, useMediaQuery } from "../../shared/hooks";
import { mediaMin } from "../../shared/theme/breakpoints";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminDrawer } from "./ui";
import { AdminGovernanceHealthEditor } from "./AdminGovernanceHealthEditor";
import { AdminGovernanceModerationEditor } from "./AdminGovernanceModerationEditor";
import { AdminGovernanceCouncilEditor } from "./AdminGovernanceCouncilEditor";
import { AdminGovernancePrinciplesEditor } from "./AdminGovernancePrinciplesEditor";
import { AdminGovernanceDecisionsEditor } from "./AdminGovernanceDecisionsEditor";
import { AdminGovernancePolicyRail } from "./AdminGovernancePolicyRail";
import { AdminGovernancePolicySaveBar } from "./AdminGovernancePolicySaveBar";
import { AdminGovernancePolicyPreview } from "./AdminGovernancePolicyPreview";
import { AdminGovernancePolicyReviewSheet } from "./AdminGovernancePolicyReviewSheet";
import {
  POLICY_SECTION_IDS,
  useAdminGovernancePolicyDraft,
} from "./adminGovernancePolicyDraft";
import { buildPolicyDiff, countPolicyDiff } from "./adminGovernancePolicyDiff";
import { useActivePolicySection } from "./useActivePolicySection";
import {
  useAdminGovernanceOverview,
  useUpdateAdminOverview,
} from "./api/useAdminGovernanceOverview";
import type { AdminOverviewResponseDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePolicy.module.css";

/** Which of the two side panels this admin has folded away. Persisted: an
 * editor who traded the preview for row width means it next time too. */
const RAIL_COLLAPSED_KEY = "qp.governancePolicy.railCollapsed";
const PREVIEW_COLLAPSED_KEY = "qp.governancePolicy.previewCollapsed";

/* Both folds are a wide-screen affordance, and both mirror a CSS breakpoint in
   AdminGovernancePolicy.module.css. Below 1100px the rail is already a wrapping
   row of chips rather than a column, and below 1560px the preview is already
   behind the "Public preview" button — folding either there would hide a
   control with nothing to gain. */
const RAIL_FOLDABLE_QUERY = mediaMin(1100);
const PREVIEW_FOLDABLE_QUERY = mediaMin(1561);

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * The admin Policy tab: everything on the public Governance page that is not a
 * number from the ledger, edited beside a live rendering of the page it
 * produces.
 *
 * Three columns. A rail that says which sections carry unsaved rows, five
 * section editors, and the public page itself drawn from the draft. One draft
 * across all five, one save bar, one review sheet: an editor asks "what is
 * different between this and what members can read right now" once, and gets
 * one answer, instead of saving section by section and hoping.
 *
 * The rows stay catalog-constrained where the words live in the translation
 * bundle (health figures, moderation steps) and free where PRD-265 made them
 * authored (council roles, principles, decisions) — an authored field asks for
 * English and Portuguese together, because there is no later moment at which
 * the Portuguese would be got.
 */
export function AdminGovernancePolicy() {
  const { overview, loading, isError, refetch } = useAdminGovernanceOverview();

  if (isError) {
    return (
      <FadeIn>
        <LoadErrorState onRetry={refetch} />
      </FadeIn>
    );
  }

  if (loading || !overview) {
    return (
      <FadeIn>
        <div className={styles.section} style={{ padding: 24 }}>
          <SkeletonLine height={16} width="70%" style={{ marginBottom: 10 }} />
          <SkeletonLine height={16} width="85%" style={{ marginBottom: 10 }} />
          <SkeletonLine height={16} width="60%" />
        </div>
      </FadeIn>
    );
  }

  // Keyed on the payload's identity so the draft below starts from whatever the
  // first successful fetch returned, rather than from an empty shape.
  return <AdminGovernancePolicyWorkspace overview={overview} />;
}

function AdminGovernancePolicyWorkspace({
  overview,
}: {
  overview: AdminOverviewResponseDTO;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const update = useUpdateAdminOverview();
  const {
    draft,
    published,
    setSection,
    changedSectionIds,
    incompleteSectionIds,
    hasUnseatedCouncilRow,
    reset,
    changedSectionsBody,
  } = useAdminGovernancePolicyDraft(overview);
  const { activeSectionId, jumpToSection } = useActivePolicySection();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRailFolded, setIsRailFolded] = useLocalStorage<boolean>(
    RAIL_COLLAPSED_KEY,
    false,
    isBoolean,
  );
  const [isPreviewFolded, setIsPreviewFolded] = useLocalStorage<boolean>(
    PREVIEW_COLLAPSED_KEY,
    false,
    isBoolean,
  );
  const isRailCollapsed = useMediaQuery(RAIL_FOLDABLE_QUERY) && isRailFolded;
  const isPreviewCollapsed =
    useMediaQuery(PREVIEW_FOLDABLE_QUERY) && isPreviewFolded;

  // Read twice per render (the bar's count and the sheet's list) and walked on
  // every keystroke, so it is computed once.
  const diffGroups = useMemo(
    () => buildPolicyDiff(t, published, draft),
    [t, published, draft],
  );
  const changeCount = countPolicyDiff(diffGroups);
  const isSectionChanged = (sectionId: (typeof POLICY_SECTION_IDS)[number]) =>
    changedSectionIds.includes(sectionId);

  const save = (note: string): void => {
    update.mutate(
      { ...changedSectionsBody, note: note || undefined },
      {
        onSuccess: () => {
          setIsReviewOpen(false);
          showToast(t("admin:governance.overview.edit.saved"), "success");
        },
        onError: () =>
          showToast(t("admin:governance.overview.edit.error"), "error"),
      },
    );
  };

  return (
    <FadeIn>
      <div className={styles.previewToggleRow}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPreviewOpen(true)}
        >
          {t("admin:governance.policy.preview.open")}
        </Button>
      </div>

      <div
        className={[
          styles.wrap,
          isRailCollapsed && styles.wrapRailCollapsed,
          isPreviewCollapsed && styles.wrapPreviewCollapsed,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <AdminGovernancePolicyRail
          sections={POLICY_SECTION_IDS.map((sectionId) => ({
            id: sectionId,
            rowCount: draft[sectionId].length,
            isChanged: isSectionChanged(sectionId),
          }))}
          activeSectionId={activeSectionId}
          isCollapsed={isRailCollapsed}
          onToggleCollapse={() => setIsRailFolded((folded) => !folded)}
          onJump={jumpToSection}
          meta={overview.meta}
        />

        <div>
          <div className={styles.editor}>
            <AdminGovernanceHealthEditor
              rows={draft.health}
              publishedRows={published.health}
              setRows={setSection.health}
              meta={overview.meta.health}
              isActive={activeSectionId === "health"}
              isChanged={isSectionChanged("health")}
            />
            <AdminGovernanceModerationEditor
              rows={draft.moderationSteps}
              publishedRows={published.moderationSteps}
              setRows={setSection.moderationSteps}
              meta={overview.meta.moderationSteps}
              isActive={activeSectionId === "moderationSteps"}
              isChanged={isSectionChanged("moderationSteps")}
            />
            <AdminGovernanceCouncilEditor
              rows={draft.council}
              publishedRows={published.council}
              setRows={setSection.council}
              meta={overview.meta.council}
              isActive={activeSectionId === "council"}
              isChanged={isSectionChanged("council")}
            />
            <AdminGovernancePrinciplesEditor
              rows={draft.principles}
              publishedRows={published.principles}
              setRows={setSection.principles}
              meta={overview.meta.principles}
              isActive={activeSectionId === "principles"}
              isChanged={isSectionChanged("principles")}
            />
            <AdminGovernanceDecisionsEditor
              rows={draft.decisions}
              publishedRows={published.decisions}
              setRows={setSection.decisions}
              meta={overview.meta.decisions}
              isActive={activeSectionId === "decisions"}
              isChanged={isSectionChanged("decisions")}
            />
          </div>

          <AdminGovernancePolicySaveBar
            changeCount={changeCount}
            changedSectionCount={diffGroups.length}
            blockedReason={
              // An empty seat first: it is the more concrete of the two, and a
              // newly added seat is empty before anything is typed in it.
              hasUnseatedCouncilRow
                ? t("admin:governance.overview.council.needsMember")
                : incompleteSectionIds.length > 0
                  ? t("admin:governance.overview.edit.needsBothLanguages")
                  : null
            }
            isSaving={update.isPending}
            onReview={() => setIsReviewOpen(true)}
            onDiscard={() => {
              reset();
              showToast(t("admin:governance.policy.bar.discarded"), "info");
            }}
            onSave={() => save("")}
          />
        </div>

        <AdminGovernancePolicyPreview
          draft={draft}
          activeSectionId={activeSectionId}
          isCollapsed={isPreviewCollapsed}
          onToggleCollapse={() => setIsPreviewFolded((folded) => !folded)}
        />
      </div>

      {isPreviewOpen && (
        <AdminDrawer
          label={t("admin:governance.policy.preview.label")}
          head={t("admin:governance.policy.preview.label")}
          onClose={() => setIsPreviewOpen(false)}
        >
          <AdminGovernancePolicyPreview
            draft={draft}
            activeSectionId={activeSectionId}
            isInDrawer
          />
        </AdminDrawer>
      )}

      {isReviewOpen && (
        <AdminGovernancePolicyReviewSheet
          groups={diffGroups}
          isSaving={update.isPending}
          onClose={() => setIsReviewOpen(false)}
          onSave={save}
        />
      )}
    </FadeIn>
  );
}
