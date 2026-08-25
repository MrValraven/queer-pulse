import { useMemo, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { SearchInput } from "./SearchInput";
import { MemberIdentity } from "./MemberIdentity";
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
  /** Slugs to hide entirely (e.g. already-added members, self). */
  excludeSlugs?: string[];
  /** Max selections; unselected rows disable once reached. */
  cap?: number;
  searchPlaceholder?: string;
  /**
   * Lift the search box out of this component, for a caller whose `people`
   * come from a server search rather than a list it already holds. Pass both
   * or neither: with `onSearchChange` set, the caller owns the query and this
   * stops filtering locally, since the results already answer the query.
   */
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  /** Controlled search only: a request for the current query is in flight. */
  isSearching?: boolean;
  /** Shown in place of "no results" before a controlled search has anything
   *  to answer, e.g. "type a name to look somebody up". */
  emptyHint?: string;
}

/**
 * Searchable member picker — the SearchInput + member rows + toggle pattern
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
  excludeSlugs,
  cap,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  isSearching = false,
  emptyHint,
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

  return (
    <div className={styles.wrap}>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={searchPlaceholder}
      />
      {visible.length === 0 ? (
        <p className={styles.empty} aria-live="polite">
          {isSearching
            ? t("shared:memberSelect.searching")
            : emptyHint && query.trim().length === 0
              ? emptyHint
              : t("shared:memberSelect.noResults")}
        </p>
      ) : (
        <div
          className={styles.list}
          role="listbox"
          aria-multiselectable={multiSelect || undefined}
        >
          {visible.map((person) => {
            const isSelected = selected.has(person.slug);
            const disabled = atCap && !isSelected;
            return (
              <button
                key={person.slug}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={disabled}
                className={[styles.row, isSelected && styles.rowSelected]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggle(person.slug)}
              >
                <MemberIdentity
                  person={person}
                  secondary={person.pronouns}
                  size={38}
                />
                {multiSelect && (
                  <span
                    className={[styles.check, isSelected && styles.checkOn]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden
                  >
                    {isSelected && <FiCheck />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
