import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useGovernanceMotionCompose } from "./api/useGovernanceProposals";

const TITLE_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 2000;

/**
 * "Put something to a vote": the member-facing half of GOV-01. Any signed-in
 * member can file a motion here. It does not go straight to a ballot, and the
 * sub-line says so plainly, because a form that quietly parks your motion in
 * a queue is how people conclude governance is decorative.
 *
 * Built on the shared `Modal` + `FormField` pair, following
 * `SuggestCommunityTagModal`: the caller mounts this only while open, and a
 * successful submit closes it and confirms with a toast.
 */
export function MotionComposeModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const compose = useGovernanceMotionCompose();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const canSubmit =
    trimmedTitle.length > 0 &&
    trimmedDescription.length > 0 &&
    !compose.isPending;

  const submit = () => {
    if (!canSubmit) return;
    compose.mutate(
      { title: trimmedTitle, description: trimmedDescription },
      {
        onSuccess: () => {
          onClose();
          showToast(
            t("governance:sections.proposals.compose.successToast"),
            "success",
          );
        },
        onError: () =>
          showToast(
            t("governance:sections.proposals.compose.errorToast"),
            "error",
          ),
      },
    );
  };

  return (
    <Modal
      eyebrow={t("governance:sections.proposals.compose.eyebrow")}
      title={t("governance:sections.proposals.compose.title")}
      sub={t("governance:sections.proposals.compose.sub")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={compose.isPending}
          >
            {t("governance:sections.proposals.compose.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={submit}
            disabled={!canSubmit}
          >
            {compose.isPending
              ? t("governance:sections.proposals.compose.submitting")
              : t("governance:sections.proposals.compose.submit")}
          </Button>
        </>
      }
    >
      <FormField
        label={t("governance:sections.proposals.compose.titleField")}
        labelAside={`${title.length}/${TITLE_MAX_LENGTH}`}
        required
      >
        <input
          type="text"
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t(
            "governance:sections.proposals.compose.titlePlaceholder",
          )}
        />
      </FormField>

      <FormField
        label={t("governance:sections.proposals.compose.descriptionField")}
        labelAside={`${description.length}/${DESCRIPTION_MAX_LENGTH}`}
        helper={t("governance:sections.proposals.compose.descriptionHelper")}
        required
      >
        <textarea
          rows={6}
          value={description}
          maxLength={DESCRIPTION_MAX_LENGTH}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t(
            "governance:sections.proposals.compose.descriptionPlaceholder",
          )}
        />
      </FormField>
    </Modal>
  );
}
