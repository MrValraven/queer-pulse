import { useMemo, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminToggle } from "../ui";
import type {
  AdminRoadmapItemDTO,
  RoadmapTeamMemberDTO,
} from "../api/roadmapAdmin.types";
import { getUniqueCategories, SORT_OPTIONS } from "./roadmapChrome.data";
import { useRoadmapFilters, type RoadmapSort } from "./state/useRoadmapFilters";
import { useRoadmapShortcuts } from "./state/useRoadmapShortcuts";
import styles from "./RoadmapChrome.module.css";

/**
 * Search + category/owner/sort filters + the compact-density toggle, shown
 * above the Board and Timeline views only (`roadmapChrome.data.ts`'
 * `showsToolbar`). Reads/writes `useRoadmapFilters()` directly — Board and
 * Timeline read the same filters back out via `matchItem`/`sortItems`, so
 * this component owns no filtering logic of its own.
 */
export function RoadmapToolbar({
  items,
  team,
}: {
  items: AdminRoadmapItemDTO[];
  team: RoadmapTeamMemberDTO[];
}) {
  const { t } = useTranslation();
  const { filters, setFilter } = useRoadmapFilters();
  const categories = useMemo(() => getUniqueCategories(items), [items]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // The `/` shortcut focuses this toolbar's search field from anywhere in
  // the view — the page mounts `useRoadmapShortcuts` too (for `n`/`j`/`k`/
  // `e`/`?`), but only the toolbar itself knows where its own input lives.
  useRoadmapShortcuts({
    onFilter: () => searchInputRef.current?.focus(),
  });

  return (
    <div className={styles.toolbar}>
      <label className={styles.searchField}>
        <FiSearch aria-hidden />
        <input
          ref={searchInputRef}
          type="search"
          value={filters.q}
          onChange={(event) => setFilter("q", event.target.value)}
          placeholder={t("admin:roadmap.toolbar.searchPlaceholder")}
          aria-label={t("admin:roadmap.toolbar.searchAriaLabel")}
        />
      </label>

      <select
        className={styles.select}
        value={filters.category}
        onChange={(event) => setFilter("category", event.target.value)}
        aria-label={t("admin:roadmap.toolbar.categoryAll")}
      >
        <option value="">{t("admin:roadmap.toolbar.categoryAll")}</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.owner}
        onChange={(event) => setFilter("owner", event.target.value)}
        aria-label={t("admin:roadmap.toolbar.ownerAll")}
      >
        <option value="">{t("admin:roadmap.toolbar.ownerAll")}</option>
        <option value="unassigned">
          {t("admin:roadmap.toolbar.ownerUnassigned")}
        </option>
        {team.map((member) => (
          <option key={member.userId} value={member.userId}>
            {member.name}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={filters.sort}
        onChange={(event) =>
          setFilter("sort", event.target.value as RoadmapSort)
        }
        aria-label={t("admin:roadmap.toolbar.sortManual")}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>

      <span className={styles.denseToggleGroup}>
        <AdminToggle
          checked={filters.dense}
          onChange={(checked) => setFilter("dense", checked)}
          label={t("admin:roadmap.toolbar.denseToggle")}
        />
        {t("admin:roadmap.toolbar.denseToggle")}
      </span>

      <span className={styles.dragHint}>
        {t("admin:roadmap.toolbar.dragHint")}
      </span>
    </div>
  );
}
