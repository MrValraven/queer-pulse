import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminTabs, AdminAvatar, type AdminTab } from "./ui";
import { ScopedQueuePane, MembersPane } from "./AdminCommunityDetailTabs";
import { SettingsPane } from "./AdminCommunitySettings";
import { AdminHealthModal } from "./AdminHealthModal";
import { AdminSupportModal } from "./AdminSupportModal";
import { firstName, type Community } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

export function AdminCommunityDetail({
  community,
  onBack,
}: {
  community: Community;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [active, setActive] = useState("queue");
  const [health, setHealth] = useState(false);
  const [support, setSupport] = useState(false);

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
      <button type="button" className={styles.backLink} onClick={onBack}>
        <FiArrowLeft aria-hidden /> {t("admin:communities.detail.backCta")}
      </button>

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
            {t("admin:communities.detail.stewardedBy", {
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
              {t(
                community.mods.length < 2
                  ? "admin:communities.detail.supportBanner.textAlone"
                  : "admin:communities.detail.supportBanner.textThin",
                {
                  name: firstName(community.mods[0]!.name),
                  members: community.members,
                },
              )}
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
          label={t("admin:communities.detail.stat.resolvedOnTime")}
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
