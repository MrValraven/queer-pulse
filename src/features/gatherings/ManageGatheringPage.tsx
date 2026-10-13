import { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  ManageGatheringTabs,
  ManageGatheringSidebar,
} from "./ManageGatheringTabs";
import { ManageGatheringHeader } from "./ManageGatheringHeader";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { ManageGatheringModals } from "./ManageGatheringModals";
import {
  editDraftFromState,
  manageGatheringCounts,
} from "./manageGatheringState";
import {
  DEMO_GATHERING_SLUGS,
  gatheringCancelledPath,
  gatheringShareUrl,
  type GatheringDetail,
} from "./data";
import { useEvent } from "./api/useEvent";
import { useAttendees } from "./api/useAttendees";
import { useUpdateEvent, useCancelEvent } from "./api/useEventMutations";
import {
  CHECKIN_FOCUS_PARAM,
  MANAGE_GATHERING_TAB_PARAM,
  manageGatheringTabFromParam,
  type ManageGatheringTab,
} from "./gatheringPaths";
import { isDoorWindow } from "./checkin/doorWindow";
import { useNow } from "./checkin/useNow";
import { useOpenCheckinScroll } from "./useOpenCheckinScroll";
import { useCancelGatheringFlow } from "./useCancelGatheringFlow";
import { useDeleteGatheringFlow } from "./useDeleteGatheringFlow";
import { useManageGatheringState } from "./useManageGatheringState";
import { useGatheringEditSave } from "./useGatheringEditSave";
import {
  useRefreshGuestListAfterLeadChange,
  useSaveGuestCommunityChanges,
} from "./useSaveGuestCommunityChanges";
import { SavedGuestListContext } from "./savedGuestListContext";
import { useSeedGuestCommunities } from "./useSeedGuestCommunities";
import styles from "./ManageGatheringPage.module.css";

/**
 * The gathering-management dashboard. Demo renders the static Pride-Brunch
 * prototype; live resolves the real event off `:slug` and drives edit / cancel /
 * attendees / cohost / invite / announcements / bars against its real id
 * (organizer-gated server-side).
 */
export function ManageGatheringPage() {
  const { slug: param } = useParams();
  const { demoMode } = useDemoMode();
  const { data, isLoading } = useEvent(param);

  if (demoMode) {
    return (
      <ManageGatheringMain
        demoMode
        gathering={null}
        slug={DEMO_GATHERING_SLUGS.manage}
        routeParam={param}
      />
    );
  }

  const gathering = data?.gathering ?? null;
  if (!gathering) return <ManageUnavailable loading={isLoading} />;
  // Only organizers can manage; the mutations are server-gated too, but this
  // keeps a non-organizer from landing on a dashboard whose writes would 403.
  if (!gathering.viewerIsOrganizer)
    return <ManageUnavailable loading={false} />;
  return (
    <ManageGatheringMain
      demoMode={false}
      gathering={gathering}
      slug={gathering.slug}
      routeParam={param}
    />
  );
}

/** Live loading / not-authorized frame. */
function ManageUnavailable({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          {loading ? (
            <>
              <SkeletonLine width="30%" height={18} />
              <SkeletonLine width="60%" height={40} style={{ marginTop: 16 }} />
              <SkeletonLine width="90%" height={16} style={{ marginTop: 16 }} />
            </>
          ) : (
            <EmptyState
              icon={<FiCalendar />}
              title={t("gatherings:gathering.notFoundTitle")}
              description={t("gatherings:gathering.notFoundDescription")}
              action={{
                label: t("gatherings:prototypeComingSoon.browseCta"),
                to: routes.events,
              }}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}

function ManageGatheringMain({
  demoMode,
  gathering,
  slug,
  routeParam,
}: {
  demoMode: boolean;
  gathering: GatheringDetail | null;
  slug: string;
  /** The raw `:slug` route param the detail query is keyed on. */
  routeParam: string | undefined;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // The share card's Copy button writes the real public link to the clipboard
  // (it used to only raise the "Link copied!" toast and copy nothing).
  const { share } = useShareLink({
    copied: t("gatherings:manage.linkCopiedToast"),
    failed: t("gatherings:manage.linkCopyFailedToast"),
  });
  const updateEvent = useUpdateEvent(slug);
  const cancelEvent = useCancelEvent(slug);
  // Shared with the Attendees tab via the react-query cache (same key), so this
  // is free; live reads real going/waitlist counts, demo keeps the static ones.
  const { data: attendees } = useAttendees(slug);
  // The draft the edit modal opened on, or null while it is closed. Kept
  // whole because the modal freezes it, and Save reads the host's guest
  // changes against the list it holds.
  const [editInitial, setEditInitial] = useState<GatheringDetailsDraft | null>(
    null,
  );
  const [messageOpen, setMessageOpen] = useState(false);

  const [gatheringState, setGatheringState] = useManageGatheringState({
    demoMode,
    gathering,
  });
  // The organisers' guest list (every status) seeds the editor's baseline;
  // the edit modal's guest field shows it loading until it has answered.
  const { guestListStatus, retryGuestList } = useSeedGuestCommunities({
    slug,
    setGatheringState,
  });
  const saveGuestCommunities = useSaveGuestCommunityChanges(slug);
  const refreshGuestListAfterLeadChange =
    useRefreshGuestListAfterLeadChange(slug);
  // The URL drives the tab: `?tab=attendees` (a lineup reply notification)
  // opens that tab, also when it arrives while mounted, and every switch
  // writes `?tab=` back. With no valid `?tab=`, the page opens on Check-in
  // if the door is open at mount and on Overview otherwise. That opening tab
  // is pinned, so the door opening or closing later (or a start-time edit)
  // never swaps the panel under the host; the live dot and the header button
  // follow `isCheckinLive` as it changes.
  const now = useNow(60_000);
  const isCheckinLive = isDoorWindow(
    gatheringState.startAt,
    gatheringState.endAt,
    now,
  );
  const [openingTab] = useState<ManageGatheringTab>(() =>
    isCheckinLive ? "checkin" : "overview",
  );
  const requestedTab = manageGatheringTabFromParam(
    searchParams.get(MANAGE_GATHERING_TAB_PARAM),
  );
  const activeTab = requestedTab ?? openingTab;
  const selectTab = (tab: ManageGatheringTab) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set(MANAGE_GATHERING_TAB_PARAM, tab);
        next.delete(CHECKIN_FOCUS_PARAM);
        return next;
      },
      { replace: true },
    );
  const openCheckin = useOpenCheckinScroll(activeTab, selectTab);
  // Every edit save, and MSG-10's this-vs-future prompt for a repeating
  // gathering's edit or cancel. See `useGatheringEditSave`.
  const editSave = useGatheringEditSave({
    isSeries: Boolean(gathering?.series),
    gatheringState,
    setGatheringState,
    updateEvent,
    onSaveGuestCommunities: saveGuestCommunities,
    onLeadCommunityChanged: refreshGuestListAfterLeadChange,
    onChooseCancelScope: (scope) => {
      cancelEvent.mutate(scope);
      void navigate(gatheringCancelledPath(slug));
    },
  });
  // Demo runs it too: `useDeleteEvent` resolves without a request there.
  const { requestDelete, isDeletePending, deleteDialog } =
    useDeleteGatheringFlow({ slug, title: gatheringState.title, routeParam });

  const { daysToGo, attendeeCount, overviewCounts } = manageGatheringCounts(
    demoMode,
    gathering,
    attendees,
  );

  const { requestCancel, cancelDialog } = useCancelGatheringFlow({
    slug,
    title: gatheringState.title,
    attendeeCount,
    cancelEvent,
  });

  // MSG-10: a gathering that's part of a series (real, live only, since
  // `gathering?.series` is always undefined in demo mode) asks this-vs-future;
  // a standalone gathering opens the plain confirm, the same `ConfirmDialog`
  // the public page's host menu opens (`useCancelGatheringFlow`).
  const cancelGathering = () => {
    if (gathering?.series) editSave.openCancelScope();
    else requestCancel();
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <ManageGatheringHeader
            title={gatheringState.title}
            daysToGo={daysToGo}
            onEditDetails={() =>
              setEditInitial(editDraftFromState(gatheringState))
            }
            onMessageAttendees={() => setMessageOpen(true)}
            isCheckinLive={isCheckinLive}
            isCheckinActive={activeTab === "checkin"}
            onOpenCheckin={openCheckin}
          />

          <div className={styles.layout}>
            <ManageGatheringTabs
              activeTab={activeTab}
              onTabChange={selectTab}
              isCheckinLive={isCheckinLive}
              startAt={gatheringState.startAt}
              endAt={gatheringState.endAt}
              slug={slug}
              onCancel={cancelGathering}
              onDelete={requestDelete}
              isDeletePending={isDeletePending}
              details={gatheringState.details}
              description={gatheringState.description}
              overviewCounts={overviewCounts}
              updatedAt={gathering?.updatedAt}
              venueListingId={gatheringState.venueListingId}
              venueListing={gatheringState.venueListing}
              cohosts={gathering?.cohosts}
              allowWaitlist={gathering?.allowWaitlist}
              showAttendeeCount={gathering?.showAttendeeCount}
              customRsvpQuestion={gathering?.customRsvpQuestion}
              hostSlug={gathering?.hostSlug}
              onUpdateSettings={(patch) => {
                if (!demoMode) updateEvent.mutate(patch);
              }}
              buildEditDraft={() => editDraftFromState(gatheringState)}
              onSaveEdit={editSave.saveFieldEdit}
              onUpdateVenue={editSave.saveVenue}
              runByListing={gatheringState.runByListing ?? null}
              onUpdateRunBy={editSave.saveRunBy}
            />
            <ManageGatheringSidebar
              slug={slug}
              title={gatheringState.title}
              startAt={gatheringState.startAt}
              location={gatheringState.location}
              coverImageUrl={gathering?.coverImageUrl}
              onCopyLink={() => void share(gatheringShareUrl(slug))}
            />
          </div>
        </div>
      </div>

      <SavedGuestListContext.Provider
        value={{
          status: guestListStatus,
          guests: gatheringState.guestCommunities ?? [],
          onRetry: retryGuestList,
        }}
      >
        <ManageGatheringModals
          slug={slug}
          editInitial={editInitial}
          onCloseEdit={() => {
            setEditInitial(null);
            // MSG-10: a save on a repeating gathering stashes its patch until
            // the host picks a scope; closing the modal is the cue to ask
            // this-vs-future.
            editSave.askScopeForPendingEdit();
          }}
          onSaveEdit={(draft) =>
            editSave.saveEditDraft(draft, editInitial?.guestCommunities)
          }
          seriesScopeMode={editSave.seriesScopeModal}
          onChooseSeriesScope={editSave.chooseSeriesScope}
          onCloseSeriesScope={editSave.closeSeriesScope}
          isMessageOpen={messageOpen}
          attendeeCount={attendeeCount}
          onCloseMessage={() => setMessageOpen(false)}
        />
      </SavedGuestListContext.Provider>
      {cancelDialog}
      {deleteDialog}
    </PageShell>
  );
}
