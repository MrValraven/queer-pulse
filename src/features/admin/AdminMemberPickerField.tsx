import { useId, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  MemberIdentity,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STRANGER_SEARCH_MIN_LENGTH,
  useStrangerMemberSearch,
  type StrangerMemberResult,
} from "../messages/api/useStrangerMemberSearch";
import styles from "./AdminMemberPickerField.module.css";

const MAX_RESULTS = 5;
/** Stable empty selection: picking collapses the list into the chip. */
const EMPTY_SELECTION = new Set<string>();
/** Stable fallback so the search hook sees the same set on every render. */
const NO_EXCLUDED_SLUGS: ReadonlySet<string> = new Set<string>();

/**
 * An admin form's "who" field: a labelled member search that collapses into a
 * clearable chip once someone is picked. It reuses the nomination picker's
 * `useStrangerMemberSearch` with a single-select `MemberSelectList`, the same
 * pairing the ambassador grant form uses.
 *
 * The visible label sits outside `MemberSelectList`/`SearchInput`, neither of
 * which exposes an id to wire a native `<label htmlFor>` onto, so the pair
 * uses `role="group"` + `aria-labelledby` instead, the standard technique for
 * labelling a control that a shared component doesn't hand out an id for.
 */
export function AdminMemberPickerField({
  label,
  searchAriaLabel,
  picked,
  onPick,
  excludeSlugs,
  helper,
  labelClassName,
  isDisabled = false,
}: {
  /** Visible label above the search. */
  label: string;
  /** Accessible name of the search input. */
  searchAriaLabel: string;
  picked: StrangerMemberResult | null;
  onPick: (member: StrangerMemberResult | null) => void;
  /** Members never offered as results (already seated, etc.). */
  excludeSlugs?: ReadonlySet<string>;
  /** Optional helper line under the field. */
  helper?: string;
  /** Overrides the default caption styling (FormField-like uppercase label). */
  labelClassName?: string;
  /** Disables the clear button while a request using the pick is in flight. */
  isDisabled?: boolean;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const helperId = useId();
  const [query, setQuery] = useState("");
  const { results, loading, isError } = useStrangerMemberSearch(
    query,
    excludeSlugs ?? NO_EXCLUDED_SLUGS,
  );
  const people = useMemo<MemberSelectPerson[]>(
    () =>
      results.slice(0, MAX_RESULTS).map((result) => ({
        slug: result.slug,
        name: result.name,
        avatarUrl: result.avatarUrl,
        pronouns: result.sub,
      })),
    [results],
  );

  const emptyHint = t("admin:memberPicker.emptyHint");
  // `MemberSelectList` shows its hint only for an empty box, so a single
  // letter would otherwise read "no results" before the search even runs.
  // An outage gets its own line so it never reads as "nobody by that name".
  const isQueryTooShort = query.trim().length < STRANGER_SEARCH_MIN_LENGTH;
  const emptyMessage = isError
    ? t("admin:memberPicker.searchError")
    : isQueryTooShort
      ? emptyHint
      : undefined;

  return (
    <div className={styles.pickerField}>
      <span id={labelId} className={labelClassName ?? styles.fieldCaption}>
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={helper ? helperId : undefined}
      >
        {picked ? (
          <div className={styles.picked}>
            <MemberIdentity
              person={picked}
              secondary={`@${picked.slug}`}
              size={34}
            />
            <button
              type="button"
              className={styles.pickedClear}
              disabled={isDisabled}
              aria-label={t("admin:memberPicker.clearAria", {
                name: picked.name,
              })}
              onClick={() => {
                onPick(null);
                setQuery("");
              }}
            >
              <FiX aria-hidden />
            </button>
          </div>
        ) : (
          <MemberSelectList
            people={people}
            selected={EMPTY_SELECTION}
            onToggle={(slug) => {
              const member = results.find((result) => result.slug === slug);
              if (member) onPick(member);
            }}
            multiSelect={false}
            searchQuery={query}
            onSearchChange={setQuery}
            isSearching={loading}
            emptyHint={emptyHint}
            emptyMessage={emptyMessage}
            searchPlaceholder={t("admin:memberPicker.placeholder")}
            searchAriaLabel={searchAriaLabel}
          />
        )}
      </div>
      {helper && (
        <p id={helperId} className={styles.helper}>
          {helper}
        </p>
      )}
    </div>
  );
}
