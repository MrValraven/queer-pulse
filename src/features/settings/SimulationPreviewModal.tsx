import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiSmartphone, FiMonitor, FiExternalLink, FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SimFlow } from "./simulations.data";
import styles from "./SimulationPreviewModal.module.css";

type Device = "mobile" | "desktop";

/** In-Settings preview: embeds the real route in a phone/desktop frame so the
 *  maintainer can walk a state screen without leaving the simulations gallery. */
export function SimulationPreviewModal({
  flow,
  onClose,
}: {
  flow: SimFlow;
  onClose: () => void;
}) {
  useScrollLock();
  const { t } = useTranslation();
  const [device, setDevice] = useState<Device>("desktop");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Portal to <body>: the settings panes sit inside <FadeIn>
  // (`will-change: transform`), which makes a containing block for fixed
  // descendants and would otherwise mis-position this fixed overlay.
  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={t("settings:previewModal.ariaLabel", {
          title: flow.title,
        })}
      >
        <header className={styles.bar}>
          <div className={styles.title}>
            <span className={styles.kicker}>
              {t("settings:previewModal.kicker")}
            </span>
            {flow.title}
          </div>
          <div className={styles.controls}>
            <div
              className={styles.deviceToggle}
              role="group"
              aria-label={t("settings:previewModal.deviceGroupAriaLabel")}
            >
              <button
                type="button"
                className={[
                  styles.deviceBtn,
                  device === "mobile" && styles.deviceBtnActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setDevice("mobile")}
                aria-pressed={device === "mobile"}
              >
                <FiSmartphone aria-hidden /> {t("settings:previewModal.mobile")}
              </button>
              <button
                type="button"
                className={[
                  styles.deviceBtn,
                  device === "desktop" && styles.deviceBtnActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setDevice("desktop")}
                aria-pressed={device === "desktop"}
              >
                <FiMonitor aria-hidden /> {t("settings:previewModal.desktop")}
              </button>
            </div>
            <Link to={`${flow.to}?from=sim`} className={styles.openFull}>
              <FiExternalLink aria-hidden />{" "}
              {t("settings:previewModal.openFullScreen")}
            </Link>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label={t("settings:previewModal.closeAriaLabel")}
            >
              <FiX aria-hidden />
            </button>
          </div>
        </header>
        <div className={styles.stage}>
          <div
            className={[
              styles.frame,
              device === "mobile" ? styles.frameMobile : styles.frameDesktop,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <iframe
              key={device}
              src={flow.to}
              title={flow.title}
              className={styles.iframe}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
