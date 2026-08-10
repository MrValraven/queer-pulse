import type { IconType } from "react-icons";
import { FiAlertCircle, FiCheck, FiClock, FiStar } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { POLISH_NUDGES, PUBLISH_REQUIREMENTS } from "./publishChecklist.data";
import type { SubprofileView } from "./api/subprofiles.adapters";
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

const STATE_ICON: Record<RowState, IconType> = {
  pass: FiCheck,
  fail: FiAlertCircle,
  unknown: FiClock,
};

/**
 * The completeness requirements an unlinked persona must meet to publish, each
 * with a pass / fail (or unknown) state and warm, actionable copy. Shown when a
 * publish attempt is rejected; the editor page renders the plum success panel
 * instead once every requirement is met.
 *
 * Visual: the global `.ready`/`.ready-item` icon-circle rows (Task 1's editor
 * CSS port) plus a `.meter` progress bar for passed/total — this is still the
 * SAME server-authoritative data (real `unmet` codes from a publish attempt),
 * only restyled. It's deliberately a different widget from the Publish pane's
 * `SideReadinessRing` above it (client-only estimate, no blocked-language
 * check) — see that component's usage in `SubprofilePublishPanel`.
 */
export function PublishChecklist({
  unmet,
  unknown = false,
}: PublishChecklistProps) {
  const { t } = useTranslation();
  const rows = PUBLISH_REQUIREMENTS.map((req) => {
    const failedCode = unknown
      ? null
      : (req.codes.find((code) => unmet.includes(code)) ?? null);
    const state: RowState = unknown ? "unknown" : failedCode ? "fail" : "pass";
    const detailKey = failedCode ? req.failKey[failedCode] : req.metKey;
    return { ...req, state, detailKey };
  });
  const passedCount = rows.filter((row) => row.state === "pass").length;
  const meterPct = Math.round((passedCount / rows.length) * 100);

  return (
    <div role="status" aria-live="polite">
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

      <div className={styles.meterRow}>
        <div
          className={`meter ${styles.meterBar}`}
          role="progressbar"
          aria-valuenow={meterPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("subprofiles:checklist.meterAria", {
            passed: passedCount,
            total: rows.length,
          })}
        >
          <i style={{ width: `${meterPct}%` }} />
        </div>
        <span className={styles.meterLabel}>
          {t("subprofiles:checklist.meterLabel", {
            passed: passedCount,
            total: rows.length,
          })}
        </span>
      </div>

      <ul className={`ready ${styles.list}`}>
        {rows.map((row) => {
          const Icon = STATE_ICON[row.state];
          return (
            <li
              key={row.key}
              className={
                row.state === "pass" ? "ready-item done" : "ready-item"
              }
            >
              <i aria-hidden>
                <Icon size={11} />
              </i>
              <span className={styles.text}>
                <span className={styles.rowTitle}>{t(row.titleKey)}</span>
                <span className={styles.rowHelp}>
                  {row.detailKey && t(row.detailKey)}
                </span>
              </span>
              <span className={styles.srOnly}>
                {t(STATE_LABEL_KEY[row.state])}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Optional, non-blocking "polish" nudges — visually + semantically separate
 * from the required checklist above. They never carry an `unmet` code, never
 * touch the backend, and never affect whether the publish button is enabled;
 * they're just a muted, friendly prompt to round out the persona. Renders a
 * short "looking polished" line once every nudge is satisfied.
 */
export function SubprofilePolishList({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const pendingNudges = POLISH_NUDGES.filter(
    (nudge) => !nudge.isSatisfied(subprofile),
  );

  if (pendingNudges.length === 0) {
    return (
      <p className={styles.polishDone}>
        <FiStar size={13} aria-hidden />
        {t("subprofiles:checklist.polishDone")}
      </p>
    );
  }

  return (
    <div className={styles.polish}>
      <h4 className={styles.polishTitle}>
        {t("subprofiles:checklist.polishTitle")}
      </h4>
      <ul className={styles.polishList}>
        {pendingNudges.map((nudge) => (
          <li key={nudge.key} className={styles.polishRow}>
            {t(nudge.titleKey)}
          </li>
        ))}
      </ul>
    </div>
  );
}
