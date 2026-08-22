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
import { ImageUploadField } from "../subprofiles/ImageUploadField";
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
  onClose: () => void;
  onSaved?: () => void;
}

/**
 * Owner/mod edit of a community's info. Seeds the shared wizard-draft shape
 * from the current editable values, then PATCHes (live) or writes the demo
 * override store via `useUpdateCommunity`. Required fields gate the submit.
 */
export function EditCommunityModal({
  slug,
  editable,
  canChangeAccess = true,
  onClose,
  onSaved,
}: EditCommunityModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const initialDraft = useMemo(() => editableToDraft(editable), [editable]);
  const { draft, set, toggleFeature, addRule, toggleRule } =
    useCommunityForm(initialDraft);
  const updateCommunity = useUpdateCommunity();
  const [error, setError] = useState(false);
  const [suggestingTag, setSuggestingTag] = useState(false);

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (missingRequired || updateCommunity.isPending) return;
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
    updateCommunity.mutate(
      { slug, dto },
      {
        onSuccess: () => {
          showToast(t("communities:edit.toast.saved"), "success");
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
        onClose={onClose}
        footer={
          <>
            <Button variant="ghost" type="button" onClick={onClose}>
              {t("communities:edit.cancel")}
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={FORM_ID}
              disabled={missingRequired || updateCommunity.isPending}
            >
              {updateCommunity.isPending
                ? t("communities:edit.saving")
                : t("communities:edit.save")}
            </Button>
          </>
        }
      >
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
          />
        </form>
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
          size={150}
          placeholder={draft.name || t("communities:edit.field.cover")}
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

      <div className={styles.block}>
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
