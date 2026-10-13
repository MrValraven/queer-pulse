import { heroImage } from "../studioArtist.data";
import type { StudioArtistRefDTO, StudioMeDTO } from "./studio.types";

/** The demo's one artist persona the signed-in demo member owns. Mariana
 *  has no persona page in the demo corpus, so her handle stays empty and
 *  the adapters leave the persona link out. */
export const DEMO_ARTIST_MARIANA: StudioArtistRefDTO = {
  id: "demo-persona-mariana-sol",
  handle: "",
  name: "Mariana Sol",
  kind: "musician",
  avatarUrl: heroImage,
};

export const DEMO_STUDIO_ME: StudioMeDTO = {
  hasAccess: true,
  uploadablePersonas: [DEMO_ARTIST_MARIANA],
};

/** What the old id-less demo links (`/studio/album`, `/studio/track`,
 *  `/studio/artist`) open, so every demo link keeps landing somewhere. */
export const DEMO_DEFAULT_RELEASE_ID = "demo-release-cidade-dos-santos";
export const DEMO_DEFAULT_TRACK_ID = "demo-track-cidade-dos-santos-06";
export const DEMO_DEFAULT_ARTIST_ID = DEMO_ARTIST_MARIANA.id;
