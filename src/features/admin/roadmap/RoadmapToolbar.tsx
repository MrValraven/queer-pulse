import { useMemo, useRef } from "react";
import { SearchInput, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminToggle, AdminToolbar, adminToolbarClasses } from "../ui";
import type {
  AdminRoadmapItemDTO,
  RoadmapTeamMemberDTO,
} from "../api/roadmapAdmin.types";
import { getUniqueCategories, SORT_OPTIONS } from "./roadmapChrome.data";
import { useRoadmapFilters } from "./state/roadmapFiltersHook";
import type { RoadmapSort } from "./state/roadmapFiltersTypes";
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
    <AdminToolbar
      className={styles.toolbar}
      label={t("admin:roadmap.toolbar.ariaLabel")}
      end={
        <>
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
        </>
      }
    >
      <SearchInput
        className={adminToolbarClasses.search}
        inputRef={searchInputRef}
        value={filters.q}
        onChange={(value) => setFilter("q", value)}
        placeholder={t("admin:roadmap.toolbar.searchPlaceholder")}
        ariaLabel={t("admin:roadmap.toolbar.searchAriaLabel")}
      />

      <Select
        size="sm"
        className={adminToolbarClasses.select}
        label={t("admin:roadmap.toolbar.categoryAll")}
        value={filters.category}
        options={[
          { value: "", label: t("admin:roadmap.toolbar.categoryAll") },
          ...categories.map((category) => ({
            value: category,
            label: category,
          })),
        ]}
        onChange={(value) => setFilter("category", value ?? "")}
      />

      <Select
        size="sm"
        className={adminToolbarClasses.select}
        label={t("admin:roadmap.toolbar.ownerAll")}
        value={filters.owner}
        options={[
          { value: "", label: t("admin:roadmap.toolbar.ownerAll") },
          {
            value: "unassigned",
            label: t("admin:roadmap.toolbar.ownerUnassigned"),
          },
          ...team.map((member) => ({
            value: member.userId,
            label: member.name,
          })),
        ]}
        onChange={(value) => setFilter("owner", value ?? "")}
      />

      <Select
        size="sm"
        className={adminToolbarClasses.select}
        label={t("admin:roadmap.toolbar.sortManual")}
        value={filters.sort}
        options={SORT_OPTIONS.map((option) => ({
          value: option.value,
          label: t(option.labelKey),
        }))}
        onChange={(value) =>
          setFilter("sort", (value ?? filters.sort) as RoadmapSort)
        }
      />
    </AdminToolbar>
  );
}
