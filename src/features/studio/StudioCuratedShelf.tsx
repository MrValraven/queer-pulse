import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioCuratedPickView } from "./api/studioDiscovery.adapters";
import { releaseMetaLine } from "./api/studio.adapters";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioReleaseCard } from "./StudioReleaseCard";
import { useStudioHomeShelf } from "./useStudioHomeShelf";
import css from "./StudioCuration.module.css";

function StudioPickMeta({ pick }: { pick: StudioCuratedPickView }) {
  const { t } = useTranslation();
  return (
    <>
      <span>{releaseMetaLine(pick)}</span>
      {pick.note && (
        <span className={css.pickNote}>
          <span className="visuallyHidden">
            {t("studio:curation.noteLabel")}{" "}
          </span>
          {pick.note}
        </span>
      )}
    </>
  );
}

/** A staff shelf (Staff picks, New this week): one swipeable row of release
 *  cards in shelf order with each pick's note, and See all opening every
 *  pick as a grid. It folds away while empty or unread. */
export function StudioCuratedShelf({
  picks,
  titleKey,
  shelfKey,
}: {
  picks: StudioCuratedPickView[];
  titleKey: string;
  /** The `?shelf=` value See all sets, and the heading id's stem. */
  shelfKey: string;
}) {
  const { attachFrame, ...shelf } = useStudioHomeShelf(shelfKey, picks.length);
  return (
    <Collapse isOpen={picks.length > 0}>
      <div ref={attachFrame}>
        <StudioShelf
          id={`studio-home-${shelfKey}`}
          title={<Translation i18nKey={titleKey} components={{ em: <em /> }} />}
          layout={shelf.layout}
          seeAllHref={shelf.seeAllHref}
          seeAllLabel={shelf.seeAllLabel}
          seeAllReplace={shelf.seeAllReplace}
        >
          {picks.map((pick) => (
            <StudioReleaseCard
              key={pick.id}
              release={pick}
              meta={<StudioPickMeta pick={pick} />}
            />
          ))}
        </StudioShelf>
      </div>
    </Collapse>
  );
}
