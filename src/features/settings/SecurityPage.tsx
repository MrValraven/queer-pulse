import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Outro, Stepper } from "../../shared/components/ui";
import type { StepperStep } from "../../shared/components/ui";
import { PageShell } from "../../shared/components/layout";
import { useClipboard } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  SECURITY_HALL_OF_FAME,
  SECURITY_PGP_KEY,
} from "./security.data";
import styles from "./SecurityPage.module.css";

// Copy for the scope lists and process timeline lives in the `settings:security.*`
// catalog; these hold the i18n keys in render order so the words stay translated.
const IN_SCOPE = [
  "settings:security.scope.in.1",
  "settings:security.scope.in.2",
  "settings:security.scope.in.3",
  "settings:security.scope.in.4",
  "settings:security.scope.in.5",
  "settings:security.scope.in.6",
  "settings:security.scope.in.7",
  "settings:security.scope.in.8",
];

const OUT_SCOPE = [
  "settings:security.scope.out.1",
  "settings:security.scope.out.2",
  "settings:security.scope.out.3",
  "settings:security.scope.out.4",
  "settings:security.scope.out.5",
  "settings:security.scope.out.6",
  "settings:security.scope.out.7",
];

const PROCESS_STEPS = [
  {
    key: "acknowledge",
    titleKey: "settings:security.process.step1.title",
    textKey: "settings:security.process.step1.text",
    noteKey: "settings:security.process.step1.note",
  },
  {
    key: "assess",
    titleKey: "settings:security.process.step2.title",
    textKey: "settings:security.process.step2.text",
    noteKey: "settings:security.process.step2.note",
  },
  {
    key: "fix",
    titleKey: "settings:security.process.step3.title",
    textKey: "settings:security.process.step3.text",
    noteKey: "settings:security.process.step3.note",
  },
  {
    key: "disclose",
    titleKey: "settings:security.process.step4.title",
    textKey: "settings:security.process.step4.text",
    noteKey: "settings:security.process.step4.note",
  },
];

export function SecurityPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { copy } = useClipboard();
  const hasPgpKey = Boolean(SECURITY_PGP_KEY?.trim());
  const hasCredits = SECURITY_HALL_OF_FAME.length > 0;

  async function copyPgpKey() {
    if (!SECURITY_PGP_KEY) return;
    const didCopy = await copy(SECURITY_PGP_KEY);
    showToast(
      didCopy
        ? t("settings:security.pgp.copied")
        : t("settings:security.pgp.copyFailed"),
      didCopy ? "success" : "error",
    );
  }

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
    <PageShell>
      <header className={styles.hero} data-plum>
        <div className="wrap">
          <div className={styles.heroEye}>{t("settings:security.hero.eyebrow")}</div>
          <h1 className={styles.heroH}>
            {t("settings:security.hero.titleTop")}
            <br />
            <em>{t("settings:security.hero.titleEm")}</em>
          </h1>
          <p className={styles.heroSub}>{t("settings:security.hero.sub")}</p>
        </div>
      </header>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.proseSection}>
                <div className={styles.proseEye}>
                  {t("settings:security.commitment.eyebrow")}
                </div>
                <h2 className={styles.proseH}>
                  <Translation
                    i18nKey="settings:security.commitment.title"
                    components={{ em: <em /> }}
                  />
                </h2>
                <p className={styles.prose}>
                  {t("settings:security.commitment.body1")}
                </p>
                <p className={styles.prose}>
                  {t("settings:security.commitment.body2")}
                </p>
              </div>

              <div className={styles.proseSection}>
                <div className={styles.proseEye}>
                  {t("settings:security.scope.eyebrow")}
                </div>
                <h2 className={styles.proseH}>
                  <Translation
                    i18nKey="settings:security.scope.title"
                    components={{ em: <em /> }}
                  />
                </h2>
                <div className={styles.scopeGrid}>
                  <div className={`${styles.scopeCard} ${styles.scopeIn}`}>
                    <div className={styles.scopeHead}>
                      <div className={styles.scopeDot} />
                      {t("settings:security.scope.inLabel")}
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
                      {t("settings:security.scope.outLabel")}
                    </div>
                    <ul className={styles.scopeList}>
                      {OUT_SCOPE.map((key) => (
                        <li key={key}>{t(key)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className={styles.proseSection}>
                <div className={styles.proseEye}>
                  {t("settings:security.process.eyebrow")}
                </div>
                <h2 className={styles.proseH}>
                  <Translation
                    i18nKey="settings:security.process.title"
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
                  ariaLabel={t("settings:security.process.aria")}
                  className={styles.timeline}
                />
              </div>

              {/* Credits appear only once a real disclosure has been made. An
                  invented Hall of Fame asserts vulnerabilities nobody reported. */}
              <div className={styles.proseSection}>
                <div className={styles.proseEye}>
                  {t("settings:security.ack.eyebrow")}
                </div>
                <h2 className={styles.proseH}>
                  <Translation
                    i18nKey="settings:security.ack.title"
                    components={{ em: <em /> }}
                  />
                </h2>
                {hasCredits ? (
                  <>
                    <p className={styles.prose}>
                      {t("settings:security.ack.body")}
                    </p>
                    <div className={styles.hallGrid}>
                      {SECURITY_HALL_OF_FAME.map((researcher) => (
                        <div
                          key={researcher.initials}
                          className={styles.hallCard}
                        >
                          <div className={styles.hallInit}>
                            {researcher.initials}
                          </div>
                          <div className={styles.hallName}>
                            {researcher.name}
                          </div>
                          <div className={styles.hallNote}>
                            {researcher.note}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className={styles.prose}>
                    {t("settings:security.ack.empty")}
                  </p>
                )}
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.reportCard}>
                <h3>
                  {t("settings:security.report.titleTop")}
                  <br />
                  <em>{t("settings:security.report.titleEm")}</em>
                </h3>
                <p>{t("settings:security.report.body")}</p>
                <Button
                  variant="ghost-dark"
                  href="mailto:hello@queerpulse.com"
                >
                  {t("settings:security.report.cta")}
                </Button>
              </div>
              {/* No key published yet: say so rather than hand a researcher a
                  truncated block they cannot import. */}
              <div className={styles.pgpCard}>
                <div className={styles.pgpLabel}>
                  {t("settings:security.pgp.label")}
                </div>
                {hasPgpKey ? (
                  <>
                    <pre className={styles.pgpBlock}>{SECURITY_PGP_KEY}</pre>
                    <Button
                      variant="ghost"
                      onClick={() => void copyPgpKey()}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      {t("settings:security.pgp.copyCta")}
                    </Button>
                  </>
                ) : (
                  <p className={styles.pgpUnavailable}>
                    {t("settings:security.pgp.unavailable")}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Outro
        title={
          <>
            {t("settings:security.outro.titleTop")}
            <br />
            <em>{t("settings:security.outro.titleEm")}</em>
          </>
        }
        sub={t("settings:security.outro.sub")}
      >
        <Button
          variant="primary"
          size="lg"
          href="mailto:hello@queerpulse.com"
        >
          {t("settings:security.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
