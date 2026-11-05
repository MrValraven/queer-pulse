import { useLayoutEffect } from "react";

/** The html attribute VjScreen.module.css keys the projector's suppression on. */
export const VJ_SCREEN_DOCUMENT_ATTRIBUTE = "data-vj-screen";

/**
 * Stamps `<html data-vj-screen="true">` while the projector page is mounted,
 * so the toast region and the consent banner stay off the projector, and
 * removes it when the page leaves.
 */
export function useVjScreenDocumentFlag(): void {
  // Layout effect: the flag lands before the first paint, so a toast queued
  // before the page mounted never shows on the projector for a frame.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute(VJ_SCREEN_DOCUMENT_ATTRIBUTE, "true");
    return () => {
      root.removeAttribute(VJ_SCREEN_DOCUMENT_ATTRIBUTE);
    };
  }, []);
}
