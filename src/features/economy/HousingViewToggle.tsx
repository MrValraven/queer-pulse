import { FiList, FiMap } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HousingView } from "./useHousingFilterParams";
import styles from "./HousingPage.module.css";

/** Segmented control that swaps the housing board between the listing grid and
 * the map. Rendered by the board rather than inside the filter bar so its
 * styling stays with the rest of the board's chrome; the bar only decides where
 * on its control row it sits. */
export function HousingViewToggle({
  view,
  onSelectView,
}: {
  view: HousingView;
  onSelectView: (next: HousingView) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.viewToggle}
      role="group"
      aria-label={`${t("economy:housing.map.viewList")} / ${t("economy:housing.map.viewMap")}`}
    >
      <button
        type="button"
        className={[
          styles.viewToggleBtn,
          view === "list" && styles.viewToggleBtnOn,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={view === "list"}
        onClick={() => onSelectView("list")}
      >
        <FiList aria-hidden /> {t("economy:housing.map.viewList")}
      </button>
      <button
        type="button"
        className={[
          styles.viewToggleBtn,
          view === "map" && styles.viewToggleBtnOn,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={view === "map"}
        onClick={() => onSelectView("map")}
      >
        <FiMap aria-hidden /> {t("economy:housing.map.viewMap")}
      </button>
    </div>
  );
}
