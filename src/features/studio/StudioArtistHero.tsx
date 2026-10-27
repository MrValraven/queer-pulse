import { useState, type Ref } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import type { StudioArtistView } from "./api/studio.adapters";
import { ARTIST_SHOWCASE } from "./studioArtist.data";
import { StudioArtistHeroActions } from "./StudioArtistHeroActions";
import { StudioDetailHero } from "./StudioDetailHero";
import { useIsHeroCompact } from "./studioHeroLayout";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";

/** The persona's wide cover, decorative (the name is the h1 beside it). It
 *  fades in once loaded; one that fails to load removes itself, so the
 *  tint wash behind it shows and the copy stays readable. Keyed by the
 *  source, so a new cover gets a fresh try. */
function ArtistCoverPhoto({
  src,
  isPriority,
}: {
  src: string;
  /** The cover is the hero's largest image (the banner), so it loads first. */
  isPriority: boolean;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (src === failedSrc) return null;
  return (
    <img
      className={styles.heroPhoto}
      src={src}
      alt=""
      loading="eager"
      fetchPriority={isPriority ? "high" : "auto"}
      decoding="async"
      data-loaded={src === loadedSrc || undefined}
      onLoad={() => setLoadedSrc(src)}
      onError={() => setFailedSrc(src)}
    />
  );
}

/** The art frame drawn as a circle, matching the band's round portrait. */
const ROUND_ART_STYLE = { borderRadius: "var(--radius-avatar)" } as const;

/** The artist hero: kind and city, the name, release and follower counts
 *  (grouped for the language), and the action row, under the artist's
 *  chosen layout (`heroLayout`):
 *  - "banner" fills a photo band with the wide cover and lays the name over
 *    its lower part, with no portrait;
 *  - "both" draws the same band and adds a small round portrait above the
 *    name;
 *  - "portrait" (the persona editor's "Avatar" choice) draws a large round
 *    portrait beside the copy over the artist's tint, with no photo band.
 *  An artist with no cover photo always gets "portrait". */
export function StudioArtistHero({
  artist,
  onTip,
  titleRef,
  sentinelRef,
}: {
  artist: StudioArtistView;
  onTip: () => void;
  /** The marker the page's sticky header watches. */
  sentinelRef?: Ref<HTMLDivElement>;
  /** Marks the name inside the page's h1, so the page can find that heading
   *  to move focus to it (StudioDetailHero owns the h1 itself). */
  titleRef?: Ref<HTMLSpanElement>;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const isShowcase = useStudioShowcase();
  const isCompact = useIsHeroCompact();
  const person = artist.artist;
  const releaseCount = artist.allReleases.length;
  // The adapter resolves a missing cover to portrait; the guard keeps a
  // stray layout from drawing an empty photo band.
  const isBanner = !!artist.coverUrl && artist.heroLayout !== "portrait";

  return (
    <StudioDetailHero
      tint={person.tint}
      variant={isBanner ? "full-bleed" : "default"}
      backdrop={
        isBanner && artist.coverUrl ? (
          <ArtistCoverPhoto src={artist.coverUrl} isPriority />
        ) : undefined
      }
      isBandAvatarShown={artist.heroLayout === "both"}
      artStyle={isBanner ? undefined : ROUND_ART_STYLE}
      sentinelRef={sentinelRef}
      isActionsCompact={isCompact}
      art={
        <ImageSlot
          src={person.avatarUrl ?? undefined}
          tint={person.tint}
          width="100%"
          height="100%"
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
        t("studio:artistPage.followerCountGrouped", {
          count: artist.followerCount,
          number: formatters.number(artist.followerCount),
        }),
      ].join(" · ")}
      actions={
        <StudioArtistHeroActions
          artist={artist}
          onTip={onTip}
          isCompact={isCompact}
        />
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
