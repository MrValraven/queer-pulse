import type { IconType } from "react-icons";
import { FiAlertTriangle, FiHeart, FiInfo, FiX } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  ComposeHelpline,
  ComposeNudge,
  ComposeNudgeTone,
} from "./composeThread.types";
import styles from "./ComposeNudgeList.module.css";

// ── The advisory rows under the body ────────────────────────────────────────
// `composeNudges.ts` decides WHAT is raised; this file only says it out loud.
// Every row carries a catalog key plus its values, so nothing here builds a
// sentence.
//
// The three tones are deliberately quiet. A nudge is something the member
// reads while they are mid-thought, and a row that shouts costs more attention
// than the thing it is warning about. `help` is the calmest of the three on
// purpose: it is the crisis row, the one somebody in real trouble reads, so it
// gets jade (the colour this app uses for care), a heart, and helplines as
// large tappable rows. It must never read as an error about their writing.

const TONE_ICON: Record<ComposeNudgeTone, IconType> = {
  neutral: FiInfo,
  warn: FiAlertTriangle,
  help: FiHeart,
};

// Depends on the CSS-module import, so it stays in this file by convention.
const TONE_CLASS: Record<ComposeNudgeTone, string> = {
  neutral: styles.toneNeutral!,
  warn: styles.toneWarn!,
  help: styles.toneHelp!,
};

export interface ComposeNudgeListProps {
  /** Every advisory the draft currently raises, most urgent first. */
  nudges: readonly ComposeNudge[];
  /** Hides one dismissible row. Ignored by the hook for the rest. */
  onDismiss: (nudge: ComposeNudge) => void;
  /** Whether the doxxing row's checkbox is ticked. Ticking it is what clears
   *  the `unacknowledgedDoxxing` blocker. */
  isDoxxingAcknowledged: boolean;
  onAcknowledgeDoxxing: (isAcknowledged: boolean) => void;
}

export function ComposeNudgeList({
  nudges,
  onDismiss,
  isDoxxingAcknowledged,
  onAcknowledgeDoxxing,
}: ComposeNudgeListProps) {
  const { t } = useTranslation();
  if (nudges.length === 0) return null;
  return (
    <ul
      className={styles.list}
      aria-label={t("forum:composePage.nudge.listLabel")}
    >
      {nudges.map((nudge) => (
        <ComposeNudgeRow
          key={nudge.id}
          nudge={nudge}
          onDismiss={onDismiss}
          isDoxxingAcknowledged={isDoxxingAcknowledged}
          onAcknowledgeDoxxing={onAcknowledgeDoxxing}
        />
      ))}
    </ul>
  );
}

interface ComposeNudgeRowProps {
  nudge: ComposeNudge;
  onDismiss: (nudge: ComposeNudge) => void;
  isDoxxingAcknowledged: boolean;
  onAcknowledgeDoxxing: (isAcknowledged: boolean) => void;
}

function ComposeNudgeRow({
  nudge,
  onDismiss,
  isDoxxingAcknowledged,
  onAcknowledgeDoxxing,
}: ComposeNudgeRowProps) {
  const { t } = useTranslation();
  const ToneIcon = TONE_ICON[nudge.tone];
  return (
    <li className={`${styles.row} ${TONE_CLASS[nudge.tone]}`}>
      <ToneIcon className={styles.rowIcon} aria-hidden />
      <div className={styles.rowBody}>
        <p className={styles.rowText}>
          <strong className={styles.rowTitle}>
            {t(nudge.titleKey, nudge.values)}
          </strong>{" "}
          {t(nudge.bodyKey, nudge.values)}
        </p>
        {nudge.helplines && <HelplineList helplines={nudge.helplines} />}
        {nudge.requiresAcknowledgement && nudge.acknowledgementLabelKey && (
          <label className={styles.acknowledge}>
            <input
              type="checkbox"
              className={styles.acknowledgeBox}
              checked={isDoxxingAcknowledged}
              onChange={(event) => onAcknowledgeDoxxing(event.target.checked)}
            />
            <span>{t(nudge.acknowledgementLabelKey)}</span>
          </label>
        )}
      </div>
      {nudge.isDismissible && (
        <button
          type="button"
          className={styles.dismiss}
          onClick={() => onDismiss(nudge)}
          aria-label={t("forum:composePage.nudge.dismiss")}
        >
          <FiX aria-hidden />
        </button>
      )}
    </li>
  );
}

/**
 * The services that answer today. Each one is a `tel:` link so a phone dials
 * it in a single tap, and the number is printed in full beside the name so it
 * is readable and copyable on a desktop, where `tel:` does nothing.
 *
 * The number is dialled exactly as `composeNudges.ts` holds it; only the
 * spaces come out of the `href`, because a dialler reads those as digits.
 */
function HelplineList({
  helplines,
}: {
  helplines: readonly ComposeHelpline[];
}) {
  const { t } = useTranslation();
  return (
    <ul className={styles.helplines}>
      {helplines.map((helpline) => {
        const serviceName = t(helpline.nameKey);
        return (
          <li key={helpline.id}>
            <a
              className={styles.helpline}
              href={`tel:${helpline.number.replace(/\s+/g, "")}`}
              aria-label={t("forum:composePage.nudge.crisis.callAria", {
                service: serviceName,
                number: helpline.number,
              })}
            >
              <span className={styles.helplineName}>{serviceName}</span>
              <span className={styles.helplineNumber} aria-hidden>
                {helpline.number}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
