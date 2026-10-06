/**
 * WebKit push-engine detection. WebKit (iOS and iPadOS Home Screen web apps,
 * macOS Safari) revokes EVERY push subscription of an origin after 3 "silent"
 * pushes (`maxSilentPushCount = 3` in WebKit's `WebPushDaemonConstants.h`). A
 * silent push is a push event that settles without `showNotification()`.
 * The counter is cumulative and never resets, and WebKit grants no exemption
 * for a focused window. Chromium waives the rule while a same-origin window is
 * focused, so only WebKit pays for focus-aware suppression: each suppressed
 * push burns one of the 3 credits, and the third one deletes the subscription.
 *
 * `sw.ts` uses this predicate to keep suppressing on engines that waive the
 * rule and to show a quiet notification on WebKit instead. It takes the user
 * agent as a plain string so the decision stays a pure, testable function.
 *
 * The user agent heuristics, in the order they matter:
 *
 * - Every iOS and iPadOS browser is WebKit underneath (CriOS, EdgiOS and FxiOS
 *   included), so an `iPhone`, `iPad` or `iPod` token settles it.
 * - An iOS Home Screen web app often omits "Safari" from its user agent, so
 *   the check never looks for that token.
 * - iPadOS desktop mode reports a Mac Safari user agent with no iPad token, so
 *   a bare `AppleWebKit` without a Blink marker also counts as WebKit.
 * - Blink browsers contain `AppleWebKit` too, and carry `Chrome/`, `Chromium/`
 *   or `Edg/`, which excludes them.
 *
 * An empty string returns `false` (an unknown engine keeps the existing
 * suppression behavior).
 */
export function isWebKitPushEngine(userAgent: string): boolean {
  if (!userAgent.includes("AppleWebKit")) return false;
  const isAppleMobileDevice = /iPhone|iPad|iPod/.test(userAgent);
  if (isAppleMobileDevice) return true;
  const isBlinkEngine = /Chrome\/|Chromium\/|Edg\//.test(userAgent);
  return !isBlinkEngine;
}
