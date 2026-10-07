import { useState } from "react";
import { Tabs } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EventHostDTO } from "./api/events.api";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import {
  MANAGE_GATHERING_TABS,
  MANAGE_TAB_PANEL_ID,
  type ManageGatheringTab,
} from "./gatheringPaths";
import { OverviewTab } from "./ManageOverviewTab";
import type { GatheringDetail, OverviewCounts } from "./ManageOverviewTab";
import { AttendeesTab } from "./ManageAttendeesTab";
import { MessagesTab } from "./ManageMessagesTab";
import { SettingsTab } from "./ManageSettingsTab";
import { CheckinTab } from "./checkin/CheckinTab";
import type { VenueSelection } from "./VenuePicker";
import styles from "./ManageGatheringPage.module.css";

export { ManageGatheringSidebar } from "./ManageGatheringSidebar";
type Tab = ManageGatheringTab;

interface ManageGatheringTabsProps {
  /** The tab on show, read off the URL (`?tab=`) by the page. */
  activeTab: Tab;
  /** Asks the page to switch tabs (it writes the URL). */
  onTabChange: (tab: Tab) => void;
  /** The door window is open now, so the Check-in tab wears a live dot. */
  isCheckinLive: boolean;
  /** The gathering's schedule, for the Check-in tab's meter and door state. */
  startAt: Date;
  endAt: Date | null;
  /** Event slug the attendee list is fetched for. */
  slug: string;
  onCancel: () => void;
  /** Opens the delete confirm; see `SettingsTab`. */
  onDelete: () => void;
  isDeletePending?: boolean;
  details: GatheringDetail[];
  description: string;
  /** Live going/waitlist/spots-left for the overview chips; demo omits it and
   *  the tab falls back to its static trio. */
  overviewCounts?: OverviewCounts;
  /** When the gathering was last edited, from the API. Demo omits it and the
   *  overview falls back to its mock constant (PRD-191). */
  updatedAt?: Date;
  venueListingId: string | null;
  venueListing: { slug: string; name: string } | null;
  /** The overview's field editors open on this draft and save through
   *  `onSaveEdit`. See `OverviewTab`. */
  buildEditDraft: () => GatheringDetailsDraft;
  onSaveEdit: (draft: GatheringDetailsDraft) => void;
  onUpdateVenue: (value: VenueSelection) => void;
  /** The event's real accepted co-hosts. See `CohostManager`. */
  cohosts?: EventHostDTO[];
  /** The "Options" toggles' real current values + persist callback. See
   *  `SettingsTab`. `undefined` in demo mode (the tab keeps its own local
   *  starting state). */
  allowWaitlist?: boolean;
  showAttendeeCount?: boolean;
  /** The host's own RSVP question, which labels each attendee's answer in the
   *  Attendees tab. Absent in demo, where a generic label stands in. */
  customRsvpQuestion?: string | null;
  /** The host's own slug, so the Attendees tab can mark the host's row and
   *  keep Remove and Bar off it. Absent in demo, whose roster is all guests. */
  hostSlug?: string;
  onUpdateSettings?: (patch: {
    allowWaitlist?: boolean;
    showAttendeeCount?: boolean;
  }) => void;
}

const TAB_ORDER: readonly Tab[] = MANAGE_GATHERING_TABS;

const TAB_LABEL_KEYS: Record<Tab, string> = {
  overview: "gatherings:manage.tabs.overview",
  checkin: "gatherings:manage.tabs.checkin",
  attendees: "gatherings:manage.tabs.attendees",
  messages: "gatherings:manage.tabs.messages",
  settings: "gatherings:manage.tabs.settings",
};

export function ManageGatheringTabs({
  activeTab: tab,
  onTabChange,
  isCheckinLive,
  startAt,
  endAt,
  slug,
  onCancel,
  onDelete,
  isDeletePending,
  details,
  description,
  overviewCounts,
  updatedAt,
  venueListingId,
  venueListing,
  buildEditDraft,
  onSaveEdit,
  onUpdateVenue,
  cohosts,
  allowWaitlist,
  showAttendeeCount,
  customRsvpQuestion,
  hostSlug,
  onUpdateSettings,
}: ManageGatheringTabsProps) {
  const { t } = useTranslation();
  // Which way the last switch went, so the incoming panel drifts in from the
  // side its tab sits on (a later tab from the right). Null until the first
  // switch: the panel the page opens on just appears. The tab lives in the
  // URL, so a switch can come from the header's Check-in button or a link
  // too; comparing against the tab shown last render catches them all.
  const [shownTab, setShownTab] = useState<Tab>(tab);
  const [switchDirection, setSwitchDirection] = useState<
    "forward" | "backward" | null
  >(null);
  if (tab !== shownTab) {
    setShownTab(tab);
    setSwitchDirection(
      TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(shownTab)
        ? "forward"
        : "backward",
    );
  }
  const changeTab = (nextTab: Tab) => {
    onTabChange(nextTab);
  };
  return (
    <div>
      <Tabs
        variant="underline"
        className={styles.tabBar}
        tabs={TAB_ORDER.map((tabId) => ({
          id: tabId,
          label: t(TAB_LABEL_KEYS[tabId]),
          icon:
            tabId === "checkin" && isCheckinLive ? (
              <span className={styles.liveDot} aria-hidden />
            ) : undefined,
        }))}
        active={tab}
        onChange={(id) => changeTab(id as Tab)}
      />
      {/* Keyed by tab: each switch remounts it and replays the animation. */}
      <div
        key={tab}
        id={MANAGE_TAB_PANEL_ID}
        className={styles.tabPanel}
        tabIndex={-1}
        data-direction={switchDirection ?? undefined}
      >
        {tab === "overview" && (
          <OverviewTab
            slug={slug}
            details={details}
            description={description}
            counts={overviewCounts}
            updatedAt={updatedAt}
            venueListingId={venueListingId}
            venueListing={venueListing}
            buildEditDraft={buildEditDraft}
            onSaveEdit={onSaveEdit}
            onUpdateVenue={onUpdateVenue}
          />
        )}
        {tab === "checkin" && (
          <CheckinTab
            slug={slug}
            startAt={startAt}
            endAt={endAt}
            customRsvpQuestion={customRsvpQuestion}
          />
        )}
        {tab === "attendees" && (
          <AttendeesTab
            slug={slug}
            customRsvpQuestion={customRsvpQuestion}
            hostSlug={hostSlug}
          />
        )}
        {tab === "messages" && <MessagesTab slug={slug} />}
        {tab === "settings" && (
          <SettingsTab
            slug={slug}
            onCancel={onCancel}
            onDelete={onDelete}
            isDeletePending={isDeletePending}
            cohosts={cohosts}
            allowWaitlist={allowWaitlist}
            showAttendeeCount={showAttendeeCount}
            onUpdateSettings={onUpdateSettings}
          />
        )}
      </div>
    </div>
  );
}
