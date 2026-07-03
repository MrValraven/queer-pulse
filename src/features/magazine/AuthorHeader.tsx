import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSocial } from "../../app/providers/SocialProvider";
import { routes } from "../../app/routeMap";
import type { Author } from "./authorContent.data";
import styles from "./AuthorPage.module.css";

export function AuthorHeader({ author }: { author: Author }) {
  const { showToast } = useToast();
  const { isFollowing, toggleFollow } = useSocial();
  const following = isFollowing(author.slug);
  const label = author.firstName;

  return (
    <>
      <header className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>{author.eyebrow}</div>
          <h1 className={styles.name}>{author.name}</h1>
          <div className={styles.role}>{author.role}</div>
          <p className={styles.bio}>{author.bio}</p>
          <div className={styles.metaRow}>
            <Button
              variant={following ? "ghost" : "primary"}
              onClick={() => {
                const now = toggleFollow(author.slug);
                showToast(
                  now ? `Following ${label}` : `Unfollowed ${label}`,
                  now ? "success" : "info",
                );
              }}
            >
              {following ? "Following" : "Follow writer"}
            </Button>
            <Button variant="ghost" to={routes.newsletter}>
              {author.columnLabel}
            </Button>
            <span className={styles.pronouns}>{author.pronouns}</span>
          </div>
        </div>
        <ImageSlot
          tint="coral"
          radius={24}
          className={styles.portrait}
          src={author.portrait}
          alt={`Portrait of ${author.slug}`}
          placeholder="Portrait"
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
