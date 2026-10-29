import { useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useShareLink } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  gatheringCancelledPath,
  gatheringShareUrl,
  type GatheringDetail,
} from "./data";
import { useAttendees } from "./api/useAttendees";
import { useUpdateEvent, useCancelEvent } from "./api/useEventMutations";
import { useEventHostScope } from "./eventHostScope";
import { useManageGatheringTab } from "./useManageGatheringTab";
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
 * The event-management dashboard, shared by the member manage page and the
 * admin console's music events. The host scope (`useEventHostScope`) decides
 * the house branches: a QueerPulse-hosted event has no guest communities,
 * Delete or Live game, and a cancel lands on the scope's home page.
 *
 * `Frame` wraps the page; the member page keeps the default `PageShell`.
 */
export function ManageGatheringDashboard({
  demoMode,
  gathering,
  slug,
  routeParam,
  Frame = PageShell,
}: {
  demoMode: boolean;
  gathering: GatheringDetail | null;
  slug: string;
  /** The raw `:slug` route param the detail query is keyed on. */
  routeParam: string | undefined;
  /** The page frame around the dashboard; `PageShell` when left out. */
  Frame?: ComponentType<{ children: ReactNode }>;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scope = useEventHostScope();
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
    gathering,
  });
  // The organisers' guest list (every status) seeds the editor's baseline;
  // the edit modal's guest field shows it loading until it has answered.
  // A house event has no guest communities, so nothing is fetched for it.
  const { guestListStatus, retryGuestList } = useSeedGuestCommunities({
    slug,
    setGatheringState,
    isEnabled: !scope.isHouseEvent,
  });
  const saveGuestCommunities = useSaveGuestCommunityChanges(slug);
  const refreshGuestListAfterLeadChange =
    useRefreshGuestListAfterLeadChange(slug);
  // `?tab=` drives the tab; see `useManageGatheringTab`.
  const tabWiring = useManageGatheringTab({
    startAt: gatheringState.startAt,
    endAt: gatheringState.endAt,
    isHouseEvent: scope.isHouseEvent,
  });
  const { activeTab, selectTab, openCheckin } = tabWiring;
  const { isCheckinLive, isQuizshowVisible } = tabWiring;
  const isQuizFormat = gatheringState.eventType === "quiz";
  // Inside the admin shell the house page drops `.wrap`'s own gutter.
  const wrapClassName = scope.isHouseEvent
    ? `wrap ${styles.houseWrap}`
    : "wrap";
  // Every edit save, and MSG-10's this-vs-future prompt for a repeating
  // gathering's edit or cancel. See `useGatheringEditSave`.
  const editSave = useGatheringEditSave({
    isSeries: Boolean(gathering?.series),
    gatheringState,
    setGatheringState,
    updateEvent,
    onSaveGuestCommunities: saveGuestCommunities,
    onLeadCommunityChanged: refreshGuestListAfterLeadChange,
    onChooseCancelScope: (cancelScope) => {
      cancelEvent.mutate(cancelScope);
      void navigate(scope.homePath ?? gatheringCancelledPath(slug));
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
    <Frame>
      <div className={styles.page}>
        <div className={wrapClassName}>
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
              onDelete={scope.isHouseEvent ? undefined : requestDelete}
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
              isQuizFormat={isQuizFormat}
              isQuizshowVisible={isQuizshowVisible}
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
    </Frame>
  );
}
