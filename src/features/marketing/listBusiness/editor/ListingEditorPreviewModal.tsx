import { useMemo } from "react";
import { Button, Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { listingDtoToPreviewPlace } from "../../../admin/api/listingPreviewPlace";
import { DirectorySpaceView } from "../../DirectorySpaceView";
import type {
  ListingDraft,
  MissingField,
  PhotoKey,
} from "../listBusiness.data";
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
 * It opens `full` so the page body gets past its 760px container collapse and
 * shows the real two-column layout (main column plus the visit rail) that
 * visitors see on desktop, instead of the squeezed one-column fallback.
 *
 * A CO-MANAGER gets the same preview with one caveat said out loud: the "who
 * runs it" block is built from the owner's own details, which never reach a
 * co-manager, so it is blank here and correct on the real page. Saying so is
 * better than letting them think their edit emptied it.
 *
 * The footer saves from here with the save bar's own rules (blocked while a
 * required field is empty), so an owner who likes what they see can publish
 * it without closing the preview and finding the bar again.
 */
export function ListingEditorPreviewModal({
  draft,
  photoPreviews,
  slug,
  isCoManagerView,
  missing,
  isDirty,
  isSaving,
  onSave,
  onClose,
}: {
  draft: ListingDraft;
  photoPreviews: Record<PhotoKey, string>;
  /** The listing's existing public slug. */
  slug: string;
  /** The viewer only co-manages this listing, so the owner block is blank. */
  isCoManagerView: boolean;
  missing: MissingField[];
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
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
      full
      eyebrow={t("marketing:listBusiness.editor.preview.eyebrow")}
      title={draft.name || t("marketing:listBusiness.preview.placeholderName")}
      sub={t(
        isCoManagerView
          ? "marketing:listBusiness.editor.preview.subCoManager"
          : "marketing:listBusiness.editor.preview.sub",
      )}
      footer={
        <ListingEditorPreviewFooter
          missing={missing}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={onSave}
          onClose={onClose}
        />
      }
      onClose={onClose}
    >
      <div className={styles.previewFrame}>
        <DirectorySpaceView place={place} preview />
      </div>
    </Modal>
  );
}

/** Where the edit stands, a way back to the form, and save. */
function ListingEditorPreviewFooter({
  missing,
  isDirty,
  isSaving,
  onSave,
  onClose,
}: {
  missing: MissingField[];
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isBlocked = missing.length > 0;
  const stateKey = isBlocked
    ? "marketing:listBusiness.paneActions.blockedTitle"
    : isDirty
      ? "marketing:listBusiness.editor.unsavedChanges"
      : "marketing:listBusiness.editor.noChanges";

  return (
    <>
      <span className={styles.previewFootState} aria-live="polite">
        {t(stateKey)}
      </span>
      <Button variant="ghost" onClick={onClose}>
        {t("marketing:listBusiness.editor.preview.keepEditing")}
      </Button>
      <Button
        variant="primary"
        onClick={onSave}
        disabled={!isDirty || isBlocked || isSaving}
      >
        {t("marketing:listBusiness.edit.saveCta")}
      </Button>
    </>
  );
}
