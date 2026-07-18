import { FiArrowRight, FiCheck, FiGlobe, FiLock } from "react-icons/fi";
import { Button, Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { usePublicProfile } from "../../app/providers/PublicProfileProvider";
import type { EligibilityCriterion } from "./publicFigure";
import styles from "./PublicProfileControl.module.css";

/** One row of the "how you unlock a public profile" checklist. */
function CriterionRow({ criterion }: { criterion: EligibilityCriterion }) {
  const { t } = useTranslation();
  const { met, labelKey, hintKey } = criterion;
  return (
    <li className={`${styles.crit} ${met ? styles.critMet : ""}`}>
      <span className={styles.critMark} aria-hidden>
        {met ? <FiCheck /> : <span className={styles.critDot} />}
      </span>
      <span className={styles.critText}>
        <span className={styles.critLabel}>{t(labelKey)}</span>
        <span className={styles.critHint}>{t(hintKey)}</span>
      </span>
    </li>
  );
}

/**
 * The member's own public-profile control, shown on their profile. Locked until
 * they're eligible (a contributor-checklist explains how it's earned); once
 * eligible, an off-by-default switch plus a "View public profile" button.
 */
export function PublicProfileControl() {
  const { t } = useTranslation();
  const { enabled, toggle, saving, eligibility } = usePublicProfile();
  const { showToast } = useToast();

  // The preference now persists, but nothing reads it: there is no
  // unauthenticated profile endpoint, so switching this on publishes nothing.
  // The toast confirms a *saved preference*, never "you're live on the web" —
  // and a failed write says so instead of claiming success.
  async function onToggle() {
    if (saving) return;
    const ok = await toggle();
    if (!ok) {
      showToast(t("members:publicProfile.control.toast.failed"), "error", 7000);
      return;
    }
    showToast(
      enabled
        ? t("members:publicProfile.control.toast.hidden")
        : t("members:publicProfile.control.toast.live"),
      enabled ? "info" : "success",
    );
  }

  if (!eligibility.eligible) {
    const metCount = eligibility.criteria.filter((c) => c.met).length;
    return (
      <div className="wrap">
        <section className={styles.panel}>
          <div className={styles.head}>
            <span className={styles.icon} aria-hidden>
              <FiLock />
            </span>
            <div>
              <span className={styles.eyebrow}>
                {t("members:publicProfile.control.locked.eyebrow")}
              </span>
              <h2 className={styles.title}>
                <Translation
                  i18nKey="members:publicProfile.control.locked.title"
                  components={{ em: <em /> }}
                />
              </h2>
            </div>
          </div>
          <p className={styles.lede}>
            {t("members:publicProfile.control.locked.lede")}
          </p>
          <ul className={styles.list}>
            {eligibility.criteria.map((c) => (
              <CriterionRow key={c.key} criterion={c} />
            ))}
          </ul>
          <p className={styles.progress}>
            {t("members:publicProfile.control.locked.progress", {
              met: metCount,
              total: eligibility.criteria.length,
            })}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className={`wrap ${styles.wrap}`}>
      <section className={styles.panel}>
        <div className={styles.head}>
          <span className={styles.icon} aria-hidden>
            <FiGlobe />
          </span>
          <div>
            <span className={styles.eyebrow}>
              {t("members:publicProfile.control.unlocked.eyebrow")}
            </span>
            <h2 className={styles.title}>
              <Translation
                i18nKey="members:publicProfile.control.unlocked.title"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
        </div>
        <p className={styles.lede}>
          {t("members:publicProfile.control.unlocked.lede")}
        </p>
        <p className={styles.notYet}>
          {t("members:publicProfile.control.notYet")}
        </p>

        <div className={styles.switchRow}>
          <div className={styles.switchText}>
            <span className={styles.switchLabel}>
              {t("members:publicProfile.control.switchLabel")}
            </span>
            <span
              className={`${styles.status} ${enabled ? styles.statusOn : ""}`}
            >
              {enabled
                ? t("members:publicProfile.control.statusOn")
                : t("members:publicProfile.control.statusOff")}
            </span>
          </div>
          <Toggle
            tone="jade"
            checked={enabled}
            label={t("members:publicProfile.control.switchLabel")}
            onChange={() => void onToggle()}
          />
        </div>

        <div className={styles.actions}>
          <Button variant="ghost-dark" to={routes.publicProfile}>
            {t("members:publicProfile.control.viewCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </section>
    </div>
  );
}
