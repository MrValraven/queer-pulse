import { FiCheck, FiRotateCcw, FiInfo } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminModerationPage.module.css";

export type AppealDecision = "uphold" | "overturn";

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
          type="button"
          aria-pressed={decision === "uphold"}
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
          type="button"
          aria-pressed={decision === "overturn"}
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
