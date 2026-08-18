import { FiSearch } from "react-icons/fi";
import { Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityType } from "../../communities/api/communities.api";
import type {
  LiveCommunityFilterState,
  LiveSortKey,
} from "./useLiveCommunityFilters";
import styles from "./Communities.module.css";

const CATS: Array<{ key: CommunityType | "all"; labelKey: string }> = [
  { key: "all", labelKey: "homepage:communities.category.all" },
  { key: "social", labelKey: "homepage:communities.category.social" },
  { key: "arts", labelKey: "homepage:communities.category.arts" },
  { key: "support", labelKey: "homepage:communities.category.support" },
  { key: "activism", labelKey: "homepage:communities.category.activism" },
  { key: "sports", labelKey: "homepage:communities.category.sports" },
  {
    key: "professional",
    labelKey: "homepage:communities.category.professional",
  },
];

interface LiveToolbarProps {
  state: LiveCommunityFilterState;
  patch: (next: Partial<LiveCommunityFilterState>) => void;
}

/**
 * Live analog of `CommunitiesToolbar`: search, category pills, "Open to
 * join" toggle, sort. No language/area selects (dropped — reflects real
 * community data, see `useLiveCommunityFilters`). Category pills skip the
 * demo's colour dot: only 4 of the 6 real community types have a colour
 * token, and the live card badge already treats all types the same way
 * (see `FeaturedCommunityCard.module.css`).
 */
export function LiveCommunitiesToolbar({ state, patch }: LiveToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.tools}>
      <div className={styles.toolSearch}>
        <FiSearch aria-hidden />
        <input
          type="search"
          value={state.q}
          onChange={(e) => patch({ q: e.target.value })}
          placeholder={t("homepage:communities.toolbar.searchPlaceholder")}
          aria-label={t("homepage:communities.toolbar.searchAriaLabel")}
        />
      </div>

      <div className={styles.toolChips}>
        {CATS.map((c) => (
          <button
            key={c.key}
            type="button"
            className={[styles.fchip, state.cat === c.key && styles.fchipOn]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={state.cat === c.key}
            onClick={() => patch({ cat: c.key })}
          >
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={[styles.toolToggle, state.open && styles.toolToggleOn]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={state.open}
        onClick={() => patch({ open: !state.open })}
      >
        <span className={styles.tg} aria-hidden />
        {t("homepage:communities.access.open")}
      </button>

      <span className={styles.toolSpacer} />

      <span className={styles.toolSort}>
        {t("homepage:communities.toolbar.sortLabel")}
        <Select
          size="sm"
          label={t("homepage:communities.toolbar.sortAriaLabel")}
          value={state.sort}
          onChange={(value) => patch({ sort: (value ?? "size") as LiveSortKey })}
          options={[
            {
              value: "size",
              label: t("homepage:communities.toolbar.sort.size"),
            },
            {
              value: "new",
              label: t("homepage:communities.toolbar.sort.new"),
            },
          ]}
        />
      </span>
    </div>
  );
}
