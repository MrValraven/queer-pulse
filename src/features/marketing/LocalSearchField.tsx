import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./LocalFilterBar.module.css";

/** The search field itself. The text it shows is held by `LocalSearch`,
 *  which keeps it in step with the URL's `query`. */
function LocalSearchInput({
  searchText,
  onSearchTextChange,
}: {
  searchText: string;
  onSearchTextChange: (next: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={s.search}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx={11} cy={11} r={7} />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        aria-label={t("marketing:local.filter.searchPlaceholder")}
        placeholder={t("marketing:local.filter.searchPlaceholder")}
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
        // Escape empties a filled field first. Claiming the key keeps the full
        // screen map open (useMapFullscreen leaves on any Escape left
        // unclaimed), so only an Escape in an empty field closes it.
        onKeyDown={(event) => {
          if (event.key !== "Escape" || searchText === "") return;
          event.preventDefault();
          onSearchTextChange("");
        }}
      />
    </div>
  );
}

/**
 * The directory's search field: above the results on desktop, at the top of
 * the mobile Filters sheet, and on the full screen map's card.
 *
 * The field holds its own text. `query` lives in the URL, and the router
 * commits a URL change inside a transition, so a field bound straight to it
 * was reset to a stale value between fast keystrokes and dropped letters.
 * A change made elsewhere ("Clear filters", a removed chip) still reaches the
 * field: it is adopted during render, React's pattern for state that follows
 * a prop (see `AdminCommunityDetail`).
 */
export function LocalSearch({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const [searchText, setSearchText] = useState(query);
  const [previousQuery, setPreviousQuery] = useState(query);
  if (query !== previousQuery) {
    setPreviousQuery(query);
    setSearchText(query);
  }
  const changeSearchText = (next: string) => {
    setSearchText(next);
    onQueryChange(next);
  };
  return (
    <LocalSearchInput
      searchText={searchText}
      onSearchTextChange={changeSearchText}
    />
  );
}
