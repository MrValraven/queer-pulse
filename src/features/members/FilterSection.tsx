import { useId, type ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import styles from "./MemberDirectoryFilterPage.module.css";

interface FilterSectionProps {
  title: string;
  /** Applied to the title text so a child ChipSelect can aria-labelledby it. */
  headingId?: string;
  open: boolean;
  onToggle: () => void;
  /** Count of active selections in this group; a small badge shows when > 0. */
  activeCount?: number;
  children: ReactNode;
}

/** A single collapsible filter card: a full-width header button (title +
 *  optional active-count badge + chevron) over a body that mounts only when
 *  open. Reuses the sidebar's `.filterCard` shell. */
export function FilterSection({
  title,
  headingId,
  open,
  onToggle,
  activeCount = 0,
  children,
}: FilterSectionProps) {
  const bodyId = useId();
  return (
    <div className={styles.filterCard}>
      <button
        type="button"
        className={styles.sectionHeader}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <span id={headingId} className={styles.sectionTitle}>
          {title}
        </span>
        {activeCount > 0 && (
          <span className={styles.sectionCount}>{activeCount}</span>
        )}
        <span
          className={[styles.sectionChevron, open && styles.sectionChevronOpen]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        >
          <FiChevronDown />
        </span>
      </button>
      {/* Body stays mounted so its height can animate open AND closed. The
          grid-rows 0fr↔1fr trick collapses it without measuring; `inert` keeps
          the hidden content out of tab order and off screen readers. */}
      <div
        className={[styles.sectionBodyWrap, open && styles.sectionBodyWrapOpen]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          id={bodyId}
          className={styles.sectionBody}
          inert={!open || undefined}
        >
          {/* Padding lives on this inner element, NOT the collapsing grid item.
              A padded grid item keeps a non-zero minimum, so the 0fr track can't
              reach true zero and a sliver of the body peeks under the header;
              padding-free item + padded inner collapses cleanly. */}
          <div className={styles.sectionBodyInner}>{children}</div>
        </div>
      </div>
    </div>
  );
}
