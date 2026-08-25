import { useEffect, useMemo, useRef, useState } from "react";
import { useProfileData } from "../../../../app/providers/useProfile";
import { usePrefersReducedMotion } from "../../../../shared/hooks/usePrefersReducedMotion";
import { useUploadImage } from "../../../members/api/useUploadImage";
import type { ManagedListingDTO } from "../api/listings.api";
import { dtoToDraft } from "../dtoToDraft";
import { flashField, resolveListing422 } from "../listing422";
import { SendingPanel } from "../ListBusinessChrome";
import { useEditListingSave, useEditUnsavedGuard } from "../useEditListingSave";
import { useListingForm } from "../useListingForm";
import {
  editorSectionsFor,
  LISTING_EDITOR_SECTION_IDS,
} from "./listingEditor.data";
import { flattenEditorMissing } from "./listingEditorMissing";
import { jumpToEditorSection } from "./jumpToEditorSection";
import { useActiveEditorSection } from "./useActiveEditorSection";
import { useListingEditorAutosave } from "./useListingEditorAutosave";
import { ListingEditorNotices } from "./ListingEditorNotices";
import { ListingEditorPreviewModal } from "./ListingEditorPreviewModal";
import { ListingEditorSaveBar } from "./ListingEditorSaveBar";
import { ListingEditorSections } from "./ListingEditorSections";
import { ListingEditorSectionNav } from "./ListingEditorSectionNav";
import pageStyles from "../ListBusinessPage.module.css";
import styles from "./ListingEditor.module.css";

/**
 * The owner's listing editor: every field on one scrollable page, with a jump
 * nav and a save bar that travels with them.
 *
 * The create flow stays a guided wizard, which genuinely helps a first
 * submission. Editing is a different job: someone arrives to change one line
 * and should not walk a six-step sequence to reach it. Both surfaces render
 * the same field components (see `../fields`), so there is one copy of every
 * input and one set of validation rules behind them.
 *
 * It serves both roles. A CO-MANAGER gets the same page minus the owner's own
 * personal fields and minus the delete, which is offered on the account
 * profile's places grid and gated there. The role is said plainly at the top,
 * because otherwise somebody else's business reads exactly like your own.
 */
export function ListingEditor({ listing }: { listing: ManagedListingDTO }) {
  const { profile } = useProfileData();
  const prefersReducedMotion = usePrefersReducedMotion();
  const userName = `${profile.first} ${profile.last}`;
  const sections = editorSectionsFor(listing.managementRole === "co_manager");
  // Stable across renders so the form's dirty comparison and the unsaved guard
  // both measure against the version that actually loaded.
  const initialDraft = useMemo(() => dtoToDraft(listing), [listing]);
  const form = useListingForm(initialDraft);
  const { draft } = form;
  const uploadPhoto = useUploadImage("listing-photo");
  const editSave = useEditListingSave({
    editRef: listing.ref,
    editSlug: listing.slug,
    editStatus: listing.status,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const activeSectionId = useActiveEditorSection(LISTING_EDITOR_SECTION_IDS);

  // Every still-unfilled required field across the whole listing, in page
  // order: `useListingForm` still gates step by step, and this is that same
  // capability read as one list because the page is now one screen.
  const missing = useMemo(
    () => flattenEditorMissing(form.missing),
    [form.missing],
  );
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft],
  );
  useEditUnsavedGuard(true, draft, initialDraft, !isSaving);

  // A long edit had exactly one exit before this: save everything, or lose
  // everything. The local copy is per listing and per member, and it is only
  // ever OFFERED, so what the server holds is never quietly replaced.
  const autosave = useListingEditorAutosave({
    listingRef: listing.ref,
    draft,
    initialDraft,
    isDirty,
  });
  // Bound once so the restore handler cannot read a null between the guard and
  // the click.
  const { restorable } = autosave;

  // Guard against setState after unmount mid-save. Reset on setup so
  // StrictMode's mount to remount cycle never leaves the ref stuck at false.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const save = async () => {
    if (missing.length > 0) return;
    setServerError(null);
    setIsSaving(true);
    try {
      // Clear the local copy the moment the edit is genuinely on the server:
      // holding it any longer would offer to "restore" what is now published.
      autosave.clearAutosave();
      await editSave.saveEdit(draft);
    } catch (error) {
      if (!isMountedRef.current) return;
      setIsSaving(false);
      // A typed 422 names the offending field: surface the server's own
      // message and flash that field, which on one screen is all the routing
      // this needs. Anything else is a plain save failure.
      const target = resolveListing422(error);
      if (target) {
        setServerError(target.message);
        window.setTimeout(
          () => flashField(target.anchor, pageStyles.fieldFlash),
          80,
        );
        return;
      }
      editSave.showSaveError();
    }
  };

  if (isSaving) {
    return (
      <div className="wrap">
        <SendingPanel isEdit />
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className={pageStyles.page}>
        <ListingEditorNotices
          listing={listing}
          restorable={restorable}
          onRestore={() => {
            if (!restorable) return;
            form.reset(restorable.draft);
            autosave.dismissRestorable();
          }}
          onDiscardRestorable={autosave.discardRestorable}
          serverError={serverError}
          onDismissServerError={() => setServerError(null)}
        />

        <div className={styles.layout}>
          <ListingEditorSectionNav
            sections={sections}
            activeSectionId={activeSectionId}
            missing={missing}
            onJump={(sectionId) =>
              jumpToEditorSection(sectionId, prefersReducedMotion)
            }
          />

          <div className={styles.main}>
            <ListingEditorSections
              form={form}
              listing={listing}
              userName={userName}
              uploadPhoto={uploadPhoto}
            />
            <ListingEditorSaveBar
              missing={missing}
              isDirty={isDirty}
              isSaving={isSaving}
              onPreview={() => setIsPreviewOpen(true)}
              onSave={() => void save()}
            />
          </div>
        </div>
      </div>

      {isPreviewOpen && (
        <ListingEditorPreviewModal
          draft={draft}
          photoPreviews={form.photoPreviews}
          slug={listing.slug}
          isCoManagerView={listing.managementRole === "co_manager"}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
