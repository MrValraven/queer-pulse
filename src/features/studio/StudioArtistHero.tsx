import { Link } from "react-router-dom";
import { FiHeart, FiPlus, FiCheck } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks";
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { heroImage, ARTIST_ID } from "./studioArtist.data";
import { routes } from "../../app/routeMap";
import { StudioDetailHero } from "./StudioDetailHero";
import styles from "./studio.module.css";

const ARTIST_NAME = "Mariana Sol";
const ARTIST_FIRST_NAME = "Mariana";
const ARTIST_LAST_NAME = "Sol";
const SUBSCRIBE_AMOUNT = 3;
const RELEASES_COUNT = 8;
const SHEET_MUSIC_COUNT = 15;
const SUSTAINERS_COUNT = 4200;

export function StudioArtistHero({ onTip }: { onTip: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { isFollowing, toggleFollow } = useSocial();
  const { showToast } = useToast();
  const { share } = useShareLink({
    copied: t("studio:detail.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  const following = isFollowing(ARTIST_ID);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "/studio/artist";

  return (
    <StudioDetailHero
      artStyle={{ borderRadius: "50%" }}
      art={
        <ImageSlot
          src={heroImage}
          tint="coral"
          width="100%"
          height="100%"
          radius={9999}
          shape="circle"
          placeholder={ARTIST_NAME}
          initials="MS"
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
          fetchPriority="high"
        />
      }
      kind="Artist · Sintra"
      title={
        <>
          {ARTIST_FIRST_NAME} <em>{ARTIST_LAST_NAME}</em>
        </>
      }
      by={
        <Translation
          i18nKey="studio:artistHero.statsLine"
          components={{ strong: <strong /> }}
          values={{
            releases: fmt.number(RELEASES_COUNT),
            sheetMusicSets: fmt.number(SHEET_MUSIC_COUNT),
            sustainers: fmt.number(SUSTAINERS_COUNT),
          }}
        />
      }
      actions={
        <>
          <Link
            to={routes.studioAlbum}
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
              const now = toggleFollow(ARTIST_ID);
              showToast(
                now
                  ? t("studio:artist.hero.followedToast", {
                      artist: ARTIST_NAME,
                    })
                  : t("studio:artist.hero.unfollowedToast", {
                      artist: ARTIST_NAME,
                    }),
                now ? "success" : "info",
              );
            }}
          >
            {following ? (
              <>
                <FiCheck /> {t("studio:artist.hero.followingCta")}
              </>
            ) : (
              <>
                <FiPlus /> {t("studio:artist.hero.followCta")}
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
    >
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
          <Translation
            i18nKey="studio:artist.hero.subscribeNote"
            components={{ em: <em /> }}
            values={{
              amount: fmt.currency(SUBSCRIBE_AMOUNT),
              artist: ARTIST_NAME,
            }}
          />{" "}
          <span className={styles.small}>
            {t("studio:artist.hero.tipOnTopNote")}
          </span>
        </span>
      </div>
    </StudioDetailHero>
  );
}
