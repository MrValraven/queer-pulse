import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import {
  AdminResourceListingContactFields,
  AdminResourceListingDetailsFields,
} from "./AdminResourceListingFormFields";
import {
  draftToWriteBody,
  type ListingFormDraft,
} from "./adminResourceListingForm.utils";
import type {
  AdminResourceSuggestionDTO,
  ResourceListingWriteBody,
} from "./api/adminResourceSuggestions.api";
import listingStyles from "./AdminResourceListingsPage.module.css";

const FORM_ID = "admin-resource-suggestion-approve-form";

/**
 * The listing draft an approval starts from: the member's submission, field by
 * field, with the two things a suggestion cannot carry left blank on purpose.
 *
 * `region` has no counterpart on `resource_suggestion` at all, and `status`
 * starts `active` because approving is publishing. Everything else is the
 * member's own text, pre-filled so the reviewer edits rather than retypes,
 * which is the whole defect PRD-269 closes: the second hand-keyed entry is
 * where a transposed digit in a legal clinic's phone number came from.
 */
export function draftFromSuggestion(
  suggestion: AdminResourceSuggestionDTO,
): ListingFormDraft {
  return {
    category: suggestion.category,
    title: suggestion.name,
    description: suggestion.description,
    region: "",
    phone: suggestion.phone ?? "",
    email: suggestion.email ?? "",
    website: suggestion.website ?? "",
    status: "active",
  };
}

/** The backend requires at least one way to reach the organisation, and a
 *  suggestion is allowed to arrive with none. Mirrors the server's
 *  `hasAtLeastOneContactField` so the reviewer learns it here rather than
 *  through a rejected request. */
function hasContactField(draft: ListingFormDraft): boolean {
  return Boolean(
    draft.phone.trim() || draft.email.trim() || draft.website.trim(),
  );
}

/**
 * Review-and-publish, the approval step for a member's resource suggestion
 * (PRD-269).
 *
 * Approving used to flip a status and tell the member their resource had been
 * accepted, while nothing reached the public directory until somebody
 * remembered to retype the organisation in a different console. The listing is
 * now created in the same transaction as the decision, which means the
 * verification that second entry was supposed to provide has to happen HERE,
 * before the member is told anything.
 *
 * So this is a form and not a confirmation. It opens on the member's words and
 * asks the reviewer to correct them: these are legal-aid clinics and testing
 * sites, nobody has checked the phone number, and the fields a suggestion
 * cannot capture (a region, a contact where the member gave none) are supplied
 * by the person who did check.
 *
 * Kept separate from `AdminResourceListingForm`, which creates a listing that
 * has no suggestion behind it, while sharing its two field groups so the two
 * paths cannot drift into asking for different things.
 */
export function AdminResourceSuggestionApproveModal({
  suggestion,
  isSaving,
  onConfirm,
  onClose,
}: {
  suggestion: AdminResourceSuggestionDTO;
  isSaving: boolean;
  onConfirm: (listing: ResourceListingWriteBody, note: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ListingFormDraft>(() =>
    draftFromSuggestion(suggestion),
  );
  const [note, setNote] = useState("");

  const isContactMissing = !hasContactField(draft);
  const isIncomplete =
    isContactMissing ||
    draft.title.trim().length === 0 ||
    draft.description.trim().length === 0;

  function patch(changes: Partial<ListingFormDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isIncomplete) return;
    onConfirm(draftToWriteBody(draft), note);
  }

  return (
    <AdminModal
      eyebrow={t("admin:adminResourceSuggestions.approve.eyebrow")}
      title={t("admin:adminResourceSuggestions.approve.title")}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={isSaving || isIncomplete}
          >
            {t("admin:adminResourceSuggestions.approve.confirmCta")}
          </Button>
        </>
      }
    >
      <p className={listingStyles.emptyText}>
        {t("admin:adminResourceSuggestions.approve.body", {
          name: suggestion.name,
        })}
      </p>

      <form
        id={FORM_ID}
        className={listingStyles.editorGrid}
        onSubmit={handleSubmit}
      >
        <AdminResourceListingDetailsFields draft={draft} onChange={patch} />
        <AdminResourceListingContactFields draft={draft} onChange={patch} />

        <div className={listingStyles.fieldGroup}>
          <label
            className={listingStyles.fieldLabel}
            htmlFor="approve-decision-note"
          >
            {t("admin:adminResourceSuggestions.approve.noteLabel")}
          </label>
          <textarea
            id="approve-decision-note"
            className={listingStyles.textarea}
            rows={3}
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t(
              "admin:adminResourceSuggestions.approve.notePlaceholder",
            )}
          />
        </div>
      </form>

      {isContactMissing && (
        // Stated before the reviewer presses a disabled button, since a
        // suggestion may genuinely arrive with no way to reach the
        // organisation and finding one is the work this step is asking for.
        <p className={listingStyles.emptyText}>
          {t("admin:adminResourceSuggestions.approve.contactRequired")}
        </p>
      )}
    </AdminModal>
  );
}
