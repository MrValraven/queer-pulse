import { useId, type ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useFormat } from "../../i18n/format";
import { AnimatedCountBadge } from "./AnimatedCountBadge";
import styles from "./FilterPage.module.css";

/** The header button's flex gap (`.sectionHeader`), which the badge slot
 *  swallows while it is closed. */
const SECTION_HEADER_GAP_PX = 10;

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

/** A single collapsible filter group: a full-width header button (title +
 *  optional active-count badge + chevron) over a body that eases open and
 *  shut. A page renders one per group inside `FilterSidebarPanel`, with
 *  `open` / `onToggle` from `useFilterPageState`'s `sectionsOpen` and
 *  `toggleSection`, and `FilterOptionRow`s or a ChipSelect as the body. */
export function FilterSection({
  title,
  headingId,
  open,
  onToggle,
  activeCount = 0,
  children,
}: FilterSectionProps) {
  const bodyId = useId();
  const fmt = useFormat();
  return (
    <div className={styles.filterCard}>
      <button
        type="button"
        className={styles.sectionHeader}
        data-filter-section-header=""
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <span id={headingId} className={styles.sectionTitle}>
          {title}
        </span>
        <AnimatedCountBadge
          count={activeCount}
          label={fmt.number(activeCount)}
          slotClassName={styles.sectionCountSlot}
          badgeClassName={styles.sectionCount}
          hostGap={SECTION_HEADER_GAP_PX}
        />
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
          {/* Padding lives on this inner element, inside the collapsing grid
              item. A padded grid item keeps a non-zero minimum, so the 0fr
              track can't reach true zero and a sliver of the body peeks under
              the header; padding-free item + padded inner collapses cleanly. */}
          <div className={styles.sectionBodyInner}>{children}</div>
        </div>
      </div>
    </div>
  );
}
