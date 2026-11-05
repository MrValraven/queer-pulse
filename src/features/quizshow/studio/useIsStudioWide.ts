import { useMediaQuery } from "../../../shared/hooks";

/**
 * From this width the host types on the slide; below it (phones, and a
 * desktop at 200% zoom) editing happens in the inspector and the slide is a
 * read-only preview.
 */
export const STUDIO_WIDE_QUERY = "(min-width: 1024px)";

export function useIsStudioWide(): boolean {
  return useMediaQuery(STUDIO_WIDE_QUERY);
}

/**
 * From this width the top bar has room for a published template's Unpublish
 * button and the Draft pill beside the full save status; below it Unpublish
 * lives in More and the Draft pill steps aside.
 */
export const STUDIO_ROOMY_BAR_QUERY = "(min-width: 1366px)";

export function useIsStudioBarRoomy(): boolean {
  return useMediaQuery(STUDIO_ROOMY_BAR_QUERY);
}
