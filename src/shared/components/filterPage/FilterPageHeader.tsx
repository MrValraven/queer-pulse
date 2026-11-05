import type { ReactNode } from "react";
import { FadeIn, SkeletonLine } from "../ui";
import styles from "./FilterPage.module.css";

interface FilterPageHeaderProps {
  /** The small coral uppercase line above the title. */
  eyebrow: ReactNode;
  /** The page's one h1. An `<em>` inside it renders italic coral. */
  title: ReactNode;
  /** The paragraph under the title. Rendered in a `<p>`, so pass inline
   *  content only; a `<b>` inside it reads in the strong ink. */
  lead?: ReactNode;
  /** Shows a shimmer line where the lead goes, for a lead that waits on
   *  data (a count, say). It renders in a `div`, since a SkeletonLine is a
   *  `div` and cannot sit inside a `<p>`. */
  isLeadLoading?: boolean;
  /** A short status line under the lead. */
  note?: ReactNode;
  /** Leads the note with the jade "live now" dot. */
  isNoteLive?: boolean;
  /** A wrapping row under the text for buttons, pill tabs or a quiet stat
   *  line. */
  actions?: ReactNode;
  /** Underline tabs sitting on the header's bottom hairline, which then
   *  acts as their track. The tab panels render below the header. */
  tabs?: ReactNode;
}

/** The filter page's header: eyebrow, h1, lead, then the optional note,
 *  actions row and tabs, fading in as one block. A page renders it first
 *  inside `FilterPageFrame`, and swaps in `FilterPageHeaderSkeleton` while
 *  the whole header waits on data. */
export function FilterPageHeader({
  eyebrow,
  title,
  lead,
  isLeadLoading = false,
  note,
  isNoteLive = false,
  actions,
  tabs,
}: FilterPageHeaderProps) {
  const hasTabs = tabs !== undefined && tabs !== null;
  return (
    <FadeIn
      as="header"
      className={[styles.head, hasTabs && styles.headWithTabs]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h1 className={styles.h1}>{title}</h1>
      {isLeadLoading ? (
        <div className={styles.lead} aria-busy="true">
          <SkeletonLine width="80%" height={13} style={{ margin: "5px 0" }} />
        </div>
      ) : (
        lead && <p className={styles.lead}>{lead}</p>
      )}
      {note && (
        <div className={styles.note}>
          {isNoteLive && <span className={styles.noteDot} aria-hidden />}
          {note}
        </div>
      )}
      {actions && <div className={styles.headActions}>{actions}</div>}
      {hasTabs && <div className={styles.headTabs}>{tabs}</div>}
    </FadeIn>
  );
}

interface FilterPageHeaderSkeletonProps {
  /** Adds a placeholder for the note line, for a header that has one. */
  hasNote?: boolean;
  /** Adds a placeholder for the actions row, for a header that has one. */
  hasActions?: boolean;
  /** Adds underline-tab placeholders on the bottom hairline (and the
   *  header's tabs spacing), for a header that has tabs. */
  hasTabs?: boolean;
}

/** Placeholder for `FilterPageHeader` that mirrors its eyebrow / h1 / lead
 *  rhythm, plus the optional note, actions and tabs, so the real header
 *  swaps in with no layout shift. A page renders it in the header's place
 *  while the header's data loads. */
export function FilterPageHeaderSkeleton({
  hasNote = false,
  hasActions = false,
  hasTabs = false,
}: FilterPageHeaderSkeletonProps) {
  return (
    <div
      className={[styles.head, hasTabs && styles.headWithTabs]
        .filter(Boolean)
        .join(" ")}
      aria-busy="true"
      aria-hidden="true"
    >
      <SkeletonLine width={200} height={11} style={{ marginBottom: 14 }} />
      <SkeletonLine width="70%" height={48} style={{ marginBottom: 16 }} />
      <SkeletonLine width="100%" height={13} style={{ marginTop: 4 }} />
      <SkeletonLine width="45%" height={13} style={{ marginTop: 8 }} />
      {hasNote && (
        <div className={styles.note}>
          <SkeletonLine width={220} height={13} style={{ margin: "3px 0" }} />
        </div>
      )}
      {hasActions && (
        <div className={styles.headActions}>
          <SkeletonLine width={150} height={38} />
          <SkeletonLine width={120} height={38} />
        </div>
      )}
      {hasTabs && (
        <div className={`${styles.headTabs} ${styles.headTabsSkeleton}`}>
          <SkeletonLine width={84} height={22} />
          <SkeletonLine width={96} height={22} />
          <SkeletonLine width={72} height={22} />
        </div>
      )}
    </div>
  );
}
