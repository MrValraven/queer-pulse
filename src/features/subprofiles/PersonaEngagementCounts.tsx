import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import type { PersonaAction } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/** A follower or endorsement count in the meta line; rolls when the viewer
 *  follows or endorses. */
function PersonaMetaCount({
  i18nKey,
  count,
}: {
  i18nKey: string;
  count: number;
}) {
  const fmt = useFormat();
  // One span: on narrow heroes the count button is inline-flex
  // (persona-skins.css), and a bare sentence would split into flex items
  // that drop the space after the number.
  return (
    <span>
      <Translation
        i18nKey={i18nKey}
        values={{ count }}
        slots={{
          count: (
            <RollingNumber value={fmt.number(count)} numericValue={count} />
          ),
        }}
      />
    </span>
  );
}

/** The endorsement and follower counts at the head of the meta line. Each one
 *  shows only above zero, so "14 followers" stands alone when nobody has
 *  endorsed yet and the line closes up with no separator left behind. A list
 *  this viewer may not read would open an empty modal, so that count renders
 *  as plain text and leaves nothing dead to click. */
export function PersonaEngagementCounts({
  view,
  interactive,
  isEndorserListOpenable,
  onAction,
}: {
  view: PublicSubprofileView;
  interactive: boolean;
  isEndorserListOpenable: boolean;
  onAction: (action: PersonaAction) => void;
}) {
  const hasEndorsements = view.endorsementCount > 0;
  const hasFollowers = view.followerCount > 0;
  const endorsementLabel = (
    <PersonaMetaCount
      i18nKey="subprofiles:hero.endorse.count"
      count={view.endorsementCount}
    />
  );
  const followerLabel = (
    <PersonaMetaCount
      i18nKey="subprofiles:hero.follow.count"
      count={view.followerCount}
    />
  );
  return (
    <>
      {hasEndorsements &&
        (isEndorserListOpenable ? (
          <button
            type="button"
            className="pp-metabtn"
            disabled={!interactive}
            onClick={
              interactive ? () => onAction("people:endorsers") : undefined
            }
          >
            {endorsementLabel}
          </button>
        ) : (
          <span>{endorsementLabel}</span>
        ))}
      {hasFollowers && (
        <button
          type="button"
          className="pp-metabtn"
          disabled={!interactive}
          onClick={interactive ? () => onAction("people:followers") : undefined}
        >
          {followerLabel}
        </button>
      )}
    </>
  );
}
