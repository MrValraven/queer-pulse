import type { ReactNode, Ref } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiUserCheck } from "react-icons/fi";
import { EmptyState, SuccessPanel } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { businessPath, routes } from "../../app/routeMap";
import type { PendingListing } from "../marketing/listBusiness/listBusiness.data";
import type { ManagedListingDTO } from "../marketing/listBusiness/api/listings.api";

interface NoticeAction {
  label: string;
  to: string;
}

/**
 * The edit page's full-width notice, drawn with the shared `EmptyState` at
 * `headingLevel={2}` since it sits straight under the page `h1`.
 *
 * The wrapper carries no visual styling of its own; it exists so
 * `tabIndex={-1}` makes the notice a focus target the page can move focus to
 * when it replaces the wizard, with an accessible name a screen reader
 * announces on that move. The global `:focus-visible` ring applies to it.
 */
function AdminListingEditNotice({
  icon,
  title,
  description,
  action,
  secondaryAction,
  noticeRef,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: NoticeAction;
  secondaryAction?: NoticeAction;
  noticeRef?: Ref<HTMLElement>;
}) {
  return (
    <section ref={noticeRef} tabIndex={-1} aria-label={title}>
      <EmptyState
        headingLevel={2}
        icon={icon}
        title={title}
        description={description}
        action={action}
        secondaryAction={secondaryAction}
      />
    </section>
  );
}

/** What the console tells the admin once the save lands. */
export function AdminListingEditSuccess({ saved }: { saved: PendingListing }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const steps = [
    t(
      `admin:listingNew.success.step.${saved.status === "live" ? "live" : "review"}`,
    ),
  ];
  return (
    <SuccessPanel
      title={t("admin:listingEdit.success.title")}
      em={saved.name}
      steps={steps}
      onClose={() => void navigate(routes.adminListings)}
      closeLabel={t("admin:listingEdit.success.closeCta")}
    >
      {t("admin:listingEdit.success.body", { ref: saved.ref })}
    </SuccessPanel>
  );
}

/**
 * Shown in place of the wizard once somebody owns the listing: from then on
 * its owner edits it, and the admin route answers 409. A live listing also
 * offers its public directory page, where an admin can suggest an edit.
 */
export function AdminListingEditHasOwner({
  listing,
  noticeRef,
}: {
  listing: ManagedListingDTO | undefined;
  noticeRef: Ref<HTMLElement>;
}) {
  const { t } = useTranslation();
  const isLive = listing?.status === "live";
  return (
    <AdminListingEditNotice
      noticeRef={noticeRef}
      icon={<FiUserCheck />}
      title={t("admin:listingEdit.hasOwner.title")}
      description={t("admin:listingEdit.hasOwner.body")}
      action={{
        label: t("admin:listingEdit.hasOwner.backCta"),
        to: routes.adminListings,
      }}
      secondaryAction={
        listing && isLive
          ? {
              label: t("admin:listingEdit.hasOwner.viewCta"),
              to: businessPath(listing.slug),
            }
          : undefined
      }
    />
  );
}

/** The listing the route names is gone, or this admin may not open it. */
export function AdminListingEditNotFound() {
  const { t } = useTranslation();
  return (
    <AdminListingEditNotice
      icon={<FiMapPin />}
      title={t("admin:listingEdit.notFound.title")}
      description={t("admin:listingEdit.notFound.body")}
      action={{
        label: t("admin:listingEdit.hasOwner.backCta"),
        to: routes.adminListings,
      }}
    />
  );
}
