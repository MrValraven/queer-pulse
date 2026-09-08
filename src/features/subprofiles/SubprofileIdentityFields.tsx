import { FormField } from "../../shared/components/ui";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ImageUploadField } from "./ImageUploadField";
import { MIN_BIO } from "./subprofileEditor.data";

interface SubprofileIdentityFieldsProps {
  avatarUrl: string;
  onAvatarUrlChange: (value: string) => void;
  onAvatarPreviewChange: (value: string | null) => void;
  /** Saved reframe crop for the committed `avatarUrl` — `ImageUploadField`
   *  overlays a fresh pick's own crop internally, so this only needs the
   *  saved value. */
  avatarCrop?: CropRect;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  nameMissing: boolean;
  tagline: string;
  onTaglineChange: (value: string) => void;
  bio: string;
  onBioChange: (value: string) => void;
}

/**
 * The persona's core identity controls: avatar, display name, tagline, and
 * bio (with a live count against the 80-char publish minimum). Renders the
 * editor's "Identity" rail pane body, fed by `useSubprofileMetaEditor`'s
 * state (via `EditorPaneRouter`). Purely controlled — the parent owns state
 * and the PATCH.
 */
export function SubprofileIdentityFields({
  avatarUrl,
  onAvatarUrlChange,
  onAvatarPreviewChange,
  avatarCrop,
  displayName,
  onDisplayNameChange,
  nameMissing,
  tagline,
  onTaglineChange,
  bio,
  onBioChange,
}: SubprofileIdentityFieldsProps) {
  const { t } = useTranslation();

  // The bio's 80-char floor is a publish MINIMUM, not a cap — frame the counter
  // as "how many more to publish" and count trimmed length (whitespace padding
  // never satisfies the server's own trimmed check).
  const bioLength = bio.trim().length;
  const bioRemaining = Math.max(0, MIN_BIO - bioLength);
  const bioAside =
    bioRemaining > 0
      ? t("subprofiles:metaForm.bioMinRemaining", { count: bioRemaining })
      : t("subprofiles:metaForm.bioMinMet");

  return (
    <>
      <FormField label={t("subprofiles:metaForm.avatarLabel")}>
        <ImageUploadField
          value={avatarUrl}
          crop={avatarCrop}
          kind="avatar"
          circle
          size={120}
          placeholder={t("subprofiles:metaForm.avatarPlaceholder")}
          onChange={onAvatarUrlChange}
          onPreviewChange={onAvatarPreviewChange}
        />
      </FormField>

      <FormField
        label={t("subprofiles:metaForm.displayNameLabel")}
        required
        error={
          nameMissing ? t("subprofiles:metaForm.displayNameError") : undefined
        }
      >
        <input
          value={displayName}
          placeholder={t("subprofiles:metaForm.displayNamePlaceholder")}
          onChange={(event) => onDisplayNameChange(event.target.value)}
        />
      </FormField>

      <FormField
        label={t("subprofiles:metaForm.taglineLabel")}
        helper={t("subprofiles:metaForm.taglineHelper")}
      >
        <input
          value={tagline}
          placeholder={t("subprofiles:metaForm.taglinePlaceholder")}
          onChange={(event) => onTaglineChange(event.target.value)}
        />
      </FormField>

      {/* MentionTextarea is FormField's ONLY child here: `wireableControl`
          bails on a multi-child field and silently stops wiring the label and
          helper, so keep any commentary outside the element.
          `aria-label` repeats the FormField label's exact words, since it wins
          over the field's own <label htmlFor> for the accessible name and
          anything else would rename this box for screen readers only.
          No `autoGrow`: FormField gives its textareas a fixed `min-height`
          with `resize: none`, and this box scrolled before. */}
      <FormField
        label={t("subprofiles:metaForm.bioLabel")}
        labelAside={bioAside}
        helper={t("subprofiles:metaForm.bioHelper")}
      >
        <MentionTextarea
          value={bio}
          rows={4}
          placeholder={t("subprofiles:metaForm.bioPlaceholder")}
          aria-label={t("subprofiles:metaForm.bioLabel")}
          onChange={onBioChange}
        />
      </FormField>
    </>
  );
}
