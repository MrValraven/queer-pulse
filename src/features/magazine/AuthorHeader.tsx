import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/SocialProvider";
import { routes } from "../../app/routeMap";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { Author } from "./authorContent.data";
import styles from "./AuthorPage.module.css";

export function AuthorHeader({ author }: { author: Author }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isFollowing, toggleFollow } = useSocial();
  const following = isFollowing(author.slug);
  const label = author.firstName;

  return (
    <>
      <header className={styles.hero}>
        <div>
          {/* Content: eyebrow/name/role/bio/pronouns are the writer's own
              profile fields — kept in English like a member bio. */}
          <div className={styles.eyebrow}>{author.eyebrow}</div>
          <h1 className={styles.name}>
            <span className={styles.nameRow}>
              {author.name}
              <MemberStaffBadge slug={author.slug} />
            </span>
          </h1>
          <div className={styles.role}>{author.role}</div>
          <p className={styles.bio}>{author.bio}</p>
          <div className={styles.metaRow}>
            <Button
              variant={following ? "ghost" : "primary"}
              onClick={() => {
                const now = toggleFollow(author.slug);
                showToast(
                  now
                    ? t("magazine:author.followingToast", { name: label })
                    : t("magazine:author.unfollowedToast", { name: label }),
                  now ? "success" : "info",
                );
              }}
            >
              {following
                ? t("magazine:author.followingCta")
                : t("magazine:author.followWriterCta")}
            </Button>
            <span className={styles.pronouns}>{author.pronouns}</span>
          </div>
        </div>
        <ImageSlot
          tint="coral"
          radius={24}
          className={styles.portrait}
          src={author.portrait}
          alt={t("magazine:author.portraitAlt", { slug: author.slug })}
          placeholder={t("magazine:author.portraitPlaceholder")}
          style={{ aspectRatio: "4/5", height: "auto" }}
        />
      </header>

      <div className={styles.stats}>
        {author.stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <b>{stat.value}</b>
            {stat.label}
          </div>
        ))}
      </div>

      <div className={styles.beats}>
        {author.beats.map((beat, index) => (
          <Link
            key={beat}
            to={routes.tag}
            className={[styles.beat, index === 0 && styles.beatPrimary]
              .filter(Boolean)
              .join(" ")}
          >
            {beat}
          </Link>
        ))}
      </div>
    </>
  );
}
