import { Link } from "react-router-dom";
import { FiHeart, FiPlus, FiCheck } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useSocial } from "../../app/providers/SocialProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { heroImage, ARTIST_ID } from "./studioArtist.data";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";

export function StudioArtistHero({ onTip }: { onTip: () => void }) {
  const { isFollowing, toggleFollow } = useSocial();
  const { showToast } = useToast();
  const following = isFollowing(ARTIST_ID);

  function share() {
    const url =
      typeof window !== "undefined" ? window.location.href : "/studio/artist";
    navigator.clipboard?.writeText(url).then(
      () => showToast("Link copied to clipboard", "success"),
      () => showToast("Could not copy link", "info"),
    );
  }

  return (
    <section className={styles.detailHero}>
      <div className={styles.detailArt} style={{ borderRadius: "50%" }}>
        <ImageSlot
          src={heroImage}
          tint="coral"
          width="100%"
          height="100%"
          radius={9999}
          shape="circle"
          placeholder="Mariana Sol"
          initials="MS"
          style={{ position: "absolute", inset: 0 }}
        />
      </div>
      <div>
        <div className={styles.kind}>Artist · Sintra</div>
        <h1>
          Mariana <em>Sol</em>
        </h1>
        <div className={styles.by}>
          8 releases · 15 sheet-music sets · <strong>4,200 sustainers</strong>
        </div>
        <div className={styles.heroActions}>
          <Link
            to={routes.studioAlbum}
            className={styles.playBig}
            aria-label="Play"
          >
            <svg viewBox="0 0 12 14" fill="currentColor">
              <path d="M1 1l10 6-10 6z" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => {
              const now = toggleFollow(ARTIST_ID);
              showToast(
                now ? "Following Mariana Sol" : "Unfollowed Mariana Sol",
                now ? "success" : "info",
              );
            }}
          >
            {following ? (
              <>
                <FiCheck /> Following
              </>
            ) : (
              <>
                <FiPlus /> Follow
              </>
            )}
          </button>
          <button type="button" className={styles.tip} onClick={onTip}>
            <FiHeart /> Tip Mariana
          </button>
          <button type="button" onClick={share}>
            Share
          </button>
        </div>
        <div className={styles.payPill}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>
            Subscribe at <em>€3/mo</em>, direct to Mariana, no platform cut.{" "}
            <span className={styles.small}>Or tip on top of streaming.</span>
          </span>
        </div>
      </div>
    </section>
  );
}
