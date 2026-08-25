import { useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  ManageGatheringTabs,
  ManageGatheringSidebar,
} from "./ManageGatheringTabs";
import { ManageGatheringHeader } from "./ManageGatheringHeader";
import type { GatheringDetailsDraft } from "./EditDetailsModal";
import {
  ManageGatheringModals,
  type SeriesScopeModalMode,
} from "./ManageGatheringModals";
import type { SeriesScope, UpdateEventDto } from "./api/events.api";
import {
  applyDetailValue,
  applyEditDraft,
  applyVenueSelection,
  buildEditPatch,
  demoInitialState,
  liveInitialState,
  manageGatheringCounts,
  type GatheringState,
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
import { dateToDatetimeValue } from "./manageGatheringDates";
import styles from "./ManageGatheringPage.module.css";

/**
 * The gathering-management dashboard. Demo renders the static Pride-Brunch
 * prototype; live resolves the real event off `:slug` and drives edit / cancel /
 * attendees / cohost / invite against its real id (organizer-gated server-side).
 * The "message attendees" surfaces stay demo-only — there is no message-
 * attendees endpoint, so live must not fake a send.
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
      />
    );
  }

  const gathering = data?.gathering ?? null;
  if (!gathering) return <ManageUnavailable loading={isLoading} />;
  // Only organizers can manage; the mutations are server-gated too, but this
  // keeps a non-organizer from landing on a dashboard whose writes would 403.
  if (!gathering.viewerIsOrganizer) return <ManageUnavailable loading={false} />;
  return (
    <ManageGatheringMain
      demoMode={false}
      gathering={gathering}
      slug={gathering.slug}
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
}: {
  demoMode: boolean;
  gathering: GatheringDetail | null;
  slug: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const navigate = useNavigate();
  // The share card's Copy button writes the real public link to the clipboard
  // — it used to only raise the "Link copied!" toast without copying anything.
  const { share } = useShareLink({
    copied: t("gatherings:manage.linkCopiedToast"),
    failed: t("gatherings:manage.linkCopyFailedToast"),
  });
  const updateEvent = useUpdateEvent(slug);
  const cancelEvent = useCancelEvent(slug);
  // Shared with the Attendees tab via the react-query cache (same key), so this
  // is free; live reads real going/waitlist counts, demo keeps the static ones.
  const { data: attendees } = useAttendees(slug);
  const [editOpen, setEditOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  // MSG-10 — a repeating gathering's edit/cancel offers a this-vs-future
  // choice. `seriesScopeModal` is which prompt (if any) is open;
  // `pendingEditPatch` holds an already-saved edit's patch until the host
  // picks a scope for it (see the `EditDetailsModal` wiring below).
  const [seriesScopeModal, setSeriesScopeModal] =
    useState<SeriesScopeModalMode>(null);
  const [pendingEditPatch, setPendingEditPatch] = useState<UpdateEventDto | null>(
    null,
  );

  const [gatheringState, setGatheringState] = useState<GatheringState>(() =>
    demoMode || !gathering ? demoInitialState() : liveInitialState(gathering, fmt),
  );

  const { daysToGo, attendeeCount, overviewCounts } = manageGatheringCounts(
    demoMode,
    gathering,
    attendees,
  );

  // MSG-10 — a gathering that's part of a series (real, live only —
  // `gathering?.series` is always undefined in demo mode) asks this-vs-future
  // instead of the plain confirm; a standalone gathering keeps the original
  // single `window.confirm`.
  const cancelGathering = () => {
    if (gathering?.series) {
      setSeriesScopeModal("cancel");
      return;
    }
    if (
      window.confirm(
        t("gatherings:manage.cancelConfirm", {
          title: gatheringState.title,
          count: attendeeCount,
        }),
      )
    ) {
      cancelEvent.mutate(undefined);
      void navigate(gatheringCancelledPath(slug));
    }
  };

  // The host's answer to the `SeriesEditScopeModal` prompt — fires the
  // deferred cancel/edit mutation with the chosen `SeriesScope`.
  const chooseSeriesScope = (scope: SeriesScope) => {
    const mode = seriesScopeModal;
    setSeriesScopeModal(null);
    if (mode === "cancel") {
      cancelEvent.mutate(scope);
      void navigate(gatheringCancelledPath(slug));
    } else if (mode === "edit" && pendingEditPatch) {
      updateEvent.mutate({ ...pendingEditPatch, seriesScope: scope });
      setPendingEditPatch(null);
    }
  };

  // A saved edit: fold it into local state, then either send the PATCH now or
  // (MSG-10, a repeating gathering) stash it until the host answers
  // `SeriesEditScopeModal`. `buildEditPatch` reads the PRE-edit snapshot from
  // this closure's `gatheringState` — see its doc for why that matters.
  const saveEditDraft = (draft: GatheringDetailsDraft) => {
    setGatheringState((current) => applyEditDraft(current, draft, fmt));
    const patch = buildEditPatch(gatheringState, draft);
    if (gathering?.series) {
      setPendingEditPatch(patch);
    } else {
      updateEvent.mutate(patch);
    }
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <ManageGatheringHeader
            title={gatheringState.title}
            daysToGo={daysToGo}
            slug={slug}
            canMessageAttendees={demoMode}
            onEditDetails={() => setEditOpen(true)}
            onMessageAttendees={() => setMessageOpen(true)}
          />

          <div className={styles.layout}>
            <ManageGatheringTabs
              slug={slug}
              onCancel={cancelGathering}
              details={gatheringState.details}
              description={gatheringState.description}
              overviewCounts={overviewCounts}
              venueListingId={gatheringState.venueListingId}
              venueListing={gatheringState.venueListing}
              cohosts={gathering?.cohosts}
              allowWaitlist={gathering?.allowWaitlist}
              showAttendeeCount={gathering?.showAttendeeCount}
              onUpdateSettings={(patch) => {
                if (!demoMode) updateEvent.mutate(patch);
              }}
              onUpdateDetail={(id, value) =>
                setGatheringState((current) =>
                  applyDetailValue(current, id, value),
                )
              }
              onUpdateVenue={(selection) => {
                setGatheringState((current) =>
                  applyVenueSelection(current, selection),
                );
                updateEvent.mutate({
                  venue: selection.text,
                  listingId: selection.listingId,
                });
              }}
              onUpdateDescription={(value) => {
                setGatheringState((current) => ({
                  ...current,
                  description: value,
                }));
                if (!demoMode) updateEvent.mutate({ description: value });
              }}
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

      <ManageGatheringModals
        editInitial={
          editOpen
            ? {
                title: gatheringState.title,
                startAt: dateToDatetimeValue(gatheringState.startAt),
                location: gatheringState.location,
                description: gatheringState.description,
                visibility: gatheringState.visibility,
                communitySlug: gatheringState.communitySlug,
              }
            : null
        }
        onCloseEdit={() => {
          setEditOpen(false);
          // MSG-10 — a save on a repeating gathering stashes its patch
          // instead of sending it immediately (see `saveEditDraft`); closing
          // the modal is the cue to ask this-vs-future.
          if (pendingEditPatch) setSeriesScopeModal("edit");
        }}
        onSaveEdit={saveEditDraft}
        seriesScopeMode={seriesScopeModal}
        onChooseSeriesScope={chooseSeriesScope}
        onCloseSeriesScope={() => {
          setSeriesScopeModal(null);
          setPendingEditPatch(null);
        }}
        isMessageOpen={messageOpen}
        attendeeCount={attendeeCount}
        onCloseMessage={() => setMessageOpen(false)}
      />
    </PageShell>
  );
}
