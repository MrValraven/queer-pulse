import { FiCheck, FiCheckSquare, FiChevronDown } from "react-icons/fi";
import { Button, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioMenu, type StudioMenuItem } from "./kit/StudioMenu";
import type { StudioRowSelection } from "./kit/useStudioRowSelection";
import type { StudioListSort } from "./useStudioListFilter";
import css from "./StudioTracklistToolbar.module.css";

export interface StudioTracklistSortOption {
  id: StudioListSort;
  labelKey: string;
}

interface StudioTracklistToolbarProps {
  /** The list's name, for the search field's label ("Search in Night Bus"). */
  listName: string;
  query: string;
  onQueryChange: (query: string) => void;
  sort: StudioListSort;
  onSortChange: (sort: StudioListSort) => void;
  sortOptions: StudioTracklistSortOption[];
  selection: StudioRowSelection;
}

/** Above a playlist or Liked songs: search inside the list, its order, and
 *  Select tracks, which turns selection mode on (a long press on a row does
 *  too) and off again. */
export function StudioTracklistToolbar({
  listName,
  query,
  onQueryChange,
  sort,
  onSortChange,
  sortOptions,
  selection,
}: StudioTracklistToolbarProps) {
  const { t } = useTranslation();
  const current =
    sortOptions.find((option) => option.id === sort) ?? sortOptions[0];
  const sortMenuLabel = t("studio:tracklist.sortLabel");
  const items: StudioMenuItem[] = sortOptions.map((option) => ({
    id: option.id,
    label: t(option.labelKey),
    icon:
      option.id === sort ? (
        <FiCheck aria-hidden />
      ) : (
        <span className={css.iconSpacer} aria-hidden="true" />
      ),
    onSelect: () => onSortChange(option.id),
  }));
  return (
    <div className={css.toolbar}>
      <SearchInput
        className={css.search}
        value={query}
        onChange={onQueryChange}
        placeholder={t("studio:tracklist.searchPlaceholder")}
        ariaLabel={t("studio:tracklist.searchAria", { name: listName })}
      />
      <div className={css.controls}>
        <StudioMenu
          trigger={
            <Button
              variant="quiet"
              size="sm"
              className={css.control}
              aria-label={t("studio:tracklist.sortAria", {
                order: current ? t(current.labelKey) : "",
              })}
            >
              <span className={css.label}>
                {current ? t(current.labelKey) : sortMenuLabel}
              </span>
              <FiChevronDown aria-hidden />
            </Button>
          }
          label={sortMenuLabel}
          items={items}
          placement="bottom-end"
        />
        <Button
          variant="quiet"
          size="sm"
          className={css.control}
          aria-pressed={selection.isSelecting}
          onClick={() => {
            if (selection.isSelecting) selection.clear();
            else selection.start();
          }}
        >
          <FiCheckSquare aria-hidden />
          <span className={css.label}>{t("studio:tracklist.selectCta")}</span>
        </Button>
      </div>
    </div>
  );
}
