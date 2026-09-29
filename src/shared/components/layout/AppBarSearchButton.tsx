import { FiSearch } from "react-icons/fi";
import { OPEN_SEARCH_EVENT } from "../../../features/members/commandPaletteEvents";
import { useTranslation } from "../../i18n/useTranslation";
import navStyles from "./Navbar.module.css";

/**
 * The mobile app bar's search trigger, for signed-in members. It opens the
 * same global command palette the desktop navbar's search button opens, so a
 * phone reaches search in one tap from the top bar. Navbar mounts it inside
 * the app-bar branch only, which keeps one search trigger per breakpoint.
 * Navbar's `.bell` gives it the look, the 44px tap target and (through the
 * global :focus-visible rule) the same focus ring as its neighbours.
 */
export function AppBarSearchButton() {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={navStyles.bell}
      aria-label={t("nav:searchShort")}
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
    >
      <FiSearch size={19} aria-hidden />
    </button>
  );
}
