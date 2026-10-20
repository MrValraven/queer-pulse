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
import { useSocial } from "../../app/providers/useSocial";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { ShareMenu } from "../messages/share/ShareMenu";
import { SubprofileFollow } from "../subprofiles/SubprofileFollow";
import type { StudioArtistView } from "./api/studio.adapters";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { ARTIST_SHOWCASE } from "./studioArtist.data";
import { StudioArtistOverflow } from "./StudioArtistOverflow";
import { StudioDetailHero } from "./StudioDetailHero";
import { studioShareTrigger } from "./share/StudioShareMenu";
import { studioIdentityNote } from "./share/studioShareContent";
import { studioArtistPath } from "./studioPaths";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** Play all queues at most this many releases, in the server's order. */
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
  const person = artist.artist;
  // The server sends releases published newest first (published_at desc,
  // id desc); Play all keeps that order as it stands.
  const releaseIds = artist.allReleases
    .map((release) => release.id)
    .slice(0, PLAY_ALL_LIMIT);
  const releaseCount = artist.allReleases.length;
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
      by={[
        person.format === "podcast"
          ? t("studio:artist.showCount", { count: releaseCount })
          : t("studio:artistPage.releaseCount", { count: releaseCount }),
        t("studio:artistPage.followerCount", { count: artist.followerCount }),
      ].join(" · ")}
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
          {isShowcase ? (
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
          ) : (
            // useFollow patches the artist view and refreshes the library's
            // Artists tab itself.
            <SubprofileFollow
              subprofileId={person.id}
              followerCount={artist.followerCount}
              viewerFollowing={artist.isFollowing}
              isOwnerViewing={artist.isOwner}
            />
          )}
          {/* Artist links stay plain links with no card; the owner sees the
              identity note because the link pairs their account with the
              persona. */}
          <ShareMenu
            content={{
              path: studioArtistPath(person.id),
              title: person.name,
              kind: "studio",
              text: person.name,
            }}
            identityNote={studioIdentityNote(
              t,
              artist.isOwner ? person.name : null,
            )}
            renderTrigger={studioShareTrigger(t("studio:detail.shareCta"))}
          />
          {!artist.isOwner && (
            <StudioArtistOverflow subprofileId={person.id} name={person.name} />
          )}
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
