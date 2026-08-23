import type { CommunityDetail } from "./communityDetails";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import { CommunityResourcesSection } from "./CommunityResourcesSection";
import { RULE_PRESET_KEYS } from "./startCommunity/startCommunity.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

export function AboutResourcesTab({
  info,
  living,
  role,
  isMember,
}: {
  info: CommunityDetail;
  living: LivingCommunity;
  /** The viewer's roster role — owner, co-owner and moderator get the shelf
   *  editor; everybody else reads the shelf as it always was. */
  role: CommunityRole | null;
  isMember: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div>
      {info.about.map((p, i) => (
        <p className={detail.aboutP} key={i}>
          {p}
        </p>
      ))}

      <div className={detail.secLbl}>
        {t("communities:detail.about.whoFor")}
      </div>
      {info.whoFor.map((w) => (
        <div className={detail.bullet} key={w}>
          <div className={detail.bulletDot} />
          <span>{w}</span>
        </div>
      ))}

      <div className={detail.secLbl}>
        {t("communities:detail.aboutResources.houseRules")}
      </div>
      <ol className={styles.rules}>
        {living.rules.map((r, i) => (
          <li className={styles.rule} key={r}>
            <span className={styles.ruleNum}>{i + 1}</span>
            {/* Preset rules are stored as i18n keys (a stable, language-
                independent id); custom rules are content typed by the member
                and rendered verbatim. Mirrors StepTone's covenant editor. */}
            <span>{RULE_PRESET_KEYS.includes(r) ? t(r) : r}</span>
          </li>
        ))}
      </ol>

      {/* The shelf reads the live `GET /communities/:slug/resources` (demo
          keeps the mock fixtures) and still renders nothing at all when a
          community has pinned nothing. `CommunityResourcesSection` owns that
          rule, plus the staff editor. */}
      <CommunityResourcesSection
        slug={living.slug}
        role={role}
        isMember={isMember}
      />

      <div className={detail.tagRow}>
        {info.tags.map((tag) => (
          <span className={detail.tag} key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
