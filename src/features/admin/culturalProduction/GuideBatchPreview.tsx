import { useId, useRef } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertTriangle, FiClock, FiUser, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import {
  leadStaffInitialsOf,
  leadStaffToneOf,
} from "../leads/leadAssignees.model";
import { AdminAvatar, AdminNotice } from "../ui";
import type { CulturalStaffSummaryDTO } from "./api/culturalProduction.types";
import type { GuideBatchPreviewResult } from "./guideBatch.model";
import styles from "./GuideBatch.module.css";

const DUE_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
};

/**
 * The tasks a batch would create, one row per checklist step with its due
 * day, under a warning when some of those days are already past. It folds
 * open once the event date is set; while it folds away it keeps showing the
 * last preview, since the Collapse holds its outgoing children.
 */
export function GuideBatchPreview({
  preview,
}: {
  preview: GuideBatchPreviewResult | null;
}) {
  const { t, language } = useTranslation();
  const headingId = useId();
  const pastCount = preview?.pastCount ?? 0;

  return (
    <Collapse isOpen={preview !== null}>
      {preview !== null && (
        <section className={styles.preview} aria-labelledby={headingId}>
          <h4 id={headingId} className={styles.previewHeading}>
            {t("admin:culturalProduction.batch.previewHeading")}
          </h4>
          <Collapse isOpen={pastCount > 0}>
            <div className={styles.pastNotice}>
              <AdminNotice tone="warn" liveRole="status">
                {t("admin:culturalProduction.batch.previewPast", {
                  count: pastCount,
                })}
              </AdminNotice>
            </div>
          </Collapse>
          <ol className={styles.previewList}>
            {preview.rows.map((row) => (
              <li
                key={row.stepId}
                className={[styles.previewRow, row.isPast && styles.isPast]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className={styles.previewText}>{row.text}</span>
                <span className={styles.previewDue}>
                  {row.isPast ? (
                    <FiAlertTriangle className={styles.dueIcon} aria-hidden />
                  ) : (
                    <FiClock className={styles.dueIcon} aria-hidden />
                  )}
                  {row.dueOn === null
                    ? t("admin:culturalProduction.batch.previewNoDue")
                    : t("admin:culturalProduction.batch.previewDue", {
                        date: formatDate(row.dueOn, language, DUE_DATE_OPTIONS),
                      })}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </Collapse>
  );
}

const CHIP_MOTION_SECONDS = 0.2;
const CHIP_MOTION_EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * The staff every task of the batch goes to, one pill each with its avatar,
 * the name ("You" for the viewer) and a remove button. A refusal that names
 * a person marks that pill and points its remove button at the refusal
 * line, so the line reads with the name. Pills fade in and out. Removing
 * one moves focus to the next pill's remove button, else the previous
 * one's, else `onEmptied` (the caller focuses its Assign staff trigger).
 */
export function GuideBatchAssigneeChips({
  people,
  viewerId,
  refusedPersonId,
  refusalId,
  isBusy,
  onRemove,
  onEmptied,
}: {
  people: readonly CulturalStaffSummaryDTO[];
  viewerId: string | null;
  refusedPersonId: string | null;
  refusalId: string;
  isBusy: boolean;
  onRemove: (person: CulturalStaffSummaryDTO) => void;
  onEmptied: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const transition = {
    duration: reducedMotion ? 0 : CHIP_MOTION_SECONDS,
    ease: CHIP_MOTION_EASE,
  };
  const hiddenScale = reducedMotion ? 1 : 0.96;
  const removeButtonsRef = useRef(new Map<string, HTMLButtonElement>());

  function remove(person: CulturalStaffSummaryDTO, index: number) {
    if (isBusy) return;
    const neighbour = people[index + 1] ?? people[index - 1] ?? null;
    onRemove(person);
    const neighbourButton =
      neighbour === null
        ? undefined
        : removeButtonsRef.current.get(neighbour.id);
    if (neighbourButton === undefined) onEmptied();
    else neighbourButton.focus();
  }

  return (
    <ul className={styles.chipList}>
      <AnimatePresence initial={false}>
        {people.map((person, index) => {
          const isViewer = person.id === viewerId;
          const isRefused = person.id === refusedPersonId;
          const initials = leadStaffInitialsOf(person.displayName);
          return (
            <m.li
              key={person.id}
              layout="position"
              className={styles.chipItem}
              initial={{ opacity: 0, scale: hiddenScale }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: hiddenScale }}
              transition={transition}
            >
              <span
                className={[styles.chip, isRefused && styles.isRefused]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className={styles.chipAvatar} aria-hidden>
                  <AdminAvatar
                    size="sm"
                    src={person.avatarUrl ?? undefined}
                    alt=""
                    initials={initials === "" ? <FiUser /> : initials}
                    tone={leadStaffToneOf(person.id)}
                  />
                </span>
                <span className={styles.chipName}>
                  {isViewer
                    ? t("admin:culturalProduction.staff.you")
                    : person.displayName}
                </span>
                <Button
                  variant="quiet"
                  size="sm"
                  className={styles.removeButton}
                  aria-label={
                    isViewer
                      ? t("admin:culturalProduction.staff.unassignSelfAria")
                      : t("admin:culturalProduction.staff.unassignAria", {
                          name: person.displayName,
                        })
                  }
                  aria-describedby={isRefused ? refusalId : undefined}
                  aria-disabled={isBusy || undefined}
                  ref={(button: HTMLButtonElement | null) => {
                    if (button === null) return;
                    removeButtonsRef.current.set(person.id, button);
                    return () => {
                      removeButtonsRef.current.delete(person.id);
                    };
                  }}
                  onClick={() => remove(person, index)}
                >
                  <FiX className={styles.removeIcon} aria-hidden />
                </Button>
              </span>
            </m.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
