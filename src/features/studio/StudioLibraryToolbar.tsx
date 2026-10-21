import { FiCheck, FiChevronDown } from "react-icons/fi";
import { Button, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioMenu, type StudioMenuItem } from "./kit/StudioMenu";
import type {
  StudioLibrarySort,
  StudioLibrarySortOption,
} from "./studioLibrarySort.data";
import css from "./StudioLibrary.module.css";

/** The sort menu shared by Library and the rail: the trigger names the order
 *  in use, and the checked item repeats it. */
export function StudioLibrarySortMenu({
  sort,
  options,
  onSortChange,
  className,
}: {
  sort: StudioLibrarySort;
  options: readonly StudioLibrarySortOption[];
  onSortChange: (sort: StudioLibrarySort) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const current = options.find((option) => option.id === sort) ?? options[0];
  const currentLabel = current ? t(current.labelKey) : "";
  const items: StudioMenuItem[] = options.map((option) => ({
    id: option.id,
    label: t(option.labelKey),
    // The empty slot keeps every label on one start edge.
    icon: option.id === current?.id ? <FiCheck /> : <span />,
    onSelect: () => onSortChange(option.id),
  }));
  return (
    <StudioMenu
      trigger={
        <Button
          type="button"
          variant="quiet"
          size="sm"
          className={[css.sortTrigger, className].filter(Boolean).join(" ")}
          aria-label={t("studio:libraryLive.sort.triggerAria", {
            sort: currentLabel,
          })}
        >
          {currentLabel}
          <FiChevronDown aria-hidden />
        </Button>
      }
      label={t("studio:libraryLive.sort.menuLabel")}
      items={items}
      placement="bottom-end"
    />
  );
}

/** Library's filter box and sort, above the tab's cards. The filter matches
 *  titles and creators as the member types, accents and case ignored. */
export function StudioLibraryToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  options,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  sort: StudioLibrarySort;
  onSortChange: (sort: StudioLibrarySort) => void;
  options: readonly StudioLibrarySortOption[];
}) {
  const { t } = useTranslation();
  const filterLabel = t("studio:libraryLive.filterLabel");
  return (
    <div className={css.toolbar}>
      <SearchInput
        value={query}
        onChange={onQueryChange}
        ariaLabel={filterLabel}
        placeholder={t("studio:libraryLive.filterPlaceholder")}
        className={css.filter}
      />
      <StudioLibrarySortMenu
        sort={sort}
        options={options}
        onSortChange={onSortChange}
      />
    </div>
  );
}
