import {
  FiAlertTriangle,
  FiCheck,
  FiClock,
  FiRotateCcw,
  FiInfo,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRovingRadioGroup } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import styles from "./AdminModerationPage.module.css";

export type AppealDecision = "uphold" | "overturn";

/** The decision tiles in the order the drawer renders them, so the radiogroup
 *  keyboard model can move between them by index. */
const APPEAL_DECISIONS: AppealDecision[] = ["uphold", "overturn"];

/**
 * The published decision deadline, at the top of the drawer (TS-11).
 *
 * §05 promises a member their appeal is decided within 7 days. Putting that
 * date in front of the moderator who is about to decide it is the cheapest way
 * to make the promise real: an overdue appeal says so plainly rather than
 * looking like every other row.
 */
export function AppealDeadlineSection({
  slaDueAt,
  isOverdue,
}: {
  slaDueAt: string | undefined;
  isOverdue: boolean | undefined;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // A demo-seeded or pre-deadline appeal carries no due date. Say nothing
  // rather than invent one: a deadline the software cannot stand behind is
  // worse than no deadline on screen.
  if (!slaDueAt) return null;

  const due = new Date(slaDueAt);
  return (
    <p
      className={[styles.appealDue, isOverdue && styles.appealDueLate]
        .filter(Boolean)
        .join(" ")}
    >
      {isOverdue ? <FiAlertTriangle aria-hidden /> : <FiClock aria-hidden />}{" "}
      {isOverdue
        ? t("admin:moderation.appeals.drawerOverdue", {
            date: fmt.date(due, { day: "numeric", month: "short" }),
          })
        : t("admin:moderation.appeals.drawerDue", {
            date: fmt.date(due, { day: "numeric", month: "short" }),
          })}
    </p>
  );
}

/** The uphold/overturn radiogroup, the reason note, and the transparency line
 *  — the interactive tail of the appeal drawer. */
export function AppealDecisionSection({
  decision,
  onDecide,
  reason,
  onReason,
  originalBy,
}: {
  decision: AppealDecision | null;
  onDecide: (decision: AppealDecision) => void;
  reason: string;
  onReason: (reason: string) => void;
  originalBy: string;
}) {
  const { t } = useTranslation();
  // The two tiles carry different "chosen" classes (uphold reads jade,
  // overturn reads coral), which is why this group runs on the shared keyboard
  // hook directly rather than through `RadioCardGroup`'s single
  // `checkedClassName`. They are radios, so they announce and behave as one
  // choice: previously they were `aria-pressed` toggles inside a radiogroup,
  // with no arrow keys and two tab stops.
  const { getRadioProps } = useRovingRadioGroup({
    optionCount: APPEAL_DECISIONS.length,
    checkedIndex: decision ? APPEAL_DECISIONS.indexOf(decision) : -1,
    onSelect: (index) => {
      const nextDecision = APPEAL_DECISIONS[index];
      if (nextDecision) onDecide(nextDecision);
    },
  });

  return (
    <section className={styles.dSec}>
      <h3 className={styles.dSecLabel}>
        {t("admin:moderation.appealDrawer.decisionTitle")}
      </h3>
      <div
        className={styles.appealDecision}
        role="radiogroup"
        aria-label={t("admin:moderation.appealDrawer.decisionAriaLabel")}
      >
        <button
          {...getRadioProps(0)}
          type="button"
          role="radio"
          aria-checked={decision === "uphold"}
          className={[
            styles.decOption,
            decision === "uphold" && styles.decUpholdOn,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onDecide("uphold")}
        >
          <span className={styles.decIco} aria-hidden>
            <FiCheck />
          </span>
          <span className={styles.decTx}>
            <span className={styles.decTitle}>
              {t("admin:moderation.appealDrawer.uphold")}
            </span>
            <span className={styles.decSub}>
              {t("admin:moderation.appealDrawer.upholdSub")}
            </span>
          </span>
        </button>
        <button
          {...getRadioProps(1)}
          type="button"
          role="radio"
          aria-checked={decision === "overturn"}
          className={[
            styles.decOption,
            decision === "overturn" && styles.decOverturnOn,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onDecide("overturn")}
        >
          <span className={styles.decIco} aria-hidden>
            <FiRotateCcw />
          </span>
          <span className={styles.decTx}>
            <span className={styles.decTitle}>
              {t("admin:moderation.appealDrawer.overturn")}
            </span>
            <span className={styles.decSub}>
              {t("admin:moderation.appealDrawer.overturnSub")}
            </span>
          </span>
        </button>
      </div>

      <textarea
        aria-label={t("admin:moderation.appealDrawer.reasonAriaLabel")}
        className={styles.dNote}
        rows={3}
        placeholder={t("admin:moderation.appealDrawer.reasonPlaceholder")}
        value={reason}
        onChange={(e) => onReason(e.target.value)}
      />
      <p className={styles.dTransparency}>
        <FiInfo aria-hidden />{" "}
        {t("admin:moderation.appealDrawer.transparency", { name: originalBy })}
      </p>
    </section>
  );
}
