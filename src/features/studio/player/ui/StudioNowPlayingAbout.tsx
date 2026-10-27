import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  Collapse,
  ExpandableText,
  ImageSlot,
} from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioArtistView } from "../../api/studio.adapters";
import { StudioArtistFollowControl } from "../../StudioArtistFollowControl";
import { StudioLine } from "../../StudioSkeletons";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import type { StudioQueueItem } from "../studioPlayerContext";
import type { StudioNowPlayingArtistState } from "../useStudioNowPlayingArtist";
import { ABOUT_BIO_LINES } from "./studioNowPlayingArtist.data";
import css from "./StudioNowPlayingArtist.module.css";
import kit from "../../studioKit.module.css";

/** The About card's shape while the artist loads: the 16:9 photo, the
 *  eyebrow, name and two meta lines (each in its loaded line box), three
 *  bio lines, Read more and the actions row, so the column keeps its place
 *  when the card fades in. */
export function StudioNowPlayingAboutSkeleton() {
  const { t } = useTranslation();
  return (
    <div className={css.card} aria-busy="true">
      <div className={css.coverSkeleton} />
      <div className={css.cardBody}>
        <div className={`${css.eyebrow} ${css.skeletonRow}`}>
          <StudioLine width="40%" height={12} />
        </div>
        <div className={`${css.name} ${css.skeletonRow}`}>
          <StudioLine width="70%" height={20} />
        </div>
        <div className={`${css.meta} ${css.skeletonRow}`}>
          <StudioLine width="55%" height={12} />
        </div>
        <div className={`${css.meta} ${css.skeletonRow}`}>
          <StudioLine width="30%" height={12} />
        </div>
        <div className={`${css.bio} ${css.skeletonBio}`} data-skeleton-bio="">
          <StudioLine width="100%" height={12} />
          <StudioLine width="92%" height={12} />
          <StudioLine width="64%" height={12} />
        </div>
        <div className={css.skeletonReadMore} data-skeleton-read-more="">
          <StudioLine width={72} height={14} />
        </div>
        <div className={`${css.actions} ${css.skeletonActions}`}>
          <StudioLine width={96} height={40} />
          <StudioLine width={150} height={40} />
        </div>
      </div>
      <span className="visuallyHidden">
        {t("studio:sidePanel.artistLoading")}
      </span>
    </div>
  );
}

/** The loaded card: the wide cover (or the avatar), the label, name, kind
 *  and city, followers, the bio folded to three lines, Follow and the link
 *  to the artist's page. */
function AboutCard({
  artist,
  isEpisode,
}: {
  artist: StudioArtistView;
  isEpisode: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const headingId = useId();
  const person = artist.artist;
  const bio = person.bio?.trim() ?? "";
  const metaLine = [t(person.kindLabelKey), person.city]
    .filter(Boolean)
    .join(" · ");
  return (
    <section className={css.card} aria-labelledby={headingId}>
      <ImageSlot
        className={css.cover}
        src={artist.coverUrl ?? person.avatarUrl ?? undefined}
        tint={person.tint}
        width="100%"
        height="auto"
        radius={0}
        srcSize={720}
        placeholder={person.name}
        initials={person.initials}
      />
      <div className={css.cardBody}>
        <h3 id={headingId} className={css.eyebrow}>
          {t(
            isEpisode
              ? "studio:show.aboutHeading"
              : "studio:sidePanel.aboutArtist",
          )}
        </h3>
        <p className={css.name}>{person.name}</p>
        {metaLine && <p className={css.meta}>{metaLine}</p>}
        <p className={css.meta}>
          {t("studio:artistPage.followerCountGrouped", {
            count: artist.followerCount,
            number: fmt.number(artist.followerCount),
          })}
        </p>
        {bio && (
          <ExpandableText
            className={css.bio}
            lines={ABOUT_BIO_LINES}
            resetKey={bio}
          >
            {bio}
          </ExpandableText>
        )}
        <div className={css.actions}>
          <StudioArtistFollowControl artist={artist} />
          <Link to={person.href} className={kit.pillLink}>
            {t(
              isEpisode
                ? "studio:sidePanel.openShowPage"
                : "studio:sidePanel.openArtistPage",
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * About the artist (or the show, for an episode), for the Now playing side
 * panel and the phone Artist tab. A skeleton holds the card's space from
 * the first moment the persona loads and crossfades into the card; a new
 * artist crossfades in the same way. One Collapse folds the slot away only
 * on a failed read, together with the caller's `slotClassName` spacing.
 */
export function StudioNowPlayingAbout({
  item,
  artistState,
  slotClassName,
}: {
  item: StudioQueueItem;
  artistState: StudioNowPlayingArtistState;
  /** Spacing around the card that opens and folds with it. */
  slotClassName?: string;
}) {
  const { reducedMotion } = useMotionPrefs();
  const enter = reducedMotion ? { duration: 0 } : STUDIO_FADE;
  const exit = reducedMotion ? { duration: 0 } : STUDIO_EXIT;
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: enter },
    exit: { opacity: 0, transition: exit },
  };
  return (
    <Collapse isOpen={artistState.status !== "failed"}>
      <div className={slotClassName}>
        <AnimatePresence mode="wait" initial={false}>
          {artistState.status === "ready" ? (
            <m.div key={`artist-${artistState.artist.artist.id}`} {...fade}>
              <AboutCard
                artist={artistState.artist}
                isEpisode={item.isEpisode === true}
              />
            </m.div>
          ) : (
            <m.div key="loading" {...fade}>
              <StudioNowPlayingAboutSkeleton />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Collapse>
  );
}
