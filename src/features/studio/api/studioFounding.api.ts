import { apiGet } from "../../../shared/api/client";
import type { StudioFoundingArtistsDTO } from "./studioLanding.types";

/** Granted members. The launch shelf switch and the founding artists the
 *  caller can see, position first. */
export const getStudioFoundingArtists = () =>
  apiGet<StudioFoundingArtistsDTO>("/studio/founding-artists");
