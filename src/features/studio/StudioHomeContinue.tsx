import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioEpisodeCard } from "./StudioEpisodeCard";
import { useStudioContinueListening } from "./useStudioContinueListening";
import { useStudioHomeShelf } from "./useStudioHomeShelf";

/** Continue listening, just under the home hero: the episodes the member
 *  left part way, each showing how far they got. Play picks up at the saved
 *  place. The places live on this device only, as the eyebrow says. It
 *  grows in once there is one and folds away when the last is finished. */
export function StudioHomeContinue() {
  const { t } = useTranslation();
  const { entries } = useStudioContinueListening();
  const { attachFrame, ...shelf } = useStudioHomeShelf(
    "continue",
    entries.length,
  );
  return (
    <Collapse isOpen={entries.length > 0}>
      <div ref={attachFrame}>
        <StudioShelf
          id="studio-home-continue"
          eyebrow={t("studio:home.continue.eyebrow")}
          title={
            <Translation
              i18nKey="studio:home.continue.title"
              components={{ em: <em /> }}
            />
          }
          layout={shelf.layout}
          seeAllHref={shelf.seeAllHref}
          seeAllLabel={shelf.seeAllLabel}
          seeAllReplace={shelf.seeAllReplace}
        >
          {entries.map((entry) => (
            <StudioEpisodeCard
              key={entry.episode.track.id}
              episode={entry.episode}
              positionSeconds={entry.positionSeconds}
            />
          ))}
        </StudioShelf>
      </div>
    </Collapse>
  );
}
