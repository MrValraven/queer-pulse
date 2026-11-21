/** The query param that asks the Pulse composer to take focus on arrival. */
export const COMPOSER_FOCUS_PARAM = "compose";
export const COMPOSER_FOCUS_VALUE = "1";

/** The search string a link appends to open a community with its composer focused. */
export function composerFocusSearch(): string {
  return `?${COMPOSER_FOCUS_PARAM}=${COMPOSER_FOCUS_VALUE}`;
}
