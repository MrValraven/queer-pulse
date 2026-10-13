import type { Ref } from "react";
import { Link } from "react-router-dom";
import {
  FiCheck,
  FiExternalLink,
  FiHeart,
  FiPlay,
  FiPlus,
} from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks";
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import type { StudioArtistView } from "./api/studio.adapters";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { ARTIST_SHOWCASE } from "./studioArtist.data";
import { StudioDetailHero } from "./StudioDetailHero";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** Play all queues at most this many releases, newest first. */
const PLAY_ALL_LIMIT = 10;

export function StudioArtistHero({
  artist,
  onTip,
  titleRef,
}: {
  artist: StudioArtistView;
  onTip: () => void;
  /** Marks the name inside the page's h1, so the page can find that heading
   *  to move focus to it (StudioDetailHero owns the h1 itself). */
  titleRef?: Ref<HTMLSpanElement>;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
  const { isFollowing, toggleFollow } = useSocial();
  const { showToast } = useToast();
  const { share } = useShareLink({
    copied: t("studio:detail.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  const person = artist.artist;
  // Albums and singles arrive as two lists, each newest first: merge them
  // by release date so the queue opens on the newest release of either.
  const releaseIds = [...artist.releases, ...artist.singles]
    .sort((left, right) =>
      (right.releasedOn ?? "").localeCompare(left.releasedOn ?? ""),
    )
    .map((release) => release.id)
    .slice(0, PLAY_ALL_LIMIT);
  const releaseCount = artist.releases.length + artist.singles.length;
  const isFollowed = isFollowing(person.id);

  return (
    <StudioDetailHero
      artStyle={{ borderRadius: "50%" }}
      art={
        <ImageSlot
          src={person.avatarUrl ?? undefined}
          tint={person.tint}
          width="100%"
          height="100%"
          radius={9999}
          shape="circle"
          placeholder={person.name}
          initials={person.initials}
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
          fetchPriority="high"
        />
      }
      kind={[t(person.kindLabelKey), person.city].filter(Boolean).join(" · ")}
      title={<span ref={titleRef}>{person.name}</span>}
      by={t("studio:artistPage.releaseCount", { count: releaseCount })}
      actions={
        <>
          <button
            type="button"
            className={styles.playBig}
            disabled={releaseIds.length === 0}
            aria-label={t("studio:artistPage.playAll", { name: person.name })}
            onClick={() => void player.playReleases(releaseIds)}
          >
            <FiPlay aria-hidden />
          </button>
          {person.personaHref && (
            <Link to={person.personaHref} className={kit.pillLink}>
              {t("studio:artistPage.viewProfile")}{" "}
              <FiExternalLink aria-hidden />
            </Link>
          )}
          {isShowcase && (
            <>
              <button
                type="button"
                onClick={() => {
                  const isNowFollowing = toggleFollow(person.id);
                  showToast(
                    t(
                      isNowFollowing
                        ? "studio:artist.hero.followedToast"
                        : "studio:artist.hero.unfollowedToast",
                      { artist: person.name },
                    ),
                    isNowFollowing ? "success" : "info",
                  );
                }}
              >
                {isFollowed ? <FiCheck aria-hidden /> : <FiPlus aria-hidden />}{" "}
                {isFollowed
                  ? t("studio:artist.hero.followingCta")
                  : t("studio:artist.hero.followCta")}
              </button>
              <button type="button" className={styles.tip} onClick={onTip}>
                <FiHeart aria-hidden />{" "}
                {t("studio:detail.tipArtistCta", { artist: person.name })}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => void share(window.location.href)}
          >
            {t("studio:detail.shareCta")}
          </button>
        </>
      }
    >
      {isShowcase && (
        <div className={styles.payPill}>
          <span>
            <Translation
              i18nKey="studio:artist.hero.subscribeNote"
              components={{ em: <em /> }}
              values={{
                amount: formatters.currency(ARTIST_SHOWCASE.subscribeAmount),
                artist: person.name,
              }}
            />{" "}
            <span className={styles.small}>
              {t("studio:artist.hero.tipOnTopNote")}
            </span>
          </span>
        </div>
      )}
    </StudioDetailHero>
  );
}
