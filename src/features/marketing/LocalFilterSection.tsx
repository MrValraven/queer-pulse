import { useId, type ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import styles from "./LocalFilterSection.module.css";

interface LocalFilterSectionProps {
  title: string;
  /** Put on the title text, so the group inside can be `aria-labelledby` it. */
  headingId: string;
  isOpen: boolean;
  onToggle: () => void;
  /** Count of active selections in this group; a small badge shows when > 0. */
  activeCount?: number;
  children: ReactNode;
}

/**
 * One collapsible filter group in the Local directory's desktop sidebar, the
 * same row the members directory uses: a full-width header button (title,
 * an active-count badge when something inside is on, and a chevron) over a
 * body that eases open and shut.
 */
export function LocalFilterSection({
  title,
  headingId,
  isOpen,
  onToggle,
  activeCount = 0,
  children,
}: LocalFilterSectionProps) {
  const bodyId = useId();
  const fmt = useFormat();
  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <span id={headingId} className={styles.sectionTitle}>
          {title}
        </span>
        {activeCount > 0 && (
          <span className={styles.sectionCount}>
            <RollingNumber
              value={fmt.number(activeCount)}
              numericValue={activeCount}
            />
          </span>
        )}
        <span
          className={[
            styles.sectionChevron,
            isOpen && styles.sectionChevronOpen,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        >
          <FiChevronDown />
        </span>
      </button>
      {/* The body stays mounted so its height can animate open and shut. The
          grid rows ease between 0fr and 1fr, so nothing is measured; `inert`
          keeps the shut body out of the tab order and away from screen
          readers. */}
      <div
        className={[
          styles.sectionBodyWrap,
          isOpen && styles.sectionBodyWrapOpen,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          id={bodyId}
          className={styles.sectionBody}
          inert={!isOpen || undefined}
        >
          {/* The padding lives on this inner element. A padded grid item
              keeps a minimum height, so the 0fr track could not reach zero
              and a sliver of the body would show under the header. */}
          <div className={styles.sectionBodyInner}>{children}</div>
        </div>
      </div>
    </div>
  );
}
