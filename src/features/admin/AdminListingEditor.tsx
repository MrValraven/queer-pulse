import { useMemo, useRef, useState } from "react";
import { Collapse } from "../../shared/components/ui/Collapse";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ManagedListingDTO } from "../marketing/listBusiness/api/listings.api";
import { dtoToDraft } from "../marketing/listBusiness/dtoToDraft";
import { listingKindOf } from "../marketing/listBusiness/listingMobile.data";
import { effectivePricingMode } from "../marketing/listBusiness/listingShop.data";
import { SendingPanel } from "../marketing/listBusiness/ListBusinessChrome";
import { useEditUnsavedGuard } from "../marketing/listBusiness/useEditListingSave";
import { useListingForm } from "../marketing/listBusiness/useListingForm";
import { WizardServerError } from "../marketing/listBusiness/WizardExtras";
import { jumpToEditorSection } from "../marketing/listBusiness/editor/jumpToEditorSection";
import { withListingKindLabels } from "../marketing/listBusiness/editor/listingEditor.data";
import { flattenEditorMissing } from "../marketing/listBusiness/editor/listingEditorMissing";
import { useActiveEditorSection } from "../marketing/listBusiness/editor/useActiveEditorSection";
import { useEditorHashLanding } from "../marketing/listBusiness/editor/useEditorHashLanding";
import { ListingEditorLivePreview } from "../marketing/listBusiness/editor/ListingEditorLivePreview";
import { ListingEditorPreviewModal } from "../marketing/listBusiness/editor/ListingEditorPreviewModal";
import { ListingEditorSaveBar } from "../marketing/listBusiness/editor/ListingEditorSaveBar";
import { ListingEditorSectionNav } from "../marketing/listBusiness/editor/ListingEditorSectionNav";
import {
  adminEditorSectionsFor,
  NO_ADMIN_SECTION_BADGES,
  withoutAdminHiddenFields,
} from "./adminListingEditor.data";
import { AdminListingEditorSections } from "./AdminListingEditorSections";
import { AdminListingEditSuccess } from "./AdminListingEditStates";
import { useAdminListingEditorSave } from "./useAdminListingEditorSave";
import styles from "../marketing/listBusiness/editor/ListingEditor.module.css";
import adminStyles from "./AdminListingEditor.module.css";

/** The save bar keeps no draft, so its draft line always reads as idle and
 *  falls back to "unsaved changes" or "everything is saved". */
const NO_DRAFT_STATUS = { kind: "idle" } as const;

/**
 * The owner's single-screen editor, over a listing the platform holds: the
 * same jump nav, fields, live preview, save bar and full-page preview, with
 * the save going to `PATCH /admin/listings/:ref`.
 *
 * The draft is seeded staff-authored on the staff path, for the reason
 * `staffAuthoredDraft` in `AdminListingNewPage` documents. That keeps every
 * rule about the person behind the listing off the page, and
 * `adminDraftToUpdateDto` drops the `path` on the way out, so a listing
 * stored as a claim keeps its own.
 *
 * Nothing autosaves and nothing is offered for restore: autosave writes
 * member-scoped draft rows, and an admin console has no business minting one
 * against the admin's own member account. The save never moves `status`, so
 * on a live listing it publishes at once and is labelled that way; a listing
 * in review stays in the queue.
 *
 * `onSaved` fires once the save has landed, so the page can drop the status
 * line that the success panel supersedes.
 */
export function AdminListingEditor({
  listing,
  onHasOwner,
  onSaved,
}: {
  listing: ManagedListingDTO;
  onHasOwner: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  // Stable across renders so the dirty comparison and the unsaved guard both
  // measure against the version that actually loaded.
  const initialDraft = useMemo(
    () => ({
      ...dtoToDraft(listing),
      isStaffAuthored: true,
      path: "suggest" as const,
    }),
    [listing],
  );
  const form = useListingForm(initialDraft);
  const { draft } = form;
  const pricingMode = effectivePricingMode(draft);
  // Read from the draft, so switching the kind in Basics retitles the
  // practical and accessibility sections and their nav entries at once.
  const kind = listingKindOf(draft);
  const { sections: baseSections, sectionIds } = adminEditorSectionsFor(
    kind === "online",
  );
  const sections = useMemo(
    () => withListingKindLabels(baseSections, pricingMode, kind),
    [baseSections, pricingMode, kind],
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const activeSectionId = useActiveEditorSection(sectionIds);
  useEditorHashLanding(sections, prefersReducedMotion);
  // The fields column, so the live preview can outline where a field shows.
  const fieldsRef = useRef<HTMLDivElement>(null);

  // One list in page order, without any field only the listing's holder
  // answers, so Save is never held back by an input this page does not show.
  const missing = useMemo(
    () => withoutAdminHiddenFields(flattenEditorMissing(form.missing)),
    [form.missing],
  );
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft],
  );
  const editorSave = useAdminListingEditorSave({
    listingRef: listing.ref,
    form,
    missing,
    prefersReducedMotion,
    onHasOwner,
    onSaved,
  });
  const { phase, serverError } = editorSave;
  const isSaving = phase === "sending";
  // "Save and leave" is offered only while the bar's Save would go through.
  useEditUnsavedGuard(
    true,
    draft,
    initialDraft,
    phase === "form",
    missing.length === 0 ? editorSave.saveAndLeave : undefined,
  );

  const isLive = listing.status === "live";
  const saveLabel = t(
    isLive ? "admin:listingEdit.publishCta" : "admin:listingEdit.submitCta",
  );

  // Each state sits in the same wrapper as the form, so the sending card,
  // the success panel and the editor all start at the same top edge.
  if (phase === "sending") {
    return (
      <div className={adminStyles.editor}>
        <SendingPanel isEdit />
      </div>
    );
  }
  if (phase === "success" && editorSave.savedListing) {
    return (
      <div className={adminStyles.editor}>
        <AdminListingEditSuccess saved={editorSave.savedListing} />
      </div>
    );
  }

  return (
    <div className={adminStyles.editor}>
      <Collapse isOpen={serverError !== null}>
        {serverError && (
          <WizardServerError
            message={serverError}
            onDismiss={editorSave.dismissServerError}
          />
        )}
      </Collapse>

      <div className={styles.layoutFrame}>
        <div className={styles.layout}>
          <ListingEditorSectionNav
            sections={sections}
            activeSectionId={activeSectionId}
            missing={missing}
            sectionBadges={NO_ADMIN_SECTION_BADGES}
            onJump={(sectionId) =>
              jumpToEditorSection(sectionId, prefersReducedMotion)
            }
          />

          <div className={styles.main} ref={fieldsRef}>
            <AdminListingEditorSections
              form={form}
              listing={listing}
              loadedName={initialDraft.name}
            />
            <ListingEditorSaveBar
              missing={missing}
              isDirty={isDirty}
              isSaving={isSaving}
              draftStatus={NO_DRAFT_STATUS}
              isDraftNoteShown={false}
              saveLabel={saveLabel}
              onPreview={() => setIsPreviewOpen(true)}
              onSave={() => void editorSave.save()}
            />
          </div>

          <ListingEditorLivePreview
            draft={draft}
            photoPreviews={form.photoPreviews}
            coverPreview={form.coverPreview}
            fieldsRef={fieldsRef}
            prefersReducedMotion={prefersReducedMotion}
            onOpenFullPreview={() => setIsPreviewOpen(true)}
            isUnclaimed
          />
        </div>
      </div>

      {isPreviewOpen && (
        <ListingEditorPreviewModal
          draft={draft}
          photoPreviews={form.photoPreviews}
          shopPhotoPreviews={form.shopPhotoPreviews}
          slug={listing.slug}
          // The admin DTO arrives redacted like a co-manager's, so the block
          // about the person behind the business is blank here too.
          isCoManagerView
          // Nobody has taken the listing over yet, so the page shows no
          // "Run by" line, and neither does its preview.
          isUnclaimed
          sub={t(
            isLive
              ? "admin:listingEdit.previewFoot.live"
              : "admin:listingEdit.previewFoot.unpublished",
          )}
          saveLabel={saveLabel}
          missing={missing}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={() => {
            // Closed first, so a failed save lands on the form with its error
            // notice and flashed field in view instead of under the preview.
            setIsPreviewOpen(false);
            void editorSave.save();
          }}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
