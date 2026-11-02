import { useMobileNavSections } from "./useMobileNavSections";
import { MoreSheetRows } from "./MoreSheetRows";

interface MegaNavDrawerProps {
  onNavigate: () => void;
}

/**
 * The phone "More" sheet's page list. Reads the curated MOBILE_NAV_SECTIONS
 * (not NAV_MENUS, which keeps feeding the desktop nav) through
 * `useMobileNavSections`, which applies the visibility pipeline and the
 * "being built" marker, and lays them out as grouped rows.
 */
export function MegaNavDrawer({ onNavigate }: MegaNavDrawerProps) {
  const sections = useMobileNavSections();
  return <MoreSheetRows sections={sections} onNavigate={onNavigate} />;
}
