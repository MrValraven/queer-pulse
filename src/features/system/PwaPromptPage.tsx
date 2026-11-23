import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  detectInAppBrowser,
  detectPlatform,
  getInstallStepKeys,
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

// The same artwork the manifest puts on the home screen, so the header shows
// what actually lands on the phone.
const HOME_SCREEN_ICON_URL = `${import.meta.env.BASE_URL}icons/icon-192-v3.png`;

type Platform = InstallPlatform;

/**
 * App-listing header: the home-screen icon beside the app name and the kicker,
 * then the heading and the lead. The icon is decorative because the heading
 * already names the app.
 */
function PwaPromptHeader() {
  const { t } = useTranslation();
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <img
          src={HOME_SCREEN_ICON_URL}
          width={72}
          height={72}
          alt=""
          className={styles.appIcon}
        />
        <div className={styles.identityText}>
          <span className={styles.appName}>
            <Translation
              i18nKey="shared:brand.wordmark"
              components={{ em: <em /> }}
            />
          </span>
          <span className={styles.kicker}>{t("system:pwaPrompt.kicker")}</span>
        </div>
      </div>
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
    </header>
  );
}

function PwaPromptFeatures() {
  const { t } = useTranslation();
  return (
    <div className={styles.featureList}>
      {FEATURES.map((feature) => (
        <div key={feature.labelKey} className={styles.featureRow}>
          <div className={styles.featureIc}>
            <FiCheck aria-hidden />
          </div>
          <div>
            <b>{t(feature.labelKey)}</b>
            <span>{t(feature.detailKey)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PwaPromptPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  // Default to the visitor's actual platform rather than always iOS; the tabs
  // stay switchable so anyone can read the other sets of instructions.
  const [platform, setPlatform] = useState<Platform>(detectPlatform);
  const { canInstall, requestInstall } = useInstallPrompt();
  const { isInstalled } = useDisplayMode();
  // Set when the browser had an install offer and then failed to open its
  // dialog; the written steps are the way forward from there.
  const [hasInstallFailed, setHasInstallFailed] = useState(false);
  // Hold the snooze redirect timer so it can't fire navigate(-1) after the
  // page has already unmounted.
  const snoozeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(snoozeTimerRef.current), []);

  const { titleKey } = INSTRUCTIONS[platform];
  // Inside a social app's built-in browser the iPhone and Android tabs open
  // with the "open this page in your browser" step (see getInstallStepKeys).
  // The desktop tab keeps its own three steps, the same guard InstallAppModal
  // applies.
  const isInAppBrowser = detectInAppBrowser() && platform !== "desktop";
  const stepKeys = getInstallStepKeys(platform, isInAppBrowser);
  // Only a browser that has offered its own install dialog gets the button.
  // iOS never offers one, and Chrome may not have yet, so the written steps
  // are the answer there, as in InstallAppModal.
  const shouldShowInstallButton =
    canInstall && !hasInstallFailed && !isInstalled;

  async function install() {
    const outcome = await requestInstall();
    if (outcome === "failed") setHasInstallFailed(true);
  }

  function snooze() {
    showToast(t("system:pwaPrompt.toast.snoozed"), "info");
    snoozeTimerRef.current = setTimeout(() => void navigate(-1), 900);
  }

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <PwaPromptHeader />
        <PwaPromptFeatures />

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
          {stepKeys.map((stepKey, stepIndex) => (
            <div key={stepKey} className={styles.step}>
              <span className={styles.stepN}>{stepIndex + 1}</span>
              <span>
                <Translation
                  i18nKey={stepKey}
                  components={{ b: <b />, em: <em /> }}
                />
              </span>
            </div>
          ))}
        </div>

        <Collapse isOpen={hasInstallFailed}>
          <p className={styles.installFailedNote}>
            {t("shared:installAppModal.installFailed")}
          </p>
        </Collapse>

        <div className={styles.actions}>
          {shouldShowInstallButton && (
            <Button
              onClick={() => void install()}
              className={styles.installBtn}
            >
              {t("system:pwaPrompt.installCta")}
            </Button>
          )}
          <Button variant="ghost" onClick={snooze} className={styles.laterBtn}>
            {t("system:pwaPrompt.laterCta")}
          </Button>
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
