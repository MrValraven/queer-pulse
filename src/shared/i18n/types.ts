export type Language = "en" | "pt";

/** The languages the switcher offers, in display order. */
export const LANGUAGES: readonly Language[] = ["en", "pt"] as const;

/**
 * Catalog namespaces — one per feature domain, mirroring `src/features/<domain>/`.
 * Adding a domain = add its id here and drop `en/<id>.ts` + `pt/<id>.ts` in
 * `catalogs/`. Keeping them enumerated gives us typo-safe namespace ids.
 */
export type Namespace =
  | "common"
  | "nav"
  | "footer"
  | "auth"
  | "subprofiles"
  | "gatherings"
  | "homepage"
  | "marketing"
  | "members"
  | "magazine"
  | "communities"
  | "community"
  | "resources"
  | "economy"
  | "studio"
  | "cinema"
  | "settings"
  | "admin"
  | "system"
  | "safety"
  | "feed"
  | "forum"
  | "topics"
  | "governance"
  | "myevents"
  | "connect"
  | "messages"
  | "culture"
  | "notifications"
  | "shared";

/** Flat key → translated string. Keys are dot paths, e.g. `signIn.title`. */
export type Catalog = Record<string, string>;

/**
 * Values passed to `t(key, options)`. `count` drives CLDR pluralization; every
 * other entry is available for `{token}` interpolation.
 */
export interface TranslateOptions {
  count?: number;
  [token: string]: string | number | undefined;
}

/**
 * The translate function. Back-compatible with the old key-only signature —
 * the options arg is optional, so existing `t("key")` calls still compile.
 */
export type TFunction = (key: string, options?: TranslateOptions) => string;
