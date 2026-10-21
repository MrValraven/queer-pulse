import { useState } from "react";
import type { StudioContentWarningId } from "./api/studioSafety.types";
import type { StudioOwnerTrackSafety } from "./api/useStudioOwnerTrackSafety";

/** The explicit flag and content warnings an editor is drafting. Each stays
 *  untouched (null) until the artist changes it, so the stored values stand
 *  and only touched warnings go on the save. Our team's explicit mark holds
 *  (spec 7): the box stays checked. */
export function useTrackSafetyDraft(
  safety: StudioOwnerTrackSafety,
  storedIsExplicit: boolean,
) {
  const [isExplicit, setIsExplicit] = useState<boolean | null>(null);
  const [contentWarnings, setContentWarnings] = useState<
    StudioContentWarningId[] | null
  >(null);
  return {
    explicitValue: safety.isExplicitLocked || (isExplicit ?? storedIsExplicit),
    warningsValue: contentWarnings ?? safety.artistContentWarnings,
    setIsExplicit,
    setContentWarnings,
    warningsPatch: contentWarnings !== null ? { contentWarnings } : {},
    /** The artist changed the explicit flag or the warnings. */
    isDirty: isExplicit !== null || contentWarnings !== null,
  };
}
