import { useTranslation } from "../../shared/i18n/useTranslation";
import { EditDetailsGroup } from "./EditDetailsSection";
import { CoverUpload } from "./fields/CoverUpload";

/**
 * The cover photo in the edit-details modal.
 *
 * The draft opens on the resolved URL the saved gathering arrived with, and a
 * pick replaces it with a storage key. `buildEditPatch` sends the cover only
 * when the two differ, so an untouched cover says nothing to the server.
 * Removing the photo leaves `""`, which the server reads as no cover.
 */
export function EditDetailsCover({
  coverImageUrl,
  onChange,
  className,
}: {
  coverImageUrl: string;
  onChange: (coverImageUrl: string) => void;
  /** Added to the group's wrapper, so the section can place it. */
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <EditDetailsGroup
      className={className}
      label={t("gatherings:create.v2.what.coverLabel")}
      hint={t("gatherings:create.v2.what.coverHint")}
    >
      {({ labelId }) => (
        <CoverUpload
          value={coverImageUrl}
          onChange={onChange}
          labelledBy={labelId}
        />
      )}
    </EditDetailsGroup>
  );
}
