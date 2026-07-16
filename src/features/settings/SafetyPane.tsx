import { FiShield } from "react-icons/fi";
import { Toggle } from "../../shared/components/ui";
import { useQuickExit } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Pane, Section, ToggleList } from "./SettingsControls";
import styles from "./SettingsPage.module.css";

/** Controlled toggle bound to real state — commits instantly, no Save-bar. */
function ControlledToggleRow({
  title,
  desc,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Greys and inert-locks the control (e.g. a sub-option of an off toggle). */
  disabled?: boolean;
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleLabel}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleDesc}>{desc}</div>
      </div>
      <div
        className={disabled ? styles.comingSoonControl : undefined}
        inert={disabled}
      >
        <Toggle
          tone="coral"
          checked={checked}
          onChange={onChange}
          label={title}
        />
      </div>
    </div>
  );
}

export function SafetyPane() {
  const { t } = useTranslation();
  const { enabled, keyTrigger, setEnabled, setKeyTrigger } = useQuickExit();

  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:safety.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:safety.sub")}
    >
      <div className={styles.gdprBox}>
        <span className={styles.gIcon}>
          <FiShield />
        </span>
        <p>
          <Translation
            i18nKey="settings:safety.gdprBox"
            components={{ strong: <strong /> }}
          />
        </p>
      </div>
      <Section label={t("settings:safety.section.quickExit")}>
        <ToggleList>
          <ControlledToggleRow
            title={t("settings:safety.toggle.showButton.title")}
            desc={t("settings:safety.toggle.showButton.desc")}
            checked={enabled}
            onChange={setEnabled}
          />
          <ControlledToggleRow
            title={t("settings:safety.toggle.doubleTap.title")}
            desc={t("settings:safety.toggle.doubleTap.desc")}
            checked={keyTrigger}
            onChange={setKeyTrigger}
            disabled={!enabled}
          />
        </ToggleList>
      </Section>
    </Pane>
  );
}
