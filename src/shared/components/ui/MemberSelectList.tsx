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
}: MemberSelectListProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const excluded = useMemo(() => new Set(excludeSlugs ?? []), [excludeSlugs]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return people.filter((person) => {
      if (excluded.has(person.slug)) return false;
      if (!needle) return true;
      return (
        person.name.toLowerCase().includes(needle) ||
        person.slug.toLowerCase().includes(needle)
      );
    });
  }, [people, excluded, query]);

  const atCap = multiSelect && cap != null && selected.size >= cap;

  return (
    <div className={styles.wrap}>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={searchPlaceholder}
      />
      {visible.length === 0 ? (
        <p className={styles.empty}>{t("shared:memberSelect.noResults")}</p>
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
