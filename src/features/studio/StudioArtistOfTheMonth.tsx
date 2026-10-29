import { useId, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Collapse, ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import type { StudioArtistOfTheMonthView } from "./api/studioDiscovery.adapters";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioReleaseCoverArt } from "./StudioReleaseCoverArt";
import { useStudioCoverTint } from "./useStudioCoverTint";
import shelfStyles from "./kit/StudioShelf.module.css";
import kit from "./studioKit.module.css";
import css from "./StudioArtistOfTheMonth.module.css";

/** The artist's newest release: a small cover and the title as a link,
 *  then one action row with Play, which toggles it once it is the current
 *  release, and the link to the artist's page. */
function StudioArtistOfTheMonthRelease({
  release,
  artistName,
  artistHref,
}: {
  release: StudioReleaseCardView;
  artistName: string;
  artistHref: string;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const isCurrent = player.isCurrentRelease(release.id);
  const isPlaying = isCurrent && player.status === "playing";
  const isLoading = isCurrent && player.status === "loading";
  return (
    <>
      <div className={css.release}>
        <div className={css.releaseCover}>
          <StudioReleaseCoverArt
            src={release.coverUrl}
            title={release.title}
            format={release.format}
            tint={release.tint}
            radius={8}
          />
        </div>
        <div className={css.releaseText}>
          <Link
            to={release.href}
            className={`${kit.titleLink} ${css.releaseTitle}`}
          >
            {release.title}
          </Link>
          {release.releaseYear ? (
            <span className={css.releaseYear}>{release.releaseYear}</span>
          ) : null}
        </div>
      </div>
      <div className={css.actions}>
        <StudioPlayButton
          size="hero"
          state={isLoading ? "loading" : isPlaying ? "playing" : "idle"}
          label={
            isPlaying
              ? t("studio:card.pauseRelease", { title: release.title })
              : t("studio:home.artistOfTheMonth.play", {
                  release: release.title,
                })
          }
          onToggle={() =>
            isCurrent
              ? player.togglePlay()
              : void player.playRelease(release.id)
          }
        />
        <Link to={artistHref} className={`${kit.pillLink} ${css.openLink}`}>
          {t("studio:home.artistOfTheMonth.openArtist", { artist: artistName })}
        </Link>
      </div>
    </>
  );
}

/** One wide card: the persona's picture, name and kind, the staff note under
 *  its visible label, the newest release and a link to the artist's page.
 *  It names the persona and keeps the member behind it private. */
function StudioArtistOfTheMonthCard({
  spotlight,
}: {
  spotlight: StudioArtistOfTheMonthView;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { artist, note, latestRelease } = spotlight;
  // Daylight washes the card in the portrait's colour, like a release hero.
  const portraitTint = useStudioCoverTint(artist.avatarUrl);
  return (
    <section className={shelfStyles.shelf} aria-labelledby={headingId}>
      <header className={shelfStyles.head}>
        <div className={shelfStyles.headText}>
          <h2 id={headingId} className={shelfStyles.title}>
            <Translation
              i18nKey="studio:home.artistOfTheMonth.title"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
      </header>
      <div
        className={css.card}
        data-cover-tint={portraitTint ? "" : undefined}
        style={
          portraitTint
            ? ({ "--card-cover-tint": portraitTint } as CSSProperties)
            : undefined
        }
      >
        <div className={css.portrait}>
          <ImageSlot
            src={artist.avatarUrl ?? undefined}
            tint={artist.tint}
            width="100%"
            height="100%"
            radius={16}
            initials={artist.initials}
            placeholder={artist.name}
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
        <div className={css.body}>
          <h3 className={css.name}>{artist.name}</h3>
          <p className={css.kind}>{t(artist.kindLabelKey)}</p>
          {note ? (
            <>
              <p className={css.noteLabel}>
                {t("studio:home.artistOfTheMonth.noteLabel")}
              </p>
              <p className={css.note}>{note}</p>
            </>
          ) : null}
          <StudioArtistOfTheMonthRelease
            release={latestRelease}
            artistName={artist.name}
            artistHref={artist.href}
          />
        </div>
      </div>
    </section>
  );
}

/** The artist of the month on Studio home, picked by staff. It folds away
 *  while the slot is empty or unread, and it ignores the format chip, like
 *  the curated shelves. */
export function StudioArtistOfTheMonth({
  spotlight,
}: {
  spotlight: StudioArtistOfTheMonthView | null;
}) {
  return (
    <Collapse isOpen={spotlight !== null}>
      {spotlight ? <StudioArtistOfTheMonthCard spotlight={spotlight} /> : null}
    </Collapse>
  );
}
