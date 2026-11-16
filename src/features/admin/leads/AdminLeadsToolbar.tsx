import { useId, type RefObject } from "react";
import { FiX } from "react-icons/fi";
import { Button, SearchInput, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminToolbar, adminToolbarClasses } from "../ui";
import {
  LEAD_SEARCH_QUERY_MAX,
  LEAD_TYPES,
  isLeadType,
} from "./api/leads.types";
import { LEAD_TYPE_LABEL_KEY } from "./leadLabels.data";
import { LeadAssigneeFilter } from "./LeadAssigneeFilter";
import { LEAD_LIST_SHORTCUT } from "./leadsList.data";
import type { LeadListControls } from "./useLeadListFilters";
import styles from "./AdminLeads.module.css";

/** Typed text cut to the longest search, in code points (SearchInput takes
 *  no `maxLength`, so the cut happens here). */
function cutToSearchMax(text: string): string {
  const codePoints = Array.from(text);
  return codePoints.length > LEAD_SEARCH_QUERY_MAX
    ? codePoints.slice(0, LEAD_SEARCH_QUERY_MAX).join("")
    : text;
}

/** "12 leads", or "Showing 50 of 64" while more pages wait. */
function useResultSummary(shownCount: number, matchCount: number | null) {
  const { t } = useTranslation();
  if (matchCount === null) {
    return t("admin:leads.toolbar.shown", { count: shownCount });
  }
  return matchCount > shownCount
    ? t("admin:leads.toolbar.showingOf", {
        shown: shownCount,
        count: matchCount,
      })
    : t("admin:leads.toolbar.count", { count: matchCount });
}

/**
 * The search over name, email and links (with its `/` key shown on a
 * keyboard device), the type select and the In charge view, laid out by the
 * shared admin toolbar at one control height. The count of leads in view
 * follows them, with Clear filters at the end while any filter is on and rows
 * show.
 * The stage and due filters live in the pipeline strip above.
 */
export function AdminLeadsToolbar({
  controls,
  searchRef,
  shownCount,
  matchCount,
  hasRows,
}: {
  controls: LeadListControls;
  searchRef: RefObject<HTMLInputElement | null>;
  shownCount: number;
  matchCount: number | null;
  hasRows: boolean;
}) {
  const { t } = useTranslation();
  const typeSelectId = useId();
  const { filters } = controls;
  const summary = useResultSummary(shownCount, matchCount);

  return (
    <AdminToolbar
      label={t("admin:leads.title")}
      count={hasRows ? summary : undefined}
      end={
        hasRows && controls.hasFilters ? (
          <Button variant="ghost" size="sm" onClick={controls.clearFilters}>
            <FiX aria-hidden />
            {t("admin:leads.empty.clearFilters")}
          </Button>
        ) : undefined
      }
    >
      <div className={styles.searchWrap}>
        <SearchInput
          className={adminToolbarClasses.search}
          inputRef={searchRef}
          value={controls.searchText}
          onChange={(text) => controls.setSearchText(cutToSearchMax(text))}
          onKeyDown={(event) => {
            if (event.key === "Escape" && controls.searchText !== "") {
              event.stopPropagation();
              controls.setSearchText("");
            }
          }}
          ariaLabel={t("admin:leads.list.searchLabel")}
          placeholder={t("admin:leads.list.searchPlaceholder")}
          clearable
        />
        {controls.searchText === "" ? (
          <kbd className={styles.keyHint} aria-hidden>
            {LEAD_LIST_SHORTCUT.search}
          </kbd>
        ) : null}
      </div>
      <Select
        id={typeSelectId}
        size="sm"
        className={adminToolbarClasses.select}
        clearable
        label={t("admin:leads.list.typeFilterLabel")}
        placeholder={t("admin:leads.list.typeAll")}
        options={LEAD_TYPES.map((type) => ({
          value: type,
          label: t(LEAD_TYPE_LABEL_KEY[type]),
        }))}
        value={filters.type}
        onChange={(type) => controls.setType(isLeadType(type) ? type : null)}
      />
      <LeadAssigneeFilter controls={controls} />
    </AdminToolbar>
  );
}
