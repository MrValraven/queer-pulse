import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSocial } from "../../app/providers/SocialProvider";
import { routes } from "../../app/routeMap";
import { AUTHOR_PORTRAIT_IMG } from "./authorPage.data";
import { AUTHOR_SLUG, BEATS } from "./authorContent.data";
import styles from "./AuthorPage.module.css";

export function AuthorHeader() {
  const { showToast } = useToast();
  const { isFollowing, toggleFollow } = useSocial();
  const following = isFollowing(AUTHOR_SLUG);

  return (
    <>
      <header className={styles.hero}>
        <div>
          <div className={styles.eyebrow}>Magazine · Writer</div>
          <h1 className={styles.name}>
            Sara <em>Pinheiro.</em>
          </h1>
          <div className={styles.role}>
            Contributing editor, health &amp; access
          </div>
          <p className={styles.bio}>
            Sara writes about queer life and the systems that surround it —
            clinics, classrooms, courtrooms, neighbourhoods. She joined
            QueerPulse Magazine in 2023 after a decade in public-health
            reporting at <em>Público</em> and <em>Mensagem de Lisboa</em>. Born
            in Setúbal, lives in Anjos.
          </p>
          <div className={styles.metaRow}>
            <Button
              variant={following ? "ghost" : "primary"}
              onClick={() => {
                const now = toggleFollow(AUTHOR_SLUG);
                showToast(
                  now ? "Following Sara" : "Unfollowed Sara",
                  now ? "success" : "info",
                );
              }}
            >
              {following ? "Following" : "Follow writer"}
            </Button>
            <Button variant="ghost" to={routes.newsletter}>
              Subscribe to her column
            </Button>
            <span className={styles.pronouns}>she/her</span>
          </div>
        </div>
        <ImageSlot
          tint="coral"
          radius={24}
          className={styles.portrait}
          src={AUTHOR_PORTRAIT_IMG}
          alt="Portrait of Sara Pinheiro"
          placeholder="Portrait of Sara Pinheiro"
          style={{ aspectRatio: "4/5", height: "auto" }}
        />
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <b>
            <em>14</em>
          </b>
          Articles published
        </div>
        <div className={styles.stat}>
          <b>3</b>Years contributing
        </div>
        <div className={styles.stat}>
          <b>1.8k</b>Subscribers to her column
        </div>
        <div className={styles.stat}>
          <b>
            <em>2</em>
          </b>
          Issue covers · 2025
        </div>
      </div>

      <div className={styles.beats}>
        {BEATS.map((beat, index) => (
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
