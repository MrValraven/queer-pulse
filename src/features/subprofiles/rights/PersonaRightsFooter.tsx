import { WorkRightsFooter } from "./WorkRightsFooter";
import { firstPublishedISO, latestPublishedISO } from "./firstPublished";
import { PageColophon } from "../skins/PageBlocks";
import type { PublicSubprofileView } from "../api/subprofiles.adapters";

/**
 * The single copyright + provenance notice that closes a public persona page.
 *
 * Previously every row, spotlight and menu card carried its own
 * `WorkRightsFooter`, which stacked the same "All rights reserved." line
 * beside every item on the page. The notice covers the whole persona, so it
 * belongs once at the end; the date shown is the persona's earliest item
 * (`firstPublishedISO`). Renders nothing when there is no dated work to claim.
 */
export function PersonaRightsFooter({
  persona,
}: {
  persona: PublicSubprofileView;
}) {
  const createdAtISO = firstPublishedISO(persona);
  if (!createdAtISO) return null;
  return <WorkRightsFooter createdAtISO={createdAtISO} variant="page" />;
}

/**
 * The page skin's one closing block, in place of the end-slot colophon note
 * and the separate rights footer it used to stack over: a single centred
 * colophon in the page's column, holding the owner's note (`PageColophon`),
 * then the © line with the years from first to latest item, then the
 * provenance line. The hairline above it and the small ornament below are
 * drawn in persona-skins.css (`.pp-colophon`).
 *
 * The rights lines stay out of the editor's docked preview, as on every other
 * skin (`isRightsShown`), while the owner's note still previews there.
 * Renders nothing when there is neither a note nor dated work.
 */
export function PersonaColophon({
  persona,
  isRightsShown,
}: {
  persona: PublicSubprofileView;
  isRightsShown: boolean;
}) {
  const createdAtISO = isRightsShown ? firstPublishedISO(persona) : null;
  const hasNote = Boolean(persona.skinData?.colophon);
  if (!createdAtISO && !hasNote) return null;
  return (
    <footer className="pp-colophon">
      <PageColophon persona={persona} />
      {createdAtISO && (
        <WorkRightsFooter
          createdAtISO={createdAtISO}
          latestISO={latestPublishedISO(persona)}
          variant="colophon"
        />
      )}
    </footer>
  );
}
