import { useEffect, useState } from "react";
import { FadeIn, Tabs } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  CommunityDetail,
  Person,
  Thread as ThreadData,
} from "./communityDetails";
import type { PulsePaging } from "./api/useCommunityPosts";
import { AboutTab, ForumTab, MembersTab } from "./CommunityTabs";
import styles from "./CommunityDetailPage.module.css";

type Tab = "about" | "members" | "forum";

/**
 * The lighter three-tab layout for non-flagship communities (those without
 * enriched "living" data). Owns its own loading state so the effect never runs
 * on the flagship path.
 */
export function FallbackHubTabs({
  detail,
  members,
  hasCount,
  memberNum,
  threads,
  slug,
  isMember,
  discussionPaging,
}: {
  detail: CommunityDetail;
  members: Person[];
  hasCount: boolean;
  memberNum: number;
  threads: ThreadData[];
  slug: string;
  isMember: boolean;
  discussionPaging: PulsePaging;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("about");

  // Simulate a short fetch when opening a data-heavy tab so its grid/threads
  // can skeleton then fade in (the About tab is static — no load needed).
  const [tabLoading, setTabLoading] = useState(false);
  useEffect(() => {
    if (tab === "about") {
      // Simulated tab-load skeleton timer, cleared on unmount / tab change below.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTabLoading(false);
      return;
    }
    setTabLoading(true);
    const t = setTimeout(() => setTabLoading(false), 500);
    return () => clearTimeout(t);
  }, [tab]);

  return (
    <div>
      <Tabs
        className={styles.tabs}
        variant="underline"
        tabs={[
          { id: "about", label: t("communities:detail.tabs.about") },
          {
            id: "members",
            label: t("communities:detail.tabs.members"),
            count: hasCount ? memberNum : undefined,
          },
          {
            id: "forum",
            label: t("communities:detail.tabs.forum"),
            count: threads.length,
          },
        ]}
        active={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      <FadeIn key={tab}>
        {tab === "about" && <AboutTab detail={detail} />}
        {tab === "members" && (
          <MembersTab
            members={members}
            hasCount={hasCount}
            memberNum={memberNum}
            loading={tabLoading}
          />
        )}
        {tab === "forum" && (
          <ForumTab
            threads={threads}
            slug={slug}
            isMember={isMember}
            loading={tabLoading}
            paging={discussionPaging}
          />
        )}
      </FadeIn>
    </div>
  );
}
