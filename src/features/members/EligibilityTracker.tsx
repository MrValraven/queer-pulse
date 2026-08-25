import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiEdit3,
  FiHeart,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  FamilyScore,
  Gate,
  NextAction,
  PublicEligibility,
} from "./publicFigure";
import styles from "./PublicProfileModal.module.css";

/** Icon per scoring family — a quiet visual anchor so rows scan at a glance. */
const FAMILY_ICON: Record<FamilyScore["key"], IconType> = {
  contribution: FiEdit3,
  trust: FiHeart,
  participation: FiUsers,
};

/** What counts toward each family — shown under the label so the number isn't a black box. */
const FAMILY_HINT: Record<FamilyScore["key"], string> = {
  contribution: "members:publicProfile.eligibility.family.contribution.hint",
  trust: "members:publicProfile.eligibility.family.trust.hint",
  participation: "members:publicProfile.eligibility.family.participation.hint",
};

/** Icon per next-action family (gate actions are filtered out before render). */
const ACTION_ICON: Record<NextAction["family"], IconType> = {
  contribution: FiEdit3,
  trust: FiHeart,
  participation: FiUsers,
  gate: FiShield,
};

/** Icon shown in a pending gate's ring — its own kind, not a generic dot. */
const GATE_ICON: Record<Gate["key"], IconType> = {
  verified: FiShield,
  tenure: FiClock,
};

/** A capped [0..cap] bar. Width is a share of the family cap, not the target. */
function FamilyBar({ family }: { family: FamilyScore }) {
  const { t } = useTranslation();
  const pct = Math.round((family.points / family.cap) * 100);
  const Icon = FAMILY_ICON[family.key];
  return (
    <li className={styles.family}>
      <span className={styles.familyHead}>
        <span className={styles.familyIcon} aria-hidden>
          <Icon />
        </span>
        <span className={styles.familyText}>
          <span className={styles.familyLabel}>{t(family.labelKey)}</span>
          <span className={styles.familyHint}>
            {t(FAMILY_HINT[family.key])}
          </span>
        </span>
        <span className={styles.familyAmount}>
          {t("members:publicProfile.eligibility.family.amount", {
            points: family.points,
            cap: family.cap,
          })}
        </span>
      </span>
      <span className={styles.track} aria-hidden>
        <span className={styles.fill} style={{ width: `${pct}%` }} />
      </span>
    </li>
  );
}

function GateRow({ gate }: { gate: Gate }) {
  const { t } = useTranslation();
  const showRemaining =
    !gate.met && gate.remainingKey && (gate.remainingCount ?? 0) > 0;
  const Icon = GATE_ICON[gate.key];
  return (
    <li className={`${styles.crit} ${gate.met ? styles.critMet : ""}`}>
      <span className={styles.critMark} aria-hidden>
        {gate.met ? <FiCheck /> : <Icon />}
      </span>
      <span className={styles.critText}>
        <span className={styles.critLabel}>{t(gate.labelKey)}</span>
        <span className={styles.critHint}>
          {showRemaining && gate.remainingKey
            ? t(gate.remainingKey, { count: gate.remainingCount })
            : t(gate.hintKey)}
        </span>
      </span>
    </li>
  );
}

function ActionRow({ action }: { action: NextAction }) {
  const { t } = useTranslation();
  const Icon = ACTION_ICON[action.family] ?? FiCalendar;
  return (
    <li className={styles.action}>
      <span className={styles.actionIcon} aria-hidden>
        <Icon />
      </span>
      <span className={styles.actionLabel}>{t(action.labelKey)}</span>
      <span className={styles.actionPill}>
        {t("members:publicProfile.eligibility.action.points", {
          points: action.points,
        })}
      </span>
    </li>
  );
}

/**
 * The locked-state body: the overall progress meter, the two hard gates, the
 * three capped family bars, the point-earning next actions, and — only when
 * standing is blocked — a generic note that never names why. All shown from
 * the first view, not staged behind the gates, so progress is never a black
 * box.
 */
export function EligibilityTracker({
  eligibility,
}: {
  eligibility: PublicEligibility;
}) {
  const { t } = useTranslation();
  const metGates = eligibility.gates.filter((gate) => gate.met).length;
  const gatesMet = metGates === eligibility.gates.length;
  const pct = Math.round(
    (eligibility.score.total / eligibility.score.target) * 100,
  );
  // The essentials are the blocker until met, so the actions list drops the
  // gate actions (already shown above) and surfaces only the point-earning ones.
  const scoringActions = eligibility.nextActions.filter(
    (action) => action.points > 0,
  );

  return (
    <div className={styles.tracker}>
      <div className={styles.hero}>
        <span className={styles.heroGlow} aria-hidden />
        <p className={styles.heroPct}>
          {t("members:publicProfile.eligibility.progress.pct", { pct })}
        </p>
        <span className={styles.heroTrack} aria-hidden>
          <span className={styles.heroFill} style={{ width: `${pct}%` }} />
        </span>
      </div>

      <section className={`${styles.group} ${styles.essentialsGroup}`}>
        <header className={styles.groupHead}>
          <span>{t("members:publicProfile.eligibility.gates.heading")}</span>
          {!gatesMet && (
            <span className={styles.groupCount} aria-hidden>
              {metGates}
              <span> / {eligibility.gates.length}</span>
            </span>
          )}
        </header>
        <ul className={styles.essentials}>
          {eligibility.gates.map((gate) => (
            <GateRow key={gate.key} gate={gate} />
          ))}
        </ul>
      </section>

      <section className={styles.group}>
        <header className={styles.groupHead}>
          <span>{t("members:publicProfile.eligibility.families.heading")}</span>
        </header>
        <ul className={styles.families}>
          {eligibility.score.families.map((family) => (
            <FamilyBar key={family.key} family={family} />
          ))}
        </ul>
      </section>

      {scoringActions.length > 0 && (
        <section className={styles.group}>
          <header className={styles.groupHead}>
            <span>
              {t("members:publicProfile.eligibility.actions.heading")}
            </span>
          </header>
          <ul className={styles.actions}>
            {scoringActions.map((action) => (
              <ActionRow
                key={`${action.family}-${action.labelKey}`}
                action={action}
              />
            ))}
          </ul>
        </section>
      )}

      {!eligibility.standingOk && (
        <p className={styles.standing} role="status">
          {t("members:publicProfile.eligibility.standing.blocked")}
        </p>
      )}
    </div>
  );
}
