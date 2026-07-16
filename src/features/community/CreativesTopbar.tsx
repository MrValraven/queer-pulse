import { useTranslation } from "../../shared/i18n/useTranslation";
import { ART_FILTERS, MUSIC_FILTERS } from "./creatives.data";
import styles from "./CreativesPage.module.css";

export function CreativesTopbar({
  mode,
  filters,
  count,
  onSwitchMode,
  onToggleFilter,
}: {
  mode: "art" | "music";
  filters: string[];
  count: number;
  onSwitchMode: (m: "art" | "music") => void;
  onToggleFilter: (name: string) => void;
}) {
  const { t } = useTranslation();
  const availableFilters = mode === "art" ? ART_FILTERS : MUSIC_FILTERS;

  return (
    <div className={styles.topbar}>
      <div className={styles.topbarInner}>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={[styles.modeBtn, mode === "art" && styles.modeBtnActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSwitchMode("art")}
          >
            {t("community:creatives.mode.art")}
          </button>
          <button
            type="button"
            className={[
              styles.modeBtn,
              mode === "music" && styles.modeBtnActive,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSwitchMode("music")}
          >
            {t("community:creatives.mode.music")}
          </button>
        </div>
        <div className={styles.filters}>
          {availableFilters.map((filterOption) => {
            const isActive =
              filterOption.id === "All"
                ? filters.length === 0
                : filters.includes(filterOption.id);
            return (
              <button
                key={filterOption.id}
                type="button"
                className={[styles.chip, isActive && styles.chipActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggleFilter(filterOption.id)}
              >
                {t(filterOption.labelKey)}
              </button>
            );
          })}
        </div>
        <div className={styles.count}>
          <b>{count}</b>{" "}
          {mode === "art"
            ? t("community:creatives.count.works", { count })
            : t("community:creatives.count.artists", { count })}
        </div>
      </div>
    </div>
  );
}
