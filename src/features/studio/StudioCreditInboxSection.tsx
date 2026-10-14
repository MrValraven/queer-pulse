import { useId, type ReactNode, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { Translation } from "../../shared/i18n/Translation";
import type { StudioCreditInboxRowView } from "./api/studioDiscovery.adapters";
import { StudioCreditInboxRow } from "./StudioCreditInboxRow";
import css from "./StudioCredits.module.css";

/** Requests or Accepted: a heading that takes focus when a row leaves, the
 *  rows fading in and out, and an optional empty block. */
export function StudioCreditInboxSection({
  titleKey,
  rows,
  headingRef,
  emptyState,
  isBusy,
  onAccept,
  onDecline,
  onRemove,
}: {
  titleKey: string;
  rows: StudioCreditInboxRowView[];
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** Shown above the list while the list is empty. */
  emptyState?: ReactNode;
  isBusy: boolean;
  /** Requests pass Accept and Decline; Accepted passes Remove. */
  onAccept?: (row: StudioCreditInboxRowView) => void;
  onDecline?: (row: StudioCreditInboxRowView) => void;
  onRemove?: (row: StudioCreditInboxRowView) => void;
}) {
  const headingId = useId();
  return (
    <section className={css.section} aria-labelledby={headingId}>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={css.sectionTitle}
      >
        <Translation i18nKey={titleKey} components={{ em: <em /> }} />
      </h2>
      {emptyState}
      <ul className={css.rows}>
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <StudioCreditInboxRow
              key={row.id}
              row={row}
              isBusy={isBusy}
              onAccept={onAccept}
              onDecline={onDecline}
              onRemove={onRemove}
            />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
