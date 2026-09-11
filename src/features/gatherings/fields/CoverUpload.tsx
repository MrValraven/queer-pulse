import { useEffect, useRef } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDiscardableUploads } from "../../members/api/useDiscardableUploads";
import { ImageUploadField } from "../../subprofiles/ImageUploadField";
import { COVER_SLOT_HEIGHT } from "../steps/whatChapter.data";

/**
 * The cover upload as a value and a change handler (ruling R16: the
 * `event-cover` upload kind), shared by the create wizard and the edit-details
 * modal.
 *
 * `value` is what the payload sends: a storage key the host picked, or the
 * resolved URL a saved gathering arrived with. `onPreviewChange` reports what
 * a preview can paint straight away.
 *
 * Uploads are presigned, so a photo lands in the member's library the moment
 * it is confirmed (see `useDiscardableUploads`). A host who uploads one cover,
 * then another, leaves the first behind. When this field unmounts (the wizard
 * swaps to the published screen, the modal to its saved panel, or the host
 * leaves) every fresh upload is taken back except the cover held at that
 * moment. That one is either on the gathering or a photo the host chose last,
 * which stays in their library to reuse next time.
 */
export function CoverUpload({
  value,
  onChange,
  onPreviewChange,
  labelledBy,
}: {
  value: string;
  onChange: (value: string) => void;
  onPreviewChange?: (previewUrl: string) => void;
  /** The id of the visible label that names the upload. */
  labelledBy: string;
}) {
  const { t } = useTranslation();
  const { track, discard } = useDiscardableUploads();
  const currentCoverKeyRef = useRef(value);

  useEffect(() => {
    currentCoverKeyRef.current = value;
  }, [value]);

  useEffect(() => {
    const coverKeyRef = currentCoverKeyRef;
    return () => {
      void discard([coverKeyRef.current]);
    };
  }, [discard]);

  return (
    <div role="group" aria-labelledby={labelledBy}>
      <ImageUploadField
        kind="event-cover"
        value={value}
        onChange={onChange}
        onPreviewChange={
          onPreviewChange
            ? (previewUrl) => onPreviewChange(previewUrl ?? "")
            : undefined
        }
        onUploaded={track}
        size={COVER_SLOT_HEIGHT}
        placeholder={t("gatherings:create.v2.what.coverPlaceholder")}
      />
    </div>
  );
}
