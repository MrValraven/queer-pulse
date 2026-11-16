import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { adminCommunityDetail } from "../../app/routeMap";
import { AdminNotice, AdminTabs, type AdminTab } from "./ui";
import { ScopedQueuePane, MembersPane } from "./AdminCommunityDetailTabs";
import { SettingsPane } from "./AdminCommunitySettings";
import { GovernanceLogPane } from "./AdminCommunityGovernanceLog";
import { AdminHealthModal } from "./AdminHealthModal";
import { AdminSupportModal } from "./AdminSupportModal";
import {
  CommunityDetailHeader,
  CommunityDetailStats,
  SupportNotice,
} from "./AdminCommunityDetailHeader";
import {
  PlaceholderHeader,
  SpacesOverview,
} from "./AdminCommunityDetailOverview";
import { useAdminCommunity } from "./api/useAdminCommunities";
import styles from "./AdminCommunitiesPage.module.css";

const ID_PREFIX = "admin-community";
const DEFAULT_TAB = "queue";
const TAB_IDS = ["queue", "members", "settings", "governance"] as const;

/** The `?tab=` value when it names one of the four tabs, else the queue. */
function tabFromSearch(tabParam: string | null): string {
  return TAB_IDS.find((tabId) => tabId === tabParam) ?? DEFAULT_TAB;
}

/**
 * Loading, error, and "loaded but missing" are kept distinct, following the
 * rule `AdminSettingsHistory` follows. `data` is `undefined` in both the
 * error and the missing-after-load cases, so falling through past this guard
 * would either crash on `community.moderators[0]!` or silently render nothing
 * useful. The header always carries the way back, so a stalled or failed
 * fetch never strands the admin on a dead screen.
 *
 * The URL is the single source of truth: `slug` comes from the route and the
 * active tab from `?tab=`. Drilling into a space or its parent pushes that
 * community's own detail route, so browser Back returns to the community the
 * admin came from. A tab switch replaces the entry, keeping history one step
 * per community; the queue drops the param so the default URL stays clean.
 */
export function AdminCommunityDetail({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const active = tabFromSearch(searchParams.get("tab"));
  const [health, setHealth] = useState(false);
  const [support, setSupport] = useState(false);
  const { data: community, isLoading, isError } = useAdminCommunity(slug);

  function openCommunity(nextSlug: string) {
    void navigate(adminCommunityDetail(nextSlug));
  }

  function changeTab(nextTab: string) {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (nextTab === DEFAULT_TAB) nextParams.delete("tab");
        else nextParams.set("tab", nextTab);
        return nextParams;
      },
      { replace: true },
    );
  }

  if (isLoading) {
    return (
      <FadeIn>
        <PlaceholderHeader />
        <div className={styles.detailStack} aria-hidden>
          <SkeletonLine width="70%" />
          <SkeletonLine width="100%" height={96} />
        </div>
      </FadeIn>
    );
  }

  if (isError || !community) {
    return (
      <FadeIn>
        <PlaceholderHeader />
        <AdminNotice tone="error">
          {t(
            isError
              ? "admin:communities.grid.loadError"
              : "admin:communities.detail.notFound",
          )}
        </AdminNotice>
      </FadeIn>
    );
  }

  const tabs: AdminTab[] = [
    {
      id: "queue",
      label: t("admin:communities.detail.tabs.queue"),
      count: community.reports,
    },
    { id: "members", label: t("admin:communities.detail.tabs.members") },
    { id: "settings", label: t("admin:communities.detail.tabs.settings") },
    {
      id: "governance",
      label: t("admin:communities.detail.tabs.governanceLog"),
    },
  ];

  return (
    <FadeIn>
      <CommunityDetailHeader
        community={community}
        onHealth={() => setHealth(true)}
      />

      <div className={styles.detailStack}>
        {community.support && (
          <SupportNotice
            community={community}
            onOfferSupport={() => setSupport(true)}
          />
        )}
        <CommunityDetailStats community={community} />
        <SpacesOverview community={community} onOpen={openCommunity} />
      </div>

      <AdminTabs
        idPrefix={ID_PREFIX}
        label={community.name}
        tabs={tabs}
        active={active}
        onChange={changeTab}
        className={styles.detailTabs}
      />

      <div
        role="tabpanel"
        id={`${ID_PREFIX}-panel-${active}`}
        aria-labelledby={`${ID_PREFIX}-tab-${active}`}
      >
        {active === "queue" && <ScopedQueuePane community={community} />}
        {active === "members" && <MembersPane community={community} />}
        {active === "settings" && <SettingsPane community={community} />}
        {active === "governance" && <GovernanceLogPane slug={community.slug} />}
      </div>

      {health && (
        <AdminHealthModal
          community={community}
          onClose={() => setHealth(false)}
          onOfferSupport={() => setSupport(true)}
        />
      )}
      {support && (
        <AdminSupportModal
          community={community}
          onClose={() => setSupport(false)}
        />
      )}
    </FadeIn>
  );
}
