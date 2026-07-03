import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
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
  const { showToast } = useToast();
  const [following, setFollowing] = useState(false);

  function toggleFollow() {
    setFollowing((f) => {
      const next = !f;
      showToast(
        next
          ? `Following ${profile.nameText} — you'll hear about new roles`
          : `Unfollowed ${profile.nameText}`,
        "success",
      );
      return next;
    });
  }

  return (
    <div className={styles.cover}>
      <div className={styles.coverInner}>
        <Link to={routes.jobs} className={styles.back}>
          <FiArrowLeft /> All companies
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
              {profile.badges.map((b) => (
                <span
                  key={b.label}
                  className={[styles.badge, badgeClass[b.kind ?? "plain"]]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {b.label}
                </span>
              ))}
            </div>
            <div className={styles.actions}>
              {openRoles > 0 && (
                <Button variant="primary" onClick={onSeeRoles}>
                  See {openRoles} open role{openRoles > 1 ? "s" : ""}
                </Button>
              )}
              <Button
                variant="ghost-dark"
                onClick={toggleFollow}
                aria-pressed={following}
              >
                {following ? "Following" : "Follow company"}
              </Button>
              <Button variant="ghost-dark" to={routes.messages}>
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.stats}>
        <div className={styles.statsInner}>
          {profile.stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <b>{s.value}</b>
              {s.label}
            </div>
          ))}
          <div className={styles.stat}>
            <b>{openRoles}</b>
            {openRoles === 1 ? "Open role" : "Open roles"}
          </div>
        </div>
      </div>
    </div>
  );
}
