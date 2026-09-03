/**
 * The web app manifest's `start_url` is `/?mode=standalone` (vite.config.ts).
 * That query pair is the one signal the app has that THIS page load is a launch
 * from the home-screen icon rather than a visit inside a session: an in-app
 * navigation to "/" never carries it, and neither does a browser-tab visit.
 *
 * Two readers depend on it, and both must agree on the spelling:
 *   - DisplayModeProvider latches its sticky "installed" flag from it.
 *   - authGate sends a signed-in member from the launch URL to their feed,
 *     so opening the installed app lands on the app and never on the
 *     marketing homepage.
 */
const STANDALONE_LAUNCH_PARAM = "mode";
const STANDALONE_LAUNCH_VALUE = "standalone";

export function isStandaloneLaunch(search: string): boolean {
  return (
    new URLSearchParams(search).get(STANDALONE_LAUNCH_PARAM) ===
    STANDALONE_LAUNCH_VALUE
  );
}
