import { useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminNotice, AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { ScopedQueuePane, MembersPane } from "./AdminCommunityDetailTabs";
import { SettingsPane } from "./AdminCommunitySettings";
import { AdminCommunitySpaces } from "./AdminCommunitySpaces";
import { GovernanceLogPane } from "./AdminCommunityGovernanceLog";
import { AdminHealthModal } from "./AdminHealthModal";
import { AdminSupportModal } from "./AdminSupportModal";
import {
  BackToGridButton,
  CommunityDetailHeader,
  CommunityDetailStats,
  SupportNotice,
} from "./AdminCommunityDetailHeader";
import { useAdminCommunity } from "./api/useAdminCommunities";
import type { Community } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

const ID_PREFIX = "admin-community";

/** The header shown while the community loads or after it fails: the
 *  section's own title and the way back, so a stalled fetch never strands the
 *  admin on a dead screen. */
function PlaceholderHeader({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <AdminPageHeader
      eyebrow={t("shared:adminNav.sections.communities")}
      title={
        <Translation
          i18nKey="admin:communities.title"
          components={{ em: <em /> }}
        />
      }
      actions={<BackToGridButton onBack={onBack} />}
    />
  );
}

/** The overview area's parent/spaces line: a space names the community it
 *  lives inside; a top-level community lists the spaces it hosts. `onOpen`
 *  drills `AdminCommunityDetail` into whichever community is clicked. */
function SpacesOverview({
  community,
  onOpen,
}: {
  community: Community;
  onOpen: (slug: string) => void;
}) {
  const { t } = useTranslation();
  if (community.parent) {
    const parent = community.parent;
    return (
      <button
        type="button"
        className={styles.linkBtn}
        onClick={() => onOpen(parent.slug)}
      >
        {t("admin:communities.detail.parent", { name: parent.name })}
      </button>
    );
  }
  return <AdminCommunitySpaces community={community} onOpen={onOpen} />;
}

/**
 * Loading, error, and "loaded but missing" are kept distinct, following the
 * rule `AdminSettingsHistory` follows. `data` is `undefined` in both the
 * error and the missing-after-load cases, so falling through past this guard
 * would either crash on `community.moderators[0]!` or silently render nothing
 * useful. The header always carries the way back, so a stalled or failed
 * fetch never strands the admin on a dead screen.
 *
 * `currentSlug` tracks the community actually shown, separate from the `slug`
 * prop: a space's parent line and a top-level community's spaces list both
 * drill into another community's admin detail without leaving this screen or
 * involving `AdminCommunitiesPage` (which only knows how to open a top-level
 * community from the grid). `onBack` always returns to that grid, even from a
 * drilled-into space, mirroring the single-level back stack the grid itself
 * already has.
 */
export function AdminCommunityDetail({
  slug,
  onBack,
}: {
  slug: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [currentSlug, setCurrentSlug] = useState(slug);
  // Resets `currentSlug` when `slug` itself changes (a fresh community opened
  // from the grid). The adjustment happens during render, following React's
  // own recommended pattern for "state that resets when a prop changes"
  // (https://react.dev/reference/react/useState#storing-information-from-previous-renders).
  const [previousSlugProp, setPreviousSlugProp] = useState(slug);
  if (slug !== previousSlugProp) {
    setPreviousSlugProp(slug);
    setCurrentSlug(slug);
  }
  const [active, setActive] = useState("queue");
  const [health, setHealth] = useState(false);
  const [support, setSupport] = useState(false);
  const {
    data: community,
    isLoading,
    isError,
  } = useAdminCommunity(currentSlug);

  function openCommunity(nextSlug: string) {
    setCurrentSlug(nextSlug);
    setActive("queue");
    window.scrollTo(0, 0);
  }

  if (isLoading) {
    return (
      <FadeIn>
        <PlaceholderHeader onBack={onBack} />
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
        <PlaceholderHeader onBack={onBack} />
        <AdminNotice tone="error">
          {t("admin:communities.grid.loadError")}
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
        onBack={onBack}
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
        onChange={setActive}
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
