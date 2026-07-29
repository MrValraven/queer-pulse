import { Link } from "react-router-dom";
import { FiLink, FiFileText, FiBookOpen, FiArrowUpRight } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { CommunityDetail } from "./communityDetails";
import type { CommunityResource, LivingCommunity } from "./community.model";
import { sisterCommunities } from "./communityConnections";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { leadingInitials } from "../../shared/lib/initials";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

const RESOURCE_ICON: Record<CommunityResource["kind"], IconType> = {
  link: FiLink,
  doc: FiFileText,
  guide: FiBookOpen,
};

export function AboutResourcesTab({
  info,
  living,
}: {
  info: CommunityDetail;
  living: LivingCommunity;
}) {
  const { t } = useTranslation();
  const sisters = sisterCommunities(living.slug);
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
            <span>{r}</span>
          </li>
        ))}
      </ol>

      <div className={detail.secLbl}>
        {t("communities:detail.aboutResources.resources")}
      </div>
      <div className={styles.shelf}>
        {living.resources.map((res) => {
          const Icon = RESOURCE_ICON[res.kind];
          return (
            <a className={styles.resource} href={res.href} key={res.title}>
              <span className={styles.resourceIc}>
                <Icon aria-hidden />
              </span>
              <span className={styles.resourceMain}>
                <span className={styles.resourceTitle}>{res.title}</span>
                {res.note && (
                  <span className={styles.resourceNote}>{res.note}</span>
                )}
              </span>
              <FiArrowUpRight aria-hidden className={styles.resourceArrow} />
            </a>
          );
        })}
      </div>

      {sisters.length > 0 && (
        <>
          <div className={detail.secLbl}>
            {t("communities:detail.aboutResources.sisterCommunities")}
          </div>
          <div className={styles.sisters}>
            {sisters.map(({ community, shared }) => (
              <Link
                className={styles.sister}
                to={`/community/${community.slug}`}
                key={community.slug}
              >
                <span className={styles.sisterIc}>
                  {leadingInitials(community.name)}
                </span>
                <span className={styles.sisterMain}>
                  <span className={styles.sisterName}>{community.name}</span>
                  <span className={styles.sisterShared}>
                    {t("communities:detail.aboutResources.sharedPeople", {
                      count: shared,
                    })}
                  </span>
                </span>
                <FiArrowUpRight aria-hidden className={styles.resourceArrow} />
              </Link>
            ))}
          </div>
        </>
      )}

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
