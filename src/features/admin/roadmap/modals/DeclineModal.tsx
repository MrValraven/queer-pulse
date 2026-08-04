import { useState } from "react";
import { Button, FormField, RadioCardGroup } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { Translation } from "../../../../shared/i18n/Translation";
import { describeError } from "../../../../shared/api/errorMessage";
import { useAdminRoadmap } from "../../api/useAdminRoadmap";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import type { RoadmapDeclineReason } from "../../api/roadmapAdmin.types";
import { AdminModal } from "../../ui";
import { useRoadmapModals } from "../state/useRoadmapModals";
import { DECLINE_REASONS } from "./declineReasons.data";
import styles from "./roadmapModals.module.css";

/**
 * Says no to a member idea publicly, with a reason — the declined idea
 * surfaces on the public roadmap's "Not building this, and why" section
 * (`roadmapAdmin.api.ts`'s `declineIdea` doc). Picking a reason pre-fills the
 * textarea with a suggested wording the admin can still edit before
 * confirming; the note that ships is whatever's in the textarea, not a copy
 * of the reason's default.
 */
export function DeclineModal() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { payload, close } = useRoadmapModals();
  const { ideas } = useAdminRoadmap();
  const { declineIdea, pending } = useAdminRoadmapMutations();
  const [reasonKey, setReasonKey] = useState<RoadmapDeclineReason | "">("");
  const [note, setNote] = useState("");

  const ideaId = payload?.ideaId;
  const idea = ideas.find((candidate) => candidate.id === ideaId);
  if (!ideaId) return null;

  function pickReason(key: RoadmapDeclineReason) {
    setReasonKey(key);
    const option = DECLINE_REASONS.find((candidate) => candidate.key === key);
    if (option) setNote(t(option.wordingKey));
  }

  function confirm() {
    const trimmedNote = note.trim();
    if (!reasonKey || trimmedNote.length === 0) {
      showToast(t("admin:roadmap.modals.decline.missingReasonToast"), "error");
      return;
    }
    const name = idea?.text ?? "";
    declineIdea(
      { id: ideaId as string, reason: reasonKey, note: trimmedNote },
      {
        onSuccess: () => {
          showToast(t("admin:roadmap.toasts.declined", { name }), "success");
          close();
        },
        onError: (error) =>
          showToast(
            describeError(t("admin:roadmap.modals.decline.confirmCta"), error),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={t("admin:roadmap.modals.decline.eyebrow")}
      title={
        <Translation
          i18nKey="admin:roadmap.modals.decline.title"
          components={{ em: <em /> }}
        />
      }
      onClose={close}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            {t("admin:common.cancel")}
          </Button>
          <Button variant="danger" onClick={confirm} disabled={pending}>
            {t("admin:roadmap.modals.decline.confirmCta")}
          </Button>
        </>
      }
    >
      {idea && (
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>
              {t("admin:roadmap.modals.decline.ideaLabel")}
            </span>
            <span className={styles.metaValue}>{idea.text}</span>
          </div>
        </div>
      )}

      <div className={styles.groupLabel}>
        {t("admin:roadmap.modals.decline.reasonLabel")}
      </div>
      <RadioCardGroup<RoadmapDeclineReason>
        className={styles.optionList}
        optionClassName={styles.optionCard}
        checkedClassName={styles.optionCardOn}
        ariaLabel={t("admin:roadmap.modals.decline.reasonLabel")}
        value={reasonKey}
        onChange={pickReason}
        options={DECLINE_REASONS.map((reason) => ({
          id: reason.key,
          render: <span className={styles.optionTitle}>{t(reason.labelKey)}</span>,
        }))}
      />

      <FormField
        className={styles.field}
        label={t("admin:roadmap.modals.decline.publishedWordingLabel")}
        helper={t("admin:roadmap.modals.decline.publishedWordingHint")}
        required
      >
        <textarea value={note} onChange={(event) => setNote(event.target.value)} />
      </FormField>
    </AdminModal>
  );
}
