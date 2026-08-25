import { WorkRightsFooter } from "./WorkRightsFooter";
import { firstPublishedISO } from "./firstPublished";
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
export function PersonaRightsFooter({ persona }: { persona: PublicSubprofileView }) {
  const createdAtISO = firstPublishedISO(persona);
  if (!createdAtISO) return null;
  return (
    <WorkRightsFooter
      authorName={persona.displayName}
      createdAtISO={createdAtISO}
      variant="page"
    />
  );
}
