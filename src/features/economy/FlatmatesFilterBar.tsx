import { Select } from "../../shared/components/ui";
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
          <Select
            size="sm"
            label={t("economy:flatmates.filter.anyNeighbourhood")}
            value={neighbourhood}
            onChange={(value) => setNeighbourhood(value ?? "all")}
            options={[
              {
                value: "all",
                label: t("economy:flatmates.filter.anyNeighbourhood"),
              },
              ...NEIGHBOURHOODS.map((neighbourhoodName) => ({
                value: neighbourhoodName,
                label: neighbourhoodName,
              })),
            ]}
          />
          <Select
            size="sm"
            label={t("economy:flatmates.filter.anyBudget")}
            value={budget}
            onChange={(value) => setBudget(value ?? "all")}
            options={[
              { value: "all", label: t("economy:flatmates.filter.anyBudget") },
              {
                value: "600",
                label: t("economy:flatmates.filter.budget.upTo700"),
              },
              {
                value: "700",
                label: t("economy:flatmates.filter.budget.700to900"),
              },
              {
                value: "900",
                label: t("economy:flatmates.filter.budget.900to1100"),
              },
              {
                value: "1100",
                label: t("economy:flatmates.filter.budget.1100plus"),
              },
            ]}
          />
          <Select
            size="sm"
            label={t("economy:flatmates.filter.anyMoveIn")}
            value={movein}
            onChange={(value) => setMovein(value ?? "all")}
            options={[
              { value: "all", label: t("economy:flatmates.filter.anyMoveIn") },
              { value: "now", label: t("economy:flatmates.filter.moveIn.now") },
              { value: "jul", label: t("economy:flatmates.filter.moveIn.jul") },
              { value: "aug", label: t("economy:flatmates.filter.moveIn.aug") },
              {
                value: "flex",
                label: t("economy:flatmates.filter.moveIn.flex"),
              },
            ]}
          />
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
