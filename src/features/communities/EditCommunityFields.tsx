import { Button, Select } from "../../shared/components/ui";
import { FormField } from "../../shared/components/ui/FormField";
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
import { MAX_COMMUNITY_TAGS, READING_GROUP_TAG } from "./communityTags.data";
import { CommunityTagPicker } from "./CommunityTagPicker";
import { EditCommunityNowReadingField } from "./EditCommunityNowReadingField";
import { EditCommunityRules } from "./EditCommunityRules";
import { EditCommunityImageFields } from "./EditCommunityImageFields";
import { editCommunityFieldId } from "./editCommunityFocusField";
import styles from "./EditCommunityModal.module.css";

interface EditCommunityFieldsProps {
  draft: CommunityDraft;
  set: (patch: Partial<CommunityDraft>) => void;
  toggleFeature: (id: string, locked?: boolean) => void;
  addRule: (text: string) => void;
  toggleRule: (rule: string) => void;
  error: string | null;
  onSuggestTag: () => void;
  /** False for a community mod: the backend now 403s a non-owner changing
   *  `accessTier`/`rosterVisible`, so those controls render read-only and a
   *  mod never submits into a guaranteed failure. */
  canChangeAccess: boolean;
  /** Hand the locally renderable URL of a freshly picked cover/mark up to the
   *  card preview. `onChange` alone only yields the storage key, which the
   *  preview's `<img>` cannot fetch. Without these the owner picks a photo,
   *  sees it in the field, and watches the card beside it stay broken. */
  onCoverPreviewChange: (previewUrl: string | null) => void;
  onAvatarPreviewChange: (previewUrl: string | null) => void;
  /** Report a key freshly uploaded from the device, so the modal can delete it
   *  again if the member closes without saving. */
  onUploaded: (key: string) => void;
}

/** The form body, split out so the modal shell stays well under 200 lines. */
export function EditCommunityFields({
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

      <EditCommunityNowReadingField
        value={draft.nowReading}
        onChange={(nowReading) => set({ nowReading })}
        isVisible={draft.tags.includes(READING_GROUP_TAG)}
      />

      <EditCommunityImageFields
        draft={draft}
        set={set}
        onCoverPreviewChange={onCoverPreviewChange}
        onAvatarPreviewChange={onAvatarPreviewChange}
        onUploaded={onUploaded}
      />

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
        id={editCommunityFieldId("welcome")}
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

      <div id={editCommunityFieldId("tags")}>
        <CommunityTagPicker
          label={t("communities:edit.field.tags")}
          helper={t("communities:edit.field.tagsHint", {
            count: MAX_COMMUNITY_TAGS,
          })}
          selectedIds={draft.tags}
          onChange={(tags) => set({ tags })}
        />
      </div>

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
          {error}
        </p>
      )}
    </>
  );
}
