import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button, Collapse } from "../../../shared/components/ui";
import { MemberSelectList } from "../../../shared/components/ui/MemberSelectList";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useLeadStaffSearch } from "./api/useLeadStaffSearch";
import {
  LEAD_MAX_ASSIGNEES,
  LEAD_STAFF_PREVIEW_LIMIT,
  type LeadStaffSummaryDTO,
} from "./api/leads.types";
import { leadStaffBySlug, toLeadStaffPerson } from "./leadAssignees.model";
import type { LeadFieldError } from "./leadForm.model";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./LeadAssigneePicker.module.css";

export interface LeadAssigneePickerProps {
  assignees: readonly LeadStaffSummaryDTO[];
  viewerId: string | null;
  isBusy: boolean;
  error: LeadFieldError | null;
  /** `isAssigned` says whether the person was in charge before the press. */
  onToggle: (person: LeadStaffSummaryDTO, isAssigned: boolean) => void;
}

/**
 * The Assign staff picker: a server search over the staff with Leads
 * access, the current assignees pinned and ticked above the results, and
 * the lines that explain the list under it (the preview hint, the limit,
 * a failed load with a way to load again, and a refused write).
 */
export function LeadAssigneePicker({
  assignees,
  viewerId,
  isBusy,
  error,
  onToggle,
}: LeadAssigneePickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const search = useLeadStaffSearch(query);
  const youLabel = t("admin:leads.assignees.you");
  const headingId = useId();
  // The rows swap, with a fade, once the search has answered the new term;
  // while it loads the previous rows stay on screen and stay keyed.
  const [shownTerm, setShownTerm] = useState(search.term);
  if (!search.isSearching && search.term !== shownTerm) {
    setShownTerm(search.term);
  }
  // Everyone the picker has drawn, by slug, so a pinned row that left both
  // the results and the assignees (unticked, then ticked again) still
  // finds its person.
  const seenStaffRef = useRef(new Map<string, LeadStaffSummaryDTO>());
  useEffect(() => {
    for (const summary of [...assignees, ...search.results]) {
      if (summary.slug.trim() !== "") {
        seenStaffRef.current.set(summary.slug, summary);
      }
    }
  }, [assignees, search.results]);

  const people = useMemo(
    () =>
      search.results.map((summary) =>
        toLeadStaffPerson(summary, viewerId, youLabel),
      ),
    [search.results, viewerId, youLabel],
  );
  const pinnedPeople = useMemo(
    () =>
      assignees
        .filter((summary) => summary.slug.trim() !== "")
        .map((summary) => toLeadStaffPerson(summary, viewerId, youLabel)),
    [assignees, viewerId, youLabel],
  );
  const selected = useMemo(
    () =>
      new Set(
        assignees
          .map((summary) => summary.slug)
          .filter((slug) => slug.trim() !== ""),
      ),
    [assignees],
  );

  const isAtCap = assignees.length >= LEAD_MAX_ASSIGNEES;
  // The search hint only matters when the preview filled up, so a team
  // that fits in it never reads about more people.
  const isPreviewFull =
    search.term === "" &&
    !search.isError &&
    search.results.length >= LEAD_STAFF_PREVIEW_LIMIT;
  // An assignee with a blank slug has no row, so the rows reach the limit
  // together with the cap line.
  const blankSlugCount = assignees.length - selected.size;
  const hasAnsweredNothing =
    shownTerm !== "" && !search.isSearching && search.results.length === 0;
  const emptyMessage = search.isError
    ? t("admin:leads.assignees.loadError")
    : hasAnsweredNothing
      ? t("admin:leads.assignees.searchEmpty", { query: shownTerm })
      : undefined;

  const handleToggle = (slug: string) => {
    if (isBusy) return;
    const summary = leadStaffBySlug(slug, [
      search.results,
      assignees,
      Array.from(seenStaffRef.current.values()),
    ]);
    if (summary === null) return;
    const isAssigned = assignees.some((assignee) => assignee.id === summary.id);
    onToggle(summary, isAssigned);
  };

  return (
    <div className={styles.picker} aria-busy={isBusy || undefined}>
      <h3 id={headingId} className={styles.visuallyHidden}>
        {t("admin:leads.assignees.pickerListLabel")}
      </h3>
      <div role="group" aria-labelledby={headingId}>
        <MemberSelectList
          multiSelect
          people={people}
          pinnedPeople={pinnedPeople}
          selected={selected}
          onToggle={handleToggle}
          cap={LEAD_MAX_ASSIGNEES - blankSlugCount}
          searchQuery={query}
          onSearchChange={setQuery}
          isSearching={search.isSearching}
          searchAriaLabel={t("admin:leads.assignees.searchLabel")}
          searchPlaceholder={t("admin:leads.assignees.searchPlaceholder")}
          resultsKey={shownTerm}
          emptyMessage={emptyMessage}
        />
      </div>
      <Collapse isOpen={isPreviewFull}>
        <p className={styles.hint}>{t("admin:leads.assignees.previewHint")}</p>
      </Collapse>
      <Collapse isOpen={isAtCap}>
        <p className={styles.hint}>
          {t("admin:leads.assignees.capReached", { max: LEAD_MAX_ASSIGNEES })}
        </p>
      </Collapse>
      <Collapse isOpen={search.isError}>
        <div className={styles.retry}>
          <Button variant="ghost" size="sm" onClick={search.retry}>
            {t("admin:leads.assignees.retry")}
          </Button>
        </div>
      </Collapse>
      <LeadRefusalLine error={error} />
    </div>
  );
}
