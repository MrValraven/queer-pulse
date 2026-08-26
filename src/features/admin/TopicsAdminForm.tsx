import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import { useCreateTopic, useUpdateTopic } from "./api/TopicsAdminHooks";
import type { AdminTopicDTO } from "./api/topicsAdmin.api";
import styles from "./TopicsAdminPage.module.css";

const FORM_ID = "admin-topic-form";

/** The same shape `topics/dto/topic-slug.param.ts` and `CreateTopicDto`
 *  enforce, checked here so a typo is caught before the round trip. */
const TAG_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";
const TAG_MAX_LENGTH = 64;
const DESCRIPTION_MAX_LENGTH = 2000;

interface TopicDraft {
  tag: string;
  label: string;
  description: string;
  isCrisisCard: boolean;
}

function draftFrom(topic: AdminTopicDTO | null): TopicDraft {
  return {
    tag: topic?.tag ?? "",
    label: topic?.label ?? "",
    description: topic?.description ?? "",
    isCrisisCard: topic?.isCrisisCard ?? false,
  };
}

/**
 * Create/edit modal for one topic. `topic` is null for "New topic" and the
 * existing record for "Edit".
 *
 * The tag is read-only once the topic exists: it is the page's URL
 * (`/topic/:tag`), the key every follow is stored under, and the hashtag
 * already written into posts. Changing it would orphan all three at once, so
 * the backend refuses it and the field says why.
 */
export function TopicsAdminForm({
  topic,
  onClose,
}: {
  topic: AdminTopicDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const [draft, setDraft] = useState<TopicDraft>(() => draftFrom(topic));
  const isEditing = topic !== null;
  const isSaving = createTopic.isPending || updateTopic.isPending;

  function patch(changes: Partial<TopicDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const label = draft.label.trim();
    const description = draft.description.trim();
    const onError = (cause: unknown) =>
      showToast(
        describeError(
          t("admin:topics.form.saveError"),
          cause,
          t("shared:apiError.tryAgainTail"),
        ),
        "error",
      );

    if (topic) {
      updateTopic.mutate(
        {
          id: topic.id,
          body: { label, description, isCrisisCard: draft.isCrisisCard },
        },
        {
          onSuccess: () => {
            showToast(
              t("admin:topics.toast.updated", { tag: topic.tag }),
              "success",
            );
            onClose();
          },
          onError,
        },
      );
      return;
    }

    const tag = draft.tag.trim().replace(/^#/, "").toLowerCase();
    createTopic.mutate(
      { tag, label, description, isCrisisCard: draft.isCrisisCard },
      {
        onSuccess: () => {
          showToast(t("admin:topics.toast.created", { tag }), "success");
          onClose();
        },
        onError,
      },
    );
  }

  return (
    <AdminModal
      eyebrow={t("admin:topics.eyebrow")}
      title={isEditing ? `#${draft.tag}` : t("admin:topics.form.createTitle")}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={isSaving}
          >
            {isEditing
              ? t("admin:common.saveChanges")
              : t("admin:topics.form.createCta")}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={styles.editorGrid} onSubmit={handleSubmit}>
        <div>
          <label className={styles.fieldLabel} htmlFor="admin-topic-tag">
            {t("admin:topics.form.tagField")}
          </label>
          <input
            id="admin-topic-tag"
            className={styles.textInput}
            value={draft.tag}
            maxLength={TAG_MAX_LENGTH}
            pattern={TAG_PATTERN}
            required
            readOnly={isEditing}
            onChange={(event) =>
              patch({ tag: event.target.value.toLowerCase() })
            }
          />
          <p className={styles.fieldHint}>
            {t(
              isEditing
                ? "admin:topics.form.tagLockedHint"
                : "admin:topics.form.tagHint",
            )}
          </p>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="admin-topic-label">
            {t("admin:topics.form.labelField")}
          </label>
          <input
            id="admin-topic-label"
            className={styles.textInput}
            value={draft.label}
            maxLength={120}
            required
            onChange={(event) => patch({ label: event.target.value })}
          />
          <p className={styles.fieldHint}>{t("admin:topics.form.labelHint")}</p>
        </div>

        <div className={styles.fieldGroupWide}>
          <label
            className={styles.fieldLabel}
            htmlFor="admin-topic-description"
          >
            {t("admin:topics.form.descriptionField")}
          </label>
          <textarea
            id="admin-topic-description"
            className={styles.textarea}
            rows={5}
            value={draft.description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            required
            onChange={(event) => patch({ description: event.target.value })}
          />
          <p className={styles.fieldHint}>
            {t("admin:topics.form.descriptionHint")}
          </p>
        </div>

        <div className={styles.fieldGroupWide}>
          <label className={styles.checkRow} htmlFor="admin-topic-crisis">
            <input
              id="admin-topic-crisis"
              type="checkbox"
              checked={draft.isCrisisCard}
              onChange={(event) =>
                patch({ isCrisisCard: event.target.checked })
              }
            />
            <span>{t("admin:topics.form.crisisField")}</span>
          </label>
          <p className={styles.fieldHint}>
            {t("admin:topics.form.crisisHint")}
          </p>
        </div>
      </form>
    </AdminModal>
  );
}
