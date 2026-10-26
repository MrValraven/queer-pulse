import { useState, type Ref } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import type { StudioArtistView, StudioHeroLayout } from "./api/studio.adapters";
import { ARTIST_SHOWCASE } from "./studioArtist.data";
import { StudioArtistHeroActions } from "./StudioArtistHeroActions";
import {
  StudioDetailHero,
  type StudioDetailHeroVariant,
} from "./StudioDetailHero";
import { useIsHeroCompact } from "./studioHeroLayout";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";

/** The detail hero variant each resolved artist layout draws with. */
const HERO_VARIANT_BY_LAYOUT: Record<
  StudioHeroLayout,
  StudioDetailHeroVariant
> = {
  classic: "default",
  "full-bleed": "full-bleed",
  avatar: "avatar-backdrop",
};

/** The persona's wide cover, decorative (the name is the h1 beside it). It
 *  fades in once loaded; one that fails to load removes itself, so the
 *  tint wash behind it shows and the copy stays readable. Keyed by the
 *  source, so a new cover gets a fresh try. */
function ArtistCoverPhoto({
  src,
  isPriority,
}: {
  src: string;
  /** The cover is the hero's largest image (full-bleed), so it loads first. */
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

/** The artist hero: the round portrait over its tint, kind and city, the
 *  name, release and follower counts (grouped for the language), and the
 *  action row. With a wide cover the artist's chosen layout either fills a
 *  photo band with it, the name over its lower part, or lays it dimmed
 *  behind the portrait. */
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
  // The adapter resolves a missing cover to classic; the guard keeps a
  // stray layout from drawing an empty photo band.
  const variant = artist.coverUrl
    ? HERO_VARIANT_BY_LAYOUT[artist.heroLayout]
    : "default";

  return (
    <StudioDetailHero
      tint={person.tint}
      variant={variant}
      backdrop={
        artist.coverUrl && variant !== "default" ? (
          <ArtistCoverPhoto
            src={artist.coverUrl}
            isPriority={variant === "full-bleed"}
          />
        ) : undefined
      }
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
