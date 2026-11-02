import { AnimatePresence } from "motion/react";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ADD_MONTH_SECTION_IDS } from "./addMonth.data";
import type { AddMonthRow, AddMonthRowIssue } from "./addMonthState";
import { AddMonthRowCard, type AddMonthRowContext } from "./AddMonthRowCard";
import styles from "./AddMonthRows.module.css";

export type { AddMonthRowContext } from "./AddMonthRowCard";

/** DOM id of the rows heading, for the page's `aria-labelledby`. */
export const ADD_MONTH_ROWS_HEADING_ID = `${ADD_MONTH_SECTION_IDS.rows}-heading`;

const NO_ISSUES: AddMonthRowIssue[] = [];

/**
 * One card per selected date, in date order. A card grows in when its date
 * is picked and folds away when it is removed; with no dates picked a line
 * says where the cards come from.
 */
export function AddMonthRowList({
  rows,
  issues,
  serverIssue,
  context,
}: {
  rows: AddMonthRow[];
  issues: Record<string, AddMonthRowIssue[]>;
  serverIssue: { date: string; message: string } | null;
  context: AddMonthRowContext;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.rows}>
      <h2 id={ADD_MONTH_ROWS_HEADING_ID} className={styles.heading}>
        {t("gatherings:addMonth.rows.heading")}
      </h2>
      <Collapse isOpen={rows.length === 0}>
        <p className={styles.empty}>{t("gatherings:addMonth.rows.empty")}</p>
      </Collapse>
      <ul className={styles.list} aria-labelledby={ADD_MONTH_ROWS_HEADING_ID}>
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <CollapseListItem key={row.date}>
              <div className={styles.listItem}>
                <AddMonthRowCard
                  row={row}
                  issues={issues[row.date] ?? NO_ISSUES}
                  serverMessage={
                    serverIssue?.date === row.date ? serverIssue.message : null
                  }
                  context={context}
                />
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
