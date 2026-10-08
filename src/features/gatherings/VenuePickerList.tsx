import { useEffect, useRef } from "react";
import { FiEdit3 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryPlace } from "../marketing/directoryPlaces";
import { categoryLabel } from "../marketing/localCategories";
import { VenuePickerOption } from "./VenuePickerOption";
import { VenuePlaceTile } from "./VenuePlaceTile";
import styles from "./VenuePickerInline.module.css";

/** Scrolls `list` by the least amount that shows all of `row`, and moves
 *  nothing else: `scrollIntoView` would also scroll the dialog body and the
 *  page behind it. `row.offsetTop` is measured from the list, which is
 *  positioned for exactly this. */
function scrollRowIntoList(list: HTMLElement, row: HTMLElement | null) {
  if (!row) return;
  const rowTop = row.offsetTop;
  const rowBottom = rowTop + row.offsetHeight;
  if (rowTop < list.scrollTop) {
    list.scrollTop = rowTop;
  } else if (rowBottom > list.scrollTop + list.clientHeight) {
    list.scrollTop = rowBottom - list.clientHeight;
  }
}

/**
 * The inline venue picker's results: a fixed-height scroll box holding the
 * listbox of directory places and, while the host has typed something, the
 * closing "Use what I typed" row. It keeps its own scrolling: the active row
 * follows the arrow keys, and with an empty search the venue already linked
 * comes into view, so a host opening the editor sees their pick even when it
 * sits far down the directory.
 */
export function VenuePickerList({
  listboxId,
  optionId,
  results,
  typedText,
  activeIndex,
  keyboardMoveCount,
  linkedSlug,
  isTypedSelected,
  onActivate,
  onPointerLeave,
  onSelectPlace,
  onSelectTyped,
}: {
  listboxId: string;
  optionId: (index: number) => string;
  results: DirectoryPlace[];
  typedText: string;
  activeIndex: number;
  /** Goes up on every arrow-key move, the signal to scroll the active row. */
  keyboardMoveCount: number;
  linkedSlug: string | null;
  isTypedSelected: boolean;
  onActivate: (index: number) => void;
  onPointerLeave: () => void;
  onSelectPlace: (place: DirectoryPlace) => void;
  onSelectTyped: () => void;
}) {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement>(null);
  const isQueryEmpty = typedText === "";

  useEffect(() => {
    const list = listRef.current;
    if (!list || keyboardMoveCount === 0 || activeIndex < 0) return;
    scrollRowIntoList(list, document.getElementById(optionId(activeIndex)));
    // Only a keyboard move scrolls: following the pointer would slide rows
    // out from under it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardMoveCount]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !isQueryEmpty) return;
    scrollRowIntoList(
      list,
      list.querySelector<HTMLElement>('[data-selected="true"]'),
    );
  }, [isQueryEmpty, results, linkedSlug]);

  return (
    // Not a Tab stop: the rows are reached from the search field.
    <div
      ref={listRef}
      className={styles.list}
      tabIndex={-1}
      onMouseLeave={onPointerLeave}
    >
      {results.length === 0 && (
        <p className={styles.empty}>
          {typedText
            ? t("gatherings:venuePicker.noDirectoryMatch", { query: typedText })
            : t("gatherings:venuePicker.noResults")}
        </p>
      )}
      <div
        id={listboxId}
        role="listbox"
        aria-label={t("gatherings:venuePicker.searchPlaceholder")}
        className={styles.listbox}
      >
        {results.map((place, index) => (
          <VenuePickerOption
            key={place.slug}
            id={optionId(index)}
            tile={<VenuePlaceTile place={place} />}
            name={place.name}
            meta={[categoryLabel(t, place.cat), place.hood]
              .filter(Boolean)
              .join(" · ")}
            isActive={index === activeIndex}
            isSelected={place.slug === linkedSlug}
            onActivate={() => onActivate(index)}
            onSelect={() => onSelectPlace(place)}
          />
        ))}
        {typedText && (
          <VenuePickerOption
            id={optionId(results.length)}
            tile={<VenuePlaceTile icon={<FiEdit3 />} />}
            name={t("gatherings:venuePicker.useTyped", { query: typedText })}
            isActive={activeIndex === results.length}
            isSelected={isTypedSelected}
            onActivate={() => onActivate(results.length)}
            onSelect={onSelectTyped}
          />
        )}
      </div>
    </div>
  );
}
