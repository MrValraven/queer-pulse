/**
 * User-agent tokens the social apps stamp on their built-in browsers. Those
 * browsers are web views inside the app: they have no Add to Home Screen and
 * fire no `beforeinstallprompt`, so a member who reaches QueerPulse from an
 * Instagram link has to move the page into Safari or Chrome before any install
 * step can work.
 *
 * - Instagram: `Instagram`
 * - Facebook and Messenger: `FBAN`, `FBAV`, `FB_IAB`, `FBIOS`
 * - Line: `Line/`
 * - TikTok: `musical_ly`, `BytedanceWebview`
 * - LinkedIn: `LinkedInApp`
 * - Snapchat and Pinterest: `Snapchat`, `Pinterest`
 * - The Google app on iOS: `GSA/`
 */
const IN_APP_BROWSER_PATTERN =
  /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line\/|musical_ly|BytedanceWebview|LinkedInApp|Snapchat|Pinterest|GSA\//;

/**
 * True inside a social app's built-in browser. Used to pick copy (the extra
 * "open this in your browser first" step), the same way `detectPlatform` is,
 * so a wrong guess costs the member one redundant step and never a broken one.
 */
export function detectInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return IN_APP_BROWSER_PATTERN.test(navigator.userAgent);
}
