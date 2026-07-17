import { useTranslation } from "../../shared/i18n/useTranslation";
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
import { ModalShell } from "./ModalShell";
import { AcceptInviteConfirm } from "./AcceptInviteConfirm";
import { RsvpDetailsModal } from "./RsvpDetailsModal";
import { EventSettingsModal } from "./EventSettingsModal";
import { SeriesScopeModal } from "./SeriesScopeModal";
import { ReportEventModal } from "./ReportEventModal";
import { BlockHostConfirm } from "./BlockHostConfirm";
import { MoreMenu } from "./MoreMenu";
import { BulkBar } from "./BulkBar";

/** The full dashboard layout (inside the provider so it can read state). */
export function MyEventsBody() {
  const { t } = useTranslation();
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

      {/* Overlays */}
      <AcceptInviteConfirm />
      <ModalShell
        open={c.details.open}
        onClose={c.closeDetails}
        label={t("myevents:modal.rsvpDetailsLabel")}
      >
        <RsvpDetailsModal key={c.details.evId ?? "none"} />
      </ModalShell>
      <ModalShell
        open={c.settingsOpen}
        onClose={c.closeSettings}
        label={t("myevents:modal.preferencesLabel")}
      >
        <EventSettingsModal key={c.settingsOpen ? "on" : "off"} />
      </ModalShell>
      <ModalShell
        open={c.scope.open}
        onClose={c.closeScope}
        label={t("myevents:modal.cancelRsvpLabel")}
        narrow
      >
        <SeriesScopeModal />
      </ModalShell>
      <ModalShell
        open={c.report.open}
        onClose={c.closeReport}
        label={t("myevents:modal.reportLabel")}
      >
        <ReportEventModal key={c.report.evId ?? "none"} />
      </ModalShell>
      <ModalShell
        open={c.block.open}
        onClose={c.closeBlock}
        label={t("myevents:modal.blockLabel")}
        narrow
      >
        <BlockHostConfirm key={c.block.evId ?? "none"} />
      </ModalShell>
      <MoreMenu />
      <BulkBar />
    </>
  );
}
