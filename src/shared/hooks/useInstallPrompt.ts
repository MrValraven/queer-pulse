import { useSyncExternalStore } from "react";

/**
 * Chrome's non-standard install event. Not in lib.dom, so it is declared here
 * rather than reaching for `any`.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface InstallPromptApi {
  /** True once the browser has offered an install and it hasn't been used. */
  canInstall: boolean;
  /** Shows the browser's install dialog. Resolves true if the user accepted. */
  promptInstall: () => Promise<boolean>;
}

export type InstallPlatform = "ios" | "android" | "desktop";

/**
 * Which install instructions to show. Only used to pick copy, never to gate
 * behaviour, since UA sniffing is unreliable and being wrong here should cost
 * the user a wrong screenshot rather than a broken button.
 */
export function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "desktop";
  const userAgent = navigator.userAgent;
  // iPadOS 13+ reports as a Mac, distinguished by touch support.
  const isIpad = /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(userAgent) || isIpad) return "ios";
  if (/Android/.test(userAgent)) return "android";
  return "desktop";
}

/*
 * The captured event lives at module scope, not in per-hook state.
 *
 * `beforeinstallprompt` is one-shot and fires within the first moments of the
 * page load. Held in `useState`, only the components already mounted at that
 * instant would ever see it: `InstallNudge` mounts at app boot and captured it,
 * while `PwaPromptPage` (the page the nudge's own CTA links to) and
 * `InstallAppModal` mount later, read `canInstall === false` forever, and
 * dropped to manual instructions on browsers that support one-tap install.
 *
 * A module-level store fixes both halves of that: the listener is registered at
 * import time so the event is captured before any component mounts, and every
 * consumer subscribes to the same value, so the offer appears and disappears
 * everywhere at once.
 */
let deferredInstallEvent: BeforeInstallPromptEvent | null = null;
/** Guards against two consumers calling `prompt()` on the same single-use event. */
let isInstallPromptInFlight = false;
const installPromptSubscribers = new Set<() => void>();

function notifyInstallPromptSubscribers(): void {
  for (const notifySubscriber of installPromptSubscribers) notifySubscriber();
}

function handleBeforeInstallPrompt(event: Event): void {
  // Suppress the browser's own mini-infobar so the app controls the moment.
  event.preventDefault();
  deferredInstallEvent = event as BeforeInstallPromptEvent;
  notifyInstallPromptSubscribers();
}

function handleAppInstalled(): void {
  // Nothing should keep offering to install an app that is already installed.
  deferredInstallEvent = null;
  notifyInstallPromptSubscribers();
}

// Registered at import time rather than in an effect: the event can fire before
// React has mounted anything, and there is no later moment to catch it.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
}

function subscribe(onStoreChange: () => void): () => void {
  installPromptSubscribers.add(onStoreChange);
  return () => {
    installPromptSubscribers.delete(onStoreChange);
  };
}

function getSnapshot(): boolean {
  return deferredInstallEvent !== null;
}

// Server / prerender: no browser event has fired, so nothing is installable and
// the manual instructions are the correct thing to render into the static HTML.
function getServerSnapshot(): boolean {
  return false;
}

async function promptInstall(): Promise<boolean> {
  const capturedEvent = deferredInstallEvent;
  if (!capturedEvent || isInstallPromptInFlight) return false;
  isInstallPromptInFlight = true;
  try {
    await capturedEvent.prompt();
    const { outcome } = await capturedEvent.userChoice;
    return outcome === "accepted";
  } finally {
    isInstallPromptInFlight = false;
    // The event is single-use; Chrome fires a fresh one if still eligible. Only
    // clear the event this call consumed, so a newer one is never discarded.
    if (deferredInstallEvent === capturedEvent) {
      deferredInstallEvent = null;
      notifyInstallPromptSubscribers();
    }
  }
}

/**
 * Reads the app-wide install offer captured from Chrome's `beforeinstallprompt`
 * so the app can offer installation from its own UI instead of relying on the
 * browser's address-bar affordance.
 *
 * Every caller shares one store (see the note above it), so a consumer that
 * mounts long after the event fired still sees `canInstall === true`.
 *
 * iOS fires no such event, since Safari's "Add to Home Screen" is manual, so
 * `canInstall` stays false there and callers must fall back to instructions.
 */
export function useInstallPrompt(): InstallPromptApi {
  const canInstall = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { canInstall, promptInstall };
}
