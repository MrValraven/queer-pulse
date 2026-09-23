import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import {
  Button,
  FadeIn,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { adminCommunityMod } from "../../app/routeMap";
import { AdminTabs, AdminAvatar, type AdminTab } from "./ui";
import { ScopedQueuePane, MembersPane } from "./AdminCommunityDetailTabs";
import { SettingsPane } from "./AdminCommunitySettings";
import { AdminCommunitySpaces } from "./AdminCommunitySpaces";
import { GovernanceLogPane } from "./AdminCommunityGovernanceLog";
import { AdminHealthModal } from "./AdminHealthModal";
import { AdminSupportModal } from "./AdminSupportModal";
import { useAdminCommunity } from "./api/useAdminCommunities";
import { firstName, type Community } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

function BackLink({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.backLink} onClick={onBack}>
      <FiArrowLeft aria-hidden /> {t("admin:communities.detail.backCta")}
    </button>
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

/** The "could use a hand" banner shown when a community's health score is
 *  low enough to flag for outreach. Self-contained aside from the callback
 *  that opens the support-offer modal owned by the parent screen. */
function SupportBanner({
  community,
  onOfferSupport,
}: {
  community: Community;
  onOfferSupport: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.supportBanner}>
      <div>
        <h3 className={styles.bannerTitle}>
          <Translation
            i18nKey="admin:communities.detail.supportBanner.title"
            components={{ em: <em /> }}
          />
        </h3>
        <p className={styles.bannerText}>
          {t(supportBannerTextKey(community.moderators.length), {
            name: community.moderators[0]
              ? firstName(community.moderators[0].name)
              : "",
            members: community.members,
          })}
        </p>
      </div>
      <Button variant="primary" size="md" onClick={onOfferSupport}>
        {t("admin:communities.detail.supportBanner.offerCta")}
      </Button>
    </div>
  );
}

/**
 * Loading, error, and "loaded but missing" are kept distinct — mirroring the
 * rule `AdminSettingsHistory` follows. `data` is `undefined` in both the
 * error and the missing-after-load cases, so falling through past this guard
 * would either crash on `community.moderators[0]!` or silently render nothing
 * useful. The back link is always present so a stalled or failed fetch never
 * strands the admin on a dead screen.
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
        <BackLink onBack={onBack} />
        <div className={styles.hero}>
          <SkeletonAvatar size={56} />
          <div className={styles.heroMain}>
            <SkeletonLine width="45%" height={32} />
            <SkeletonLine width="70%" style={{ marginTop: 12 }} />
            <div className={styles.heroChips}>
              <SkeletonLine width={130} height={32} />
              <SkeletonLine width={100} height={32} />
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (isError || !community) {
    return (
      <FadeIn>
        <BackLink onBack={onBack} />
        <p className={styles.loadError}>
          {t("admin:communities.grid.loadError")}
        </p>
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

  const words = community.name.split(/\s+/);
  const lead = words.slice(0, -1).join(" ");
  const lastWord = words[words.length - 1];

  const healthLabel = t(
    `admin:communities.detail.health.${labelFor(community.health)}`,
  );

  return (
    <FadeIn>
      <BackLink onBack={onBack} />

      <div className={styles.hero}>
        <AdminAvatar
          initials={community.initials}
          tone={community.tone}
          size="lg"
        />
        <div className={styles.heroMain}>
          <h1 className={styles.heroName}>
            {lead && `${lead} `}
            <em>{lastWord}</em>
          </h1>
          <p className={styles.heroDesc}>
            {community.description}{" "}
            {community.moderators.length === 0
              ? t("admin:communities.detail.foundedOnly", {
                  founded: community.founded,
                })
              : t("admin:communities.detail.stewardedBy", {
                  count: community.moderators.length,
                  founded: community.founded,
                })}
          </p>
          <div className={styles.heroChips}>
            <button
              type="button"
              className={`${styles.healthChip} ${styles[`hc_${healthTone(community.health)}`]}`}
              onClick={() => setHealth(true)}
            >
              <span className={styles.healthChipDot} aria-hidden />
              {t("admin:communities.detail.healthChip", {
                score: community.health,
                label: healthLabel,
              })}
            </button>
            <Button
              variant="ghost"
              size="md"
              to={adminCommunityMod(community.slug)}
            >
              {t("admin:communities.detail.settingsCta")}
            </Button>
          </div>
        </div>
      </div>

      {community.support && (
        <SupportBanner
          community={community}
          onOfferSupport={() => setSupport(true)}
        />
      )}

      <div className={styles.statBar}>
        <StatCell
          label={t("admin:communities.detail.stat.members")}
          value={community.members}
        />
        <StatCell
          label={t("admin:communities.detail.stat.activeThisWeek")}
          value={`${community.activePercent}%`}
        />
        <StatCell
          label={t("admin:communities.detail.stat.openReports")}
          value={String(community.reports)}
          color={community.reports > 0 ? "var(--accent-ink)" : "var(--jade)"}
        />
        <StatCell
          label={t("admin:communities.detail.stat.handled")}
          value={`${community.resolvedPercent}%`}
          color={
            community.resolvedPercent >= 95 ? "var(--jade)" : "var(--amber)"
          }
        />
      </div>

      <SpacesOverview community={community} onOpen={openCommunity} />

      <AdminTabs
        tabs={tabs}
        active={active}
        onChange={setActive}
        className={styles.detailTabs}
      />

      {active === "queue" && <ScopedQueuePane community={community} />}
      {active === "members" && <MembersPane community={community} />}
      {active === "settings" && <SettingsPane community={community} />}
      {active === "governance" && <GovernanceLogPane slug={community.slug} />}

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

function StatCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className={styles.statCell}>
      <div className={styles.statVal} style={color ? { color } : undefined}>
        {value}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function healthTone(score: number): "jade" | "amber" | "coral" {
  if (score >= 90) return "jade";
  if (score >= 78) return "amber";
  return "coral";
}

function labelFor(score: number): string {
  if (score >= 90) return "thriving";
  if (score >= 78) return "steady";
  return "needsHand";
}

/**
 * A community can legitimately have zero moderators — the backend drops a
 * moderator whose profile no longer resolves and just logs a warning rather
 * than failing the request — so `moderatorCount` can be 0, not just 1 or
 * many. `textNone` avoids naming a moderator that doesn't exist instead of
 * crashing on (or silently blanking) the missing name.
 */
function supportBannerTextKey(moderatorCount: number): string {
  if (moderatorCount === 0)
    return "admin:communities.detail.supportBanner.textNone";
  if (moderatorCount === 1)
    return "admin:communities.detail.supportBanner.textAlone";
  return "admin:communities.detail.supportBanner.textThin";
}
