import { safeStorage } from "../../shared/storage/safeStorage";

/**
 * Seasonal skin for the boot sequence. One value drives one `data-season`
 * attribute on the overlay and the stylesheet forks from there — the design
 * calls for Pride, Trans Day of Remembrance and a Lisbon summer variant
 * "from one data attribute, no forked files", so this is the whole switch.
 */
export type LaunchSeason = "default" | "pride" | "remembrance" | "summer";

/** Trans Day of Remembrance: 20 November, a single day, and it outranks the rest. */
const REMEMBRANCE_MONTH = 10; // zero-based: November
const REMEMBRANCE_DAY = 20;

/**
 * Which variant today falls in. Deliberately derived from the clock rather
 * than a setting: nobody should have to remember to turn Pride on in June.
 *
 * The order matters. Remembrance is one fixed day and is checked first, so it
 * wins over the summer window it sits outside anyway and would win over any
 * future overlap. Pride is June (Lisbon's march), summer is July and August.
 */
export function resolveLaunchSeason(now: Date = new Date()): LaunchSeason {
  const month = now.getMonth();
  const day = now.getDate();
  if (month === REMEMBRANCE_MONTH && day === REMEMBRANCE_DAY) {
    return "remembrance";
  }
  if (month === 5) return "pride";
  if (month === 6 || month === 7) return "summer";
  return "default";
}

/**
 * What the previous session left behind for the next cold launch.
 *
 * The design splits the splash two ways: a first launch shows the slogan, a
 * returning member is greeted by name. At boot we cannot know which — the
 * session check has not come back yet, and the whole point of this screen is
 * that it paints before that happens. So the *previous* run records the first
 * name, and this run reads it synchronously on the very first render.
 *
 * Only a first name is kept, it never leaves the device, and it is cleared the
 * moment a session check comes back signed-out (see AppLaunch), so a signed-out
 * phone stops being greeted.
 */
const MEMORY_KEY = "qp-launch-member";

export interface LaunchMemory {
  /** Display first name, for the warm greeting. */
  firstName: string;
}

export function readLaunchMemory(): LaunchMemory | null {
  const raw = safeStorage.get(MEMORY_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "firstName" in parsed &&
      typeof (parsed as LaunchMemory).firstName === "string" &&
      (parsed as LaunchMemory).firstName.length > 0
    ) {
      return { firstName: (parsed as LaunchMemory).firstName };
    }
  } catch {
    // A hand-edited or half-written value is not worth a crash on the boot
    // path: fall through and treat this launch as a first launch.
  }
  return null;
}

export function writeLaunchMemory(memory: LaunchMemory): void {
  safeStorage.set(MEMORY_KEY, JSON.stringify(memory));
}

export function clearLaunchMemory(): void {
  safeStorage.remove(MEMORY_KEY);
}

/**
 * How wide the OS draws the app icon on its own launch screen, as a fraction
 * of the screen width. Measured pixel by pixel from a launch-screen screenshot
 * of an iPhone that matched none of index.html's apple-touch-startup-image
 * queries, so iOS generated its launch screen from the icon: the core (radius
 * 10 of the 64 grid) spanned 16.7% of the width, which puts the tile (plum on
 * plum, so only the mark shows) at 53%, and its centre sat at exactly 50% of
 * the screen height. Android's icon splash is smaller; this is the figure
 * with evidence behind it.
 */
const OS_ICON_WIDTH_FRACTION = 0.53;

/**
 * The home indicator band at the bottom of a Face ID iPhone, in CSS px. The
 * status bar band varies by model (44, 47, 54, 59...); this one does not, which
 * is what lets resolveLaunchCentreTop() split a missing height into the two.
 */
const IOS_HOME_INDICATOR_BAND_PX = 34;

/**
 * A viewport short of the screen by more than this is not a chrome band at
 * all (landscape, split view, a keyboard), and the correction stands down.
 */
const IOS_MAX_CHROME_BANDS_PX = 120;

/** Missing height at or below this is the home indicator band alone. */
const IOS_BOTTOM_BAND_ONLY_MAX_PX = 36;

/** Missing height at or above this is both bands, not one tall status bar. */
const IOS_BOTH_BANDS_MIN_PX = 70;

export interface LaunchCentreInput {
  /** window.innerHeight at the moment of measuring. */
  viewportHeight: number;
  /** window.screen.height: the full screen in CSS px, portrait on iOS. */
  screenHeight: number;
  /** navigator.standalone, the iOS-only home-screen launch flag. */
  isIosStandalone: boolean;
}

/**
 * Where the screen's vertical centre falls inside the viewport, in px from the
 * viewport's top, or null to leave the stylesheet's `50%` alone.
 *
 * iOS puts its generated launch icon at the exact centre of the SCREEN. The
 * overlay is `position: fixed; inset: 0`, so `50%` is the centre of the
 * VIEWPORT, and on an iOS home-screen launch the first layout can run in a
 * viewport that is still short of the screen by the status bar band, the home
 * indicator band, or both, before it grows to full size. In that frame `50%`
 * sits below the icon and the handoff visibly steps down.
 *
 * The screen height is known (`screen.height`), so the correction is just
 * which band is missing: the home indicator is a fixed 34px, the status bar is
 * whatever is left. Re-run on resize: once the viewport reaches the screen,
 * the answer is `50%` again and nothing has moved. iOS only, on the flag that
 * only iOS sets, because Android's splash centres differently and has not
 * been measured.
 */
export function resolveLaunchCentreTop({
  viewportHeight,
  screenHeight,
  isIosStandalone,
}: LaunchCentreInput): number | null {
  if (!isIosStandalone) return null;
  if (!(viewportHeight > 0) || !(screenHeight > 0)) return null;
  const missingHeight = screenHeight - viewportHeight;
  if (missingHeight < 0 || missingHeight > IOS_MAX_CHROME_BANDS_PX) return null;
  let statusBarBand = 0;
  if (missingHeight > IOS_BOTTOM_BAND_ONLY_MAX_PX) {
    statusBarBand =
      missingHeight >= IOS_BOTH_BANDS_MIN_PX
        ? missingHeight - IOS_HOME_INDICATOR_BAND_PX
        : missingHeight;
  }
  return screenHeight / 2 - statusBarBand;
}

/** The inputs resolveLaunchCentreTop() needs, read from the live window. */
export function readLaunchCentreTop(): number | null {
  if (typeof window === "undefined") return null;
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return resolveLaunchCentreTop({
    viewportHeight: window.innerHeight,
    screenHeight: window.screen?.height ?? 0,
    isIosStandalone: iosNavigator.standalone === true,
  });
}

/**
 * Side of the ghost's box at rest, in px: the size at which the mark's core
 * (radius 10 of a 64 grid) is exactly the overlay's 13px pulse dot, so the
 * ghost can fade out over the dot with nothing moving.
 */
export const LAUNCH_GHOST_SIZE_PX = 13 * (64 / 20);

/**
 * The scale the ghost mark opens at, so its first frame is the same size as
 * the icon the OS just painted. Drives `--launch-open-scale` on the overlay;
 * the stylesheet then eases it down to 1.
 */
export function resolveLaunchOpenScale(viewportWidth: number): number {
  if (!(viewportWidth > 0)) return 1;
  return (viewportWidth * OS_ICON_WIDTH_FRACTION) / LAUNCH_GHOST_SIZE_PX;
}

/**
 * Point the exit animation at the nav bar's real brand dot and wordmark.
 *
 * The design's exit is specified against a fixed 402x874 stage, where the
 * travel is a hardcoded `translate(-165px, -270px)`. A phone is not that stage,
 * so the distances are measured instead: both targets carry a
 * `data-launch-target` attribute (Navbar.tsx) precisely so this can find them
 * without reaching into another module's hashed class names.
 *
 * Called while the splash is still at rest, one beat BEFORE the exit class
 * lands — measuring after it would read the transform's end state back.
 *
 * When a target is missing (a layout without the brand, a nav that has not
 * mounted) its custom properties stay unset and the stylesheet's fallbacks turn
 * the exit into a plain lift. No travel beats travel to the wrong place.
 */
export function applyHandoffTargets(
  overlay: HTMLElement | null,
  mark: HTMLElement | null,
  wordmark: HTMLElement | null,
): void {
  if (!overlay) return;

  const dotTarget = document.querySelector<HTMLElement>(
    '[data-launch-target="brand-dot"]',
  );
  if (mark && dotTarget) {
    const from = mark.getBoundingClientRect();
    const to = dotTarget.getBoundingClientRect();
    if (from.width > 0 && to.width > 0) {
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      overlay.style.setProperty("--launch-dot-dx", `${dx}px`);
      overlay.style.setProperty("--launch-dot-dy", `${dy}px`);
      overlay.style.setProperty(
        "--launch-dot-scale",
        `${to.width / from.width}`,
      );
    }
  }

  const wordmarkTarget = document.querySelector<HTMLElement>(
    '[data-launch-target="brand-wordmark"]',
  );
  if (wordmark && wordmarkTarget) {
    const from = wordmark.getBoundingClientRect();
    const to = wordmarkTarget.getBoundingClientRect();
    if (from.width > 0 && to.width > 0) {
      // The group's transform-origin is `50% 0` — top centre — so the two top
      // centres are what have to meet.
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      overlay.style.setProperty("--launch-wm-dx", `${dx}px`);
      overlay.style.setProperty("--launch-wm-dy", `${to.top - from.top}px`);
      overlay.style.setProperty(
        "--launch-wm-scale",
        `${to.width / from.width}`,
      );
    }
  }
}
