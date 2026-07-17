import { useMemo, useState } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { buildAvailableIntegrations } from "./integrations.data";
import styles from "./SettingsModal.module.css";

/**
 * Gallery of available integrations. Each card has a Connect button that flips
 * to a connected state in local set — no real endpoints involved.
 */
export function IntegrationsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const availableIntegrations = useMemo(
    () => buildAvailableIntegrations(t),
    [t],
  );
  const [connected, setConnected] = useState<Set<string>>(new Set());
  useScrollLock();

  function connect(id: string) {
    setConnected((prev) => new Set(prev).add(id));
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${styles.modalWide}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("settings:integrationsModal.ariaLabel")}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("settings:modals.common.close")}
        >
          ×
        </button>
        <div className={styles.eye}>
          {t("settings:integrationsModal.eyebrow")}
        </div>
        <div className={styles.title}>
          <Translation
            i18nKey="settings:integrationsModal.title"
            components={{ em: <em /> }}
          />
        </div>
        <p className={styles.desc}>{t("settings:integrationsModal.desc")}</p>
        <div className={styles.grid}>
          {availableIntegrations.map((integration) => {
            const isConnected = connected.has(integration.id);
            return (
              <div key={integration.id} className={styles.intCard}>
                <div className={styles.intTop}>
                  <div className={styles.intLogo}>{integration.glyph}</div>
                  <div className={styles.intName}>{integration.name}</div>
                </div>
                <p className={styles.intDesc}>{integration.desc}</p>
                {isConnected ? (
                  <span className={styles.connectedTag}>
                    <FiCheck size={15} />{" "}
                    {t("settings:integrationsModal.connectedTag")}
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => connect(integration.id)}
                    style={{
                      fontSize: "13px",
                      padding: "8px 16px",
                      alignSelf: "flex-start",
                    }}
                  >
                    <FiPlus size={14} />{" "}
                    {t("settings:integrationsModal.connectCta")}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
