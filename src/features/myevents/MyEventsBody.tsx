import { sx } from "./myEvents.styles";
import { useMyEvents } from "./MyEventsContext";
import { OfflineBanner } from "./OfflineBanner";
import { MyEventsHeader } from "./MyEventsHeader";
import { MobileViewToggle } from "./MobileViewToggle";
import { EventPills } from "./EventPills";
import { EventToolbar } from "./EventToolbar";
import { DayFilterChip } from "./DayFilterChip";
import { EventAgenda } from "./EventAgenda";
import { CalendarCard } from "./CalendarCard";
import { AcceptInviteConfirm } from "./AcceptInviteConfirm";
import { RsvpDetailsModal } from "./RsvpDetailsModal";
import { EventTicketModal } from "./EventTicketModal";
import { EventSettingsModal } from "./EventSettingsModal";
import { SeriesScopeModal } from "./SeriesScopeModal";
import { ReportEventModal } from "./ReportEventModal";
import { BlockHostConfirm } from "./BlockHostConfirm";
import { MoreMenu } from "./MoreMenu";
import { BulkBar } from "./BulkBar";

/** The full dashboard layout (inside the provider so it can read state). */
export function MyEventsBody() {
  const c = useMyEvents();
  const layoutCls = sx(
    `ev-layout view-${c.mobileView}${c.density === "compact" ? " compact" : ""}${c.selectMode ? " selecting" : ""}`,
  );

  return (
    <>
      <OfflineBanner />
      <div className={sx("ev-page")}>
        <div className="wrap">
          <MyEventsHeader />
          <MobileViewToggle />
          <div className={layoutCls}>
            <div className={sx("agenda-col")}>
              <EventPills />
              <EventToolbar />
              <DayFilterChip />
              <EventAgenda />
            </div>
            <CalendarCard />
          </div>
        </div>
      </div>

      {/* Overlays — each modal is self-contained (built on the shared Modal /
          ConfirmDialog) and mounted only while open, so its a11y setup and
          local state run per open. */}
      <AcceptInviteConfirm />
      {c.details.open && <RsvpDetailsModal key={c.details.eventId ?? "none"} />}
      {c.ticket.open && <EventTicketModal key={c.ticket.eventId ?? "none"} />}
      {c.settingsOpen && <EventSettingsModal />}
      {c.scope.open && <SeriesScopeModal />}
      {c.report.open && <ReportEventModal key={c.report.eventId ?? "none"} />}
      <BlockHostConfirm />
      <MoreMenu />
      <BulkBar />
    </>
  );
}
