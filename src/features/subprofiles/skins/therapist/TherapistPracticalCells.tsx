import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiClock } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { resolveFeeChoice } from "./therapistFeeOptions";
import type { TherapistView } from "./therapistView";
import { RevealBlock, RevealList, RevealRow } from "./TherapistReveal";
import { useRevealList } from "./revealKeys";
import { useStableRowKeys } from "./useStableRowKeys";
import styles from "./TherapistPractical.module.css";

interface PracticalCellProps {
  icon: IconType;
  title: string;
  /** Spans the whole grid row (calculator, getting there, accessibility). */
  isWide?: boolean;
  /** Extra layout class from this module (e.g. the availability cell). */
  className?: string;
  children: ReactNode;
}

/** One tinted cell of the practical grid: small-caps title, then content. */
export function PracticalCell({
  icon: Icon,
  title,
  isWide = false,
  className,
  children,
}: PracticalCellProps) {
  const cellClassName = [styles.cell, isWide && styles.wide, className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cellClassName}>
      <h3 className={styles.cellTitle}>
        <Icon className={styles.cellIcon} aria-hidden="true" />
        {title}
      </h3>
      {children}
    </div>
  );
}

/** The gap between a `.rows` list's lines, in CSS pixels. */
const ROWS_GAP = 2;
/** A cell's own gap between its blocks (`.cell`, `.availabilityFacts`). */
export const CELL_GAP = 4;

/** A label/value line inside a cell's `<dl>`. As a direct child of
 *  `RevealList` it grows in and folds away. Anywhere else it is a plain row:
 *  a `RevealBlock` around it would otherwise fold it a second time. */
export function PracticalRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const isInRevealList = useRevealList() !== null;
  const cells = (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
  if (!isInRevealList) return <div className={styles.row}>{cells}</div>;
  return (
    <RevealRow className={styles.row} parentGap={ROWS_GAP}>
      {cells}
    </RevealRow>
  );
}

const SESSION_MODE_KEY = {
  both: "subprofiles:therapist.practical.sessions.modeBoth",
  onlineOnly: "subprofiles:therapist.practical.sessions.modeOnline",
  inPerson: "subprofiles:therapist.practical.sessions.modeInPerson",
} as const;

const ONLINE_ANSWER_KEY = {
  yes: "subprofiles:therapist.practical.sessions.onlineVideo",
  no: "subprofiles:therapist.practical.sessions.onlineNo",
  "": "subprofiles:therapist.practical.sessions.onlineUnknown",
} as const;

function sessionModeKey(view: TherapistView): string | null {
  if (view.hasInPerson && view.hasOnlineSessions) return SESSION_MODE_KEY.both;
  if (view.isOnlineOnly) return SESSION_MODE_KEY.onlineOnly;
  if (view.hasInPerson) return SESSION_MODE_KEY.inPerson;
  return null;
}

export function SessionsCell({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const firstLength = view.feeSchedule[0]?.label ?? "";
  const modeKey = sessionModeKey(view);
  const frequency = resolveFeeChoice(
    t,
    "frequency",
    view.fees?.frequency ?? "",
  );
  const venueText = view.venue
    ? [view.venue.name, ...view.venue.lines].filter(Boolean).join(", ")
    : "";
  // Keyed by the typed label: a row keeps its key while the owner edits it.
  const scheduleKeys = useStableRowKeys(
    view.feeSchedule.map((line) => line.label),
  );
  return (
    <PracticalCell
      icon={FiClock}
      title={t("subprofiles:therapist.practical.sessions.title")}
    >
      <RevealBlock isShown={firstLength !== ""} parentGap={CELL_GAP}>
        <p className={styles.big}>
          {firstLength}
          {modeKey && <small>{t(modeKey)}</small>}
        </p>
      </RevealBlock>
      <dl className={styles.rows}>
        <RevealList>
          {view.feeSchedule.map((line, index) => (
            <PracticalRow
              key={scheduleKeys[index]}
              label={line.label}
              value={line.value}
            />
          ))}
          {frequency && (
            <PracticalRow
              key="frequency"
              label={t("subprofiles:therapist.practical.sessions.frequency")}
              value={frequency}
            />
          )}
          {venueText && (
            <PracticalRow
              key="venue"
              label={t("subprofiles:therapist.practical.sessions.inPerson")}
              value={venueText}
            />
          )}
          <PracticalRow
            key="online"
            label={t("subprofiles:therapist.practical.sessions.online")}
            value={t(ONLINE_ANSWER_KEY[view.online])}
          />
        </RevealList>
      </dl>
      <RevealBlock
        isShown={view.isOnlineOnly && view.timezone !== ""}
        parentGap={CELL_GAP}
      >
        <p className={styles.hint}>{view.timezone}</p>
      </RevealBlock>
    </PracticalCell>
  );
}
