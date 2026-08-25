import { useState } from "react";
import { Button, RadioCardGroup, Tag } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Translation } from "../../../../shared/i18n/Translation";
import { describeError } from "../../../../shared/api/errorMessage";
import { useAdminRoadmap } from "../../api/useAdminRoadmap";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import { AdminModal } from "../../ui";
import { useRoadmapModals } from "../state/roadmapModalsHook";
import styles from "./roadmapModals.module.css";

/**
 * Folds a member idea into an existing board item: moves its votes across
 * and removes the idea from the queue. Pre-selects the idea's own
 * `duplicateOfItemId` when the admin already flagged a likely match while
 * triaging (Ideas view), but any non-archived item can be picked instead.
 */
export function MergeIdeaModal() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { payload, close } = useRoadmapModals();
  const { items, ideas } = useAdminRoadmap();
  const { mergeIdea, pending } = useAdminRoadmapMutations();

  const ideaId = payload?.ideaId;
  const idea = ideas.find((candidate) => candidate.id === ideaId);
  const [targetItemId, setTargetItemId] = useState(
    idea?.duplicateOfItemId ?? "",
  );

  if (!ideaId) return null;

  const targets = items.filter((item) => !item.archived);

  function confirm() {
    if (!targetItemId) {
      showToast(t("admin:roadmap.modals.mergeIdea.missingPickToast"), "error");
      return;
    }
    const votes = idea?.votes ?? 0;
    const name = idea?.text ?? "";
    mergeIdea(
      { id: ideaId as string, intoItemId: targetItemId },
      {
        onSuccess: () => {
          showToast(
            t("admin:roadmap.toasts.merged", { count: votes, votes, name }),
            "success",
          );
          close();
        },
        onError: (error) =>
          showToast(
            describeError(
              t("admin:roadmap.modals.mergeIdea.confirmCta"),
              error,
            ),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={t("admin:roadmap.modals.mergeIdea.eyebrow")}
      title={
        <Translation
          i18nKey="admin:roadmap.modals.mergeIdea.title"
          components={{ em: <em /> }}
        />
      }
      onClose={close}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            {t("admin:common.cancel")}
          </Button>
          <Button variant="primary" onClick={confirm} disabled={pending}>
            {t("admin:roadmap.modals.mergeIdea.confirmCta")}
          </Button>
        </>
      }
    >
      <p className={styles.body}>{t("admin:roadmap.modals.mergeIdea.body")}</p>

      {idea && (
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("admin:roadmap.modals.mergeIdea.ideaLabel")}
            </span>
            <span className={styles.metaValue}>{idea.text}</span>
          </div>
        </div>
      )}

      <div className={styles.groupLabel}>
        {t("admin:roadmap.modals.mergeIdea.mergeIntoLabel")}
      </div>
      {targets.length === 0 ? (
        <p className={styles.emptyOption}>
          {t("admin:roadmap.modals.mergeIdea.emptyTargets")}
        </p>
      ) : (
        <RadioCardGroup<string>
          className={styles.optionList}
          optionClassName={styles.optionCard}
          checkedClassName={styles.optionCardOn}
          ariaLabel={t("admin:roadmap.modals.mergeIdea.mergeIntoLabel")}
          value={targetItemId}
          onChange={setTargetItemId}
          options={targets.map((item) => ({
            id: item.id,
            render: (
              <>
                <span className={styles.optionTitle}>{item.name}</span>
                <span className={styles.optionCat}>
                  {idea?.duplicateOfItemId === item.id && (
                    <Tag>
                      {t("admin:roadmap.modals.mergeIdea.suggestedTag")}
                    </Tag>
                  )}{" "}
                  {t(`admin:roadmap.categories.${item.category}`)}
                </span>
              </>
            ),
          }))}
        />
      )}
    </AdminModal>
  );
}
