import {
  FiActivity,
  FiArrowLeft,
  FiCheckCircle,
  FiFlag,
  FiUsers,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { adminCommunityMod } from "../../app/routeMap";
import { AdminNotice, AdminPageHeader, AdminStat, AdminStatTiles } from "./ui";
import { firstName, type Community } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

/** The detail's way back to the grid, as a header action. */
export function BackToGridButton({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <Button variant="ghost" size="md" onClick={onBack}>
      <FiArrowLeft aria-hidden /> {t("admin:communities.detail.backCta")}
    </Button>
  );
}

/**
 * The detail page header: the community's name with its last word in the
 * coral italic, its description and stewardship line as the sub, and the
 * health score, mod panel link and way back as actions.
 */
export function CommunityDetailHeader({
  community,
  onBack,
  onHealth,
}: {
  community: Community;
  onBack: () => void;
  onHealth: () => void;
}) {
  const { t } = useTranslation();
  const words = community.name.split(/\s+/);
  const lead = words.slice(0, -1).join(" ");
  const lastWord = words[words.length - 1];
  const healthLabel = t(
    `admin:communities.detail.health.${labelFor(community.health)}`,
  );

  return (
    <AdminPageHeader
      eyebrow={t("shared:adminNav.sections.communities")}
      title={
        <>
          {lead && `${lead} `}
          <em>{lastWord}</em>
        </>
      }
      sub={
        <>
          {community.description}{" "}
          {community.moderators.length === 0
            ? t("admin:communities.detail.foundedOnly", {
                founded: community.founded,
              })
            : t("admin:communities.detail.stewardedBy", {
                count: community.moderators.length,
                founded: community.founded,
              })}
        </>
      }
      meta={
        <button
          type="button"
          className={`${styles.healthChip} ${styles[`hc_${healthTone(community.health)}`]}`}
          onClick={onHealth}
        >
          <span className={styles.healthChipDot} aria-hidden />
          {t("admin:communities.detail.healthChip", {
            score: community.health,
            label: healthLabel,
          })}
        </button>
      }
      actions={
        <>
          <BackToGridButton onBack={onBack} />
          <Button
            variant="ghost"
            size="md"
            to={adminCommunityMod(community.slug)}
          >
            {t("admin:communities.detail.settingsCta")}
          </Button>
        </>
      }
    />
  );
}

/** The "could use a hand" notice shown when a community's health score is
 *  low enough to flag for outreach. The action opens the support-offer modal
 *  owned by the parent screen. */
export function SupportNotice({
  community,
  onOfferSupport,
}: {
  community: Community;
  onOfferSupport: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AdminNotice
      tone="warn"
      title={
        <Translation
          i18nKey="admin:communities.detail.supportBanner.title"
          components={{ em: <em /> }}
        />
      }
      action={
        <Button variant="primary" size="md" onClick={onOfferSupport}>
          {t("admin:communities.detail.supportBanner.offerCta")}
        </Button>
      }
    >
      {t(supportBannerTextKey(community.moderators.length), {
        name: community.moderators[0]
          ? firstName(community.moderators[0].name)
          : "",
        members: community.members,
      })}
    </AdminNotice>
  );
}

/** Members, weekly activity, open reports and the share handled. */
export function CommunityDetailStats({ community }: { community: Community }) {
  const { t } = useTranslation();
  return (
    <AdminStatTiles columns={4}>
      <AdminStat
        icon={FiUsers}
        label={t("admin:communities.detail.stat.members")}
        value={community.members}
      />
      <AdminStat
        icon={FiActivity}
        label={t("admin:communities.detail.stat.activeThisWeek")}
        value={`${community.activePercent}%`}
      />
      <AdminStat
        icon={FiFlag}
        label={t("admin:communities.detail.stat.openReports")}
        value={String(community.reports)}
        tone={community.reports > 0 ? "warn" : "default"}
      />
      <AdminStat
        icon={FiCheckCircle}
        label={t("admin:communities.detail.stat.handled")}
        value={`${community.resolvedPercent}%`}
        tone={community.resolvedPercent >= 95 ? "default" : "warn"}
      />
    </AdminStatTiles>
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
 * A community can legitimately have zero moderators: the backend drops a
 * moderator whose profile no longer resolves and logs a warning, so
 * `moderatorCount` can be 0 as well as 1 or many. `textNone` keeps the copy
 * from naming a moderator who is missing.
 */
function supportBannerTextKey(moderatorCount: number): string {
  if (moderatorCount === 0)
    return "admin:communities.detail.supportBanner.textNone";
  if (moderatorCount === 1)
    return "admin:communities.detail.supportBanner.textAlone";
  return "admin:communities.detail.supportBanner.textThin";
}
