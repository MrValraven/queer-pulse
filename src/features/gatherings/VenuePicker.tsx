import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { FiMapPin } from "react-icons/fi";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryPlaces } from "../marketing/api/useDirectory";
import type { DirectoryPlace } from "../marketing/directoryPlaces";
import { VenuePickerSearch } from "./VenuePickerSearch";
import styles from "./VenuePicker.module.css";

/** A gathering's venue: either free text, or a structured link to a real
 *  directory listing (name mirrors the listing's own, so display never
 *  diverges from what the link points at). */
export interface VenueSelection {
  text: string;
  listingId: string | null;
  venueListing: { slug: string; name: string } | null;
}

const MAX_RESULTS = 8;

function matchesQuery(place: DirectoryPlace, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    place.name.toLowerCase().includes(q) ||
    place.hood.toLowerCase().includes(q) ||
    place.cat.toLowerCase().includes(q)
  );
}

/**
 * Pick a gathering's venue from the local business directory, or type one in
 * by hand. Three states: a linked-listing chip (with a "Change" escape
 * hatch), a search combobox over `useDirectoryPlaces()`, and a plain
 * free-text field — toggled via "Can't find it? Type it in instead" /
 * "Search the directory instead". Used by both the manage dashboard's Edit
 * venue modal and the create-gathering wizard's DatePlaceStep.
 */
export function VenuePicker({
  value,
  onChange,
  id,
  labelledBy,
}: {
  value: VenueSelection;
  onChange: (value: VenueSelection) => void;
  id?: string;
  labelledBy?: string;
}) {
  const { t } = useTranslation();
  const places = useDirectoryPlaces();
  const baseId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"search" | "freetext">(
    value.venueListing || !value.text ? "search" : "freetext",
  );
  const [query, setQuery] = useState(value.venueListing ? "" : value.text);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(
    () =>
      places
        .filter((place) => matchesQuery(place, query))
        .slice(0, MAX_RESULTS),
    [places, query],
  );

  useOutsideDismiss(open, containerRef, () => setOpen(false));

  const selectPlace = (place: DirectoryPlace) => {
    onChange({
      text: place.name,
      listingId: place.id ?? null,
      venueListing: { slug: place.slug, name: place.name },
    });
    setOpen(false);
  };

  const switchToFreeText = () => {
    setMode("freetext");
    setOpen(false);
    onChange({
      text: query || value.text,
      listingId: null,
      venueListing: null,
    });
  };

  const switchToSearch = () => {
    setMode("search");
    setQuery("");
    setActiveIndex(0);
  };

  const startChange = () => {
    setMode("search");
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter") setOpen(true);
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter": {
        event.preventDefault();
        const target = results[activeIndex];
        if (target) selectPlace(target);
        break;
      }
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  };

  if (value.venueListing) {
    return (
      <div className={styles.linked}>
        <FiMapPin aria-hidden className={styles.linkedIcon} />
        <div className={styles.linkedBody}>
          <div className={styles.linkedName}>{value.venueListing.name}</div>
          <div className={styles.linkedMeta}>
            {t("gatherings:venuePicker.fromDirectory")}
          </div>
        </div>
        <button
          type="button"
          className={styles.changeBtn}
          onClick={startChange}
        >
          {t("gatherings:venuePicker.change")}
        </button>
      </div>
    );
  }

  if (mode === "freetext") {
    return (
      <div>
        <input
          id={id}
          aria-labelledby={labelledBy}
          type="text"
          className={styles.freeInput}
          placeholder={t("gatherings:venuePicker.freeTextPlaceholder")}
          value={value.text}
          onChange={(event) =>
            onChange({
              text: event.target.value,
              listingId: null,
              venueListing: null,
            })
          }
        />
        <button
          type="button"
          className={styles.toggleLink}
          onClick={switchToSearch}
        >
          {t("gatherings:venuePicker.searchInstead")}
        </button>
      </div>
    );
  }

  return (
    <VenuePickerSearch
      id={id}
      labelledBy={labelledBy}
      baseId={baseId}
      containerRef={containerRef}
      query={query}
      setQuery={setQuery}
      open={open}
      setOpen={setOpen}
      activeIndex={activeIndex}
      setActiveIndex={setActiveIndex}
      results={results}
      onKeyDown={onKeyDown}
      onSelectPlace={selectPlace}
      onSwitchToFreeText={switchToFreeText}
    />
  );
}
