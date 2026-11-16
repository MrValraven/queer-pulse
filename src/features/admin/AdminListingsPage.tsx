import { useSearchParams } from "react-router-dom";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ListingPreviewDrawer } from "./ListingPreviewDrawer";
import { EditSuggestionsSection } from "./EditSuggestionsSection";
import { ListingClaimsSection } from "./ListingClaimsSection";
import { ListingDraftsSection } from "./ListingDraftsSection";
import { AdminDirectoryPartnersSection } from "./AdminDirectoryPartnersSection";
import { listingViewsFor, type ListingViewTab } from "./adminListingViews";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { AdminListingQueueView } from "./AdminListingQueueView";
import { useListingQueueState } from "./useListingQueueState";
import { LISTING_QUEUE_HEADING_ID } from "./listingQueueFocus";
import {
  AdminListingViewTabs,
  LISTING_VIEW_ID_PREFIX,
} from "./AdminListingViewTabs";

type ViewTab = ListingViewTab;

/** The search param that deep-links a view, e.g. `?view=claims`. The
 *  submissions queue is the default and keeps the URL bare. */
const VIEW_PARAM = "view";

function isViewTab(
  value: string | null,
  views: readonly ViewTab[],
): value is ViewTab {
  return views.some((viewOption) => viewOption === value);
}

/** The views this viewer may open. Unfinished drafts and directory
 *  partners are Admin only (their routes are `@Roles(Admin)`, and reaching
 *  out goes through the Admin-only official thread), so a moderator or a
 *  `directory_moderator` grant holder is never offered a tab the API refuses.
 *  Gated like `ListingPreviewDrawer`'s delegation section. */
function useListingViews(): ViewTab[] {
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  return listingViewsFor({ role, isDemoMode: demoMode });
}

/**
 * Moderator desk for member-submitted directory listings: a header, the view
 * tabs (Submissions, Edit suggestions, Ownership claims, Unfinished drafts,
 * Partners) and the chosen view. The Submissions queue's state lives in
 * `useListingQueueState`, held here so it survives a trip to another view.
 */
export function AdminListingsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const views = useListingViews();
  // The view lives in the URL, so a link can land straight on a tab
  // (`?view=claims`). A value this viewer may not open, or one that names no
  // view at all, lands on the submissions queue.
  const requestedView = searchParams.get(VIEW_PARAM);
  const view: ViewTab = isViewTab(requestedView, views)
    ? requestedView
    : "queue";
  const queue = useListingQueueState(searchParams.get("q") ?? "");

  // Replaces the history entry, so switching tabs never piles up Back
  // steps. Every other param (`?q=` included) is carried over as it is.
  function handleViewChange(nextView: ViewTab) {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (nextView === "queue") nextParams.delete(VIEW_PARAM);
        else nextParams.set(VIEW_PARAM, nextView);
        return nextParams;
      },
      { replace: true },
    );
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminListings.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          titleId={LISTING_QUEUE_HEADING_ID}
          eyebrow={t("shared:adminNav.sections.directory")}
          title={
            <Translation
              i18nKey="admin:adminListings.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminListings.header.sub")}
        />
      </FadeIn>

      <AdminListingViewTabs
        views={views}
        view={view}
        onChange={handleViewChange}
      />

      <div
        role="tabpanel"
        id={`${LISTING_VIEW_ID_PREFIX}-panel-${view}`}
        aria-labelledby={`${LISTING_VIEW_ID_PREFIX}-tab-${view}`}
      >
        {view === "queue" ? (
          <AdminListingQueueView queue={queue} />
        ) : (
          <ListingSecondaryView view={view} />
        )}
      </div>

      {queue.openRowLive && (
        <ListingPreviewDrawer
          row={queue.openRowLive}
          onClose={() => queue.setOpenRow(null)}
        />
      )}
    </AdminShell>
  );
}

/** Every view but the submissions queue: each is a self-contained section
 *  that owns its own query and filters. */
function ListingSecondaryView({ view }: { view: Exclude<ViewTab, "queue"> }) {
  if (view === "editSuggestions") return <EditSuggestionsSection />;
  if (view === "claims") return <ListingClaimsSection />;
  if (view === "partners") return <AdminDirectoryPartnersSection />;
  return <ListingDraftsSection />;
}
