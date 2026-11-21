import { FormField } from "../../shared/components/ui/FormField";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityDraft } from "./startCommunity/startCommunity.data";
import { ImageUploadField } from "../subprofiles/ImageUploadField";
import { editCommunityFieldId } from "./editCommunityFocusField";

interface EditCommunityImageFieldsProps {
  draft: CommunityDraft;
  set: (patch: Partial<CommunityDraft>) => void;
  onCoverPreviewChange: (previewUrl: string | null) => void;
  onAvatarPreviewChange: (previewUrl: string | null) => void;
  onUploaded: (key: string) => void;
}

/** The cover and avatar upload fields of the edit modal. Each wrapper carries
 *  an `editCommunityFieldId`, so the setup checklist can open onto it. */
export function EditCommunityImageFields({
  draft,
  set,
  onCoverPreviewChange,
  onAvatarPreviewChange,
  onUploaded,
}: EditCommunityImageFieldsProps) {
  const { t } = useTranslation();
  return (
    <>
      <FormField
        id={editCommunityFieldId("cover")}
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
        id={editCommunityFieldId("avatar")}
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
    </>
  );
}
