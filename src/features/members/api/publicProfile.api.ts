import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * The member's public-profile preference.
 *
 * Scope note, deliberately narrow: this endpoint stores a flag and nothing more.
 * There is no unauthenticated profile endpoint anywhere in the backend yet, so
 * turning this on does not publish anything to the open web — it records what
 * the member wants for when public profiles do exist. The UI says exactly that
 * (see `PublicProfileControl`); don't let it drift back into "you are live".
 */
export interface PublicProfileVisibilityDTO {
  enabled: boolean;
}

/** GET /me/public-profile */
export async function getPublicProfileVisibility(): Promise<PublicProfileVisibilityDTO> {
  const res =
    await apiGet<Partial<PublicProfileVisibilityDTO>>("/me/public-profile");
  return { enabled: res?.enabled === true };
}

/** PUT /me/public-profile */
export async function putPublicProfileVisibility(
  enabled: boolean,
): Promise<PublicProfileVisibilityDTO> {
  const res = await apiPut<Partial<PublicProfileVisibilityDTO>>(
    "/me/public-profile",
    { enabled },
  );
  return { enabled: res?.enabled === true };
}
