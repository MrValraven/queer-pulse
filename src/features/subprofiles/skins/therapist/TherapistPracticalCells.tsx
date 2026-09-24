import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiClock, FiShield } from "react-icons/fi";
import type { Language, TFunction } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  feeChoiceInListKey,
  matchFeeChoice,
  resolveFeeChoice,
} from "./therapistFeeOptions";
import type { TherapistView } from "./therapistView";
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

/** A label/value line inside a cell's `<dl>`. */
export function PracticalRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
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
  return (
    <PracticalCell
      icon={FiClock}
      title={t("subprofiles:therapist.practical.sessions.title")}
    >
      {firstLength && (
        <p className={styles.big}>
          {firstLength}
          {modeKey && <small>{t(modeKey)}</small>}
        </p>
      )}
      <dl className={styles.rows}>
        {view.feeSchedule.map((line, index) => (
          <PracticalRow
            key={`${line.label}-${index}`}
            label={line.label}
            value={line.value}
          />
        ))}
        {frequency && (
          <PracticalRow
            label={t("subprofiles:therapist.practical.sessions.frequency")}
            value={frequency}
          />
        )}
        {venueText && (
          <PracticalRow
            label={t("subprofiles:therapist.practical.sessions.inPerson")}
            value={venueText}
          />
        )}
        <PracticalRow
          label={t("subprofiles:therapist.practical.sessions.online")}
          value={t(ONLINE_ANSWER_KEY[view.online])}
        />
      </dl>
      {view.isOnlineOnly && view.timezone && (
        <p className={styles.hint}>{view.timezone}</p>
      )}
    </PracticalCell>
  );
}

/** The chosen payment methods as one phrase in the reader's language ("MB
 *  WAY, bank transfer or card"). Known methods use their in-list label, other
 *  entries stay as stored, and only the phrase's first letter is capitalised.
 *  British English keeps the list free of an Oxford comma. Falls back to the
 *  older payment text. */
function paymentText(
  t: TFunction,
  language: Language,
  fees: TherapistView["fees"],
): string {
  const labels = (fees?.paymentMethods ?? [])
    .map((method) => {
      const choice = matchFeeChoice(t, "paymentMethods", method);
      return choice ? t(feeChoiceInListKey(choice)) : method.trim();
    })
    .filter(Boolean);
  if (labels.length === 0) return fees?.payment ?? "";
  const locale = language === "pt" ? "pt-PT" : "en-GB";
  const phrase = new Intl.ListFormat(locale, {
    type: "disjunction",
  }).format(labels);
  return phrase.charAt(0).toLocaleUpperCase(locale) + phrase.slice(1);
}

/** The notice ("24 hours' notice") then the owner's note, as one line. A
 *  full stop joins them unless the notice already ends a sentence. */
function cancellationText(t: TFunction, fees: TherapistView["fees"]): string {
  const notice = resolveFeeChoice(
    t,
    "cancellationNotice",
    fees?.cancellationNotice ?? "",
  );
  const note = fees?.cancellation ?? "";
  if (!notice || !note) return notice || note;
  const isSentenceEnded = /[.!?…]$/.test(notice);
  return `${notice}${isSentenceEnded ? " " : ". "}${note}`;
}

export function SmallPrintCell({ view }: { view: TherapistView }) {
  const { t, language } = useTranslation();
  const fees = view.fees;
  // Each key is also the row's heading key under `smallPrint.`.
  const rows: { key: string; value: string }[] = [
    {
      key: "receiptTime",
      value: resolveFeeChoice(t, "receiptTime", fees?.receiptTime ?? ""),
    },
    { key: "payment", value: paymentText(t, language, fees) },
    { key: "cancellation", value: cancellationText(t, fees) },
  ].filter((row) => row.value !== "");
  const receipts = fees?.receipts ?? "";
  return (
    <PracticalCell
      icon={FiShield}
      title={t("subprofiles:therapist.practical.smallPrint.title")}
    >
      {!receipts && rows.length === 0 && (
        <p className={styles.missing}>
          {t("subprofiles:therapist.practical.smallPrint.unknown")}
        </p>
      )}
      {receipts && <p className={styles.soloLine}>{receipts}</p>}
      {rows.length > 0 && (
        <dl className={styles.rows}>
          {rows.map((row) => (
            <PracticalRow
              key={row.key}
              label={t(`subprofiles:therapist.practical.smallPrint.${row.key}`)}
              value={row.value}
            />
          ))}
        </dl>
      )}
    </PracticalCell>
  );
}
