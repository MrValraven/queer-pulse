import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "../../shared/components/ui";
import { FormField } from "../../shared/components/ui/FormField";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunity } from "./api/useCommunity";
import { useSuggestCommunityTag } from "./api/useCommunityMutations";
import { communityTagRequestsPrefix } from "./api/useCommunityTagRequests";
import { CommunityTagRequestLog } from "./CommunityTagRequestLog";
import styles from "./SuggestCommunityTagModal.module.css";

const LABEL_MAX_LENGTH = 60;
const NOTE_MAX_LENGTH = 300;

/**
 * The small "Suggest a tag" dialog opened from `EditCommunityModal`'s tag
 * field: an owner, co-owner or moderator flags a curated tag that does not
 * exist yet in `COMMUNITY_TAGS`. Nested inside the edit modal (the shared
 * `Modal` stack only closes the topmost on Escape, so this composes safely).
 *
 * ## The log below the form (PRD-150)
 *
 * This used to be fire and forget in the strict sense: the form submitted, the
 * dialog closed, a toast said thanks, and that was the last the community ever
 * saw of the suggestion. There was no record of it anywhere in the product, so
 * an owner could not tell whether anybody had read it, could not tell their own
 * suggestion from a co-moderator's, and filed the same tag again a month later.
 *
 * `CommunityTagRequestLog` is the answer, and it sits here rather than behind a
 * mod-tools rail item because this is the one place in the product where tag
 * suggestions are a subject at all. A sending surface and the record of what it
 * has sent belong together.
 *
 * Which is also why a successful send no longer closes the dialog. It clears
 * the form and refreshes the log instead, so the suggestion the owner just made
 * appears underneath it, marked as waiting to be read. Closing on success would
 * put the confirmation on the far side of a dialog they would have to reopen.
 *
 * The log is honest about what it can promise: a resolved suggestion means an
 * admin has read it, never that the tag now exists.
 */
export function SuggestCommunityTagModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  // The viewer's own roster role, read from the community DTO's `myRole` (the
  // one live source for "what am I here"). It gates the log's request, which
  // the backend serves to owners, co-owners and moderators only. This resolves
  // from the same cache entry the detail page behind this dialog already holds,
  // so it costs no extra request.
  const { myRole } = useCommunity(slug);
  const suggestTag = useSuggestCommunityTag(slug);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  // Sticky rather than read off the mutation: a second suggestion that fails
  // would otherwise flip the dismiss button's label back to "Cancel" after the
  // first one was already sent.
  const [hasSentSuggestion, setHasSentSuggestion] = useState(false);

  const trimmedLabel = label.trim();
  const canSubmit = trimmedLabel.length > 0 && !suggestTag.isPending;

  const submit = () => {
    if (!canSubmit) return;
    const trimmedNote = note.trim();
    suggestTag.mutate(
      { label: trimmedLabel, note: trimmedNote || undefined },
      {
        onSuccess: () => {
          setLabel("");
          setNote("");
          setHasSentSuggestion(true);
          void queryClient.invalidateQueries({
            queryKey: communityTagRequestsPrefix(slug),
          });
          showToast(t("communities:edit.suggestTag.successToast"), "success");
        },
        onError: () =>
          showToast(t("communities:edit.suggestTag.errorToast"), "error"),
      },
    );
  };

  return (
    <Modal
      title={t("communities:edit.suggestTag.title")}
      sub={t("communities:edit.suggestTag.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t(
              hasSentSuggestion
                ? "communities:edit.suggestTag.closeCta"
                : "communities:edit.suggestTag.cancel",
            )}
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={submit}
            disabled={!canSubmit}
          >
            {suggestTag.isPending
              ? t("communities:edit.suggestTag.submitting")
              : t("communities:edit.suggestTag.submit")}
          </Button>
        </>
      }
    >
      <FormField
        label={t("communities:edit.suggestTag.labelField")}
        labelAside={
          <span className={styles.counter}>
            {label.length}/{LABEL_MAX_LENGTH}
          </span>
        }
        required
      >
        <input
          type="text"
          value={label}
          maxLength={LABEL_MAX_LENGTH}
          onChange={(event) => setLabel(event.target.value)}
          placeholder={t("communities:edit.suggestTag.labelPlaceholder")}
        />
      </FormField>

      <FormField
        label={t("communities:edit.suggestTag.noteField")}
        labelAside={
          <span className={styles.counter}>
            {note.length}/{NOTE_MAX_LENGTH}
          </span>
        }
      >
        <textarea
          value={note}
          maxLength={NOTE_MAX_LENGTH}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("communities:edit.suggestTag.notePlaceholder")}
        />
      </FormField>

      <CommunityTagRequestLog slug={slug} viewerRole={myRole} />
    </Modal>
  );
}
