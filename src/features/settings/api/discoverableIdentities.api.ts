import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * Which of the member's private identities are published for member-directory
 * search. `GET|PUT /me/discoverable-identities`.
 *
 * `available` is what this member COULD publish (the identities they hold
 * privately, minus "Prefer not to say"); `published` is what they have. Both
 * come from the server so the pane never has to derive one from a stale copy of
 * the other — a toggle rendered from an out-of-date private list could offer to
 * publish something already retracted.
 */
export interface DiscoverableIdentitiesDTO {
  available: string[];
  published: string[];
}

export const getDiscoverableIdentities = () =>
  apiGet<DiscoverableIdentitiesDTO>("/me/discoverable-identities");

/** Full replace. `[]` un-publishes everything. Returns the persisted state. */
export const putDiscoverableIdentities = (identities: string[]) =>
  apiPut<DiscoverableIdentitiesDTO>("/me/discoverable-identities", {
    identities,
  });
