/** localStorage key that records an explicit sign-out for the prototype auth state. */
export const AUTH_STORAGE_KEY = "qp_logged_in";

/**
 * i18n Pattern A. `name` (technical cookie identifier) and `provider` (brand
 * name) are never translated. `expiresKey` resolves through `t()` since a
 * duration word ("Session", "30 days") reads differently in pt-PT.
 */
export interface CookieRow {
  name: string;
  expiresKey: string;
  provider: string;
}

export interface CookieCategory {
  id: "essential" | "functional" | "analytics";
  titleKey: string;
  required?: boolean;
  bodyKey: string;
  cookies: CookieRow[];
}

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    titleKey: "marketing:cookies.essential.title",
    required: true,
    bodyKey: "marketing:cookies.essential.body",
    cookies: [
      {
        name: "qp_session",
        expiresKey: "marketing:cookies.expires.session",
        provider: "QueerPulse",
      },
      {
        name: "qp_csrf",
        expiresKey: "marketing:cookies.expires.session",
        provider: "QueerPulse",
      },
      {
        name: "qp_auth",
        expiresKey: "marketing:cookies.expires.days30",
        provider: "QueerPulse",
      },
      {
        name: "qp_prefs",
        expiresKey: "marketing:cookies.expires.year1",
        provider: "QueerPulse",
      },
    ],
  },
  {
    id: "functional",
    titleKey: "marketing:cookies.functional.title",
    bodyKey: "marketing:cookies.functional.body",
    cookies: [
      {
        name: "qp_theme",
        expiresKey: "marketing:cookies.expires.year1",
        provider: "QueerPulse",
      },
      {
        name: "qp_lang",
        expiresKey: "marketing:cookies.expires.year1",
        provider: "QueerPulse",
      },
      {
        name: "qp_notif",
        expiresKey: "marketing:cookies.expires.months6",
        provider: "QueerPulse",
      },
    ],
  },
  {
    id: "analytics",
    titleKey: "marketing:cookies.analytics.title",
    bodyKey: "marketing:cookies.analytics.body",
    cookies: [
      {
        name: "plausible_ignore",
        expiresKey: "marketing:cookies.expires.session",
        provider: "Plausible",
      },
    ],
  },
];
