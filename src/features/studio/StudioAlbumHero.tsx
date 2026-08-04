import { Link } from "react-router-dom";
import { FiHeart, FiPlus, FiCheck } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks";
import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { StudioDetailHero } from "./StudioDetailHero";
import styles from "./studio.module.css";
import { ALBUM_COVER, ALBUM } from "./studioAlbum.data";

const ARTIST_NAME = "Mariana Sol";

export function StudioAlbumHero({ onTip }: { onTip: () => void }) {
  const { t } = useTranslation();
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();
  const { share } = useShareLink({
    copied: t("studio:detail.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  const saved = isSaved(ALBUM.id);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : routes.studioAlbum;

  return (
    <StudioDetailHero
      art={
        <ImageSlot
          src={ALBUM_COVER}
          tint="coral"
          width="100%"
          height="100%"
          radius={16}
          placeholder="cover · Cidade dos santos"
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
          fetchPriority="high"
        />
      }
      kind="Album · 11 tracks · 42 min"
      title={
        <>
          Cidade dos <em>santos</em>
        </>
      }
      by={
        <>
          by <strong>{ARTIST_NAME}</strong> · 2026 · Sintra
        </>
      }
      actions={
        <>
          <Link
            to={routes.studio}
            className={styles.playBig}
            aria-label={t("studio:player.play")}
          >
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
                  ? t("studio:detail.addedToast")
                  : t("studio:detail.removedToast"),
                now ? "success" : "info",
              );
            }}
          >
            {saved ? (
              <>
                <FiCheck /> {t("studio:room.hero.inLibrary")}
              </>
            ) : (
              <>
                <FiPlus /> {t("studio:room.hero.addLibrary")}
              </>
            )}
          </button>
          <button type="button" className={styles.tip} onClick={onTip}>
            <FiHeart />{" "}
            {t("studio:detail.tipArtistCta", { artist: ARTIST_NAME })}
          </button>
          <button type="button" onClick={() => void share(shareUrl)}>
            {t("studio:detail.shareCta")}
          </button>
        </>
      }
    />
  );
}
