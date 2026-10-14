import { useId } from "react";
import { Collapse, LoadMoreFooter } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAppearsOn } from "./api/useStudioAppearsOn";
import { useStudioRelatedArtists } from "./api/useStudioRelatedArtists";
import { StudioArtistsRow } from "./StudioArtistsRow";
import { StudioReleaseCard } from "./StudioReleaseCard";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** The end of the artist's music tab: Appears on (releases where this
 *  persona holds an accepted credit, with the roles), then Related artists
 *  (scored from credits, public playlists, scenes and genres). */
export function StudioArtistDiscovery({ artistId }: { artistId: string }) {
  const { t } = useTranslation();
  const headingId = useId();
  const appearsOn = useStudioAppearsOn(artistId);
  const { artists: related } = useStudioRelatedArtists(artistId);
  return (
    <>
      <Collapse isOpen={appearsOn.cards.length > 0}>
        <section aria-labelledby={headingId}>
          <div className={`${styles.rowH} ${kit.sectionGap}`}>
            <h2 id={headingId}>
              <Translation
                i18nKey="studio:artist.appearsOn.title"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
          <div className={`${styles.rowGrid} ${kit.rowGrid5}`}>
            {appearsOn.cards.map((card) => (
              <StudioReleaseCard
                key={card.id}
                release={card}
                meta={[
                  card.artist.name,
                  card.roleLabelKeys.map((key) => t(key)).join(", "),
                ].join(" · ")}
              />
            ))}
          </div>
          <Collapse
            isOpen={appearsOn.hasMore || appearsOn.isFetchNextPageError}
          >
            <div className={kit.moreFooter}>
              <LoadMoreFooter
                isFetchingNextPage={appearsOn.isFetchingNextPage}
                isFetchNextPageError={appearsOn.isFetchNextPageError}
                onLoadMore={appearsOn.fetchNextPage}
                label={t("studio:home.newReleases.showMore")}
                loadingLabel={t("studio:home.newReleases.loadingMore")}
                errorMessage={t("studio:home.newReleases.loadMoreError")}
              />
            </div>
          </Collapse>
        </section>
      </Collapse>
      <Collapse isOpen={related.length > 0}>
        {/* The tab's own 40px rhythm sets the row's spacing, so the gap
            above Related artists matches every other section. */}
        <StudioArtistsRow
          artists={related}
          titleKey="studio:artist.related.title"
          className={kit.sectionGap}
        />
      </Collapse>
    </>
  );
}
