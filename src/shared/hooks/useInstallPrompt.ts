import { useCallback, useEffect, useState } from "react";

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
 * Which install instructions to show. Only used to pick copy — never to gate
 * behaviour, since UA sniffing is unreliable and being wrong here should cost
 * the user a wrong screenshot, not a broken button.
 */
export function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "desktop";
  const userAgent = navigator.userAgent;
  // iPadOS 13+ reports as a Mac, distinguished by touch support.
  const isIpad =
    /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(userAgent) || isIpad) return "ios";
  if (/Android/.test(userAgent)) return "android";
  return "desktop";
}

/**
 * Captures Chrome's `beforeinstallprompt` so the app can offer installation
 * from its own UI instead of relying on the browser's address-bar affordance.
 *
 * iOS fires no such event — Safari's "Add to Home Screen" is manual — so
 * `canInstall` stays false there and callers must fall back to instructions.
 */
export function useInstallPrompt(): InstallPromptApi {
  const [deferredEvent, setDeferredEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // Suppress the browser's own mini-infobar so the app controls the moment.
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredEvent(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return false;
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    // The event is single-use; Chrome fires a fresh one if still eligible.
    setDeferredEvent(null);
    return outcome === "accepted";
  }, [deferredEvent]);

  return { canInstall: deferredEvent !== null, promptInstall };
}
