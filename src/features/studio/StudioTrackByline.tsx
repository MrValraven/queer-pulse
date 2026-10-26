import type { ReactNode } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { StudioTrackView } from "./api/studio.adapters";
import { StudioMorphLink } from "./StudioMorphLink";
import type { StudioMorphDestination } from "./studioPageMorph";

/** One credit in the byline: the catalog's `<strong>` or `<em>` run, linked
 *  to its page through the Studio page morph. Translation fills the children
 *  with the run's text. */
function StudioBylineCredit({
  to,
  destination,
  emphasis,
  children,
}: {
  to: string;
  destination: StudioMorphDestination;
  emphasis: "strong" | "em";
  children?: ReactNode;
}) {
  const Emphasis = emphasis;
  return (
    <StudioMorphLink to={to} destination={destination}>
      <Emphasis>{children}</Emphasis>
    </StudioMorphLink>
  );
}

/** "by Artist · from Release" on the track hero, with the artist linked to
 *  the artist page and the release linked to its own page. Following either
 *  carries the page over smoothly, and into the release the cover moves to
 *  its place on the release hero. */
export function StudioTrackByline({ track }: { track: StudioTrackView }) {
  return (
    <Translation
      i18nKey="studio:trackPage.byLine"
      components={{
        strong: (
          <StudioBylineCredit
            to={track.release.artist.href}
            destination="artist"
            emphasis="strong"
          />
        ),
        em: (
          <StudioBylineCredit
            to={track.release.href}
            destination="release"
            emphasis="em"
          />
        ),
      }}
      values={{
        artist: track.release.artist.name,
        release: track.release.title,
      }}
    />
  );
}
