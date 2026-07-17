import { FiAlertCircle, FiCheck, FiClock } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PUBLISH_REQUIREMENTS } from "./publishChecklist.data";
import styles from "./PublishChecklist.module.css";

interface PublishChecklistProps {
  /** The exact contract-C5 unmet codes from the publish gate. */
  unmet: string[];
  /**
   * True when the failure couldn't be read (e.g. live mode surfaced only an
   * error message, not the 422 `{unmet}` body). Every requirement then renders
   * as "still to check" instead of a definite pass/fail.
   */
  unknown?: boolean;
}

type RowState = "pass" | "fail" | "unknown";

/** i18n label-key indirection: `RowState` is local, ephemeral UI state (never
 *  persisted), but keys are used for consistency with the rest of the sweep. */
const STATE_LABEL_KEY: Record<RowState, string> = {
  pass: "subprofiles:checklist.statePass",
  fail: "subprofiles:checklist.stateFail",
  unknown: "subprofiles:checklist.stateUnknown",
};

/**
 * The completeness requirements an unlinked persona must meet to publish, each
 * with a pass / fail (or unknown) state and warm, actionable copy. Shown when a
 * publish attempt is rejected; the editor page renders the plum success panel
 * instead once every requirement is met.
 */
export function PublishChecklist({
  unmet,
  unknown = false,
}: PublishChecklistProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.card} role="status" aria-live="polite">
      <h3 className={styles.title}>
        <Translation
          i18nKey="subprofiles:checklist.title"
          components={{ em: <em /> }}
        />
      </h3>
      <p className={styles.lede}>
        {unknown
          ? t("subprofiles:checklist.ledeUnknown")
          : t("subprofiles:checklist.ledeDefault")}
      </p>
      <ul className={styles.list}>
        {PUBLISH_REQUIREMENTS.map((req) => {
          const failedCode = unknown
            ? null
            : (req.codes.find((c) => unmet.includes(c)) ?? null);
          const state: RowState = unknown
            ? "unknown"
            : failedCode
              ? "fail"
              : "pass";
          const detailKey = failedCode ? req.failKey[failedCode] : req.metKey;
          return (
            <li key={req.key} className={styles.row} data-state={state}>
              <span className={styles.icon} aria-hidden>
                {state === "pass" ? (
                  <FiCheck size={15} />
                ) : state === "fail" ? (
                  <FiAlertCircle size={15} />
                ) : (
                  <FiClock size={15} />
                )}
              </span>
              <span className={styles.text}>
                <span className={styles.rowTitle}>{t(req.titleKey)}</span>
                <span className={styles.rowHelp}>
                  {detailKey && t(detailKey)}
                </span>
              </span>
              <span className={styles.srOnly}>{t(STATE_LABEL_KEY[state])}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
