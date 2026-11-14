import { useId, type RefObject } from "react";
import { FiX } from "react-icons/fi";
import { Button, SearchInput, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  LEAD_SEARCH_QUERY_MAX,
  LEAD_TYPES,
  isLeadType,
} from "./api/leads.types";
import { LEAD_TYPE_LABEL_KEY } from "./leadLabels.data";
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
function ResultSummary({
  shownCount,
  matchCount,
}: {
  shownCount: number;
  matchCount: number | null;
}) {
  const { t } = useTranslation();
  const text =
    matchCount === null
      ? t("admin:leads.toolbar.shown", { count: shownCount })
      : matchCount > shownCount
        ? t("admin:leads.toolbar.showingOf", {
            shown: shownCount,
            count: matchCount,
          })
        : t("admin:leads.toolbar.count", { count: matchCount });
  return (
    <p className={styles.summary} role="status">
      {text}
    </p>
  );
}

/**
 * The search over name, email and links (with its `/` key shown on a
 * keyboard device), the type select, and a line that counts the leads in
 * view, with Clear filters beside it while any filter is on and rows show.
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

  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <SearchInput
          className={styles.search}
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
      <div className={styles.typeFilter}>
        <Select
          id={typeSelectId}
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
      </div>
      <div className={styles.toolbarEnd}>
        {hasRows ? (
          <ResultSummary shownCount={shownCount} matchCount={matchCount} />
        ) : null}
        {hasRows && controls.hasFilters ? (
          <Button variant="ghost" size="sm" onClick={controls.clearFilters}>
            <FiX aria-hidden />
            {t("admin:leads.empty.clearFilters")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
