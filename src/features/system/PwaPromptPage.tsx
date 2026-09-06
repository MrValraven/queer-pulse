import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  detectPlatform,
  useInstallPrompt,
  INSTALL_INSTRUCTIONS as INSTRUCTIONS,
  INSTALL_TAB_LABEL_KEY as TAB_LABEL_KEY,
  type InstallPlatform,
} from "../../shared/hooks";
import { useDisplayMode } from "../../app/providers/displayModeContext";
import styles from "./PwaPromptPage.module.css";

const FEATURES: { labelKey: string; detailKey: string }[] = [
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

type Platform = InstallPlatform;

export function PwaPromptPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  // Default to the visitor's actual platform rather than always iOS; the tabs
  // stay switchable so anyone can read the other sets of instructions.
  const [platform, setPlatform] = useState<Platform>(detectPlatform);
  const { canInstall, promptInstall } = useInstallPrompt();
  const { isInstalled } = useDisplayMode();
  // Hold the snooze redirect timer so it can't fire navigate(-1) after the
  // page has already unmounted.
  const snoozeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(snoozeTimerRef.current), []);

  const { titleKey, stepKeys } = INSTRUCTIONS[platform];

  async function install() {
    // Chrome path: show the browser's real install dialog.
    if (canInstall) {
      const accepted = await promptInstall();
      if (accepted) return;
    }
    // iOS fires no beforeinstallprompt and Safari has no programmatic install,
    // so the on-screen instructions are the actual answer there. Same fallback
    // when Chrome hasn't (yet) judged the app installable.
    showToast(t("system:pwaPrompt.toast.installHint"), "info");
  }

  function snooze() {
    showToast(t("system:pwaPrompt.toast.snoozed"), "info");
    snoozeTimerRef.current = setTimeout(() => void navigate(-1), 900);
  }

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.ic}>
          <div className={styles.icInner}>
            <span className={styles.icDot} />
            <span>
              <Translation
                i18nKey="shared:brand.wordmark"
                components={{ em: <em /> }}
              />
            </span>
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
                <FiCheck aria-hidden />
              </div>
              <div>
                <b>{t(f.labelKey)}</b>
                <span>{t(f.detailKey)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.tabs}>
          {(["ios", "android", "desktop"] as Platform[]).map(
            (platformOption) => (
              <button
                type="button"
                key={platformOption}
                className={[
                  styles.tab,
                  platform === platformOption && styles.tabActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setPlatform(platformOption)}
              >
                {t(TAB_LABEL_KEY[platformOption])}
              </button>
            ),
          )}
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
          <Button
            onClick={() => void install()}
            className={styles.installBtn}
            disabled={isInstalled}
          >
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
            }}
          />
        </p>
      </div>
    </SystemStateShell>
  );
}
