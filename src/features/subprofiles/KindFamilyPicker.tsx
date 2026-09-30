import { useRef, useState } from "react";
import { FiCompass } from "react-icons/fi";
import { Collapse, EmptyState, SearchInput } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "./api/subprofiles.api";
import { KIND_FAMILIES } from "./kindFamilies.data";
import { KindFamilyCard } from "./KindFamilyCard";
import { kindsMatchingWordPrefix } from "./kindSearch";
import { useSuggestedPersonaKinds } from "./useSuggestedPersonaKinds";
import styles from "./NewSideModal.module.css";

/** How long the query rests before the list narrows: short enough to feel
 *  live, long enough that a quick word filters once. */
const SEARCH_DEBOUNCE_MS = 150;

/** The kinds a search term leaves on screen, by family, in the picker's own
 *  order. An empty term shows every kind; any other term keeps only the
 *  families with a matching kind (`kindsMatchingWordPrefix`), so a term that
 *  matches nothing leaves the map empty. */
function visibleKindsByFamily(
  trimmedQuery: string,
): Map<string, SubprofileKind[]> {
  if (trimmedQuery === "") {
    return new Map(
      KIND_FAMILIES.map((familyGroup) => [
        familyGroup.family,
        familyGroup.kinds,
      ]),
    );
  }
  const matchingKinds = new Set(kindsMatchingWordPrefix(trimmedQuery));
  const kindsByFamily = new Map<string, SubprofileKind[]>();
  for (const familyGroup of KIND_FAMILIES) {
    const familyKinds = familyGroup.kinds.filter((candidateKind) =>
      matchingKinds.has(candidateKind),
    );
    if (familyKinds.length > 0) {
      kindsByFamily.set(familyGroup.family, familyKinds);
    }
  }
  return kindsByFamily;
}

/** The heading of the row of kinds the member's own work profile suggests
 *  (`useSuggestedPersonaKinds`). It folds away while a search is running, so
 *  the families below own the results. */
const SUGGESTED_GROUP = {
  labelKey: "subprofiles:newModal.suggestedLabel",
  noteKey: "subprofiles:newModal.suggestedNote",
};

/** False while the picker still shows the kinds it opened with, and true for
 *  good from the first search on. Stored during render, so the render that
 *  first narrows the list already reads true. */
function useHasSearched(trimmedQuery: string): boolean {
  const [hasSearched, setHasSearched] = useState(false);
  const isSearchingNow = trimmedQuery !== "";
  if (isSearchingNow && !hasSearched) setHasSearched(true);
  return hasSearched || isSearchingNow;
}

/**
 * The "By craft" picker: a search field above the family-grouped kinds
 * (`.fams`). Typing narrows the families from the first letter to the kinds
 * whose EN or PT label or alias has a word starting with the term
 * (`kindsMatchingWordPrefix`), after a short debounce; the field itself stays
 * live. A term that finds nothing folds in a warm empty state with a way back.
 * The chosen kind lives in the form, so a selection the search hides stays
 * chosen and Continue stays enabled.
 *
 * Every family keeps its own always-mounted `Collapse` slot, in family order,
 * so a family that joins or leaves folds open or closed in place and the
 * families after it slide. One shared AnimatePresence would reinsert leaving
 * families among the staying ones, which React counts as a move, and in
 * development StrictMode would then cancel the kind exits inside and leave
 * them stuck on screen. Inside each family the kinds pop and glide on their
 * own (`KindFamilyCard`).
 */
export function KindFamilyPicker({
  kind,
  onChangeKind,
  t,
}: {
  kind: SubprofileKind | null;
  onChangeKind: (kind: SubprofileKind) => void;
  t: TranslationApi["t"];
}) {
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS).trim();
  const kindsByFamily = visibleKindsByFamily(filterQuery);
  const isSearching = filterQuery !== "";
  const hasNoMatches = isSearching && kindsByFamily.size === 0;
  const shouldKindsPopIn = useHasSearched(filterQuery);
  const suggestedKinds = useSuggestedPersonaKinds();
  let matchCount = 0;
  for (const familyKinds of kindsByFamily.values()) {
    matchCount += familyKinds.length;
  }

  function clearSearch() {
    setQuery("");
    searchInputRef.current?.focus();
  }

  return (
    <div className={styles.kindPicker}>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t("subprofiles:newModal.searchPlaceholder")}
        ariaLabel={t("subprofiles:newModal.searchAria")}
        inputRef={searchInputRef}
      />
      <span className="visuallyHidden" role="status" aria-live="polite">
        {/* A miss is announced by the EmptyState's own status role. */}
        {isSearching && matchCount > 0
          ? t("subprofiles:newModal.searchResultCount", { count: matchCount })
          : ""}
      </span>

      <div className={styles.fams}>
        <Collapse isOpen={hasNoMatches}>
          <EmptyState
            compact
            headingLevel={3}
            className={styles.famsEmpty}
            icon={<FiCompass />}
            title={t("subprofiles:newModal.searchEmptyTitle", {
              query: filterQuery,
            })}
            description={t("subprofiles:newModal.searchEmptyDescription")}
            action={{
              label: t("subprofiles:newModal.searchEmptyClear"),
              onClick: clearSearch,
            }}
          />
        </Collapse>
        {suggestedKinds.length > 0 && (
          <Collapse isOpen={!isSearching}>
            <KindFamilyCard
              familyGroup={SUGGESTED_GROUP}
              visibleKinds={suggestedKinds}
              selectedKind={kind}
              onChangeKind={onChangeKind}
              shouldKindsPopIn={false}
              t={t}
            />
          </Collapse>
        )}
        {KIND_FAMILIES.map((familyGroup) => {
          const visibleKinds = kindsByFamily.get(familyGroup.family);
          return (
            <Collapse
              key={familyGroup.family}
              isOpen={visibleKinds !== undefined}
            >
              {visibleKinds && (
                <KindFamilyCard
                  familyGroup={familyGroup}
                  visibleKinds={visibleKinds}
                  selectedKind={kind}
                  onChangeKind={onChangeKind}
                  shouldKindsPopIn={shouldKindsPopIn}
                  t={t}
                />
              )}
            </Collapse>
          );
        })}
      </div>
    </div>
  );
}
