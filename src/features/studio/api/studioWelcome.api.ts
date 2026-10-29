import { apiGet, apiPut } from "../../../shared/api/client";
import type { StudioWelcomeDTO, StudioWelcomeUpdateDTO } from "./studio.types";

/** GET /me/studio-welcome: whether this account has closed the Studio
 *  welcome and the picks it made there. Needs a Studio grant; answers the
 *  defaults (not seen, no picks) when nothing is stored. */
export const getStudioWelcome = () =>
  apiGet<StudioWelcomeDTO>("/me/studio-welcome");

/** PUT /me/studio-welcome: a partial replace. `hasSeenWelcome` goes out only
 *  as true and stamps welcomeSeenAt once; `genres` and `moods` each replace
 *  the stored list when passed. The answer is the whole stored row. */
export const putStudioWelcome = (
  update: StudioWelcomeUpdateDTO,
): Promise<StudioWelcomeDTO> =>
  apiPut<StudioWelcomeDTO>("/me/studio-welcome", update);
