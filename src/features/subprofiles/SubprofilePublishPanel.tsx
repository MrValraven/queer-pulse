import { useState } from "react";
import { Button, SuccessPanel } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { nestedPersonaPath, personaPath } from "../../app/routeMap";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  PublishUnmetError,
  useSubprofileMutations,
} from "./api/useSubprofileMutations";
import { PublishChecklist, SubprofilePolishList } from "./PublishChecklist";
import styles from "./SubprofileEditor.module.css";

interface ChecklistState {
  unmet: string[];
  unknown: boolean;
}

/**
 * The publish surface: a Publish action that, on a rejected completeness check,
 * feeds the unmet codes to `PublishChecklist`; on success, the plum success
 * panel. Published personas get an Unpublish action to return to draft. Live
 * mode may not surface the 422 `{unmet}` body, so a non-`PublishUnmetError`
 * rejection renders the checklist in its "still to check" state.
 */
export function SubprofilePublishPanel({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { publish, unpublish } = useSubprofileMutations();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [checklist, setChecklist] = useState<ChecklistState | null>(null);
  const [justPublished, setJustPublished] = useState(false);

  const isPublished = subprofile.status === "published";
  const isLinked = subprofile.linkVisibility === "linked";

  // Where the now-live persona can be viewed: a linked persona nests under the
  // owner's main profile; an unlinked one stands on its own handle.
  const ownerSlug = user?.profile.slug;
  const livePath = isLinked
    ? ownerSlug
      ? nestedPersonaPath(ownerSlug, subprofile.slug)
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
    <div className={styles.card}>
      <div className={styles.publishBar}>
        <p className={styles.publishCopy}>
          {isPublished
            ? t("subprofiles:publishPanel.copyPublished")
            : isLinked
              ? t("subprofiles:publishPanel.copyLinkedUnpublished")
              : t("subprofiles:publishPanel.copyUnlinkedUnpublished")}
        </p>
        <div className={styles.publishActions}>
          {isPublished && (
            <Button
              variant="ghost"
              onClick={onUnpublish}
              disabled={unpublish.isPending}
            >
              {unpublish.isPending
                ? t("subprofiles:publishPanel.working")
                : t("subprofiles:publishPanel.moveToDraft")}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onPublish}
            disabled={publish.isPending}
          >
            {publish.isPending
              ? t("subprofiles:publishPanel.publishing")
              : isPublished
                ? t("subprofiles:publishPanel.recheck")
                : t("subprofiles:publishPanel.publish")}
          </Button>
        </div>
      </div>
      {checklist && (
        <div className={styles.checklistWrap}>
          <PublishChecklist
            unmet={checklist.unmet}
            unknown={checklist.unknown}
          />
        </div>
      )}
      <SubprofilePolishList subprofile={subprofile} />
    </div>
  );
}
