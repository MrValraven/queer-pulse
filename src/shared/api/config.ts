/**
 * Build-time configuration. Vite inlines `import.meta.env.*` at build, so every
 * value here is frozen into the artifact — there is no runtime signal if it's
 * wrong. That makes "missing config" the most dangerous state this app can be
 * in, and this module's job is to make it impossible to ship silently.
 *
 * The rule: **demo mode is an explicit opt-in (`VITE_DEMO=1`), never a fallback
 * for missing config.** Previously an absent-or-typo'd `VITE_API_URL` yielded
 * `""` ⇒ demo forced on ⇒ anonymous visitors auto-signed-in as a mock user, fed
 * fabricated data as real community content, with the admin role-guard bypassed.
 * One typo turned production into a fake platform. Failing closed here makes
 * that entire class of bug unreachable.
 */

/**
 * True only when demo mode was explicitly asked for at build time (`VITE_DEMO=1`).
 * This is what lets the standalone prototype run with no backend at all; it is
 * never inferred from the API looking unavailable.
 */
export const demoConfigured: boolean = import.meta.env.VITE_DEMO === "1";

const rawApiUrl: string = (import.meta.env.VITE_API_URL ?? "").trim();

// Fail loudly at boot rather than degrade into a convincing fake. A production
// build with no backend is only legitimate when it's a deliberate demo build.
if (import.meta.env.PROD && !rawApiUrl && !demoConfigured) {
  throw new Error(
    "[qp] VITE_API_URL is not set in this production build. Refusing to boot: " +
      "without a backend the app would silently serve mock data as real " +
      "community content. Set VITE_API_URL to the API origin (e.g. " +
      "https://api.queerpulse.com), or set VITE_DEMO=1 if you deliberately " +
      "intend to build the standalone demo prototype. See .env.example.",
  );
}

/** Backend origin from Vite env. Empty string only in demo/dev builds. */
export const API_BASE_URL: string = rawApiUrl;

/** True when a backend origin is configured; gates live mode + the demo toggle. */
export const apiAvailable: boolean = API_BASE_URL.length > 0;
