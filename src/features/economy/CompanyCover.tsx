import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { CompanyProfile } from "./companies.data";
import styles from "./CompanyPage.module.css";

const badgeClass: Record<
  NonNullable<CompanyProfile["badges"][number]["kind"]>,
  string | undefined
> = {
  verified: styles.badgeVerified,
  coral: styles.badgeCoral,
  plain: "",
};

export function CompanyCover({
  profile,
  openRoles,
  onSeeRoles,
}: {
  profile: CompanyProfile;
  openRoles: number;
  onSeeRoles: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [following, setFollowing] = useState(false);

  function toggleFollow() {
    setFollowing((wasFollowing) => {
      const next = !wasFollowing;
      showToast(
        t(
          next
            ? "economy:company.cover.toast.followed"
            : "economy:company.cover.toast.unfollowed",
          { name: profile.nameText },
        ),
        "success",
      );
      return next;
    });
  }

  return (
    <div className={styles.cover}>
      <div className={styles.coverInner}>
        <Link to={routes.jobs} className={styles.back}>
          <FiArrowLeft /> {t("economy:company.cover.backCta")}
        </Link>
        <div className={styles.head}>
          <div
            className={styles.logo}
            style={{ background: profile.logoBg, color: profile.logoText }}
          >
            {profile.logo}
          </div>
          <div className={styles.headText}>
            <h1 className={styles.name}>{profile.name}</h1>
            <p className={styles.tagline}>{profile.tagline}</p>
            <div className={styles.badges}>
              {profile.badges.map((badge) => (
                <span
                  key={badge.label}
                  className={[styles.badge, badgeClass[badge.kind ?? "plain"]]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <div className={styles.actions}>
              {openRoles > 0 && (
                <Button variant="primary" onClick={onSeeRoles}>
                  {t("economy:company.cover.seeOpenRoles", {
                    count: openRoles,
                  })}
                </Button>
              )}
              <Button
                variant="ghost-dark"
                onClick={toggleFollow}
                aria-pressed={following}
              >
                {following
                  ? t("economy:company.cover.following")
                  : t("economy:company.cover.follow")}
              </Button>
              <Button variant="ghost-dark" to={routes.messages}>
                {t("economy:company.cover.message")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.stats}>
        <div className={styles.statsInner}>
          {profile.stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <b>{stat.value}</b>
              {stat.label}
            </div>
          ))}
          <div className={styles.stat}>
            <b>{openRoles}</b>
            {t("economy:company.cover.openRoleStat", { count: openRoles })}
          </div>
        </div>
      </div>
    </div>
  );
}
