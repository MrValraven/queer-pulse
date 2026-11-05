import { useEffect, useId, useRef } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiActivity } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadDTO, LeadEntryDTO } from "./api/leads.types";
import { leadHistoryLineOf, type LeadHistoryLine } from "./leadHistory.model";
import { LeadNoteComposer } from "./LeadNoteComposer";
import { LeadEntryTime, LeadNoteItem } from "./LeadNoteItem";
import adminStyles from "./AdminLead.module.css";
import styles from "./LeadHistory.module.css";

const ENTRY_SECONDS = 0.25;
const ENTRY_EASE = [0.22, 0.68, 0.16, 1] as const;

/** A history entry ready to draw: a note (no line), or a stage, persona
 *  or created entry with its words. A line the model can't word is left
 *  out. */
interface HistoryRow {
  entry: LeadEntryDTO;
  line: LeadHistoryLine | null;
}

/** A stage, persona or created entry: one quiet line with its time. */
function LeadHistoryLineItem({
  entry,
  line,
}: {
  entry: LeadEntryDTO;
  line: LeadHistoryLine;
}) {
  const { t } = useTranslation();
  return (
    <p className={styles.line}>
      <FiActivity className={styles.lineIcon} aria-hidden />
      <span className={styles.lineText}>{t(line.key, line.values)}</span>
      <span className={styles.lineTime}>
        <LeadEntryTime at={entry.createdAt} />
      </span>
    </p>
  );
}

/** Focus counts as lost when it sits on the page itself, or inside the
 *  list on an entry that is no longer in the history (the note on its way
 *  out, where the closing dialog hands focus back to Delete note). */
function isHistoryFocusLost(
  list: HTMLOListElement | null,
  presentEntryIds: ReadonlySet<string>,
): boolean {
  const focused = document.activeElement;
  if (focused === null || focused === document.body) return true;
  if (list === null || !list.contains(focused)) return false;
  const entryId = focused
    .closest("[data-entry-id]")
    ?.getAttribute("data-entry-id");
  return entryId == null || !presentEntryIds.has(entryId);
}

/**
 * After a note leaves (Delete note confirmed), focus that sat on its
 * controls has nowhere to go; it lands on the new note box. Motion reports
 * the exit before React removes the entry, so the check waits a frame,
 * past that removal. The composer id follows `LeadNoteComposer`'s.
 */
function useComposerFocusAfterExit(leadId: string, entryIds: string[]) {
  const listRef = useRef<HTMLOListElement>(null);
  const presentEntryIdsRef = useRef<ReadonlySet<string>>(new Set(entryIds));
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    presentEntryIdsRef.current = new Set(entryIds);
  });

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const handleExitComplete = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      if (!isHistoryFocusLost(listRef.current, presentEntryIdsRef.current)) {
        return;
      }
      document.getElementById(`lead-${leadId}-new-note`)?.focus();
    });
  };

  return { listRef, handleExitComplete };
}

/**
 * The lead's history: the new note box, then every entry newest first.
 * Notes are cards with their author; stage, persona and created entries
 * read as one quiet line. Entries slide into place as notes come and go.
 */
export function LeadHistoryPanel({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const duration = reducedMotion ? 0 : ENTRY_SECONDS;
  const transition = { duration, ease: ENTRY_EASE };
  const rows = lead.entries.flatMap((entry): HistoryRow[] => {
    if (entry.kind === "note") return [{ entry, line: null }];
    const line = leadHistoryLineOf(entry, (key) => t(key));
    return line === null ? [] : [{ entry, line }];
  });
  const { listRef, handleExitComplete } = useComposerFocusAfterExit(
    lead.id,
    rows.map(({ entry }) => entry.id),
  );

  return (
    <section className={adminStyles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={adminStyles.sectionHeading}>
        {t("admin:leads.history.heading")}
      </h2>
      <LeadNoteComposer leadId={lead.id} />
      <ol ref={listRef} className={styles.list} aria-labelledby={headingId}>
        {/* A leaving note pops out of the flow, so the entries below glide
            up as it fades. */}
        <AnimatePresence
          initial={false}
          mode="popLayout"
          onExitComplete={handleExitComplete}
        >
          {rows.map(({ entry, line }) => (
            <m.li
              key={entry.id}
              layout="position"
              className={styles.item}
              data-kind={entry.kind}
              data-entry-id={entry.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration, ease: ENTRY_EASE } }}
              transition={transition}
            >
              {line === null ? (
                <LeadNoteItem leadId={lead.id} entry={entry} />
              ) : (
                <LeadHistoryLineItem entry={entry} line={line} />
              )}
            </m.li>
          ))}
        </AnimatePresence>
      </ol>
    </section>
  );
}
