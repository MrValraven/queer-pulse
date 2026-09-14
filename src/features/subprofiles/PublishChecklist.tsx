import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiStar,
} from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { POLISH_NUDGES, requirementsFor } from "./publishChecklist.data";
import type { PublishRequirement } from "./publishChecklist.data";
import type { LinkVisibility } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { EditorFieldTarget } from "./useEditorFieldJump";
import styles from "./PublishChecklist.module.css";

/** The outcome of the last publish attempt, if one has been made since the
 *  persona was last edited. `unknown` covers a live-mode rejection that carried
 *  only an error message, never the 422 `{unmet}` body. */
export interface PublishAttempt {
  unmet: string[];
  unknown: boolean;
}

interface PublishChecklistProps {
  /**
   * Live per-requirement verdicts off the editor's working state
   * (`evaluatePublishRequirements`): the failing contract-C5 code, or `null`
   * once met. A requirement missing from this map is not client-checkable.
   */
  clientCodes: Record<string, string | null>;
  /** Last publish attempt, or `null` when none has been made yet. */
  attempt: PublishAttempt | null;
  /** Decides which requirements apply: a linked persona claims no handle. */
  linkVisibility: LinkVisibility;
  /** Opens the pane an unmet requirement lives on and flashes its field. */
  onJump: (target: EditorFieldTarget) => void;
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

interface ChecklistRow extends PublishRequirement {
  state: RowState;
  detailKey: string | undefined;
}

/**
 * Resolves ONE requirement against the two sources that know anything about it.
 *
 * A real publish attempt is authoritative and wins: it ran the same rules
 * server-side, and it is the only thing that can speak for `language` or a
 * taken handle. Below that sits the live client verdict, which is what lets the
 * list be honest BEFORE any attempt (and what gates the Publish button). A
 * requirement neither source can answer is "still to check" rather than a
 * guessed pass, so the list never claims a persona is clear of something it has
 * not actually looked at.
 *
 * Attempts are dropped the moment the editor goes dirty (see
 * `SubprofilePublishPanel`), so a server code here always refers to the state
 * now on screen.
 */
function resolveRow(
  requirement: PublishRequirement,
  clientCodes: Record<string, string | null>,
  attempt: PublishAttempt | null,
): ChecklistRow {
  const serverCode =
    attempt && !attempt.unknown
      ? (requirement.codes.find((code) => attempt.unmet.includes(code)) ?? null)
      : null;
  const isClientChecked = requirement.key in clientCodes;
  const failedCode = serverCode ?? clientCodes[requirement.key] ?? null;

  if (failedCode) {
    return {
      ...requirement,
      state: "fail",
      detailKey: requirement.failKey[failedCode],
    };
  }

  // Nothing failed it. That is only a PASS if someone actually checked: either
  // this attempt came back clean, or the browser can judge it on its own.
  const isAnswered = (attempt !== null && !attempt.unknown) || isClientChecked;
  return {
    ...requirement,
    state: isAnswered ? "pass" : "unknown",
    detailKey: isAnswered ? requirement.metKey : undefined,
  };
}

/**
 * The completeness requirements an unlinked persona must meet to publish, each
 * with a pass / fail (or unknown) state and warm, actionable copy. Rendered
 * permanently in the editor's Publish pane, live against the working state, so
 * an owner sees what is left BEFORE reaching for a disabled Publish button
 * rather than only after a rejection. Every unmet row is a button that opens
 * the pane its field lives on and flashes the field itself.
 *
 * Visual: the global `.ready`/`.ready-item` icon-circle rows plus a `.meter`
 * progress bar for passed/total.
 */
export function PublishChecklist({
  clientCodes,
  attempt,
  linkVisibility,
  onJump,
}: PublishChecklistProps) {
  const { t } = useTranslation();
  const rows = requirementsFor(linkVisibility).map((requirement) =>
    resolveRow(requirement, clientCodes, attempt),
  );
  // A linked persona has no requirements at all, so there is no list to draw
  // and nothing for the meter to be a fraction OF (0/0 would render NaN%).
  if (rows.length === 0) return null;

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
        {attempt?.unknown
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
        {rows.map((row) => (
          <ChecklistRowItem key={row.key} row={row} onJump={onJump} />
        ))}
      </ul>
    </div>
  );
}

/**
 * One requirement row. An unmet row is a button (the whole row, so the target
 * is generous) that takes the owner to the field; a met or unchecked row is
 * plain text, since there is nothing to go and do.
 */
function ChecklistRowItem({
  row,
  onJump,
}: {
  row: ChecklistRow;
  onJump: (target: EditorFieldTarget) => void;
}) {
  const { t } = useTranslation();
  const Icon = STATE_ICON[row.state];
  const body = (
    <>
      <i aria-hidden>
        <Icon size={11} />
      </i>
      <span className={styles.text}>
        <span className={styles.rowTitle}>{t(row.titleKey)}</span>
        <span className={styles.rowHelp}>
          {row.detailKey && t(row.detailKey)}
        </span>
      </span>
      <span className={styles.srOnly}>{t(STATE_LABEL_KEY[row.state])}</span>
    </>
  );

  if (row.state !== "fail") {
    return (
      <li className={row.state === "pass" ? "ready-item done" : "ready-item"}>
        {body}
      </li>
    );
  }

  return (
    <li className={`ready-item ${styles.rowActionable}`}>
      <button
        type="button"
        className={styles.rowButton}
        onClick={() => onJump(row.jump)}
      >
        {body}
        <span className={styles.jumpHint}>
          {t("subprofiles:checklist.jumpAction")}
          <FiArrowRight size={12} aria-hidden />
        </span>
      </button>
    </li>
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
