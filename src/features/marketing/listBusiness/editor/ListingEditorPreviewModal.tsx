import { useMemo } from "react";
import { Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { listingDtoToPreviewPlace } from "../../../admin/api/listingPreviewPlace";
import { DirectorySpaceView } from "../../DirectorySpaceView";
import type { ListingDraft, PhotoKey } from "../listBusiness.data";
import { listingDraftToPreviewSource } from "./listingDraftPreviewSource";
import styles from "./ListingEditor.module.css";

/**
 * The owner's full-page preview: the real directory detail body, read-only,
 * built from the draft currently in the editor.
 *
 * This is the same machinery the moderator drawer uses (`DirectorySpaceView`
 * behind its `preview` flag, fed by `listingDtoToPreviewPlace`), so an owner
 * and a moderator are looking at the same page.
 *
 * A CO-MANAGER gets the same preview with one caveat said out loud: the "who
 * runs it" block is built from the owner's own details, which never reach a
 * co-manager, so it is blank here and correct on the real page. Saying so is
 * better than letting them think their edit emptied it.
 */
export function ListingEditorPreviewModal({
  draft,
  photoPreviews,
  slug,
  isCoManagerView,
  onClose,
}: {
  draft: ListingDraft;
  photoPreviews: Record<PhotoKey, string>;
  /** The listing's existing public slug. */
  slug: string;
  /** The viewer only co-manages this listing, so the owner block is blank. */
  isCoManagerView: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const place = useMemo(
    () =>
      listingDtoToPreviewPlace(
        listingDraftToPreviewSource(draft, slug, photoPreviews),
      ),
    [draft, slug, photoPreviews],
  );

  return (
    <Modal
      wide
      eyebrow={t("marketing:listBusiness.editor.preview.eyebrow")}
      title={draft.name || t("marketing:listBusiness.preview.placeholderName")}
      sub={t(
        isCoManagerView
          ? "marketing:listBusiness.editor.preview.subCoManager"
          : "marketing:listBusiness.editor.preview.sub",
      )}
      onClose={onClose}
    >
      <div className={styles.previewFrame}>
        <DirectorySpaceView place={place} preview />
      </div>
    </Modal>
  );
}
