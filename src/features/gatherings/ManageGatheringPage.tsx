import { useState } from "react";
import { FiArrowRight, FiCalendar } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  ManageGatheringTabs,
  ManageGatheringSidebar,
} from "./ManageGatheringTabs";
import { EditDetailsModal } from "./EditDetailsModal";
import type { EventVisibility, SeriesScope, UpdateEventDto } from "./api/events.api";
import { MessageAttendeesModal } from "./MessageAttendeesModal";
import { SeriesEditScopeModal } from "./SeriesEditScopeModal";
import type { VenueSelection } from "./VenuePicker";
import {
  GATHERING_TITLE,
  GATHERING_DESCRIPTION,
  GATHERING_DETAILS,
  GATHERING_DATE,
  ATTENDEE_COUNT,
} from "./manageGathering.data";
import {
  DEMO_GATHERING_SLUGS,
  gatheringCancelledPath,
  gatheringDashboardPath,
  type GatheringDetail,
} from "./data";
import { useEvent } from "./api/useEvent";
import { useAttendees } from "./api/useAttendees";
import { useUpdateEvent, useCancelEvent } from "./api/useEventMutations";
import { daysUntil, dateToDatetimeValue } from "./manageGatheringDates";
import styles from "./ManageGatheringPage.module.css";

interface GatheringDetailRow {
  id: string;
  labelKey: string;
  value: string;
}

interface GatheringState {
  title: string;
  /** Formatted display string for the "date" details row — derived, never
   *  edited directly. See `startAt` for the real editable moment. */
  date: string;
  /** The gathering's real scheduled start — what actually gets sent to the
   *  backend on save. Kept in step with `date`/`details` (the display copy)
   *  whenever either changes. */
  startAt: Date;
  location: string;
  description: string;
  details: GatheringDetailRow[];
  /** The venue's directory link, or null for a free-text venue. See
   *  `VenuePicker`/`EditVenueModal`. */
  venueListingId: string | null;
  venueListing: { slug: string; name: string } | null;
  /** Who can find and RSVP to this gathering. See `AudienceScopeField`. */
  visibility: EventVisibility;
  /** The community this gathering is filed to, or `""` for none — settable
   *  in the edit modal now, same "" sentinel `useGatheringForm` uses. Absent
   *  (`""`) in the demo prototype. */
  communitySlug: string;
}

function renderTitle(title: string) {
  const idx = title.indexOf(":");
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx).trim()}: <em>{title.slice(idx + 1).trim()}</em>
    </>
  );
}

/** The demo dashboard's starting state — the static Pride-Brunch prototype. */
function demoInitialState(): GatheringState {
  const dateDetail =
    GATHERING_DETAILS.find((detail) => detail.id === "date")?.value ?? "";
  const venueDetail =
    GATHERING_DETAILS.find((detail) => detail.id === "venue")?.value ?? "";
  return {
    title: GATHERING_TITLE,
    date: dateDetail,
    startAt: GATHERING_DATE,
    location: venueDetail,
    description: GATHERING_DESCRIPTION,
    details: GATHERING_DETAILS,
    // The static prototype has no gathering linked to a real directory
    // listing.
    venueListingId: null,
    venueListing: null,
    // The static prototype has no audience-scope of its own; "members"
    // (Public) matches the wizard's default and prior behaviour.
    visibility: "members",
    communitySlug: "",
  };
}

/** The live dashboard's starting state, seeded from the fetched event. Only the
 *  fields the event DTO actually carries (date, venue, description) become
 *  editable rows — time/capacity aren't on the detail view-model. */
function liveInitialState(
  gathering: GatheringDetail,
  fmt: Formatters,
): GatheringState {
  const dateValue = fmt.date(gathering.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    title: gathering.title,
    date: dateValue,
    startAt: gathering.date,
    location: gathering.hood,
    description: gathering.body,
    details: [
      { id: "date", labelKey: "gatherings:manage.details.date", value: dateValue },
      {
        id: "venue",
        labelKey: "gatherings:manage.details.venue",
        value: gathering.hood,
      },
    ],
    venueListingId: gathering.venueListingId ?? null,
    venueListing: gathering.venueListing ?? null,
    visibility: gathering.visibility ?? "members",
    communitySlug: gathering.communitySlug ?? "",
  };
}

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
  const { showToast } = useToast();
  const fmt = useFormat();
  const navigate = useNavigate();
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
  const [seriesScopeModal, setSeriesScopeModal] = useState<
    "edit" | "cancel" | null
  >(null);
  const [pendingEditPatch, setPendingEditPatch] = useState<UpdateEventDto | null>(
    null,
  );

  const [gatheringState, setGatheringState] = useState<GatheringState>(() =>
    demoMode || !gathering ? demoInitialState() : liveInitialState(gathering, fmt),
  );

  // Header "days to go" + cancel-confirm attendee count: real in live, static
  // in demo (so the demo prototype reads exactly as before).
  const daysToGo = demoMode || !gathering ? 12 : daysUntil(gathering.date);
  const attendeeCount = demoMode
    ? ATTENDEE_COUNT
    : (attendees?.goingCount ?? gathering?.spots.values?.count ?? 0);
  // Overview stat chips: demo keeps its own static trio; live derives them from
  // the shared attendees query (undefined → OverviewTab falls back to demo).
  const overviewCounts =
    demoMode || !attendees
      ? undefined
      : {
          going: attendees.goingCount,
          waitlist: attendees.waitlistCount,
          spotsLeft: attendees.capacity
            ? Math.max(0, attendees.capacity - attendees.goingCount)
            : 0,
        };

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

  const updateDetail = (id: string, value: string) => {
    setGatheringState((current) => ({
      ...current,
      details: current.details.map((detail) =>
        detail.id === id ? { ...detail, value } : detail,
      ),
      ...(id === "date" ? { date: value } : {}),
    }));
  };

  const updateVenue = (selection: VenueSelection) => {
    setGatheringState((current) => ({
      ...current,
      location: selection.text,
      venueListingId: selection.listingId,
      venueListing: selection.venueListing,
      details: current.details.map((detail) =>
        detail.id === "venue" ? { ...detail, value: selection.text } : detail,
      ),
    }));
    updateEvent.mutate({ venue: selection.text, listingId: selection.listingId });
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.header}>
            <div className={styles.eyebrow}>
              <div className={styles.phDot} /> {t("gatherings:manage.eyebrow")}
            </div>
            <div className={styles.title}>
              {renderTitle(gatheringState.title)}
            </div>
            <div className={styles.phRow}>
              <div className={styles.status}>
                <div className={styles.statusDot} />{" "}
                {t("gatherings:manage.status.approvedDaysToGo", {
                  count: daysToGo,
                })}
              </div>
              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  className={styles.actionBtn}
                  onClick={() => setEditOpen(true)}
                >
                  {t("gatherings:manage.actions.editDetails")}
                </Button>
                {/* "Message attendees" has no backend endpoint, so it stays a
                    demo-only affordance rather than faking a send in live. */}
                {demoMode && (
                  <Button
                    variant="ghost"
                    className={styles.actionBtn}
                    onClick={() => setMessageOpen(true)}
                  >
                    {t("gatherings:manage.actions.messageAttendees")}
                  </Button>
                )}
                <Button
                  variant="primary"
                  className={styles.actionBtn}
                  to={gatheringDashboardPath(slug)}
                >
                  {t("gatherings:manage.actions.dayOfDashboard")}{" "}
                  <FiArrowRight aria-hidden />
                </Button>
              </div>
            </div>
          </div>

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
              onUpdateDetail={updateDetail}
              onUpdateVenue={updateVenue}
              onUpdateDescription={(value) => {
                setGatheringState((current) => ({
                  ...current,
                  description: value,
                }));
                if (!demoMode) updateEvent.mutate({ description: value });
              }}
            />
            <ManageGatheringSidebar
              onCopyLink={() =>
                showToast(t("gatherings:manage.linkCopiedToast"), "success")
              }
            />
          </div>
        </div>
      </div>

      {editOpen && (
        <EditDetailsModal
          initial={{
            title: gatheringState.title,
            startAt: dateToDatetimeValue(gatheringState.startAt),
            location: gatheringState.location,
            description: gatheringState.description,
            visibility: gatheringState.visibility,
            communitySlug: gatheringState.communitySlug,
          }}
          onClose={() => {
            setEditOpen(false);
            // MSG-10 — a save on a repeating gathering (see `onSave` below)
            // stashes its patch here instead of sending it immediately;
            // closing the modal is the cue to ask this-vs-future.
            if (pendingEditPatch) setSeriesScopeModal("edit");
          }}
          onSave={(draft) => {
            // This modal only offers a plain-text location field — it can't
            // specify (or preserve) a directory link, so any change to the
            // location text implicitly detaches an existing one rather than
            // leaving it silently pointing at stale text. An untouched
            // location (only the title/date/etc. changed) leaves the link
            // exactly as it was.
            const locationChanged = draft.location !== gatheringState.location;
            // `draft.startAt` is the modal's local `"yyyy-mm-ddThh:mm"` wire
            // value (no timezone suffix), which `new Date(...)` parses as
            // local time — the same convention the create-gathering wizard
            // uses for its own date+time fields.
            const newStartAt = new Date(draft.startAt);
            const newDateDisplay = fmt.date(newStartAt, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            setGatheringState((current) => ({
              ...current,
              title: draft.title,
              date: newDateDisplay,
              startAt: newStartAt,
              location: draft.location,
              description: draft.description,
              visibility: draft.visibility,
              communitySlug: draft.communitySlug,
              ...(locationChanged
                ? { venueListingId: null, venueListing: null }
                : {}),
              details: current.details.map((detail) =>
                detail.id === "date"
                  ? { ...detail, value: newDateDisplay }
                  : detail.id === "venue"
                    ? { ...detail, value: draft.location }
                    : detail,
              ),
            }));
            const patch: UpdateEventDto = {
              title: draft.title,
              description: draft.description,
              // Reschedules the real event — the backend applies `startAt`
              // on PATCH and fans out an "event updated" notice to every
              // attendee/invitee when it actually changes (events.service.ts
              // `update()`'s `materialChanges` check). Never propagated to
              // future series siblings even under `scope: "future"` below —
              // each occurrence keeps its own date (see the backend's
              // `update()` doc).
              startAt: newStartAt.toISOString(),
              venue: draft.location,
              ...(locationChanged ? { listingId: null } : {}),
              visibility: draft.visibility,
              // Only include `communitySlug` when it actually changed from
              // the PERSISTED value (`gatheringState.communitySlug`, this
              // closure's pre-edit snapshot — never compare against `draft`
              // itself). The backend re-runs community-membership
              // authorization (`assertMemberBySlug`, 403/404) whenever this
              // key is present at all, so sending it unconditionally would
              // spuriously reject an unrelated edit (e.g. just the title) on
              // an event whose host has since left the community's roster.
              // "" (no community) sends explicit `null` — the edit modal's
              // only way to CLEAR a gathering's community. See
              // `UpdateEventDto` (events.api.ts) for why this is `| null`.
              ...(draft.communitySlug !== gatheringState.communitySlug
                ? { communitySlug: draft.communitySlug || null }
                : {}),
            };
            // MSG-10 — a repeating gathering defers the actual PATCH until
            // the host answers `SeriesEditScopeModal` (triggered from
            // `onClose` above); a standalone gathering sends it immediately,
            // exactly as before this feature existed.
            if (gathering?.series) {
              setPendingEditPatch(patch);
            } else {
              updateEvent.mutate(patch);
            }
          }}
        />
      )}

      {seriesScopeModal && (
        <SeriesEditScopeModal
          mode={seriesScopeModal}
          onChoose={chooseSeriesScope}
          onClose={() => {
            setSeriesScopeModal(null);
            setPendingEditPatch(null);
          }}
        />
      )}

      {messageOpen && (
        <MessageAttendeesModal
          attendeeCount={attendeeCount}
          onClose={() => setMessageOpen(false)}
        />
      )}
    </PageShell>
  );
}
