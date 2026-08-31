import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * Whether this member may be recommended to other members (PRD-16).
 *
 * ---------------------------------------------------------------------------
 * The gap this closes
 * ---------------------------------------------------------------------------
 * There was no way to stop being suggested to strangers. The Visibility pane's
 * "Appear in suggested connections" toggle was inert and badged coming-soon,
 * and the only lever a member had over the suggestion strip was the 24-hour
 * hide, which also takes them out of the member directory.
 *
 * `hideFromSuggestions: true` now removes them from every other member's
 * strip. The backend enforces it inside the candidate query
 * (`MemberSuggestionsService.visibleCandidates`), so an opted-out member is
 * never scored, and it is a `NOT EXISTS` so the common case of no stored
 * preferences row still reads as recommendable.
 *
 * ---------------------------------------------------------------------------
 * It is one-directional, and narrower than it sounds
 * ---------------------------------------------------------------------------
 * Opting out stops the member being suggested. It never stops them SEEING
 * suggestions: their own strip is built from their own graph, and charging
 * them their discovery for a privacy choice would make this a switch people
 * warn each other not to touch.
 *
 * It governs the suggestion strip alone. They stay in the member directory,
 * stay findable by search, and their profile stays exactly as visible as their
 * profile visibility setting says.
 *
 * `hideFromSuggestions`, not `enabled`: the pane's label reads "Appear in
 * suggested connections", so an `enabled` field would sit one careless reading
 * away from being wired backwards, and backwards here means the platform keeps
 * pushing somebody at strangers after they asked it to stop.
 */
export interface SuggestionVisibilityDTO {
  hideFromSuggestions: boolean;
}

/**
 * Members are recommendable unless they opt out. Mirrors the backend's
 * `DEFAULT_HIDE_FROM_SUGGESTIONS`, and is what the toggle renders before the
 * first fetch resolves.
 *
 * The permissive default is right because the strip only ever surfaces people
 * the member directory would already list, under the directory's own
 * visibility gates. What was missing was the lever.
 */
export const DEFAULT_HIDE_FROM_SUGGESTIONS = false;

/** GET /me/suggestion-visibility: never 404s; synthesises the default when unset. */
export const getSuggestionVisibility = () =>
  apiGet<SuggestionVisibilityDTO>("/me/suggestion-visibility");

/** PUT /me/suggestion-visibility: echoes back what was actually stored. */
export const putSuggestionVisibility = (hideFromSuggestions: boolean) =>
  apiPut<SuggestionVisibilityDTO>("/me/suggestion-visibility", {
    hideFromSuggestions,
  });
