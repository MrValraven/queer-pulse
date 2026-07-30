import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import type { SubprofileKind } from "./api/subprofiles.api";
import styles from "./SubprofileShowcase.module.css";

/**
 * The craft filter chips shown above the switch list once it's collapsed to
 * a filterable index (`asIndex`) and more than one kind is present.
 * Extracted from `SubprofileSwitchList` to keep it under the 200-line cap.
 */
export function SubprofileFilterChips({
  kinds,
  filter,
  onSelect,
}: {
  kinds: SubprofileKind[];
  filter: SubprofileKind | "all";
  onSelect: (kind: SubprofileKind | "all") => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.filters}
      role="group"
      aria-label={t("subprofiles:alsoAs.filterLabel")}
    >
      <button
        type="button"
        className={styles.chip}
        aria-pressed={filter === "all"}
        onClick={() => onSelect("all")}
      >
        {t("subprofiles:alsoAs.filterAll")}
      </button>
      {kinds.map((kind) => (
        <button
          key={kind}
          type="button"
          className={styles.chip}
          aria-pressed={filter === kind}
          onClick={() => onSelect(kind)}
        >
          {t(KIND_LABEL_KEYS[kind])}
        </button>
      ))}
    </div>
  );
}
