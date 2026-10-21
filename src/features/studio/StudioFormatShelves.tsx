import type { ReactNode } from "react";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import {
  releaseMetaLine,
  type StudioReleaseCardView,
} from "./api/studio.adapters";
import type { StudioFormat } from "./api/studio.types";
import { useStudioFormatReleases } from "./api/useStudioFormatReleases";
import { useStudioLatestEpisodes } from "./api/useStudioLatestEpisodes";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioEpisodeCard } from "./StudioEpisodeCard";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { studioBrowsePath } from "./studioPaths";

/** Cards a shelf row holds; See all opens the format in browse. */
const SHELF_SIZE = 12;

function StudioFormatShelf({
  id,
  titleKey,
  format,
  isOpen,
  children,
}: {
  id: string;
  titleKey: string;
  /** See all browses this format. */
  format: StudioFormat;
  isOpen: boolean;
  children: ReactNode;
}) {
  return (
    <Collapse isOpen={isOpen}>
      <StudioShelf
        id={id}
        title={<Translation i18nKey={titleKey} components={{ em: <em /> }} />}
        seeAllHref={studioBrowsePath(null, null, format)}
      >
        {children}
      </StudioShelf>
    </Collapse>
  );
}

function StudioReleaseShelf({
  id,
  titleKey,
  format,
  releases,
}: {
  id: string;
  titleKey: string;
  format: StudioFormat;
  releases: StudioReleaseCardView[];
}) {
  return (
    <StudioFormatShelf
      id={id}
      titleKey={titleKey}
      format={format}
      isOpen={releases.length > 0}
    >
      {releases.slice(0, SHELF_SIZE).map((release) => (
        <StudioReleaseCard
          key={release.id}
          release={release}
          meta={releaseMetaLine(release)}
        />
      ))}
    </StudioFormatShelf>
  );
}

/** Home under All (spec 5.1): New episodes, Spoken word and On stage, each
 *  one swipeable row with See all into browse for its format, and each
 *  folded away while empty, loading or failed. */
export function StudioFormatShelves() {
  const { episodes } = useStudioLatestEpisodes();
  const spokenWord = useStudioFormatReleases("spoken_word", { isSilent: true });
  const onStage = useStudioFormatReleases("performance", { isSilent: true });
  return (
    <>
      <StudioFormatShelf
        id="studio-home-new-episodes"
        titleKey="studio:home.newEpisodes.title"
        format="podcast"
        isOpen={episodes.length > 0}
      >
        {episodes.slice(0, SHELF_SIZE).map((episode) => (
          <StudioEpisodeCard key={episode.track.id} episode={episode} />
        ))}
      </StudioFormatShelf>
      <StudioReleaseShelf
        id="studio-home-spoken-word"
        titleKey="studio:home.spokenWord.title"
        format="spoken_word"
        releases={spokenWord.releases}
      />
      <StudioReleaseShelf
        id="studio-home-on-stage"
        titleKey="studio:home.onStage.title"
        format="performance"
        releases={onStage.releases}
      />
    </>
  );
}
