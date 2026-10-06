import { useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { SearchInput } from "./SearchInput";
import { MemberSelectRow } from "./MemberSelectRow";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./MemberSelectList.module.css";

export interface MemberSelectPerson {
  slug: string;
  name: string;
  avatarUrl?: string;
  pronouns?: string;
  staffRole?: string;
  /** Which of the person's staff roles wear a badge; `MemberIdentity` reads it. */
  staffBadgedRoles?: readonly string[];
}

export interface MemberSelectListProps {
  people: MemberSelectPerson[];
  /** Slugs currently selected. */
  selected: Set<string>;
  onToggle: (slug: string) => void;
  /** Multi-select shows a checkbox and honours `cap`. Default true. */
  multiSelect?: boolean;
  /**
   * Single-select only: draw a radio-style selected indicator, plus the
   * questionnaire's accent border and tint, on the chosen row. Opt-in and
   * unset by default, because most single-select lists act on tap (add a
   * cohost, pick a nominee) and never hold a selection, so a permanent, ever
   * empty ring beside every row would misread as "choose, then confirm".
   * Pass `"radio"` only from a list where a row stays chosen until the
   * caller submits, such as the Go together partner picker.
   */
  selectedIndicator?: "radio";
  /** Slugs to hide entirely (e.g. already-added members, self). */
  excludeSlugs?: string[];
  /** Max selections; unselected rows disable once reached. */
  cap?: number;
  searchPlaceholder?: string;
  /** Accessible name for the search field. Defaults to SearchInput's own. */
  searchAriaLabel?: string;
  /**
   * Lift the search box out of this component, for a caller whose `people`
   * come from a server search that answers each query fresh. Pass both or
   * neither: with `onSearchChange` set, the caller owns the query and this
   * stops filtering locally, since the results already answer the query.
   */
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  /** Controlled search only: a request for the current query is in flight. */
  isSearching?: boolean;
  /** Shown in place of "no results" before a controlled search has anything
   *  to answer, e.g. "type a name to look somebody up". */
  emptyHint?: string;
  /**
   * Replaces the whole empty-list line when set, for a caller that knows why
   * nothing is showing (a failed load, or rows that are all excluded).
   */
  emptyMessage?: string;
  /**
   * Rendered after the rows inside the scrolling list, e.g. a "Load more"
   * button, and also when no row is visible. It sits beside the listbox, which
   * may own options only. Omit it and the list renders exactly as before.
   */
  listFooter?: ReactNode;
  /**
   * People listed above the results whatever the query, such as picks made
   * under an earlier search, so a chosen row stays on screen and can be
   * unticked. A pinned person who is also in `people` keeps their place in
   * the results, so ticking a row never makes it jump. A pinned row that is
   * unticked stays on screen until the query changes, so the rows under the
   * pointer hold still and keyboard focus stays on a row that still exists.
   * Pinned rows leave the empty line alone, so "no results" still shows under
   * them when the search matches nobody.
   */
  pinnedPeople?: MemberSelectPerson[];
  /**
   * Lower the scrolling list to about two rows, for a picker that lives
   * inside a tight surface such as a sidebar block. Unset, the list keeps its
   * full height.
   */
  isCompact?: boolean;
  /**
   * Show the search field alone, with no rows and no empty line under it, for
   * a picker that opens its results only once the member engages with the
   * search. Unset, the results always show.
   */
  isListHidden?: boolean;
}

/**
 * Searchable member picker: the SearchInput + member rows + toggle pattern
 * generalized from the cohost picker (and shared by the new-message,
 * new-group, add-members and invite-co-owner flows). Composes the shared
 * `SearchInput` and `MemberIdentity`. Selection is controlled by the caller;
 * this owns only the local search query.
 */
export function MemberSelectList({
  people,
  selected,
  onToggle,
  multiSelect = true,
  selectedIndicator,
  excludeSlugs,
  cap,
  searchPlaceholder,
  searchAriaLabel,
  searchQuery,
  onSearchChange,
  isSearching = false,
  emptyHint,
  emptyMessage,
  listFooter,
  pinnedPeople,
  isCompact = false,
  isListHidden = false,
}: MemberSelectListProps) {
  const { t } = useTranslation();
  const [localQuery, setLocalQuery] = useState("");
  const isSearchControlled = onSearchChange !== undefined;
  const query = isSearchControlled ? (searchQuery ?? "") : localQuery;
  const setQuery = isSearchControlled ? onSearchChange : setLocalQuery;
  const heldPinned = useHeldPinnedPeople(pinnedPeople, query);
  const excluded = useMemo(() => new Set(excludeSlugs ?? []), [excludeSlugs]);
  const isQueryTyped = query.trim().length > 0;
  const { resultsRef, resultsMinHeight } = useHeldResultsHeight(isQueryTyped);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return people.filter((person) => {
      if (excluded.has(person.slug)) return false;
      // A controlled search already asked the server this question; filtering
      // its answer again here would hide rows that legitimately matched.
      if (isSearchControlled || !needle) return true;
      return (
        person.name.toLowerCase().includes(needle) ||
        person.slug.toLowerCase().includes(needle)
      );
    });
  }, [people, excluded, query, isSearchControlled]);
  const pinnedVisible = useMemo(() => {
    const visibleSlugs = new Set(visible.map((person) => person.slug));
    return heldPinned.filter(
      (person) => !excluded.has(person.slug) && !visibleSlugs.has(person.slug),
    );
  }, [heldPinned, excluded, visible]);
  const hasPinnedRows = pinnedVisible.length > 0;
  const listClassName = isCompact
    ? `${styles.list} ${styles.listCompact}`
    : styles.list;

  const atCap = multiSelect && cap != null && selected.size >= cap;
  const showsRadioIndicator = !multiSelect && selectedIndicator === "radio";
  const isIdleControlledSearch =
    isSearchControlled &&
    !emptyHint &&
    !emptyMessage &&
    !isSearching &&
    !isQueryTyped;

  // A controlled search with an empty box has not asked the server anything
  // yet, so "no members match" would be a lie. Callers that want to fill that
  // space pass an `emptyHint`; the rest get nothing.
  const emptyLine = isIdleControlledSearch ? null : (
    <p className={styles.empty} aria-live="polite">
      {emptyMessage ??
        (isSearching
          ? t("shared:memberSelect.searching")
          : emptyHint && query.trim().length === 0
            ? emptyHint
            : t("shared:memberSelect.noResults"))}
    </p>
  );

  const renderRow = (person: MemberSelectPerson) => {
    const isSelected = selected.has(person.slug);
    return (
      <MemberSelectRow
        key={person.slug}
        person={person}
        isSelected={isSelected}
        isDisabled={atCap && !isSelected}
        multiSelect={multiSelect}
        showsRadioIndicator={showsRadioIndicator}
        onToggle={onToggle}
      />
    );
  };

  const renderListbox = (className: string | undefined) => (
    <div
      className={className}
      role="listbox"
      aria-multiselectable={multiSelect || undefined}
    >
      {hasPinnedRows && (
        // The picks sit in their own group above a hairline, so a pinned
        // person never reads as a match for the typed search.
        <div
          className={styles.pinnedGroup}
          role="group"
          aria-label={t("shared:memberSelect.pickedGroup")}
        >
          {pinnedVisible.map(renderRow)}
        </div>
      )}
      {visible.map(renderRow)}
    </div>
  );

  const results =
    listFooter !== undefined ? (
      // The scroll area holds the rows and the footer after them, so the
      // footer is reached by scrolling to the end of the list.
      <div className={listClassName}>
        {(hasPinnedRows || visible.length > 0) &&
          renderListbox(styles.listRows)}
        {visible.length === 0 && emptyLine}
        {listFooter}
      </div>
    ) : visible.length === 0 && !hasPinnedRows ? (
      emptyLine
    ) : visible.length === 0 ? (
      <div className={listClassName}>
        {renderListbox(styles.listRows)}
        {emptyLine}
      </div>
    ) : (
      renderListbox(listClassName)
    );

  return (
    <div className={styles.wrap}>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={searchPlaceholder}
        ariaLabel={searchAriaLabel}
      />
      {!isListHidden && (
        <div
          ref={resultsRef}
          className={styles.results}
          style={{ minHeight: resultsMinHeight }}
        >
          {results}
        </div>
      )}
    </div>
  );
}

/**
 * Holds the results area at the height it had with an empty search box for
 * as long as a search is typed, so a sheet that hugs its content stays put
 * while the matches thin out to "no results" or "looking". The height is
 * read only while the box is empty, because a local search narrows the rows
 * on the very first keystroke; clearing the box lets the area relax and the
 * reading starts again. Only a list inside a modal dialog is held: there the
 * dialog re-fits around its content, while an inline card would show a tall
 * blank block under "no results". Without a ResizeObserver (jsdom) nothing
 * is held.
 */
function useHeldResultsHeight(isHolding: boolean) {
  const [resultsElement, setResultsElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [heldHeight, setHeldHeight] = useState(0);

  // A layout effect, so the observer is gone before the browser reports the
  // first narrowed frame; that frame already carries the held min-height.
  useLayoutEffect(() => {
    if (!resultsElement || isHolding) return;
    if (typeof ResizeObserver === "undefined") return;
    if (!resultsElement.closest('[aria-modal="true"]')) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setHeldHeight(entry.contentRect.height);
    });
    observer.observe(resultsElement);
    return () => observer.disconnect();
  }, [resultsElement, isHolding]);

  return {
    resultsRef: setResultsElement,
    resultsMinHeight: isHolding && heldHeight > 0 ? heldHeight : undefined,
  };
}

const NO_PINNED_PEOPLE: MemberSelectPerson[] = [];

/**
 * The pinned rows to draw for this query: every current pin, plus any row
 * pinned earlier under the same query that has since been unticked. The held
 * list starts over whenever the query changes.
 */
function useHeldPinnedPeople(
  pinnedPeople: MemberSelectPerson[] | undefined,
  query: string,
): MemberSelectPerson[] {
  const currentPins = pinnedPeople ?? NO_PINNED_PEOPLE;
  const [held, setHeld] = useState({ query, people: currentPins });
  const isQueryChanged = held.query !== query;
  const heldSlugs = new Set(held.people.map((person) => person.slug));
  const addedPins = currentPins.filter((person) => !heldSlugs.has(person.slug));
  const nextPeople = isQueryChanged
    ? currentPins
    : addedPins.length > 0
      ? [...held.people, ...addedPins]
      : held.people;
  // Adjusting state while rendering: the guard lets this run once per new
  // query or new pin, and callers without pins never get here.
  if (pinnedPeople && nextPeople !== held.people) {
    setHeld({ query, people: nextPeople });
  }
  return pinnedPeople ? nextPeople : NO_PINNED_PEOPLE;
}
