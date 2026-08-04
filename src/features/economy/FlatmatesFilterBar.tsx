import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  LIFESTYLE_TAGS,
  NEIGHBOURHOODS,
  type ListingType,
} from "./flatmates.data";
import styles from "./FlatmatesPage.module.css";

interface FilterBarProps {
  type: ListingType | "all";
  setType: (t: ListingType | "all") => void;
  neighbourhood: string;
  setNeighbourhood: (v: string) => void;
  budget: string;
  setBudget: (v: string) => void;
  movein: string;
  setMovein: (v: string) => void;
  tags: string[];
  toggleTag: (t: string) => void;
}

export function FlatmatesFilterBar({
  type,
  setType,
  neighbourhood,
  setNeighbourhood,
  budget,
  setBudget,
  movein,
  setMovein,
  tags,
  toggleTag,
}: FilterBarProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.filterBar}>
      <div className="wrap">
        <div className={styles.filterRow}>
          <span className={styles.fLabel}>
            {t("economy:flatmates.filter.show")}
          </span>
          {(["all", "seeking", "offering"] as const).map((typeOption) => (
            <button
              key={typeOption}
              type="button"
              className={[styles.typeChip, type === typeOption && styles.typeOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setType(typeOption)}
            >
              {typeOption === "all"
                ? t("economy:flatmates.filter.all")
                : typeOption === "seeking"
                  ? t("economy:flatmates.filter.seeking")
                  : t("economy:flatmates.filter.offering")}
            </button>
          ))}
          <div className={styles.spacer} />
          <select
            className={styles.fSelect}
            aria-label={t("economy:flatmates.filter.anyNeighbourhood")}
            value={neighbourhood}
            onChange={(e) => setNeighbourhood(e.target.value)}
          >
            <option value="all">
              {t("economy:flatmates.filter.anyNeighbourhood")}
            </option>
            {NEIGHBOURHOODS.map((neighbourhoodName) => (
              <option key={neighbourhoodName} value={neighbourhoodName}>
                {neighbourhoodName}
              </option>
            ))}
          </select>
          <select
            className={styles.fSelect}
            aria-label={t("economy:flatmates.filter.anyBudget")}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          >
            <option value="all">
              {t("economy:flatmates.filter.anyBudget")}
            </option>
            <option value="600">
              {t("economy:flatmates.filter.budget.upTo700")}
            </option>
            <option value="700">
              {t("economy:flatmates.filter.budget.700to900")}
            </option>
            <option value="900">
              {t("economy:flatmates.filter.budget.900to1100")}
            </option>
            <option value="1100">
              {t("economy:flatmates.filter.budget.1100plus")}
            </option>
          </select>
          <select
            className={styles.fSelect}
            aria-label={t("economy:flatmates.filter.anyMoveIn")}
            value={movein}
            onChange={(e) => setMovein(e.target.value)}
          >
            <option value="all">
              {t("economy:flatmates.filter.anyMoveIn")}
            </option>
            <option value="now">
              {t("economy:flatmates.filter.moveIn.now")}
            </option>
            <option value="jul">
              {t("economy:flatmates.filter.moveIn.jul")}
            </option>
            <option value="aug">
              {t("economy:flatmates.filter.moveIn.aug")}
            </option>
            <option value="flex">
              {t("economy:flatmates.filter.moveIn.flex")}
            </option>
          </select>
        </div>
        <div className={styles.filterRow}>
          <span className={styles.fLabel}>
            {t("economy:flatmates.filter.lifestyle")}
          </span>
          {LIFESTYLE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={[styles.tagChip, tags.includes(tag) && styles.tagOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
