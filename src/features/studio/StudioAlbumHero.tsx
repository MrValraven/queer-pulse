import { Link } from "react-router-dom";
import { FiHeart, FiPlus, FiCheck } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useSaved } from "../../app/providers/SavedProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./studio.module.css";
import { ALBUM_COVER, ALBUM } from "./studioAlbum.data";

export function StudioAlbumHero({ onTip }: { onTip: () => void }) {
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();
  const saved = isSaved(ALBUM.id);

  function share() {
    const url =
      typeof window !== "undefined" ? window.location.href : routes.studioAlbum;
    navigator.clipboard?.writeText(url).then(
      () => showToast("Link copied to clipboard", "success"),
      () => showToast("Could not copy link", "info"),
    );
  }

  return (
    <section className={styles.detailHero}>
      <div className={styles.detailArt}>
        <ImageSlot
          src={ALBUM_COVER}
          tint="coral"
          width="100%"
          height="100%"
          radius={16}
          placeholder="cover · Cidade dos santos"
          style={{ position: "absolute", inset: 0 }}
        />
      </div>
      <div>
        <div className={styles.kind}>Album · 11 tracks · 42 min</div>
        <h1>
          Cidade dos <em>santos</em>
        </h1>
        <div className={styles.by}>
          by <strong>Mariana Sol</strong> · 2026 · Sintra
        </div>
        <div className={styles.heroActions}>
          <Link to={routes.studio} className={styles.playBig} aria-label="Play">
            <svg viewBox="0 0 12 14" fill="currentColor">
              <path d="M1 1l10 6-10 6z" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => {
              const now = toggleSave(ALBUM);
              showToast(
                now
                  ? "Album added to your library"
                  : "Removed from your library",
                now ? "success" : "info",
              );
            }}
          >
            {saved ? (
              <>
                <FiCheck /> In library
              </>
            ) : (
              <>
                <FiPlus /> Library
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
      </div>
    </section>
  );
}
