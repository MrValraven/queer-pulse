import { useId, useMemo, useState, type FormEvent } from "react";
import { Modal, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SuggestCommunityTagModal } from "./SuggestCommunityTagModal";
import {
  editableToDraft,
  draftToUpdateDto,
  type EditableCommunityFields,
} from "./api/communities.adapters";
import { useUpdateCommunity } from "./api/useCommunityMutations";
import { communityErrorText } from "./communityErrors";
import { useCommunityForm } from "./startCommunity/useCommunityForm";
import { EditCommunityFields } from "./EditCommunityFields";
import { EditCommunityChangeSummary } from "./EditCommunityChangeSummary";
import { diffCommunityUpdates } from "./editCommunityChanges";
import { missingRequiredFieldKeys } from "./editCommunityRequired";
import { EditCommunityMissingFields } from "./EditCommunityMissingFields";
import {
  CommunityCardPreview,
  type CommunityCardStats,
} from "./CommunityCardPreview";
import { useDiscardableUploads } from "../members/api/useDiscardableUploads";
import type { EditCommunityFocusField } from "./editCommunityFocusField";
import { useFocusEditFieldOnOpen } from "./useFocusEditFieldOnOpen";
import styles from "./EditCommunityModal.module.css";

const FORM_ID = "edit-community-form";

interface EditCommunityModalProps {
  slug: string;
  editable: EditableCommunityFields;
  /** Owner-only settings. The backend refuses a MOD who changes who can find
   *  the community or whether the member list is visible, so a mod sees them
   *  as read-only rather than editing into a 403. Defaults to true for callers
   *  that only ever open this as the owner. */
  canChangeAccess?: boolean;
  /** Current member count and weekly activity, so the live card preview's
   *  footer matches the real Discover card. Neither is editable here; they
   *  ride along purely so the preview isn't missing lines the card will have. */
  previewStats?: CommunityCardStats;
  /** Scrolls to and focuses this field on open, for the setup checklist. */
  focusField?: EditCommunityFocusField;
  onClose: () => void;
  onSaved?: () => void;
}

/**
 * Owner/mod edit of a community's info. Seeds the shared wizard-draft shape
 * from the current editable values, then PATCHes (live) or writes the demo
 * override store via `useUpdateCommunity`. Required fields gate the submit.
 *
 * The form sits beside a live `CommunityCardPreview` — the real Discover card,
 * redrawn from the draft on every keystroke — because name, tagline, cover,
 * kind, tags and access tier are all *card* decisions, and until now the only
 * way to see what they did to the card was to save and go look.
 */
export function EditCommunityModal({
  slug,
  editable,
  canChangeAccess = true,
  previewStats,
  focusField,
  onClose,
  onSaved,
}: EditCommunityModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  useFocusEditFieldOnOpen(focusField);
  const initialDraft = useMemo(() => editableToDraft(editable), [editable]);
  const {
    draft,
    set,
    toggleFeature,
    addRule,
    toggleRule,
    coverPreviewUrl,
    setCoverPreviewUrl,
    avatarPreviewUrl,
    setAvatarPreviewUrl,
  } = useCommunityForm(initialDraft);
  // The inline alert names the cause, so the global toast would repeat it.
  const updateCommunity = useUpdateCommunity({
    shouldSilenceGlobalError: true,
  });
  // The cause line for a refused save, shown under the form. Null until one.
  const [error, setError] = useState<string | null>(null);
  const [suggestingTag, setSuggestingTag] = useState(false);
  // A pick uploads to storage immediately (presigned PUT), so a cover chosen
  // here and then abandoned would sit in the member's photo library forever.
  // Track what this modal uploaded and drop whatever it doesn't commit.
  const { track: trackUpload, discard: discardUnsavedUploads } =
    useDiscardableUploads();

  /** Leaving without saving: nothing was committed, so every upload made while
   *  this modal was open is an orphan. Best-effort and non-blocking — the modal
   *  closes at once either way. */
  const closeAndDiscardUploads = () => {
    void discardUnsavedUploads();
    onClose();
  };

  const missingFieldKeys = missingRequiredFieldKeys(draft, initialDraft);
  const missingRequired = missingFieldKeys.length > 0;
  const missingNoticeId = useId();

  // Nothing to save until something actually differs. Compared as the very DTO
  // the submit would send rather than field by field, so the check can't drift
  // from what is written, and so draft-only state the form never sends
  // (stewards, invites, handle, tint) can't report a phantom change. Going
  // through `draftToUpdateDto` also trims, which makes a typed-then-deleted
  // space the no-op it looks like.
  const initialDto = useMemo(
    () => draftToUpdateDto(initialDraft),
    [initialDraft],
  );
  // Named field by field rather than as one boolean, because the same
  // comparison answers two questions: whether Save does anything, and what it
  // is about to do. `changes` being empty IS `isUnchanged`, so the summary and
  // the button can never disagree about whether this form has been touched.
  const changes = useMemo(
    () => diffCommunityUpdates(initialDto, draftToUpdateDto(draft)),
    [initialDto, draft],
  );
  const isUnchanged = changes.length === 0;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (missingRequired || isUnchanged || updateCommunity.isPending) return;
    setError(null);
    const dto = draftToUpdateDto(draft);
    // Only send the cover when it actually changed. Re-sending an UNCHANGED
    // cover would replay the original uploader's storage key — and the backend's
    // StorageKeyOwnershipInterceptor 403s a PATCH that references someone else's
    // key, so a mod (who didn't upload the owner's cover) saving any other edit
    // would fail. A freshly picked cover is a new key the editor owns, so
    // sending that is fine; clearing sends "".
    if (draft.coverImageUrl === initialDraft.coverImageUrl) {
      delete dto.coverImageUrl;
    }
    // The avatar carries the same ownership caveat as the cover above, for the
    // same reason: an unchanged value is the ORIGINAL uploader's storage key,
    // and replaying it is what turns a moderator's unrelated edit into a 403.
    if (draft.avatarImageUrl === initialDraft.avatarImageUrl) {
      delete dto.avatarImageUrl;
    }
    updateCommunity.mutate(
      { slug, dto },
      {
        onSuccess: () => {
          showToast(t("communities:edit.toast.saved"), "success");
          // The cover and mark just saved are keepers; anything else uploaded
          // here was superseded by a later pick and is now an orphan. The two
          // keepers are referenced by the community as of the PATCH above, so
          // even a raced attempt on them is refused server-side (409).
          void discardUnsavedUploads([
            draft.coverImageUrl,
            draft.avatarImageUrl,
          ]);
          onSaved?.();
          onClose();
        },
        onError: (saveError) => setError(communityErrorText(t, saveError)),
      },
    );
  };

  return (
    <>
      <Modal
        title={t("communities:edit.title")}
        eyebrow={t("communities:edit.eyebrow")}
        onClose={closeAndDiscardUploads}
        className={styles.dialog}
        footer={
          <>
            {/* Ahead of the buttons so the wrapping footer puts it on its own
                full-width line directly above Save, where it is read before
                the press rather than discovered after it. */}
            <EditCommunityMissingFields
              id={missingNoticeId}
              labelKeys={missingFieldKeys}
            />
            <EditCommunityChangeSummary changes={changes} />
            <Button
              variant="ghost"
              type="button"
              onClick={closeAndDiscardUploads}
            >
              {t("communities:edit.cancel")}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={FORM_ID}
              aria-describedby={missingRequired ? missingNoticeId : undefined}
              disabled={
                missingRequired || isUnchanged || updateCommunity.isPending
              }
            >
              {updateCommunity.isPending
                ? t("communities:edit.saving")
                : t("communities:edit.save")}
            </Button>
          </>
        }
      >
        <div className={styles.layout}>
          {/* Ahead of the form in the DOM so the stacked (mobile) order puts
              the card on top, where it is visible without scrolling the whole
              settings column first. On desktop the grid places it right. */}
          <aside
            className={styles.preview}
            aria-label={t("communities:edit.preview.title")}
          >
            <span className={styles.previewLabel}>
              {t("communities:edit.preview.title")}
            </span>
            <div className={styles.previewStage}>
              <CommunityCardPreview
                slug={slug}
                draft={draft}
                coverPreviewUrl={coverPreviewUrl}
                avatarPreviewUrl={avatarPreviewUrl}
                {...previewStats}
              />
            </div>
            <p className={styles.previewHint}>
              {t("communities:edit.preview.hint")}
            </p>
          </aside>

          <form id={FORM_ID} onSubmit={onSubmit} className={styles.form}>
            <EditCommunityFields
              draft={draft}
              set={set}
              toggleFeature={toggleFeature}
              addRule={addRule}
              toggleRule={toggleRule}
              error={error}
              onSuggestTag={() => setSuggestingTag(true)}
              canChangeAccess={canChangeAccess}
              onCoverPreviewChange={setCoverPreviewUrl}
              onAvatarPreviewChange={setAvatarPreviewUrl}
              onUploaded={trackUpload}
            />
          </form>
        </div>
      </Modal>

      {suggestingTag && (
        <SuggestCommunityTagModal
          slug={slug}
          onClose={() => setSuggestingTag(false)}
        />
      )}
    </>
  );
}
