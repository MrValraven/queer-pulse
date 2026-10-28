import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StudioArtistView } from "./api/studio.adapters";
import type { StudioVisitorPreview } from "./studioVisitorPreview";

/**
 * The owner's "View as visitor" on their artist page. Page-local and kept out
 * of the URL: it is a way of looking at the page, and a shared link should
 * always open the page as its reader is.
 *
 * The preview belongs to the address it started on (`addressKey`, the URL's
 * artist id), so following a link to another artist ends it. While it runs,
 * `viewArtist` is the artist as a visitor receives it: no ownership and no
 * owner releases, so every child draws the visitor's page. Leaving it hands
 * focus back to the View as visitor control.
 */
export function useStudioArtistVisitorPreview({
  addressKey,
  artist,
  onEnter,
}: {
  addressKey: string;
  artist: StudioArtistView | null;
  /** Runs as the preview starts, for the page to close its owner sheets. */
  onEnter: () => void;
}) {
  const [previewAddressKey, setPreviewAddressKey] = useState<string | null>(
    null,
  );
  const visitorControlRef = useRef<HTMLButtonElement | null>(null);
  // Set by an exit, so focus returns only after the owner chose to leave.
  const isFocusReturnPendingRef = useRef(false);
  const isOwner = artist?.isOwner === true;
  const isVisitorPreview = isOwner && previewAddressKey === addressKey;

  const enterVisitorPreview = useCallback(() => {
    onEnter();
    setPreviewAddressKey(addressKey);
    // A visitor arrives at the top of the page, so the preview starts there.
    window.scrollTo({ top: 0 });
  }, [addressKey, onEnter]);

  const exitVisitorPreview = useCallback(() => {
    isFocusReturnPendingRef.current = true;
    setPreviewAddressKey(null);
  }, []);

  // The control comes back with the owner view, so it is focused once that
  // render has landed.
  useEffect(() => {
    if (isVisitorPreview || !isFocusReturnPendingRef.current) return;
    isFocusReturnPendingRef.current = false;
    visitorControlRef.current?.focus();
  }, [isVisitorPreview]);

  const viewArtist = useMemo(
    () =>
      artist && isVisitorPreview
        ? { ...artist, isOwner: false, ownerReleases: null }
        : artist,
    [artist, isVisitorPreview],
  );

  const preview = useMemo<StudioVisitorPreview>(
    () => ({
      isVisitorPreview,
      enterVisitorPreview: isOwner ? enterVisitorPreview : null,
      visitorControlRef,
    }),
    [isVisitorPreview, isOwner, enterVisitorPreview],
  );

  return { preview, viewArtist, exitVisitorPreview };
}
