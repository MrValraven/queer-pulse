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
            Visual Art
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
            Music
          </button>
        </div>
        <div className={styles.filters}>
          {availableFilters.map((flt) => {
            const isActive =
              flt === "All" ? filters.length === 0 : filters.includes(flt);
            return (
              <button
                key={flt}
                type="button"
                className={[styles.chip, isActive && styles.chipActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggleFilter(flt)}
              >
                {flt}
              </button>
            );
          })}
        </div>
        <div className={styles.count}>
          <b>{count}</b>{" "}
          {mode === "art"
            ? `work${count !== 1 ? "s" : ""}`
            : `artist${count !== 1 ? "s" : ""}`}
        </div>
      </div>
    </div>
  );
}
