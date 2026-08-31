import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * The member's three content-sensitivity feed filters (PRD-10).
 *
 * ---------------------------------------------------------------------------
 * What these used to be
 * ---------------------------------------------------------------------------
 * Placeholders. The Interests pane rendered them `defaultChecked`, disabled
 * and badged coming-soon, with no stored field and no filter anywhere in the
 * app. For this audience "do not show me mental-health content" is a real
 * need, so they are now persisted on `member_preferences` and read by the
 * backend's feed queries.
 *
 * ---------------------------------------------------------------------------
 * What they actually do
 * ---------------------------------------------------------------------------
 * Each one hides feed items whose COMMUNITY carries a tag classified into that
 * sensitivity, plus forum threads whose own tags match. The classification is
 * derived from the community tag taxonomy on the server
 * (`queerpulse-backend/src/feed/content-sensitivity.ts`), so it cannot drift
 * away from the tags communities actually use.
 *
 * The scope is the FEED and nothing else, which is exactly what the pane's
 * helper copy promises: community access, search, direct links and the
 * member's own rooms are untouched. That is also what makes the second use
 * case work, the one worth designing for here: a member who needs their home
 * screen to be safe to have open at work can quiet it without leaving
 * anything.
 *
 * ---------------------------------------------------------------------------
 * Why the fields are `hide*`
 * ---------------------------------------------------------------------------
 * The wire, the column and the query predicate all say `hide`, so the value
 * means the same thing everywhere it travels. The pane's checkbox reads the
 * other way round ("show me this"), and `useContentSensitivity` owns that
 * single inversion so no component has to.
 */
export interface ContentSensitivityDTO {
  hideDating: boolean;
  hideMentalHealth: boolean;
  hideSexualityIdentity: boolean;
}

/**
 * Nothing is hidden until the member says so. Mirrors the backend's three
 * `DEFAULT_HIDE_*_CONTENT` constants, and is what the toggles render before
 * the first fetch resolves so a row never flickers from off to on.
 *
 * Permissive is the safe default here, in contrast with every other switch on
 * this table. Nothing escapes the member's control when a content filter is
 * off, while a filter shipped on would silently subtract whole communities
 * from the feed of somebody who never asked and cannot see what is missing.
 */
export const DEFAULT_CONTENT_SENSITIVITY: ContentSensitivityDTO = {
  hideDating: false,
  hideMentalHealth: false,
  hideSexualityIdentity: false,
};

/** GET /me/content-sensitivity: never 404s; synthesises the defaults when unset. */
export const getContentSensitivity = () =>
  apiGet<ContentSensitivityDTO>("/me/content-sensitivity");

/**
 * PUT /me/content-sensitivity: a full replace of all three, echoing back what
 * was actually stored. All three fields are required, so send the whole
 * current shape with one field changed rather than a patch.
 */
export const putContentSensitivity = (next: ContentSensitivityDTO) =>
  apiPut<ContentSensitivityDTO>("/me/content-sensitivity", next);
