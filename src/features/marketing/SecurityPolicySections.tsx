import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Stepper } from "../../shared/components/ui";
import type { StepperStep } from "../../shared/components/ui";
import { useClipboard } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { SECURITY_HALL_OF_FAME, SECURITY_PGP_KEY } from "./securityPolicy.data";
import {
  IN_SCOPE,
  OUT_SCOPE,
  PROCESS_STEPS,
} from "./securityPolicyContent.data";
import styles from "./SecurityPolicyPage.module.css";

/** Plum hero banner at the top of the security / responsible-disclosure page. */
export function SecurityPolicyHero() {
  const { t } = useTranslation();
  return (
    <header className={styles.hero} data-plum>
      <div className="wrap">
        <div className={styles.heroEye}>
          {t("marketing:securityPolicy.hero.eyebrow")}
        </div>
        <h1 className={styles.heroH}>
          {t("marketing:securityPolicy.hero.titleTop")}
          <br />
          <em>{t("marketing:securityPolicy.hero.titleEm")}</em>
        </h1>
        <p className={styles.heroSub}>
          {t("marketing:securityPolicy.hero.sub")}
        </p>
      </div>
    </header>
  );
}

/** "Our commitment" prose section. */
export function SecurityPolicyCommitmentSection() {
  const { t } = useTranslation();
  return (
    <div className={styles.proseSection}>
      <div className={styles.proseEye}>
        {t("marketing:securityPolicy.commitment.eyebrow")}
      </div>
      <h2 className={styles.proseH}>
        <Translation
          i18nKey="marketing:securityPolicy.commitment.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.prose}>
        {t("marketing:securityPolicy.commitment.body1")}
      </p>
      <p className={styles.prose}>
        {t("marketing:securityPolicy.commitment.body2")}
      </p>
    </div>
  );
}

/** In-scope / out-of-scope grid. */
export function SecurityPolicyScopeSection() {
  const { t } = useTranslation();
  return (
    <div className={styles.proseSection}>
      <div className={styles.proseEye}>
        {t("marketing:securityPolicy.scope.eyebrow")}
      </div>
      <h2 className={styles.proseH}>
        <Translation
          i18nKey="marketing:securityPolicy.scope.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.scopeGrid}>
        <div className={`${styles.scopeCard} ${styles.scopeIn}`}>
          <div className={styles.scopeHead}>
            <div className={styles.scopeDot} />
            {t("marketing:securityPolicy.scope.inLabel")}
          </div>
          <ul className={styles.scopeList}>
            {IN_SCOPE.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
        <div className={`${styles.scopeCard} ${styles.scopeOut}`}>
          <div className={styles.scopeHead}>
            <div className={styles.scopeDot} />
            {t("marketing:securityPolicy.scope.outLabel")}
          </div>
          <ul className={styles.scopeList}>
            {OUT_SCOPE.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Disclosure-process timeline (acknowledge → assess → fix → disclose). */
export function SecurityPolicyProcessSection() {
  const { t } = useTranslation();
  const processSteps: StepperStep[] = PROCESS_STEPS.map((step) => ({
    key: step.key,
    label: t(step.titleKey),
    description: (
      <>
        <span className={styles.stepText}>{t(step.textKey)}</span>
        <span className={styles.stepNote}>{t(step.noteKey)}</span>
      </>
    ),
  }));

  return (
    <div className={styles.proseSection}>
      <div className={styles.proseEye}>
        {t("marketing:securityPolicy.process.eyebrow")}
      </div>
      <h2 className={styles.proseH}>
        <Translation
          i18nKey="marketing:securityPolicy.process.title"
          components={{ em: <em /> }}
        />
      </h2>
      <Stepper
        steps={processSteps}
        current={0}
        marker="number"
        orientation="vertical"
        size="lg"
        showFill={false}
        ariaLabel={t("marketing:securityPolicy.process.aria")}
        className={styles.timeline}
      />
    </div>
  );
}

/**
 * Researcher acknowledgements. Credits appear only once a real disclosure has
 * been made. An invented Hall of Fame asserts vulnerabilities nobody reported.
 */
export function SecurityPolicyAcknowledgmentsSection() {
  const { t } = useTranslation();
  const hasCredits = SECURITY_HALL_OF_FAME.length > 0;

  return (
    <div className={styles.proseSection}>
      <div className={styles.proseEye}>
        {t("marketing:securityPolicy.ack.eyebrow")}
      </div>
      <h2 className={styles.proseH}>
        <Translation
          i18nKey="marketing:securityPolicy.ack.title"
          components={{ em: <em /> }}
        />
      </h2>
      {hasCredits ? (
        <>
          <p className={styles.prose}>
            {t("marketing:securityPolicy.ack.body")}
          </p>
          <div className={styles.hallGrid}>
            {SECURITY_HALL_OF_FAME.map((researcher) => (
              <div key={researcher.initials} className={styles.hallCard}>
                <div className={styles.hallInit}>{researcher.initials}</div>
                <div className={styles.hallName}>{researcher.name}</div>
                <div className={styles.hallNote}>{researcher.note}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className={styles.prose}>
          {t("marketing:securityPolicy.ack.empty")}
        </p>
      )}
    </div>
  );
}

/** Report-a-vulnerability card + PGP key card. */
export function SecurityPolicySidebar() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { copy } = useClipboard();
  const hasPgpKey = Boolean(SECURITY_PGP_KEY?.trim());

  async function copyPgpKey() {
    if (!SECURITY_PGP_KEY) return;
    const didCopy = await copy(SECURITY_PGP_KEY);
    showToast(
      didCopy
        ? t("marketing:securityPolicy.pgp.copied")
        : t("marketing:securityPolicy.pgp.copyFailed"),
      didCopy ? "success" : "error",
    );
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.reportCard}>
        <h3>
          {t("marketing:securityPolicy.report.titleTop")}
          <br />
          <em>{t("marketing:securityPolicy.report.titleEm")}</em>
        </h3>
        <p>{t("marketing:securityPolicy.report.body")}</p>
        <Button variant="ghost-dark" href="mailto:hello@queerpulse.com">
          {t("marketing:securityPolicy.report.cta")}
        </Button>
      </div>
      {/* No key published yet: say so rather than hand a researcher a
          truncated block they cannot import. */}
      <div className={styles.pgpCard}>
        <div className={styles.pgpLabel}>
          {t("marketing:securityPolicy.pgp.label")}
        </div>
        {hasPgpKey ? (
          <>
            <pre className={styles.pgpBlock}>{SECURITY_PGP_KEY}</pre>
            <Button
              variant="ghost"
              onClick={() => void copyPgpKey()}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {t("marketing:securityPolicy.pgp.copyCta")}
            </Button>
          </>
        ) : (
          <p className={styles.pgpUnavailable}>
            {t("marketing:securityPolicy.pgp.unavailable")}
          </p>
        )}
      </div>
    </aside>
  );
}
