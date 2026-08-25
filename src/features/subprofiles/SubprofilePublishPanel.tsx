import { useState } from "react";
import { Button, SuccessPanel } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { nestedPersonaPath, personaPath } from "../../app/routeMap";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  PublishUnmetError,
  useSubprofileMutations,
} from "./api/useSubprofileMutations";
import { estimateEditorReadiness } from "./subprofileDraftReadiness";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { SideReadinessRing } from "./SideReadinessRing";
import { PublishChecklist, SubprofilePolishList } from "./PublishChecklist";
import { SubprofileDeleteModal } from "./SubprofileDeleteModal";
import { usePersonaCreatorSlug } from "./usePersonaCreatorSlug";
import sharedStyles from "./SubprofileEditor.module.css";
import styles from "./SubprofilePublishPanel.module.css";

interface ChecklistState {
  unmet: string[];
  unknown: boolean;
}

/**
 * The publish surface: a quick client-only readiness ring (honest estimate,
 * `estimateDraftReadiness` — no blocked-language check, no network) above the
 * Publish action; on a rejected completeness check, the real server-verified
 * `PublishChecklist`; on success, the plum success panel. Published personas
 * get an Unpublish action to return to draft. Live mode may not surface the
 * 422 `{unmet}` body, so a non-`PublishUnmetError` rejection renders the
 * checklist in its "still to check" state. Below all of that, a type-to-
 * confirm delete (`SubprofileDeleteModal`) — this pane's Publish/Unpublish
 * mutations and the delete mutation are siblings on the same persona, so
 * pairing "make it live" with "get rid of it entirely" here (rather than only
 * on the dashboard) keeps every persona-lifecycle action in one place.
 */
export function SubprofilePublishPanel({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { publish, unpublish } = useSubprofileMutations();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const editor = useSubprofileEditorContext();
  const [checklist, setChecklist] = useState<ChecklistState | null>(null);
  const [justPublished, setJustPublished] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isPublished = subprofile.status === "published";
  const isLinked = subprofile.linkVisibility === "linked";
  // Ring reads the LIVE editor snapshot (meta fields + working rows), not the
  // saved persona, so it tracks unsaved edits as they're made.
  const readiness = estimateEditorReadiness(editor);
  // Publish verifies the SAVED server row. With unsaved edits in the editor,
  // the check would run against a stale (often empty) row and reject — so gate
  // Publish behind a Save first rather than firing it against stale state.
  const { dirty } = editor;

  // Where the now-live persona can be viewed: a linked persona nests under the
  // CREATOR's main profile (the only slug that route resolves by), an unlinked
  // one stands on its own handle. Reading the signed-in member's slug here sent
  // every co-owner of a shared persona to a not-found wall.
  const creatorSlug = usePersonaCreatorSlug(
    subprofile.id,
    subprofile.memberCount,
  );
  const livePath = isLinked
    ? creatorSlug
      ? nestedPersonaPath(creatorSlug, subprofile.slug)
      : null
    : subprofile.handle
      ? personaPath(subprofile.handle)
      : null;

  async function onPublish() {
    setChecklist(null);
    try {
      await publish.mutateAsync(subprofile.id);
      setJustPublished(true);
      showToast(t("subprofiles:publishPanel.toastLive"), "success");
    } catch (err) {
      if (err instanceof PublishUnmetError) {
        setChecklist({ unmet: err.unmet, unknown: false });
      } else {
        setChecklist({ unmet: [], unknown: true });
        showToast(t("subprofiles:publishPanel.toastPublishError"), "error");
      }
    }
  }

  async function onUnpublish() {
    try {
      await unpublish.mutateAsync(subprofile.id);
      setJustPublished(false);
      setChecklist(null);
      showToast(t("subprofiles:publishPanel.toastUnpublished"), "info");
    } catch {
      showToast(t("subprofiles:publishPanel.toastError"), "error");
    }
  }

  if (justPublished) {
    return (
      <SuccessPanel
        title={t("subprofiles:publishPanel.successTitle")}
        em={t("subprofiles:publishPanel.successEm")}
        onClose={() => setJustPublished(false)}
        closeLabel={t("subprofiles:publishPanel.closeLabel")}
        footer={
          livePath && (
            <Button variant="ghost-dark" to={livePath}>
              {t("subprofiles:publishPanel.viewLive")}
            </Button>
          )
        }
      >
        {isLinked
          ? t("subprofiles:publishPanel.successLinked")
          : t("subprofiles:publishPanel.successUnlinked")}
      </SuccessPanel>
    );
  }

  return (
    <div className="ed-grid">
      <div className={styles.readinessRow}>
        <SideReadinessRing
          readyCount={readiness.readyCount}
          totalCount={readiness.totalCount}
        />
        <div className={styles.readinessText}>
          <p className={styles.readinessTitle}>
            {t("subprofiles:publishPanel.estimateTitle")}
          </p>
          <p className={styles.readinessNote}>
            {t("subprofiles:publishPanel.estimateNote")}
          </p>
        </div>
      </div>

      <div className={sharedStyles.publishBar}>
        <p className={sharedStyles.publishCopy}>
          {isPublished
            ? t("subprofiles:publishPanel.copyPublished")
            : isLinked
              ? t("subprofiles:publishPanel.copyLinkedUnpublished")
              : t("subprofiles:publishPanel.copyUnlinkedUnpublished")}
        </p>
        <div className={sharedStyles.publishActions}>
          {isPublished && (
            <Button
              variant="ghost"
              onClick={() => void onUnpublish()}
              disabled={unpublish.isPending}
            >
              {unpublish.isPending
                ? t("subprofiles:publishPanel.working")
                : t("subprofiles:publishPanel.moveToDraft")}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => void onPublish()}
            disabled={publish.isPending || dirty}
          >
            {publish.isPending
              ? t("subprofiles:publishPanel.publishing")
              : isPublished
                ? t("subprofiles:publishPanel.recheck")
                : t("subprofiles:publishPanel.publish")}
          </Button>
        </div>
        {dirty && (
          <p className={styles.saveFirstHint} role="status">
            {t("subprofiles:publishPanel.saveFirstHint")}
          </p>
        )}
      </div>

      {checklist && (
        <div className={sharedStyles.checklistWrap}>
          <PublishChecklist
            unmet={checklist.unmet}
            unknown={checklist.unknown}
          />
        </div>
      )}

      <SubprofilePolishList subprofile={subprofile} />

      <div className={styles.dangerZone}>
        <p className={styles.dangerCopy}>
          {t("subprofiles:publishPanel.deleteCopy")}
        </p>
        <Button variant="danger" onClick={() => setDeleting(true)}>
          {t("subprofiles:publishPanel.deleteCta")}
        </Button>
      </div>

      {deleting && (
        <SubprofileDeleteModal
          subprofile={subprofile}
          onClose={() => setDeleting(false)}
        />
      )}
    </div>
  );
}
