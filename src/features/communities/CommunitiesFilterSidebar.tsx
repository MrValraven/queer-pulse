import { useId } from "react";
import {
  FilterOptionRow,
  FilterSection,
  FilterSidebarPanel,
} from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunitiesCategoryFilter } from "./CommunitiesCategoryFilter";
import { CommunitiesTagsFilter } from "./CommunitiesTagsFilter";
import type { CommunitiesFilterSectionKey } from "./communitiesFilterSections";
import type { DiscoverCommunities } from "./useDiscoverCommunities";

/**
 * The `/communities` filters panel: Category, Quick filters and Tags as
 * collapsible sections on one paper surface, closed by the clear-all row. The
 * same panel is the desktop sidebar and, with `isInSheet`, the body of the
 * mobile filters sheet. Every value lives in `useDiscoverCommunities`; this
 * only draws it.
 */
export function CommunitiesFilterSidebar({
  discover,
  isInSheet = false,
  appliedCount,
  onClearAll,
  sectionsOpen,
  onToggleSection,
}: {
  discover: DiscoverCommunities;
  isInSheet?: boolean;
  /** How many sidebar filters are on (the search term and sort excluded). */
  appliedCount: number;
  onClearAll: () => void;
  sectionsOpen: Record<CommunitiesFilterSectionKey, boolean>;
  onToggleSection: (key: CommunitiesFilterSectionKey) => void;
}) {
  const { t } = useTranslation();
  return (
    <FilterSidebarPanel
      isInSheet={isInSheet}
      appliedCount={appliedCount}
      onClearAll={onClearAll}
      ariaLabel={t("communities:discover.filtersSheetLabel")}
    >
      <CommunitiesCategoryFilter
        filter={discover.filter}
        setFilter={discover.setFilter}
        categoryCounts={discover.categoryCounts}
        isOpen={sectionsOpen.category}
        onToggle={() => onToggleSection("category")}
      />
      <CommunitiesQuickFilters
        discover={discover}
        isOpen={sectionsOpen.quick}
        onToggle={() => onToggleSection("quick")}
      />
      <CommunitiesTagsFilter
        selectedTagIds={discover.tagIds}
        onChange={discover.setTagIds}
        tagCounts={discover.tagCounts}
        isCountStale={discover.isShowingStaleResults}
        isOpen={sectionsOpen.tags}
        onToggle={() => onToggleSection("tags")}
      />
    </FilterSidebarPanel>
  );
}

/**
 * The "Quick filters" section: "Open to all" and "Busy this week" as two
 * checkbox rows, each with the live facet count the server takes with its own
 * predicate lifted and the other still applied.
 *
 * A count is `undefined` while the first page is still in flight, and on a
 * server that predates the facet. That draws no number and never disables the
 * row: "not counted" and "nobody is here" are different answers, and only the
 * second one may take a filter away from a member.
 */
function CommunitiesQuickFilters({
  discover,
  isOpen,
  onToggle,
}: {
  discover: DiscoverCommunities;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const rows = [
    {
      key: "open",
      label: t("communities:discover.toggle.openOnly"),
      count: discover.openToAllCount,
      isOn: discover.isOpenOnly,
      onToggle: () => discover.setIsOpenOnly((isOn) => !isOn),
    },
    {
      key: "busy",
      label: t("communities:discover.toggle.busyOnly"),
      count: discover.busyCount,
      isOn: discover.isBusyOnly,
      onToggle: () => discover.setIsBusyOnly((isOn) => !isOn),
    },
  ];
  const activeCount = rows.filter((row) => row.isOn).length;

  return (
    <FilterSection
      title={t("communities:discover.toggle.groupLabel")}
      headingId={headingId}
      open={isOpen}
      onToggle={onToggle}
      activeCount={activeCount}
    >
      {/* The section title names the pair, so a screen reader hears
          "Quick filters" before either checkbox. */}
      <div role="group" aria-labelledby={headingId}>
        {rows.map((row) => (
          <FilterOptionRow
            key={row.key}
            type="checkbox"
            label={row.label}
            isChecked={row.isOn}
            // Nothing left under this filter, so ticking it could only empty
            // the grid. Never while it is on, or it could not be unticked.
            isDisabled={row.count === 0 && !row.isOn}
            count={row.count}
            isCountStale={discover.isShowingStaleResults}
            ariaLabel={
              row.count === undefined
                ? row.label
                : t("communities:discover.toggle.withCount", {
                    label: row.label,
                    count: row.count,
                  })
            }
            onChange={row.onToggle}
          />
        ))}
      </div>
    </FilterSection>
  );
}
