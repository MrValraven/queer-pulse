import { useMemo, useState, type FormEvent } from "react";
import { Modal, Button, Select } from "../../shared/components/ui";
import { FormField } from "../../shared/components/ui/FormField";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityType } from "../homepage/data/types";
import type { AccessTier } from "./membership.types";
import type { CommunityDraft } from "./startCommunity/startCommunity.data";
import {
  ACCESS_OPTIONS,
  CATEGORY_OPTIONS,
  FEATURE_OPTIONS,
  MAX_WELCOME_MESSAGE_LENGTH,
} from "./startCommunity/startCommunity.data";
import { MAX_COMMUNITY_TAGS } from "./communityTags.data";
import { CommunityTagPicker } from "./CommunityTagPicker";
import { SuggestCommunityTagModal } from "./SuggestCommunityTagModal";
import {
  editableToDraft,
  draftToUpdateDto,
  type EditableCommunityFields,
} from "./api/communities.adapters";
import { useUpdateCommunity } from "./api/useCommunityMutations";
import { useCommunityForm } from "./startCommunity/useCommunityForm";
import { EditCommunityRules } from "./EditCommunityRules";
import { EditCommunityChangeSummary } from "./EditCommunityChangeSummary";
import { diffCommunityUpdates } from "./editCommunityChanges";
import {
  CommunityCardPreview,
  type CommunityCardStats,
} from "./CommunityCardPreview";
import { ImageUploadField } from "../subprofiles/ImageUploadField";
import { useDiscardableUploads } from "../members/api/useDiscardableUploads";
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
  onClose,
  onSaved,
}: EditCommunityModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
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
  const updateCommunity = useUpdateCommunity();
  const [error, setError] = useState(false);
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

  const missingRequired =
    !draft.name.trim() ||
    !draft.tagline.trim() ||
    !draft.purpose.trim() ||
    !draft.whoFor.trim() ||
    !draft.type ||
    !draft.accessTier ||
    // A community keeps at least one shared value — the same floor the
    // Start-a-Community wizard enforces, so editing can't strip it below that.
    draft.rules.length === 0;

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
    setError(false);
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
        onError: () => setError(true),
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

interface EditCommunityFieldsProps {
  draft: CommunityDraft;
  set: (patch: Partial<CommunityDraft>) => void;
  toggleFeature: (id: string, locked?: boolean) => void;
  addRule: (text: string) => void;
  toggleRule: (rule: string) => void;
  error: boolean;
  onSuggestTag: () => void;
  /** False for a community mod: the backend now 403s a non-owner changing
   *  `accessTier`/`rosterVisible`, so those controls render read-only rather
   *  than letting a mod submit into a guaranteed failure. */
  canChangeAccess: boolean;
  /** Hand the locally renderable URL of a freshly picked cover/mark up to the
   *  card preview. `onChange` alone only yields the storage key, which the
   *  preview's `<img>` cannot fetch — so without these the owner picks a photo,
   *  sees it in the field, and watches the card beside it stay broken. */
  onCoverPreviewChange: (previewUrl: string | null) => void;
  onAvatarPreviewChange: (previewUrl: string | null) => void;
  /** Report a key freshly uploaded from the device, so the modal can delete it
   *  again if the member closes without saving. */
  onUploaded: (key: string) => void;
}

/** The form body, split out so the modal shell stays well under 200 lines. */
function EditCommunityFields({
  draft,
  set,
  toggleFeature,
  addRule,
  toggleRule,
  error,
  onSuggestTag,
  canChangeAccess,
  onCoverPreviewChange,
  onAvatarPreviewChange,
  onUploaded,
}: EditCommunityFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      <FormField label={t("communities:edit.field.name")} required>
        <input
          type="text"
          value={draft.name}
          onChange={(event) => set({ name: event.target.value })}
        />
      </FormField>

      <FormField label={t("communities:edit.field.tagline")} required>
        <input
          type="text"
          value={draft.tagline}
          onChange={(event) => set({ tagline: event.target.value })}
        />
      </FormField>

      <FormField
        label={t("communities:edit.field.cover")}
        helper={t("communities:edit.field.coverHint")}
      >
        <ImageUploadField
          kind="community-cover"
          value={draft.coverImageUrl}
          onChange={(coverImageUrl) => set({ coverImageUrl })}
          onPreviewChange={(previewUrl) => onCoverPreviewChange(previewUrl)}
          onUploaded={onUploaded}
          size={150}
          placeholder={draft.name || t("communities:edit.field.cover")}
        />
      </FormField>

      <FormField
        label={t("communities:edit.field.avatar")}
        helper={t("communities:edit.field.avatarHint")}
      >
        <ImageUploadField
          kind="community-avatar"
          circle
          value={draft.avatarImageUrl}
          onChange={(avatarImageUrl) => set({ avatarImageUrl })}
          onPreviewChange={(previewUrl) => onAvatarPreviewChange(previewUrl)}
          onUploaded={onUploaded}
          size={112}
          placeholder={draft.name || t("communities:edit.field.avatar")}
        />
      </FormField>

      <FormField label={t("communities:edit.field.type")} required>
        <Select
          value={draft.type}
          onChange={(value) => set({ type: value as CommunityType })}
          options={CATEGORY_OPTIONS.map((option) => ({
            value: option.type,
            label: t(option.labelKey),
          }))}
        />
      </FormField>

      <FormField label={t("communities:edit.field.whoFor")} required>
        <textarea
          value={draft.whoFor}
          onChange={(event) => set({ whoFor: event.target.value })}
        />
      </FormField>

      <FormField label={t("communities:edit.field.purpose")} required>
        <textarea
          value={draft.purpose}
          onChange={(event) => set({ purpose: event.target.value })}
        />
      </FormField>

      <FormField
        label={t("communities:edit.field.access")}
        required
        helper={
          canChangeAccess ? undefined : t("communities:edit.ownerOnlyHint")
        }
      >
        <Select
          value={draft.accessTier}
          disabled={!canChangeAccess}
          onChange={(value) => set({ accessTier: value as AccessTier })}
          options={ACCESS_OPTIONS.map((option) => ({
            value: option.tier,
            label: t(option.nameKey),
          }))}
        />
      </FormField>

      <FormField
        label={t("communities:edit.field.welcome")}
        helper={t("communities:edit.field.welcomeHint")}
      >
        <textarea
          value={draft.welcomeMessage}
          maxLength={MAX_WELCOME_MESSAGE_LENGTH}
          placeholder={t("communities:edit.field.welcomePlaceholder")}
          onChange={(event) => set({ welcomeMessage: event.target.value })}
        />
      </FormField>

      <CommunityTagPicker
        label={t("communities:edit.field.tags")}
        helper={t("communities:edit.field.tagsHint", {
          count: MAX_COMMUNITY_TAGS,
        })}
        selectedIds={draft.tags}
        onChange={(tags) => set({ tags })}
      />

      <Button
        variant="ghost"
        size="sm"
        className={styles.suggestTagTrigger}
        onClick={onSuggestTag}
      >
        {t("communities:edit.suggestTag.trigger")}
      </Button>

      <div className={styles.block}>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={draft.rosterVisible}
            disabled={!canChangeAccess}
            onChange={(event) => set({ rosterVisible: event.target.checked })}
          />
          <span className={styles.checkText}>
            {t("communities:edit.field.rosterVisible")}
            {!canChangeAccess && (
              <span className={styles.ownerOnlyHint}>
                {" "}
                {t("communities:edit.ownerOnlyHint")}
              </span>
            )}
          </span>
        </label>
      </div>

      <fieldset className={[styles.block, styles.fieldset].join(" ")}>
        <legend className={styles.legend}>
          {t("communities:edit.field.features")}
        </legend>
        <div className={styles.featureList}>
          {FEATURE_OPTIONS.map((option) => (
            <label key={option.id} className={styles.featureRow}>
              <input
                type="checkbox"
                checked={draft.features.includes(option.id)}
                disabled={option.locked}
                onChange={() => toggleFeature(option.id, option.locked)}
              />
              <span className={styles.featureText}>{t(option.labelKey)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={[styles.block, styles.blockSpaced].join(" ")}>
        <span className={styles.blockLabel}>
          {t("communities:edit.field.rules")}{" "}
          <span className={styles.req} aria-hidden>
            *
          </span>
        </span>
        <EditCommunityRules
          rules={draft.rules}
          onAdd={addRule}
          onRemove={toggleRule}
        />
      </div>

      {error && (
        <p className={styles.alert} role="alert">
          {t("communities:edit.toast.error")}
        </p>
      )}
    </>
  );
}
