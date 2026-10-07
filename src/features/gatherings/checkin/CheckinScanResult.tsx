import type { Ref } from "react";
import type { IconType } from "react-icons";
import { FiCheckCircle, FiClock, FiX, FiXCircle } from "react-icons/fi";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { keepOnFrameLoop } from "./checkinMotion";
import type { ScanOutcome } from "./scanOutcome";
import styles from "./CheckinScanResult.module.css";
import viewfinderStyles from "./CheckinViewfinder.module.css";

type ShownOutcome = Exclude<ScanOutcome, { kind: "closed" }>;
/** What the card can show: a scan outcome, or the confirmation after Undo. */
export type ShownResult = ShownOutcome | { kind: "undone" };

const TONE_CLASS: Record<ShownResult["kind"], string | undefined> = {
  undone: styles.toneJade,
  welcome: styles.toneJade,
  repeat: styles.toneAmber,
  refused: styles.toneDanger,
};

const TONE_ICON: Record<ShownResult["kind"], IconType> = {
  undone: FiCheckCircle,
  welcome: FiCheckCircle,
  repeat: FiClock,
  refused: FiXCircle,
};

const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;
const REDUCED_FADE = { duration: 0.12 } as const;

/** The card that slides up over the viewfinder after each scan. */
export function CheckinScanResult({
  outcome,
  onDismiss,
  onUndo,
  ref,
}: {
  ref?: Ref<HTMLDivElement>;
  outcome: ShownResult;
  onDismiss: () => void;
  onUndo: (memberSlug: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const ToneIcon = TONE_ICON[outcome.kind];
  const guestCount =
    outcome.kind === "welcome" ? (outcome.attendee.guestCount ?? 0) : 0;

  return (
    <m.div
      ref={ref}
      className={`${styles.result} ${viewfinderStyles.result} ${TONE_CLASS[outcome.kind] ?? ""}`}
      onUpdate={keepOnFrameLoop}
      initial={reducedMotion ? { opacity: 0 } : { y: "100%", opacity: 0 }}
      animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { y: "100%", opacity: 0 }}
      transition={reducedMotion ? REDUCED_FADE : SPRING}
    >
      <span className={styles.resultIcon} aria-hidden="true">
        <ToneIcon />
      </span>
      <div className={styles.resultBody}>
        {outcome.kind === "undone" ? (
          <p className={styles.resultTitle}>
            {t("gatherings:door.undoneToast")}
          </p>
        ) : null}
        {outcome.kind === "refused" ? (
          <>
            <p className={styles.resultTitle}>
              {t("gatherings:checkin.scan.refusedTitle")}
            </p>
            <p className={styles.resultLine}>{outcome.message}</p>
          </>
        ) : null}
        {outcome.kind === "welcome" ? (
          <>
            <p className={styles.resultTitle}>
              {t("gatherings:checkin.scan.welcome", {
                name: outcome.attendee.name,
              })}
            </p>
            {outcome.attendee.pronouns ? (
              <p className={styles.resultLine}>{outcome.attendee.pronouns}</p>
            ) : null}
            {guestCount > 0 ? (
              <p className={styles.resultLine}>
                {t("gatherings:checkin.row.guests", { count: guestCount })}
              </p>
            ) : null}
            {outcome.attendee.accessNeeds ? (
              <p className={`${styles.resultLine} ${styles.resultLineClamped}`}>
                {outcome.attendee.accessNeeds}
              </p>
            ) : null}
            <button
              type="button"
              className={styles.resultUndo}
              onClick={() => {
                onUndo(outcome.attendee.slug);
              }}
            >
              {t("gatherings:door.undoCta")}
            </button>
          </>
        ) : null}
        {outcome.kind === "repeat" ? (
          <p className={styles.resultTitle}>
            {t("gatherings:checkin.scan.repeat", {
              name: outcome.attendee.name,
              time: outcome.attendee.checkedInAt
                ? fmt.time(outcome.attendee.checkedInAt)
                : "",
            })}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className={styles.resultClose}
        aria-label={t("gatherings:checkin.scan.dismiss")}
        onClick={onDismiss}
      >
        <FiX aria-hidden="true" />
      </button>
    </m.div>
  );
}
