import { useState } from "react";

/** Fades a lazily loaded cover in once its image arrives. The frame takes
 *  `onLoad` (React hands it the image's load event) and marks itself with
 *  `data-cover-loaded`, which the stylesheet turns into the fade. Keyed by
 *  the source, so a new cover starts hidden again until it loads. */
export function useStudioAdminCoverReveal(src: string | null) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  return {
    isCoverLoaded: src !== null && loadedSrc === src,
    onCoverLoad: () => setLoadedSrc(src),
  };
}
