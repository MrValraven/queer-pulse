import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button, Collapse } from "../../../shared/components/ui";
import {
  MemberSelectList,
  type MemberSelectPerson,
} from "../../../shared/components/ui/MemberSelectList";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CULTURAL_MAX_ASSIGNEES,
  CULTURAL_STAFF_PREVIEW_LIMIT,
  type CulturalStaffSummaryDTO,
} from "./api/culturalProduction.types";
import { useCulturalStaffSearch } from "./api/useCulturalStaffSearch";
import {
  culturalErrorKeyOf,
  culturalErrorValuesOf,
} from "./culturalProductionErrors";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { useCulturalViewerId } from "./useCulturalViewerId";
import styles from "./CulturalStaffPicker.module.css";

export interface CulturalStaffPickerProps {
  selectedPeople: readonly CulturalStaffSummaryDTO[];
  /** `isSelected` says whether the person was selected before the press,
   *  so true asks to remove them and false asks to add them. */
  onToggle: (person: CulturalStaffSummaryDTO, isSelected: boolean) => void;
  /** A write is in flight: rows ignore presses. */
  isBusy?: boolean;
  /** A refused write, named under the list. */
  error?: unknown;
}

/** A picker row for `MemberSelectList`, which keys rows by slug. The
 *  viewer's row reads "You" under the name. */
function toStaffPerson(
  summary: CulturalStaffSummaryDTO,
  viewerId: string | null,
  youLabel: string,
): MemberSelectPerson {
  return {
    slug: summary.slug,
    name: summary.displayName,
    avatarUrl: summary.avatarUrl ?? undefined,
    detail: viewerId !== null && summary.id === viewerId ? youLabel : undefined,
  };
}

/**
 * The Assign staff picker: a server search over the people with Cultural
 * Production access, the current selection pinned and ticked above the
 * results, and the lines that explain the list under it (the preview hint,
 * the limit of ten, a failed load named with its cause and a way to load
 * again, and a refused write).
 */
export function CulturalStaffPicker({
  selectedPeople,
  onToggle,
  isBusy = false,
  error = null,
}: CulturalStaffPickerProps) {
  const { t } = useTranslation();
  const viewerId = useCulturalViewerId();
  const [query, setQuery] = useState("");
  const search = useCulturalStaffSearch(query);
  const youLabel = t("admin:culturalProduction.staff.you");
  const headingId = useId();
  // The rows swap, with a fade, once the search has answered the new term;
  // while it loads the previous rows stay on screen and stay keyed.
  const [shownTerm, setShownTerm] = useState(search.term);
  if (!search.isSearching && search.term !== shownTerm) {
    setShownTerm(search.term);
  }
  // The cause stays on screen while its line folds away after a retry.
  const [lastSearchError, setLastSearchError] = useState<unknown>(null);
  if (search.isError && search.error !== lastSearchError) {
    setLastSearchError(search.error);
  }
  // Everyone the picker has drawn, by slug, so a pinned row that left both
  // the results and the selection still finds its person.
  const seenStaffRef = useRef(new Map<string, CulturalStaffSummaryDTO>());
  useEffect(() => {
    for (const summary of [...selectedPeople, ...search.results]) {
      if (summary.slug.trim() !== "") {
        seenStaffRef.current.set(summary.slug, summary);
      }
    }
  }, [selectedPeople, search.results]);

  const people = useMemo(
    () =>
      search.results.map((summary) =>
        toStaffPerson(summary, viewerId, youLabel),
      ),
    [search.results, viewerId, youLabel],
  );
  const pinnedPeople = useMemo(
    () =>
      selectedPeople
        .filter((summary) => summary.slug.trim() !== "")
        .map((summary) => toStaffPerson(summary, viewerId, youLabel)),
    [selectedPeople, viewerId, youLabel],
  );
  const selectedSlugs = useMemo(
    () =>
      new Set(
        selectedPeople
          .map((summary) => summary.slug)
          .filter((slug) => slug.trim() !== ""),
      ),
    [selectedPeople],
  );

  const isAtCap = selectedPeople.length >= CULTURAL_MAX_ASSIGNEES;
  // The search hint only matters when the preview filled up.
  const isPreviewFull =
    search.term === "" &&
    !search.isError &&
    search.results.length >= CULTURAL_STAFF_PREVIEW_LIMIT;
  // A selected person with a blank slug has no row, so the rows reach the
  // limit together with the cap line.
  const blankSlugCount = selectedPeople.length - selectedSlugs.size;
  const hasAnsweredNothing =
    shownTerm !== "" && !search.isSearching && search.results.length === 0;
  const emptyMessage = search.isError
    ? t("admin:culturalProduction.staff.loadError")
    : hasAnsweredNothing
      ? t("admin:culturalProduction.staff.searchEmpty", { query: shownTerm })
      : undefined;

  const handleToggle = (slug: string) => {
    if (isBusy || slug === "") return;
    const summary =
      search.results.find((candidate) => candidate.slug === slug) ??
      selectedPeople.find((candidate) => candidate.slug === slug) ??
      seenStaffRef.current.get(slug);
    if (summary === undefined) return;
    const isSelected = selectedPeople.some(
      (candidate) => candidate.id === summary.id,
    );
    onToggle(summary, isSelected);
  };

  return (
    <div className={styles.picker} aria-busy={isBusy || undefined}>
      <h3 id={headingId} className="visuallyHidden">
        {t("admin:culturalProduction.staff.pickerListLabel")}
      </h3>
      <div role="group" aria-labelledby={headingId}>
        <MemberSelectList
          multiSelect
          people={people}
          pinnedPeople={pinnedPeople}
          selected={selectedSlugs}
          onToggle={handleToggle}
          cap={CULTURAL_MAX_ASSIGNEES - blankSlugCount}
          searchQuery={query}
          onSearchChange={setQuery}
          isSearching={search.isSearching}
          searchAriaLabel={t("admin:culturalProduction.staff.searchLabel")}
          searchPlaceholder={t(
            "admin:culturalProduction.staff.searchPlaceholder",
          )}
          resultsKey={shownTerm}
          emptyMessage={emptyMessage}
        />
      </div>
      <Collapse isOpen={isPreviewFull}>
        <p className={styles.hint}>
          {t("admin:culturalProduction.staff.previewHint")}
        </p>
      </Collapse>
      <Collapse isOpen={isAtCap}>
        <p className={styles.hint}>
          {t("admin:culturalProduction.staff.capReached", {
            max: CULTURAL_MAX_ASSIGNEES,
          })}
        </p>
      </Collapse>
      <Collapse isOpen={search.isError}>
        <div className={styles.retry}>
          <p className={styles.hint}>
            {t(
              culturalErrorKeyOf(lastSearchError),
              culturalErrorValuesOf(lastSearchError),
            )}
          </p>
          <Button variant="ghost" size="sm" onClick={search.retry}>
            {t("admin:culturalProduction.staff.retry")}
          </Button>
        </div>
      </Collapse>
      <CulturalRefusalLine error={error} />
    </div>
  );
}
