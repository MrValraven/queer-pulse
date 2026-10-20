import type { ReactNode } from "react";
import { FiCopy, FiExternalLink, FiPause, FiPlay } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useShareLink } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPressKitView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks } from "./player/studioQueue";
import { StudioHiddenTrackNote } from "./StudioHiddenTrack";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { releaseFactsLine } from "./studioFacts";
import styles from "./StudioPressSections.module.css";

export function PressSectionHead({
  titleKey,
  action,
}: {
  titleKey: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.head}>
      <h2 className={styles.title}>
        <Translation i18nKey={titleKey} components={{ em: <em /> }} />
      </h2>
      {action}
    </div>
  );
}

/** A section with nothing in it yet: hidden from visitors, a hint for the
 *  owner (a listenable persona with no published release answers an empty
 *  kit). */
function PressOwnerEmpty({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return (
    <section className={styles.section}>
      <PressSectionHead titleKey={titleKey} />
      <p className={styles.hint}>{t("studio:pressKit.ownerEmptySection")}</p>
    </section>
  );
}

/** The best tracks, played through the app player as one queue. */
export function PressBestTracks({
  pressKit,
}: {
  pressKit: StudioPressKitView;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const hideExplicit = useStudioHideExplicit();
  if (pressKit.featuredTracks.length === 0)
    return pressKit.isOwner ? (
      <PressOwnerEmpty titleKey="studio:pressKit.section.bestTracks" />
    ) : null;
  const queue = queueFromTracks(pressKit.featuredTracks);
  return (
    <section className={styles.section}>
      <PressSectionHead titleKey="studio:pressKit.section.bestTracks" />
      {pressKit.isFeaturedFallback && (
        <p className={styles.hint}>{t("studio:pressKit.fallbackNote")}</p>
      )}
      <ol
        className={styles.tracks}
        aria-label={t("studio:pressKit.bestTracksLabel", {
          name: pressKit.artist.name,
        })}
      >
        {pressKit.featuredTracks.map((track) => {
          const isCurrent = player.isCurrentTrack(track.id);
          const isPlaying = isCurrent && player.status === "playing";
          const isHidden = hideExplicit && track.isExplicit;
          const isPlayBlocked = !track.hasAudio || isHidden;
          return (
            <li
              key={track.id}
              className={styles.track}
              aria-current={isCurrent ? "true" : undefined}
            >
              <button
                type="button"
                className={styles.trackPlay}
                aria-disabled={(!isCurrent && isPlayBlocked) || undefined}
                aria-label={t(
                  isPlaying
                    ? "studio:release.pauseTrack"
                    : "studio:release.playTrack",
                  { title: track.title },
                )}
                onClick={() => {
                  if (isCurrent) player.togglePlay();
                  else if (!isPlayBlocked)
                    void player.playTracks(queue, track.id);
                }}
              >
                {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
              </button>
              <div className={styles.trackText}>
                <span className={styles.trackTitle}>{track.title}</span>
                <span className={styles.trackMeta}>
                  {[track.release.title, track.durationLabel]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                <Collapse isOpen={isHidden}>
                  <StudioHiddenTrackNote />
                </Collapse>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function PressBio({ pressKit }: { pressKit: StudioPressKitView }) {
  const { t } = useTranslation();
  const { share: copy } = useShareLink({
    copied: t("studio:pressKit.bioCopiedToast"),
    failed: t("studio:press.copyFailToast"),
  });
  const paragraphs = (pressKit.bio ?? "")
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim());
  // Decision 18: an empty section hides for visitors and hints the owner.
  if (paragraphs.length === 0 && !pressKit.isOwner) return null;
  return (
    <section className={styles.section}>
      <PressSectionHead
        titleKey="studio:press.section.bio"
        action={
          pressKit.bio ? (
            <Button
              variant="ghost"
              size="sm"
              className={styles.copyBio}
              onClick={() => void copy(pressKit.bio ?? "")}
            >
              <FiCopy aria-hidden /> {t("studio:pressKit.copyBioCta")}
            </Button>
          ) : undefined
        }
      />
      {paragraphs.length > 0 ? (
        <div className={styles.prose}>
          {paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className={styles.hint}>{t("studio:pressKit.noBio")}</p>
      )}
    </section>
  );
}

export function PressReleases({ pressKit }: { pressKit: StudioPressKitView }) {
  const { t } = useTranslation();
  if (pressKit.releases.length === 0)
    return pressKit.isOwner ? (
      <PressOwnerEmpty titleKey="studio:pressKit.section.releases" />
    ) : null;
  return (
    <section className={styles.section}>
      <PressSectionHead titleKey="studio:pressKit.section.releases" />
      <div className={styles.releases}>
        {pressKit.releases.map((release) => (
          <StudioReleaseCard
            key={release.id}
            release={release}
            meta={releaseFactsLine(release, t)}
          />
        ))}
      </div>
    </section>
  );
}

export function PressQuotes({ pressKit }: { pressKit: StudioPressKitView }) {
  if (pressKit.quotes.length === 0) return null;
  return (
    <section className={styles.section}>
      <PressSectionHead titleKey="studio:press.section.press" />
      <div className={styles.quotes}>
        {pressKit.quotes.map((entry) => (
          <figure
            key={`${entry.source}-${entry.quote.slice(0, 16)}`}
            className={styles.quote}
          >
            <blockquote>
              <q>{entry.quote}</q>
            </blockquote>
            <figcaption className={styles.quoteSource}>
              {entry.source}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function PressContact({
  pressKit,
  children,
}: {
  pressKit: StudioPressKitView;
  /** The demo's "Request press access" sits here. */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const { contact } = pressKit;
  // Decision 18: an empty section hides for visitors and hints the owner.
  if (!contact && !pressKit.isOwner && !children) return null;
  return (
    <section className={styles.section}>
      <PressSectionHead titleKey="studio:pressKit.section.contact" />
      {contact ? (
        <a
          className={styles.contact}
          href={contact.href}
          {...(contact.isEmail
            ? {}
            : { target: "_blank", rel: "noopener noreferrer" })}
        >
          {contact.label}
          {!contact.isEmail && (
            <>
              <FiExternalLink aria-hidden className={styles.contactExternal} />
              <span className="visuallyHidden">
                {t("studio:support.opensInNewTab")}
              </span>
            </>
          )}
        </a>
      ) : (
        pressKit.isOwner && (
          <p className={styles.hint}>{t("studio:pressKit.noContact")}</p>
        )
      )}
      {children}
    </section>
  );
}
