import type { Ref } from "react";
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

/** The artist hero: the round portrait over its tint, kind and city, the
 *  name, release and follower counts (grouped for the language), and the
 *  action row. */
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

  return (
    <StudioDetailHero
      tint={person.tint}
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
