import type { ReactNode } from "react";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  PublishedCountDTO,
  TransparencyBreakdownRowDTO,
} from "./api/transparency.api";
import styles from "./TransparencyPage.module.css";

/**
 * The shared vocabulary of the Transparency Report: a headline figure, and a
 * table of counts.
 *
 * Both have to render a WITHHELD figure as gracefully as a published one. A
 * count of one or two on a platform this size can identify a person, so the
 * backend withholds it, and the page's job is to say so in words rather than
 * leave a gap a reader would fill with a guess.
 */

/** Turn a published count into the words a reader sees. */
function useCountText() {
  const { t } = useTranslation();
  const format = useFormat();
  return (count: PublishedCountDTO, smallCountFloor: number): string => {
    if (count.value !== null) return format.number(count.value);
    if (count.isSuppressed) {
      return t("governance:transparency.suppressed.value", {
        floor: smallCountFloor,
      });
    }
    return t("governance:transparency.suppressed.unavailable");
  };
}

interface HeadlineFigureProps {
  count: PublishedCountDTO;
  smallCountFloor: number;
  label: ReactNode;
}

/** One big number with its plain label. */
export function HeadlineFigure({
  count,
  smallCountFloor,
  label,
}: HeadlineFigureProps) {
  const countText = useCountText();
  const isPublished = count.value !== null;
  return (
    <div className={styles.headline}>
      <div
        className={
          isPublished ? styles.headlineValue : styles.headlineValueWithheld
        }
      >
        {countText(count, smallCountFloor)}
      </div>
      <div className={styles.headlineLabel}>{label}</div>
    </div>
  );
}

interface HeadlineTextProps {
  value: string;
  label: ReactNode;
  /** True when `value` is a real figure rather than a "not published" note, so
   *  the two render in visibly different shapes. */
  isPublished: boolean;
}

/** A headline slot whose value is not a count (a duration, a percentage, or
 *  the sentence explaining why neither is published). */
export function HeadlineText({ value, label, isPublished }: HeadlineTextProps) {
  return (
    <div className={styles.headline}>
      <div
        className={
          isPublished ? styles.headlineValue : styles.headlineValueWithheld
        }
      >
        {value}
      </div>
      <div className={styles.headlineLabel}>{label}</div>
    </div>
  );
}

export function HeadlineRow({ children }: { children: ReactNode }) {
  return <div className={styles.headlines}>{children}</div>;
}

interface CountTableProps {
  caption: string;
  rowHeader: string;
  countHeader: string;
  rows: TransparencyBreakdownRowDTO[];
  smallCountFloor: number;
  /** Row key to translated label. A key with no label is dropped rather than
   *  rendered raw: a stray identifier on a published document reads as a bug
   *  and undermines the whole page. */
  labelFor: (key: string) => string | undefined;
}

/**
 * A plain two-column table of counts.
 *
 * A real `<table>` with a `<caption>` and row headers, so a screen reader
 * announces "Harassment, 27" rather than reading two disconnected columns. The
 * withheld cells are marked by their words, never by colour alone.
 */
export function CountTable({
  caption,
  rowHeader,
  countHeader,
  rows,
  smallCountFloor,
  labelFor,
}: CountTableProps) {
  const countText = useCountText();
  const labelledRows = rows
    .map((row) => ({ row, label: labelFor(row.key) }))
    .filter(
      (entry): entry is { row: TransparencyBreakdownRowDTO; label: string } =>
        entry.label !== undefined,
    );

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{rowHeader}</th>
            <th scope="col" className={styles.numberCell}>
              {countHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {labelledRows.map(({ row, label }) => (
            <tr key={row.key}>
              <th scope="row">{label}</th>
              <td
                className={
                  row.count.value === null
                    ? styles.withheldCell
                    : styles.numberCell
                }
              >
                {countText(row.count, smallCountFloor)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
