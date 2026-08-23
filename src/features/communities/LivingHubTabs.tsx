import { useSearchParams } from "react-router-dom";
import { FiEyeOff } from "react-icons/fi";
import { FadeIn, Tabs } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Community } from "../homepage/data/types";
import type { CommunityDetail, Thread as ThreadData } from "./communityDetails";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import type { PulsePaging } from "./api/useCommunityPosts";
import type { CommunityPulseResult } from "./api/useCommunityPulse";
import { PulseTab } from "./PulseTab";
import { DiscussionTab } from "./DiscussionTab";
import { RosterTab } from "./RosterTab";
import { EventsTab } from "./EventsTab";
import { AboutResourcesTab } from "./AboutResourcesTab";
import { ModToolsTab } from "./ModToolsTab";
import { CommunityNotificationControl } from "./CommunityNotificationControl";
import { isCommunityStaff } from "./communityStaff";
import styles from "./CommunityDetailPage.module.css";
import notificationStyles from "./CommunityNotificationControl.module.css";

type Tab = "pulse" | "discussion" | "members" | "events" | "about" | "modtools";

const TABS: Tab[] = [
  "pulse",
  "discussion",
  "members",
  "events",
  "about",
  "modtools",
];
const isTab = (value: string | null): value is Tab =>
  value != null && (TABS as string[]).includes(value);

/** A founder/edit-modal feature id is "on" when the community's `features`
 *  array includes it — or when the array itself is absent (demo mock data
 *  seeded before this field existed defaults every feature on, matching the
 *  hub's behaviour before tabs were gated). */
function featureOn(features: string[] | undefined, id: string): boolean {
  return features == null || features.includes(id);
}

export function LivingHubTabs({
  community,
  info,
  living,
  threads,
  slug,
  isMember,
  role,
  pulsePaging,
  discussionPaging,
  rosterPaging,
  communityPulse,
}: {
  community: Community;
  info: CommunityDetail;
  living: LivingCommunity;
  threads: ThreadData[];
  slug: string;
  isMember: boolean;
  role: CommunityRole | null;
  pulsePaging: PulsePaging;
  discussionPaging: PulsePaging;
  rosterPaging: PulsePaging;
  /** Live-mode events source + loading/error state for the Events tab (inert
   *  in demo, where the tab reads `living.events` directly). */
  communityPulse: CommunityPulseResult;
}) {
  const { t } = useTranslation();
  // The active tab lives in the URL (?tab=), so a tab is deep-linkable,
  // survives a refresh, and the back button restores it. Falls back to Pulse
  // for a missing or unknown value.
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = isTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as Tab)
    : "pulse";
  const setTab = (next: Tab) =>
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next === "pulse") params.delete("tab");
        else params.set("tab", next);
        return params;
      },
      { replace: true },
    );

  // Owner, co-owner and moderator all speak for the community: they get the
  // Mod tools tab, they see a tab the founder hid, and they may post an
  // announcement (the server refuses anybody else with a 403, so the
  // composer's switch is gated on the same set). Comparing against "owner"
  // and "mod" by hand here is what used to hide every moderation surface
  // from a co-owner.
  const isStaff = isCommunityStaff(role);
  // The founder's "events"/"roster" feature toggles (plus "show roster to
  // members" for roster specifically) decide whether each tab is really on.
  // An owner/mod who turned one off still sees it themselves — with a
  // "hidden from members" note below — everyone else just doesn't get the
  // tab. `living.features`/`rosterVisible` are `undefined` for demo mock data
  // seeded before these fields existed, which `featureOn`/the `?? true`
  // default treat as "on" (today's unchanged behaviour).
  const eventsOn = featureOn(living.features, "events");
  const rosterOn =
    featureOn(living.features, "roster") && (living.rosterVisible ?? true);
  const showEvents = eventsOn || isStaff;
  const showMembers = rosterOn || isStaff;

  const baseTabs: { id: Tab; label: string }[] = [
    { id: "pulse", label: t("communities:detail.tabs.pulse") },
    { id: "discussion", label: t("communities:detail.tabs.discussion") },
    ...(showMembers
      ? [{ id: "members" as Tab, label: t("communities:detail.tabs.members") }]
      : []),
    ...(showEvents
      ? [{ id: "events" as Tab, label: t("communities:detail.tabs.events") }]
      : []),
    { id: "about", label: t("communities:detail.tabs.about") },
  ];
  const tabs = isStaff
    ? [
        ...baseTabs,
        { id: "modtools" as Tab, label: t("communities:detail.tabs.modtools") },
      ]
    : baseTabs;
  // If the active tab is no longer offered (mod tools after a role drop, or a
  // tab the founder just hid), fall back to Pulse.
  const active: Tab =
    (tab === "modtools" && !isStaff) ||
    (tab === "events" && !showEvents) ||
    (tab === "members" && !showMembers)
      ? "pulse"
      : tab;

  const count: Partial<Record<Tab, number>> = {
    pulse: living.pinned.length + living.pulse.length,
    discussion: threads.length,
    members: living.stats.members,
    events: living.events.filter((e) => !e.past).length,
    modtools:
      (living.joinRequests?.length ?? 0) + (living.reports?.length ?? 0),
  };

  return (
    <div>
      {/* The member's own notification level rides in the tab row: it belongs
          to every member (so never in mod tools) and this strip is the one
          part of the hub that stays put whichever tab is open. */}
      <div className={notificationStyles.tabRow}>
        <div className={notificationStyles.tabRowTabs}>
          <Tabs
            className={styles.tabs}
            variant="underline"
            tabs={tabs.map((t) => ({
              id: t.id,
              label: t.label,
              count: count[t.id],
            }))}
            active={active}
            onChange={(id) => setTab(id as Tab)}
          />
        </div>
        {isMember && (
          <div className={notificationStyles.tabRowControl}>
            <CommunityNotificationControl
              key={slug}
              slug={slug}
              communityName={community.name}
            />
          </div>
        )}
      </div>

      <LivingHubTabContent
        active={active}
        isStaff={isStaff}
        eventsOn={eventsOn}
        rosterOn={rosterOn}
        community={community}
        info={info}
        living={living}
        threads={threads}
        slug={slug}
        isMember={isMember}
        role={role}
        pulsePaging={pulsePaging}
        discussionPaging={discussionPaging}
        rosterPaging={rosterPaging}
        communityPulse={communityPulse}
      />
    </div>
  );
}

/** The active tab's content. Split out of `LivingHubTabs` (which already owns
 *  the tab bar + all the visibility/gating logic) to keep each component
 *  under the repo's 200-line limit. */
function LivingHubTabContent({
  active,
  isStaff,
  eventsOn,
  rosterOn,
  community,
  info,
  living,
  threads,
  slug,
  isMember,
  role,
  pulsePaging,
  discussionPaging,
  rosterPaging,
  communityPulse,
}: {
  active: Tab;
  isStaff: boolean;
  eventsOn: boolean;
  rosterOn: boolean;
  community: Community;
  info: CommunityDetail;
  living: LivingCommunity;
  threads: ThreadData[];
  slug: string;
  isMember: boolean;
  role: CommunityRole | null;
  pulsePaging: PulsePaging;
  discussionPaging: PulsePaging;
  rosterPaging: PulsePaging;
  communityPulse: CommunityPulseResult;
}) {
  const { t } = useTranslation();
  return (
    <FadeIn key={active}>
      {isStaff && active === "events" && !eventsOn && (
        <p className={styles.hiddenNote}>
          <FiEyeOff aria-hidden />
          {t("communities:detail.hiddenFromMembers")}
        </p>
      )}
      {isStaff && active === "members" && !rosterOn && (
        <p className={styles.hiddenNote}>
          <FiEyeOff aria-hidden />
          {t("communities:detail.hiddenFromMembers")}
        </p>
      )}
      {active === "pulse" && (
        <PulseTab
          community={living}
          name={community.name}
          isMember={isMember}
          canModerate={isStaff}
          canAnnounce={isStaff}
          frozen={!!living.frozen}
          paging={pulsePaging}
        />
      )}
      {active === "discussion" && (
        <DiscussionTab
          threads={threads}
          slug={slug}
          isMember={isMember}
          canModerate={isStaff}
          frozen={!!living.frozen}
          paging={discussionPaging}
        />
      )}
      {active === "members" && (
        <RosterTab
          roster={living.roster}
          total={living.stats.members}
          slug={living.slug}
          paging={rosterPaging}
        />
      )}
      {active === "events" && (
        <EventsTab
          events={living.events}
          communitySlug={living.slug}
          isMember={isMember}
          isLoading={communityPulse.isLoading}
          isError={communityPulse.isError}
          onRetry={communityPulse.refetch}
        />
      )}
      {active === "about" && (
        <AboutResourcesTab
          info={info}
          living={living}
          role={role}
          isMember={isMember}
        />
      )}
      {active === "modtools" && (
        <ModToolsTab
          living={living}
          role={role}
          communityName={community.name}
          rosterPaging={rosterPaging}
        />
      )}
    </FadeIn>
  );
}
