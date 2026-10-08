import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlaces } from "../marketing/api/useDirectory";
import type { DirectoryPlace } from "../marketing/directoryPlaces";
import type { VenueSelection } from "./VenuePicker";
import { VenuePickerList } from "./VenuePickerList";
import { VenueSelectedCard } from "./VenueSelectedCard";
import { hasHiddenRunByMatch, venuePickerResults } from "./venuePickerResults";
import styles from "./VenuePickerInline.module.css";

/** Enough rows to browse a neighbourhood's worth of places in the tall list. */
const INLINE_RESULT_LIMIT = 60;
/** Where Modal turns into a bottom sheet. */
const PHONE_QUERY = "(max-width: 719.98px)";

/**
 * `VenuePicker`'s inline layout, for a dialog with room to spare: the chosen
 * venue as a card, a large search field, and a results list that stays on
 * the page at a fixed height, so the dialog keeps its size while the host
 * filters. Typing a name the directory does not have adds a closing row
 * that uses the name as typed, which replaces the dropdown layout's
 * separate free-text mode. The field stays a combobox: arrows walk the rows
 * (the typed-in row included), Enter picks the active one.
 *
 * On a phone the dialog is a bottom sheet that the keyboard squeezes, so a
 * tap into the search scrolls the field to the top of the sheet, with the
 * list straight under it above the keyboard.
 */
export function VenuePickerInline({
  value,
  onChange,
  id,
  labelledBy,
  selectionDetail,
}: {
  value: VenueSelection;
  onChange: (value: VenueSelection) => void;
  id?: string;
  labelledBy?: string;
  selectionDetail?: ReactNode;
}) {
  const { t } = useTranslation();
  const places = useDirectoryPlaces();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-opt-${index}`;
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [keyboardMoveCount, setKeyboardMoveCount] = useState(0);
  // A row the pointer made active lets go when the pointer leaves the list,
  // so it never reads as a second pick beside the selected row.
  const isActiveFromPointerRef = useRef(false);
  // The dialog focuses the field on open; only a later focus is the host's.
  const hasHadFirstFocusRef = useRef(false);
  const searchRowRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => venuePickerResults(places, query, INLINE_RESULT_LIMIT),
    [places, query],
  );
  const typedText = query.trim();
  const shouldPointToRunBy = hasHiddenRunByMatch(places, query);
  const optionCount = results.length + (typedText ? 1 : 0);
  const linkedSlug = value.venueListing?.slug ?? null;
  const linkedPlace = linkedSlug
    ? places.find((place) => place.slug === linkedSlug)
    : undefined;
  const isTypedSelected =
    typedText !== "" && linkedSlug === null && value.text.trim() === typedText;
  const hasActive = activeIndex >= 0 && activeIndex < optionCount;

  const selectPlace = (place: DirectoryPlace) =>
    onChange({
      text: place.name,
      listingId: place.id ?? null,
      venueListing: { slug: place.slug, name: place.name },
    });

  const selectTyped = () =>
    onChange({ text: typedText, listingId: null, venueListing: null });

  const setActive = (index: number, isFromPointer: boolean) => {
    isActiveFromPointerRef.current = isFromPointer;
    setActiveIndex(index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (optionCount === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(
        Math.min(Math.max(activeIndex + step, 0), optionCount - 1),
        false,
      );
      setKeyboardMoveCount((count) => count + 1);
    } else if (event.key === "Enter" && hasActive) {
      event.preventDefault();
      const place = results[activeIndex];
      if (place) selectPlace(place);
      else if (typedText) selectTyped();
    }
  };

  const scrollSearchToTop = () => {
    if (!window.matchMedia(PHONE_QUERY).matches) return;
    searchRowRef.current?.scrollIntoView({ block: "start" });
  };

  return (
    <div
      className={styles.root}
      data-has-detail={selectionDetail ? "true" : undefined}
    >
      <div aria-live="polite">
        {value.text.trim() && (
          <VenueSelectedCard
            value={value}
            place={linkedPlace}
            detail={selectionDetail}
          />
        )}
      </div>
      <div ref={searchRowRef} className={styles.searchRow}>
        <FiSearch aria-hidden className={styles.searchIcon} />
        <input
          id={id}
          aria-labelledby={labelledBy}
          role="combobox"
          aria-expanded
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={hasActive ? optionId(activeIndex) : undefined}
          type="text"
          autoComplete="off"
          className={styles.searchInput}
          placeholder={t("gatherings:venuePicker.searchPlaceholder")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(event.target.value.trim() ? 0 : -1, false);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (hasHadFirstFocusRef.current) scrollSearchToTop();
            hasHadFirstFocusRef.current = true;
          }}
          onClick={scrollSearchToTop}
        />
      </div>
      <p className="visuallyHidden" aria-live="polite">
        {t("gatherings:venuePicker.resultCount", { count: results.length })}
      </p>
      <VenuePickerList
        listboxId={listboxId}
        optionId={optionId}
        results={results}
        typedText={typedText}
        activeIndex={activeIndex}
        keyboardMoveCount={keyboardMoveCount}
        linkedSlug={linkedSlug}
        isTypedSelected={isTypedSelected}
        onActivate={(index) => setActive(index, true)}
        onPointerLeave={() => {
          if (isActiveFromPointerRef.current) setActive(-1, false);
        }}
        onSelectPlace={selectPlace}
        onSelectTyped={selectTyped}
      />
      {shouldPointToRunBy && (
        <p className={styles.hint}>{t("gatherings:venuePicker.runByHint")}</p>
      )}
      {/* Always mounted, so the dialog keeps its height while the host types. */}
      <p
        className={styles.hint}
        data-hidden={typedText ? "true" : undefined}
        aria-hidden={typedText ? true : undefined}
      >
        {t("gatherings:venuePicker.typeAnyHint")}
      </p>
    </div>
  );
}
