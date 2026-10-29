import { useId } from "react";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioFollowedArtists } from "./api/useStudioFollowedArtists";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioArtistCard } from "./StudioArtistCard";
import { StudioLoadError } from "./StudioLoadStates";
import { studioLibraryPath } from "./studioPaths";
import { StudioShelfSkeleton } from "./StudioSkeletons";
import styles from "./studio.module.css";

const FOLLOWING_LIMIT = 8;

/** The artists the member follows, on the private You page: the first eight
 *  on a shelf, with the full list under "Open your library" (artists tab).
 *  Owns its loading, error and empty states. */
export function StudioMeFollowing() {
  const { t } = useTranslation();
  const headingId = useId();
  const followed = useStudioFollowedArtists();
  const shownArtists = followed.artists.slice(0, FOLLOWING_LIMIT);
  const hasArtists = followed.artists.length > 0;
  const isLoading = followed.loadState.isLoading && !hasArtists;
  const isFailed = followed.loadState.isError && !hasArtists;
  const isEmpty = !isLoading && !isFailed && !followed.hasMore && !hasArtists;
  const heading = t("studio:me.following.heading");

  return (
    <>
      <Collapse isOpen={hasArtists}>
        <StudioShelf
          id={headingId}
          title={heading}
          seeAllHref={studioLibraryPath("artists")}
          seeAllLabel={t("studio:me.following.seeAll")}
        >
          {shownArtists.map((artist) => (
            <StudioArtistCard key={artist.id} artist={artist} />
          ))}
        </StudioShelf>
      </Collapse>
      <Collapse isOpen={!hasArtists}>
        <section className={styles.row} aria-labelledby={`${headingId}-state`}>
          <div className={styles.rowH}>
            <h2 id={`${headingId}-state`}>{heading}</h2>
          </div>
          <Collapse isOpen={isLoading}>
            <StudioShelfSkeleton cards={4} label={heading} />
          </Collapse>
          <Collapse isOpen={isFailed}>
            <StudioLoadError
              loadState={followed.loadState}
              what="studio:errors.what.followedArtists"
            />
          </Collapse>
          <Collapse isOpen={isEmpty}>
            <div className={styles.rowH}>
              <p className={styles.sub}>{t("studio:me.following.empty")}</p>
            </div>
          </Collapse>
        </section>
      </Collapse>
    </>
  );
}
