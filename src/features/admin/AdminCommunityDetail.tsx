import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import {
  Button,
  FadeIn,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminTabs, AdminAvatar, type AdminTab } from "./ui";
import { ScopedQueuePane, MembersPane } from "./AdminCommunityDetailTabs";
import { SettingsPane } from "./AdminCommunitySettings";
import { AdminHealthModal } from "./AdminHealthModal";
import { AdminSupportModal } from "./AdminSupportModal";
import { useAdminCommunity } from "./api/useAdminCommunities";
import { firstName } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

function BackLink({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.backLink} onClick={onBack}>
      <FiArrowLeft aria-hidden /> {t("admin:communities.detail.backCta")}
    </button>
  );
}

/**
 * Loading, error, and "loaded but missing" are kept distinct — mirroring the
 * rule `AdminSettingsHistory` follows. `data` is `undefined` in both the
 * error and the missing-after-load cases, so falling through past this guard
 * would either crash on `community.mods[0]!` or silently render nothing
 * useful. The back link is always present so a stalled or failed fetch never
 * strands the admin on a dead screen.
 */
export function AdminCommunityDetail({
  slug,
  onBack,
}: {
  slug: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [active, setActive] = useState("queue");
  const [health, setHealth] = useState(false);
  const [support, setSupport] = useState(false);
  const { data: community, isLoading, isError } = useAdminCommunity(slug);

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
            {community.desc}{" "}
            {community.mods.length === 0
              ? t("admin:communities.detail.foundedOnly", {
                  founded: community.founded,
                })
              : t("admin:communities.detail.stewardedBy", {
                  count: community.mods.length,
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
              onClick={() =>
                showToast(t("admin:communities.detail.settingsToast"), "info")
              }
            >
              {t("admin:communities.detail.settingsCta")}
            </Button>
          </div>
        </div>
      </div>

      {community.support && (
        <div className={styles.supportBanner}>
          <div>
            <h3 className={styles.bannerTitle}>
              <Translation
                i18nKey="admin:communities.detail.supportBanner.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p className={styles.bannerText}>
              {t(supportBannerTextKey(community.mods.length), {
                name: community.mods[0] ? firstName(community.mods[0].name) : "",
                members: community.members,
              })}
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setSupport(true)}>
            {t("admin:communities.detail.supportBanner.offerCta")}
          </Button>
        </div>
      )}

      <div className={styles.statBar}>
        <StatCell
          label={t("admin:communities.detail.stat.members")}
          value={community.members}
        />
        <StatCell
          label={t("admin:communities.detail.stat.activeThisWeek")}
          value={`${community.activePct}%`}
        />
        <StatCell
          label={t("admin:communities.detail.stat.openReports")}
          value={String(community.reports)}
          color={community.reports > 0 ? "var(--accent-ink)" : "var(--jade)"}
        />
        <StatCell
          label={t("admin:communities.detail.stat.handled")}
          value={`${community.resolvedPct}%`}
          color={community.resolvedPct >= 95 ? "var(--jade)" : "var(--amber)"}
        />
      </div>

      <AdminTabs
        tabs={tabs}
        active={active}
        onChange={setActive}
        className={styles.detailTabs}
      />

      {active === "queue" && <ScopedQueuePane community={community} />}
      {active === "members" && <MembersPane community={community} />}
      {active === "settings" && <SettingsPane community={community} />}

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
  if (moderatorCount === 0) return "admin:communities.detail.supportBanner.textNone";
  if (moderatorCount === 1) return "admin:communities.detail.supportBanner.textAlone";
  return "admin:communities.detail.supportBanner.textThin";
}
