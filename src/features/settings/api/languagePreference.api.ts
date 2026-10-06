import { apiGet, apiPut } from "../../../shared/api/client";
import type { Language } from "../../../shared/i18n/types";

/**
 * The member's interface language, stored on the server (PRD-325).
 *
 * The browser keeps its own copy in localStorage, plus an IndexedDB mirror the
 * service worker reads for push copy (`src/pushLang.ts`). This server copy is
 * what carries the choice to a new device and back after site data is
 * cleared, and what the backend reads when it writes push text itself.
 *
 * `language` is `null` until the member's first signed-in device writes one
 * up; `useLanguagePreferenceSync` does that on the first session it sees.
 */
export interface LanguagePreferenceDTO {
  language: Language | null;
}

/** GET /me/language: never 404s; `{ language: null }` when unset. */
export const getLanguagePreference = () =>
  apiGet<LanguagePreferenceDTO>("/me/language");

/** PUT /me/language: echoes back what was stored. */
export const putLanguagePreference = (language: Language) =>
  apiPut<LanguagePreferenceDTO>("/me/language", { language });
