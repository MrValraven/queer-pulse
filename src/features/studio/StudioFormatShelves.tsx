import { useId, type ReactNode } from "react";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import {
  releaseMetaLine,
  type StudioReleaseCardView,
} from "./api/studio.adapters";
import { useStudioFormatReleases } from "./api/useStudioFormatReleases";
import { useStudioLatestEpisodes } from "./api/useStudioLatestEpisodes";
import { StudioEpisodeCard } from "./StudioEpisodeCard";
import { StudioReleaseCard } from "./StudioReleaseCard";
import styles from "./studio.module.css";

/** Cards a shelf shows; the grids and browse hold the rest. */
const SHELF_SIZE = 8;

function StudioShelf({
  titleKey,
  isOpen,
  children,
}: {
  titleKey: string;
  isOpen: boolean;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <Collapse isOpen={isOpen}>
      <section className={styles.row} aria-labelledby={headingId}>
        <div className={styles.rowH}>
          <h2 id={headingId}>
            <Translation i18nKey={titleKey} components={{ em: <em /> }} />
          </h2>
        </div>
        <div className={styles.rowGrid}>{children}</div>
      </section>
    </Collapse>
  );
}

function StudioReleaseShelf({
  titleKey,
  releases,
}: {
  titleKey: string;
  releases: StudioReleaseCardView[];
}) {
  return (
    <StudioShelf titleKey={titleKey} isOpen={releases.length > 0}>
      {releases.slice(0, SHELF_SIZE).map((release) => (
        <StudioReleaseCard
          key={release.id}
          release={release}
          meta={releaseMetaLine(release)}
        />
      ))}
    </StudioShelf>
  );
}

/** Home under All (spec 5.1): New episodes, Spoken word and On stage, each
 *  folded away while empty, loading or failed. */
export function StudioFormatShelves() {
  const { episodes } = useStudioLatestEpisodes();
  const spokenWord = useStudioFormatReleases("spoken_word", { isSilent: true });
  const onStage = useStudioFormatReleases("performance", { isSilent: true });
  return (
    <>
      <StudioShelf
        titleKey="studio:home.newEpisodes.title"
        isOpen={episodes.length > 0}
      >
        {episodes.slice(0, SHELF_SIZE).map((episode) => (
          <StudioEpisodeCard key={episode.track.id} episode={episode} />
        ))}
      </StudioShelf>
      <StudioReleaseShelf
        titleKey="studio:home.spokenWord.title"
        releases={spokenWord.releases}
      />
      <StudioReleaseShelf
        titleKey="studio:home.onStage.title"
        releases={onStage.releases}
      />
    </>
  );
}
