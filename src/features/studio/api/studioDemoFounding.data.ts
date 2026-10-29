import type { StudioFoundingArtistsDTO } from "./studioLanding.types";
import {
  DEMO_ARTIST_LECHATDASHINKO,
  DEMO_ARTIST_NIGHTFORM,
} from "./studioDemoMe.data";
import { DEMO_ARTIST_VANDA_DIESEL } from "./studioDemoFormats.data";

/** The demo founding artists. The subprofiles demo flags the same ids with
 *  `isFoundingArtist`, and studioDemoFormats.data.ts imports this list, so
 *  this file keeps its ids as plain strings. */
export const DEMO_FOUNDING_ARTIST_IDS: readonly string[] = [
  "sp-diogo-nightform",
  "sp-ines-fonseca-vanda-diesel",
  "sp-jordan-lechatdashinko",
];

/** `artists` is a getter: studioDemoFormats.data.ts and this file import each
 *  other, so the refs resolve when the read happens and never while the
 *  modules load. */
export const DEMO_STUDIO_FOUNDING_ARTISTS: StudioFoundingArtistsDTO = {
  isShelfVisible: true,
  get artists() {
    return [
      DEMO_ARTIST_NIGHTFORM,
      DEMO_ARTIST_VANDA_DIESEL,
      DEMO_ARTIST_LECHATDASHINKO,
    ];
  },
};
