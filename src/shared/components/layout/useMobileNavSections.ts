import { isBeingBuiltLink } from "./navMenus";
import {
  MOBILE_NAV_SECTIONS,
  type MobileNavSection,
  type MobileNavTile,
} from "./mobileNav.data";
import { useIsLinkVisible } from "../../../app/authGate";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useStudioAccess } from "../../../features/studio/api/useStudioAccess";

export interface VisibleMobileNavTile extends MobileNavTile {
  /** Cinema and Studio still carry the "being built" marker for most members. */
  isBeingBuilt: boolean;
}

export interface VisibleMobileNavSection extends Omit<
  MobileNavSection,
  "tiles"
> {
  tiles: VisibleMobileNavTile[];
}

/**
 * The "More" sheet's sections after the old drawer's visibility pipeline:
 * `useIsLinkVisible` drops gated tiles, a section with no tile left is dropped,
 * and each survivor is tagged with the "being built" marker. Every sheet
 * layout renders from this, so they all show the same destinations.
 */
export function useMobileNavSections(): VisibleMobileNavSection[] {
  const isLinkVisible = useIsLinkVisible();
  const { demoMode } = useDemoMode();
  const { hasAccess: hasStudioAccess } = useStudioAccess();
  return MOBILE_NAV_SECTIONS.map((section) => ({
    ...section,
    tiles: section.tiles
      .filter((tile) => isLinkVisible(tile.href))
      .map((tile) => ({
        ...tile,
        isBeingBuilt: isBeingBuiltLink(tile.href, demoMode, hasStudioAccess),
      })),
  })).filter((section) => section.tiles.length > 0);
}

/** Props every "More" sheet layout takes. */
export interface MoreSheetLayoutProps {
  sections: VisibleMobileNavSection[];
  /** Closes the sheet; each tile's link calls it on click. */
  onNavigate: () => void;
}
