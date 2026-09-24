import type { ReactNode } from "react";
import { FiMonitor, FiSmartphone } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PreviewDevice } from "./usePreviewFit";
import styles from "./PreviewDeviceToggle.module.css";

/**
 * The Mobile / Desktop switch in the docked preview's bar. The same pattern
 * as `PersonaViewToggle`: a labelled `role="group"` of `aria-pressed`
 * buttons. The bar is narrow, so the options show their icons only; each
 * label stays in the DOM, visually hidden, as the button's accessible name,
 * and doubles as the hover `title`.
 */
export function PreviewDeviceToggle({
  device,
  onChange,
}: {
  device: PreviewDevice;
  onChange: (device: PreviewDevice) => void;
}) {
  const { t } = useTranslation();
  const options: { id: PreviewDevice; label: string; icon: ReactNode }[] = [
    {
      id: "mobile",
      label: t("subprofiles:editorPreview.device.mobile"),
      icon: <FiSmartphone aria-hidden />,
    },
    {
      id: "desktop",
      label: t("subprofiles:editorPreview.device.desktop"),
      icon: <FiMonitor aria-hidden />,
    },
  ];
  return (
    <div
      className={styles.deviceToggle}
      role="group"
      aria-label={t("subprofiles:editorPreview.device.label")}
    >
      {options.map((option) => {
        const isPressed = device === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={[styles.deviceChip, isPressed && styles.deviceChipOn]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={isPressed}
            title={option.label}
            onClick={() => onChange(option.id)}
          >
            {option.icon}
            <span className="visuallyHidden">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
