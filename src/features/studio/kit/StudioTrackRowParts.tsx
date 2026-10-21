import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  StudioTrackMenu,
  type StudioTrackMenuTrack,
} from "../player/ui/StudioTrackMenu";
import { StudioAddToPlaylistButton } from "../StudioAddToPlaylistButton";
import { StudioHiddenTrackNote } from "../StudioHiddenTrack";
import { StudioLikeButton } from "../StudioLikeButton";
import { StudioTrackWarningPill } from "../StudioTrackWarningPill";
import { StudioOfflineTag } from "../StudioWithheldBanner";
import type { StudioTrackSummary } from "./studioTrackRow.types";
import css from "./StudioTrackRow.module.css";

/** The row actions a caller can leave out (a preview link, a taken-down
 *  release, an owner's draft). */
export type StudioTrackRowAction = "like" | "addToPlaylist" | "menu";

export type StudioTrackRowHeadingLevel = 3 | 4 | 5;

/** The heart's options a list can set: Liked songs confirms an unlike by
 *  fading the row, so it goes quiet and listens for the change. */
export interface StudioTrackRowLikeOptions {
  isQuiet?: boolean;
  onToggled?: (isLiked: boolean) => void;
}

const HEADING_TAGS = { 3: "h3", 4: "h4", 5: "h5" } as const;

interface StudioTrackRowMainProps {
  track: StudioTrackSummary;
  headingLevel: StudioTrackRowHeadingLevel;
  showArtist: boolean;
  showRelease: boolean;
  isHidden: boolean;
  isCurrent: boolean;
  /** The lead cell has nothing to focus (a hidden or blocked row), so the
   *  title link is the row's Tab stop. */
  isTitleFocusTarget: boolean;
  details?: ReactNode;
}

/** The title link, the explicit badge, the artist and release links, and
 *  the notes under them. */
export function StudioTrackRowMain({
  track,
  headingLevel,
  showArtist,
  showRelease,
  isHidden,
  isCurrent,
  isTitleFocusTarget,
  details,
}: StudioTrackRowMainProps) {
  const { t } = useTranslation();
  const Heading = HEADING_TAGS[headingLevel];
  const { release } = track;
  const hasSubline = track.isExplicit || showArtist || showRelease || isCurrent;
  return (
    <div className={css.main}>
      <Heading className={css.title}>
        <Link
          to={track.href}
          className={css.titleLink}
          data-studio-row-title=""
          {...(isTitleFocusTarget
            ? { tabIndex: 0, "data-studio-row-focus": "" }
            : { tabIndex: -1 })}
        >
          {track.title}
        </Link>
      </Heading>
      {hasSubline && (
        <div className={css.subline}>
          {isCurrent && (
            <span className={css.srOnly}>{t("studio:release.nowPlaying")}</span>
          )}
          {track.isExplicit && (
            <span
              className={css.explicit}
              aria-label={t("studio:release.explicit")}
              role="img"
            >
              <span aria-hidden="true">
                {t("studio:release.explicitShort")}
              </span>
            </span>
          )}
          {showArtist && (
            <Link to={release.artist.href} className={css.subLink}>
              {release.artist.name}
            </Link>
          )}
          {showArtist && showRelease && (
            <span className={css.dot} aria-hidden="true" />
          )}
          {showRelease && (
            <Link to={release.href} className={css.subLink}>
              {release.title}
            </Link>
          )}
        </div>
      )}
      {track.isWithheld && <StudioOfflineTag />}
      <StudioTrackWarningPill
        warnings={track.contentWarnings}
        className={css.warning}
      />
      {isHidden && <StudioHiddenTrackNote />}
      {details}
    </div>
  );
}

interface StudioTrackRowActionsProps {
  track: StudioTrackSummary;
  isPlayBlocked: boolean;
  hiddenActions: readonly StudioTrackRowAction[];
  /** A caller's own buttons, before Add to playlist. Each can fold with a
   *  `data-studio-row-extra` attribute (StudioTrackRow.module.css):
   *  - `"menu"`: hidden below --sm, so the caller offers the same action in
   *    the row's "..." menu and in selection mode (an owner's Move up, Move
   *    down, Remove). Above --sm, on a pointer that hovers, it rests hidden
   *    and comes up with the row, its focus or an open menu.
   *  - `"hover"`: stays on phones; only the hover-reveal applies.
   *  An element with `aria-pressed` or `aria-expanded` true stays up. */
  extraActions?: ReactNode;
  menuTrack: StudioTrackMenuTrack;
  likeOptions?: StudioTrackRowLikeOptions;
}

/** Add to playlist, the heart, the duration and the "..." menu. On a
 *  pointer that hovers they rest faint and come up with the row; a liked
 *  heart stays up. */
export function StudioTrackRowActions({
  track,
  isPlayBlocked,
  hiddenActions,
  extraActions,
  menuTrack,
  likeOptions,
}: StudioTrackRowActionsProps) {
  const { t } = useTranslation();
  const { release } = track;
  const isPublished = release.publishedAt !== null;
  const canPlay = !isPlayBlocked && track.hasAudio;
  const likeSubject = {
    trackId: track.id,
    title: track.title,
    href: track.href,
    artistName: release.artist.name,
  };
  const hasLike = canPlay && isPublished && !hiddenActions.includes("like");
  const hasAdd = isPublished && !hiddenActions.includes("addToPlaylist");
  const hasMenu = !hiddenActions.includes("menu");
  return (
    <div className={css.actions}>
      {extraActions}
      {hasAdd && (
        <StudioAddToPlaylistButton
          trackIds={canPlay ? [track.id] : []}
          subjectTitle={track.title}
          ariaLabel={t("studio:playlist.add.trackAria", { title: track.title })}
          className={`${css.action} ${css.addAction}`}
          likeSubject={hasLike ? likeSubject : undefined}
        />
      )}
      {hasLike && (
        <StudioLikeButton
          subject={likeSubject}
          className={`${css.action} ${css.likeAction}`}
          isQuiet={likeOptions?.isQuiet}
          onToggled={likeOptions?.onToggled}
        />
      )}
      <span className={css.duration}>
        {track.durationLabel ?? t("studio:release.processing")}
      </span>
      {hasMenu && (
        <span className={css.menuSlot}>
          <StudioTrackMenu track={menuTrack} />
        </span>
      )}
    </div>
  );
}
