import { useSearchParams } from "react-router-dom";
import { FadeIn, Tabs } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Community } from "../homepage/data/types";
import type { CommunityDetail, Thread as ThreadData } from "./communityDetails";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import type { PulsePaging } from "./api/useCommunityPosts";
import { PulseTab } from "./PulseTab";
import { DiscussionTab } from "./DiscussionTab";
import { RosterTab } from "./RosterTab";
import { EventsTab } from "./EventsTab";
import { AboutResourcesTab } from "./AboutResourcesTab";
import { ModToolsTab } from "./ModToolsTab";
import styles from "./CommunityDetailPage.module.css";

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

  const baseTabs: { id: Tab; label: string }[] = [
    { id: "pulse", label: t("communities:detail.tabs.pulse") },
    { id: "discussion", label: t("communities:detail.tabs.discussion") },
    { id: "members", label: t("communities:detail.tabs.members") },
    { id: "events", label: t("communities:detail.tabs.events") },
    { id: "about", label: t("communities:detail.tabs.about") },
  ];
  const isMod = role === "owner" || role === "mod";
  const tabs = isMod
    ? [
        ...baseTabs,
        { id: "modtools" as Tab, label: t("communities:detail.tabs.modtools") },
      ]
    : baseTabs;
  // If a mod opens Mod tools then leaves (role drops), fall back to Pulse.
  const active: Tab = tab === "modtools" && !isMod ? "pulse" : tab;

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

      <FadeIn key={active}>
        {active === "pulse" && (
          <PulseTab
            community={living}
            name={community.name}
            isMember={isMember}
            paging={pulsePaging}
          />
        )}
        {active === "discussion" && (
          <DiscussionTab
            threads={threads}
            slug={slug}
            isMember={isMember}
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
        {active === "events" && <EventsTab events={living.events} />}
        {active === "about" && (
          <AboutResourcesTab info={info} living={living} />
        )}
        {active === "modtools" && <ModToolsTab living={living} />}
      </FadeIn>
    </div>
  );
}
