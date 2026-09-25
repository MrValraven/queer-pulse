import { useMemo, useRef, useState } from "react";
import { useProfileData } from "../../../../app/providers/useProfile";
import { usePrefersReducedMotion } from "../../../../shared/hooks/usePrefersReducedMotion";
import { useUploadImage } from "../../../members/api/useUploadImage";
import type { ManagedListingDTO } from "../api/listings.api";
import { dtoToDraft } from "../dtoToDraft";
import { pricingModeOf } from "../listingMenu.data";
import { SendingPanel } from "../ListBusinessChrome";
import { useEditUnsavedGuard } from "../useEditListingSave";
import { useListingForm } from "../useListingForm";
import {
  editorSectionsFor,
  LISTING_EDITOR_SECTION_IDS,
  withPricingModeLabel,
} from "./listingEditor.data";
import { flattenEditorMissing } from "./listingEditorMissing";
import { jumpToEditorSection } from "./jumpToEditorSection";
import { useActiveEditorSection } from "./useActiveEditorSection";
import { useDeleteListingExit } from "./useDeleteListingExit";
import { useEditorHashLanding } from "./useEditorHashLanding";
import { useListingEditorAutosave } from "./useListingEditorAutosave";
import { useListingEditorSave } from "./useListingEditorSave";
import { ListingEditorLivePreview } from "./ListingEditorLivePreview";
import { ListingEditorNotices } from "./ListingEditorNotices";
import { ListingEditorPreviewModal } from "./ListingEditorPreviewModal";
import { ListingEditorSaveBar } from "./ListingEditorSaveBar";
import { ListingEditorSections } from "./ListingEditorSections";
import { ListingEditorSectionNav } from "./ListingEditorSectionNav";
import pageStyles from "../ListBusinessPage.module.css";
import styles from "./ListingEditor.module.css";

/**
 * The owner's listing editor: every field on one scrollable page, with a jump
 * nav and a save bar that travels with them. The create flow stays a guided
 * wizard, which genuinely helps a first submission. Editing is a different
 * job: someone arrives to change one line, and both surfaces render the same
 * field components (see `../fields`), so there is one copy of every input
 * and one set of validation rules behind them.
 *
 * It serves both roles. A CO-MANAGER gets the same page minus the owner's own
 * personal fields and the owner-only Danger zone. The role is said plainly at
 * the top, because otherwise somebody else's business reads exactly like yours.
 */
export function ListingEditor({ listing }: { listing: ManagedListingDTO }) {
  const { profile } = useProfileData();
  const prefersReducedMotion = usePrefersReducedMotion();
  const userName = `${profile.first} ${profile.last}`;
  // Stable across renders so the form's dirty comparison and the unsaved guard
  // both measure against the version that actually loaded.
  const initialDraft = useMemo(() => dtoToDraft(listing), [listing]);
  const form = useListingForm(initialDraft);
  const { draft } = form;
  const pricingMode = pricingModeOf(draft);
  const sections = useMemo(
    () =>
      withPricingModeLabel(
        editorSectionsFor(listing.managementRole === "co_manager"),
        pricingMode,
      ),
    [listing.managementRole, pricingMode],
  );
  const uploadPhoto = useUploadImage("listing-photo");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const activeSectionId = useActiveEditorSection(LISTING_EDITOR_SECTION_IDS);
  useEditorHashLanding(sections, prefersReducedMotion);
  // The fields column, so the live preview can outline where a field shows.
  const fieldsRef = useRef<HTMLDivElement>(null);

  // Every still-unfilled required field, in page order: `useListingForm`
  // gates step by step, read here as one list since the page is one screen.
  const missing = useMemo(
    () => flattenEditorMissing(form.missing),
    [form.missing],
  );
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft],
  );
  // A long edit had one exit before this: save everything or lose it. This
  // local copy is per listing and member, and only ever offered for restore.
  const autosave = useListingEditorAutosave({
    listingRef: listing.ref,
    draft,
    initialDraft,
    isDirty,
  });
  // Bound once so the restore handler can't read a null between the guard
  // and the click.
  const { restorable } = autosave;
  const deleteExit = useDeleteListingExit(listing, autosave.clearAutosave);
  const { isSaving, serverError, dismissServerError, save, saveAndLeave } =
    useListingEditorSave({
      listing,
      form,
      missing,
      clearAutosave: autosave.clearAutosave,
    });
  const isLeaving = isSaving || deleteExit.hasDeleted;
  // "Save and leave" is offered only when the save bar's Save would go
  // through: every required field is filled (the guard adds the form phase).
  useEditUnsavedGuard(
    true,
    draft,
    initialDraft,
    !isLeaving,
    missing.length === 0 ? saveAndLeave : undefined,
  );

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
          onDismissServerError={dismissServerError}
        />

        <div className={styles.layoutFrame}>
          <div className={styles.layout}>
            <ListingEditorSectionNav
              sections={sections}
              activeSectionId={activeSectionId}
              missing={missing}
              onJump={(sectionId) =>
                jumpToEditorSection(sectionId, prefersReducedMotion)
              }
            />

            <div className={styles.main} ref={fieldsRef}>
              <ListingEditorSections
                form={form}
                listing={listing}
                userName={userName}
                uploadPhoto={uploadPhoto}
                onConfirmDelete={deleteExit.confirmDelete}
              />
              <ListingEditorSaveBar
                missing={missing}
                isDirty={isDirty}
                isSaving={isSaving}
                onPreview={() => setIsPreviewOpen(true)}
                onSave={() => void save()}
              />
            </div>

            <ListingEditorLivePreview
              draft={draft}
              photoPreviews={form.photoPreviews}
              fieldsRef={fieldsRef}
              prefersReducedMotion={prefersReducedMotion}
              onOpenFullPreview={() => setIsPreviewOpen(true)}
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
          missing={missing}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={() => {
            // Closed first, so a failed save lands on the form with its error
            // notice and flashed field in view instead of under the preview.
            setIsPreviewOpen(false);
            void save();
          }}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
