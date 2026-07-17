import { useState } from "react";
import { FiCheck, FiLoader, FiShield } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type { Integration } from "./integrations.data";
import styles from "./SettingsModal.module.css";

type Phase = "consent" | "authorizing" | "done";

/**
 * Simulated OAuth-style provider authorization. There is no real endpoint —
 * "Authorize" runs a short fake handshake then reports the linked state back
 * to the page via onLinked.
 */
export function LinkProviderModal({
  provider,
  onClose,
  onLinked,
}: {
  provider: Integration;
  onClose: () => void;
  onLinked: () => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("consent");
  useScrollLock();

  function authorize() {
    setPhase("authorizing");
    setTimeout(() => {
      setPhase("done");
      onLinked();
    }, 1400);
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t("settings:linkProvider.ariaLabel", {
          provider: provider.name,
        })}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("settings:modals.common.close")}
        >
          ×
        </button>

        {phase !== "done" ? (
          <>
            <div className={styles.eye}>
              {t("settings:linkProvider.eyebrow", { provider: provider.name })}
            </div>
            <div className={styles.providerHead}>
              <div className={styles.providerLogo}>
                {provider.glyph || provider.name[0]}
              </div>
              <div>
                <div className={styles.providerName}>
                  {t("settings:linkProvider.continueWith", {
                    provider: provider.name,
                  })}
                </div>
                <div className={styles.providerMeta}>
                  {t("settings:linkProvider.requestingAccess")}
                </div>
              </div>
            </div>
            <p className={styles.desc}>{provider.desc}</p>
            <ul className={styles.scopeList}>
              {provider.scopes.map((scope) => (
                <li key={scope} className={styles.scopeItem}>
                  <FiShield size={16} />
                  <span>{scope}</span>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <Button
                variant="primary"
                onClick={authorize}
                disabled={phase === "authorizing"}
              >
                {phase === "authorizing" ? (
                  <>
                    <span className={styles.spin}>
                      <FiLoader size={16} />
                    </span>{" "}
                    {t("settings:linkProvider.authorizing")}
                  </>
                ) : (
                  t("settings:linkProvider.authorizeCta", {
                    provider: provider.name,
                  })
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={phase === "authorizing"}
              >
                {t("settings:linkProvider.cancel")}
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <FiCheck size={28} />
            </div>
            <div className={styles.successTitle}>
              <Translation
                i18nKey="settings:linkProvider.linkedTitle"
                values={{ provider: provider.name }}
                components={{ em: <em /> }}
              />
            </div>
            <p className={styles.successSub}>
              {t("settings:linkProvider.linkedSub", {
                provider: provider.name,
              })}
            </p>
            <div className={styles.successActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                {t("settings:linkProvider.done")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
