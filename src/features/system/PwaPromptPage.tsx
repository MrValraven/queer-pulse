import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./PwaPromptPage.module.css";

const FEATURES: { labelKey: string; detailKey: string }[] = [
  {
    labelKey: "system:pwaPrompt.features.quickExit.label",
    detailKey: "system:pwaPrompt.features.quickExit.detail",
  },
  {
    labelKey: "system:pwaPrompt.features.push.label",
    detailKey: "system:pwaPrompt.features.push.detail",
  },
  {
    labelKey: "system:pwaPrompt.features.offline.label",
    detailKey: "system:pwaPrompt.features.offline.detail",
  },
  {
    labelKey: "system:pwaPrompt.features.size.label",
    detailKey: "system:pwaPrompt.features.size.detail",
  },
];

type Platform = "ios" | "android" | "desktop";

const INSTRUCTIONS: Record<Platform, { titleKey: string; stepKeys: string[] }> = {
  ios: {
    titleKey: "system:pwaPrompt.instructions.ios.title",
    stepKeys: [
      "system:pwaPrompt.instructions.ios.step1",
      "system:pwaPrompt.instructions.ios.step2",
      "system:pwaPrompt.instructions.ios.step3",
    ],
  },
  android: {
    titleKey: "system:pwaPrompt.instructions.android.title",
    stepKeys: [
      "system:pwaPrompt.instructions.android.step1",
      "system:pwaPrompt.instructions.android.step2",
      "system:pwaPrompt.instructions.android.step3",
    ],
  },
  desktop: {
    titleKey: "system:pwaPrompt.instructions.desktop.title",
    stepKeys: [
      "system:pwaPrompt.instructions.desktop.step1",
      "system:pwaPrompt.instructions.desktop.step2",
      "system:pwaPrompt.instructions.desktop.step3",
    ],
  },
};

const TAB_LABEL_KEY: Record<Platform, string> = {
  ios: "system:pwaPrompt.tabs.ios",
  android: "system:pwaPrompt.tabs.android",
  desktop: "system:pwaPrompt.tabs.desktop",
};

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function PwaPromptPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<Platform>("ios");

  const { titleKey, stepKeys } = INSTRUCTIONS[platform];

  function install() {
    showToast(t("system:pwaPrompt.toast.installHint"), "info");
  }

  function snooze() {
    showToast(t("system:pwaPrompt.toast.snoozed"), "info");
    setTimeout(() => navigate(-1), 900);
  }

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.ic}>
          <div className={styles.icInner}>
            <span className={styles.icDot} />
            <Translation
              i18nKey="shared:brand.wordmark"
              components={{ em: <em /> }}
            />
          </div>
        </div>

        <div className={styles.kicker}>{t("system:pwaPrompt.kicker")}</div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="system:pwaPrompt.heading"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="system:pwaPrompt.lead"
            components={{ em: <em /> }}
          />
        </p>

        <div className={styles.featureList}>
          {FEATURES.map((f) => (
            <div key={f.labelKey} className={styles.featureRow}>
              <div className={styles.featureIc}>
                <CheckIcon />
              </div>
              <div>
                <b>{t(f.labelKey)}</b>
                <span>{t(f.detailKey)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.tabs}>
          {(["ios", "android", "desktop"] as Platform[]).map((p) => (
            <button
              type="button"
              key={p}
              className={[styles.tab, platform === p && styles.tabActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setPlatform(p)}
            >
              {t(TAB_LABEL_KEY[p])}
            </button>
          ))}
        </div>

        <div className={styles.howto}>
          <h4 className={styles.howtoTitle}>{t(titleKey)}</h4>
          {stepKeys.map((stepKey, i) => (
            <div key={stepKey} className={styles.step}>
              <span className={styles.stepN}>{i + 1}</span>
              <span>
                <Translation
                  i18nKey={stepKey}
                  components={{ b: <b />, em: <em /> }}
                />
              </span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Button onClick={install} className={styles.installBtn}>
            {t("system:pwaPrompt.installCta")}
          </Button>
          <button type="button" className={styles.laterBtn} onClick={snooze}>
            {t("system:pwaPrompt.laterCta")}
          </button>
        </div>
        <p className={styles.actionsFoot}>
          <Translation
            i18nKey="system:pwaPrompt.actionsFoot"
            components={{
              b: <b />,
              a: <Link to={routes.getTheApp} className={styles.appLink} />,
            }}
          />
        </p>
      </div>
    </SystemStateShell>
  );
}
