import { useMemo, useState, type ReactNode } from "react";
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
}: MemberSelectListProps) {
  const { t } = useTranslation();
  const [localQuery, setLocalQuery] = useState("");
  const isSearchControlled = onSearchChange !== undefined;
  const query = isSearchControlled ? (searchQuery ?? "") : localQuery;
  const setQuery = isSearchControlled ? onSearchChange : setLocalQuery;
  const excluded = useMemo(() => new Set(excludeSlugs ?? []), [excludeSlugs]);

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

  const atCap = multiSelect && cap != null && selected.size >= cap;
  const showsRadioIndicator = !multiSelect && selectedIndicator === "radio";
  const isIdleControlledSearch =
    isSearchControlled &&
    !emptyHint &&
    !emptyMessage &&
    !isSearching &&
    query.trim().length === 0;

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

  const renderListbox = (className: string | undefined) => (
    <div
      className={className}
      role="listbox"
      aria-multiselectable={multiSelect || undefined}
    >
      {visible.map((person) => {
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
      })}
    </div>
  );

  return (
    <div className={styles.wrap}>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={searchPlaceholder}
        ariaLabel={searchAriaLabel}
      />
      {listFooter !== undefined ? (
        // The scroll area holds the rows and the footer after them, so the
        // footer is reached by scrolling to the end of the list.
        <div className={styles.list}>
          {visible.length === 0 ? emptyLine : renderListbox(styles.listRows)}
          {listFooter}
        </div>
      ) : visible.length === 0 ? (
        emptyLine
      ) : (
        renderListbox(styles.list)
      )}
    </div>
  );
}
