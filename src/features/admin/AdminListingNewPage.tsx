import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminListingFromDraft } from "./AdminListingFromDraft";
import { AdminListingNewForm } from "./AdminListingNewForm";
import { FROM_DRAFT_PARAM, staffAuthoredDraft } from "./listingDraftHandover";

/** The id the page heading carries, so "Add another listing" can move focus
 *  back to the top of a fresh form. */
const LISTING_NEW_HEADING_ID = "admin-listing-new-heading";

/**
 * After "Add another listing" remounts the form, returns the admin to the top
 * of the page with focus on its heading. The button that was pressed unmounts
 * with the success panel, which would otherwise leave focus on the body. Waits
 * two frames so React has committed the fresh form first, the same way
 * `focusListingQueueHeadingAfterRemove` in `listingQueueFocus.ts` does.
 */
function focusListingNewHeadingAfterReset() {
  window.scrollTo({ top: 0 });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(LISTING_NEW_HEADING_ID)?.focus();
    });
  });
}

/**
 * `/admin/listings/new`: staff authoring a directory listing for a business
 * that has not joined yet.
 *
 * The form itself IS the member wizard (`ListingWizard`), mounted through the
 * seams it grew for this page: a staff-authored draft, no autosave, no
 * member-shaped name or seed, and a submit that posts to `POST
 * /admin/listings`. Everything addressed to a
 * submitter about themselves (the owner block, the consents, the affirming
 * baseline, the vouch line) hides itself on a staff-authored draft, so what
 * is left is the business.
 *
 * With `?fromDraft=<id>` the same form opens on the business half of a
 * member's unfinished draft and offers the listing back to them
 * (`AdminListingFromDraft`).
 *
 * The wizard's CSS modules live in the marketing feature. That cross-feature
 * import is deliberate and safe: they are plain CSS modules over the global
 * tokens, with nothing marketing-specific to inherit.
 */
export function AdminListingNewPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const fromDraftId = searchParams.get(FROM_DRAFT_PARAM);
  // Bumped by "Add another listing": the form below is keyed on it, so each
  // round starts from a clean mount.
  const [formRound, setFormRound] = useState(0);

  const startAnotherListing = useCallback(() => {
    // Another listing starts blank, so a round opened on a member's draft
    // lets go of it rather than reopening the same draft.
    setSearchParams(
      (params) => {
        params.delete(FROM_DRAFT_PARAM);
        return params;
      },
      { replace: true },
    );
    setFormRound((round) => round + 1);
    focusListingNewHeadingAfterReset();
  }, [setSearchParams]);

  return (
    <AdminShell
      title={t("admin:listingNew.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
        // A plain label of its own, because `admin:adminListings.title`
        // carries `<em>` markup for the queue's own heading.
        {
          label: t("admin:listingNew.queueBreadcrumb"),
          to: routes.adminListings,
        },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:listingNew.eyebrow")}
          title={t("admin:listingNew.title")}
          sub={t("admin:listingNew.sub")}
          titleId={LISTING_NEW_HEADING_ID}
        />
      </FadeIn>

      {fromDraftId ? (
        <AdminListingFromDraft
          key={`${formRound}-${fromDraftId}`}
          draftId={fromDraftId}
          onAddAnother={startAnotherListing}
        />
      ) : (
        <AdminListingNewForm
          key={formRound}
          initialDraft={staffAuthoredDraft()}
          onAddAnother={startAnotherListing}
        />
      )}
    </AdminShell>
  );
}
