import { FiSearch, FiX } from "react-icons/fi";
import { Button, EmptyState } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskStates.module.css";

export interface DeskNoMatchStateProps {
  /** The search text, quoted in the title when there is one. */
  query: string;
  /** A filter or focus chip is on (besides any search). */
  hasFilters: boolean;
  /** How many pieces the scope holds before search and filters. */
  scopePieceCount: number;
  /** Clears search, filters and focus chips together. */
  onClearAll: () => void;
}

/** The description's key: what hides the pieces, named as it is. */
function descriptionKey(hasQuery: boolean, hasFilters: boolean): string {
  if (hasQuery && hasFilters) return "magazine:desk.states.noMatchDescription";
  return hasQuery
    ? "magazine:desk.states.noMatchSearchDescription"
    : "magazine:desk.states.noMatchFiltersDescription";
}

/**
 * The table's place when the scope has pieces but search, filters or focus
 * chips hide every one. It says the narrowing matched nothing (the desk is
 * full, so "The desk is clear" would mislead), names what does the hiding,
 * and offers the one way back: clear it all and see the scope's pieces
 * again.
 */
export function DeskNoMatchState({
  query,
  hasFilters,
  scopePieceCount,
  onClearAll,
}: DeskNoMatchStateProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery !== "";
  return (
    <div className={styles.empty}>
      <EmptyState
        icon={<FiSearch aria-hidden />}
        title={
          hasQuery
            ? t("magazine:desk.states.noMatchSearchTitle", {
                query: trimmedQuery,
              })
            : t("magazine:desk.states.noMatchFilterTitle")
        }
        description={
          <Translation
            i18nKey={descriptionKey(hasQuery, hasFilters)}
            values={{ count: scopePieceCount }}
            slots={{ count: format.number(scopePieceCount) }}
          />
        }
        headingLevel={2}
      />
      <div className={styles.emptyActions}>
        <Button variant="ghost" onClick={onClearAll}>
          <FiX aria-hidden />{" "}
          {t(
            hasQuery
              ? "magazine:desk.states.clearSearchAndFilters"
              : "magazine:desk.states.clearFilters",
          )}
        </Button>
      </div>
    </div>
  );
}
