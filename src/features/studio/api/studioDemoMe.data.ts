import { heroImage } from "../studioArtist.data";
import type { StudioArtistRefDTO, StudioMeDTO } from "./studio.types";

/** The demo member's music persona (Late Bloomers, below, is their
 *  podcaster). Mariana has no persona page in the demo corpus, so her handle
 *  stays empty and the adapters leave the persona link out. */
export const DEMO_ARTIST_MARIANA: StudioArtistRefDTO = {
  id: "demo-persona-mariana-sol",
  handle: "",
  name: "Mariana Sol",
  kind: "musician",
  avatarUrl: heroImage,
};

/** Two demo artists the persona credit ledger also names, kept here so the
 *  release fixture and the credits file share one literal each. */
export const DEMO_ARTIST_NIGHTFORM: StudioArtistRefDTO = {
  id: "sp-diogo-nightform",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician",
  avatarUrl: null,
};
export const DEMO_ARTIST_LECHATDASHINKO: StudioArtistRefDTO = {
  id: "sp-jordan-lechatdashinko",
  handle: "jordan-lechatdashinko",
  name: "LeChatDashinko",
  kind: "dj",
  avatarUrl: null,
};

/** Artist kinds: the demo viewer's own podcaster persona (the subprofiles
 *  demo's Late Bloomers, `sp-tiago-late-bloomers`), so the owner views of a
 *  show (drafts, Add episode, episode mode) can be reviewed in demo. */
export const DEMO_ARTIST_LATE_BLOOMERS: StudioArtistRefDTO = {
  id: "sp-tiago-late-bloomers",
  handle: "late-bloomers",
  name: "Late Bloomers",
  kind: "podcaster",
  avatarUrl: null,
};

export const DEMO_STUDIO_ME: StudioMeDTO = {
  hasAccess: true,
  uploadablePersonas: [DEMO_ARTIST_MARIANA, DEMO_ARTIST_LATE_BLOOMERS],
};

/** What the old id-less demo links (`/studio/album`, `/studio/track`,
 *  `/studio/artist`) open, so every demo link keeps landing somewhere. */
export const DEMO_DEFAULT_RELEASE_ID = "demo-release-cidade-dos-santos";
export const DEMO_DEFAULT_TRACK_ID = "demo-track-cidade-dos-santos-06";
export const DEMO_DEFAULT_ARTIST_ID = DEMO_ARTIST_MARIANA.id;
