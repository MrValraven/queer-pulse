import { FiShield } from "react-icons/fi";
import { Toggle } from "../../shared/components/ui";
import { useQuickExit } from "../../shared/hooks";
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
  const { enabled, keyTrigger, setEnabled, setKeyTrigger } = useQuickExit();

  return (
    <Pane
      title={
        <>
          Safety &amp; <em>quick exit.</em>
        </>
      }
      sub="A fast way to clear the screen if someone walks in. These settings live on this device only — they're never tied to your account."
    >
      <div className={styles.gdprBox}>
        <span className={styles.gIcon}>
          <FiShield />
        </span>
        <p>
          <strong>Quick exit is a fast screen-clear, not anonymity.</strong> It
          sends this tab to a neutral weather page and reopens QueerPulse in a
          separate tab. It can't wipe your earlier browser history, bookmarks,
          or address-bar suggestions — for that, also use a private window.
        </p>
      </div>
      <Section label="Quick exit">
        <ToggleList>
          <ControlledToggleRow
            title="Show the Quick exit button"
            desc="A floating button, on every page, that leaves the site instantly. On by default for everyone's safety."
            checked={enabled}
            onChange={setEnabled}
          />
          <ControlledToggleRow
            title="Double-tap Shift shortcut"
            desc="Tap the Shift key twice to leave without reaching for the button. Works only while the Quick exit button is on."
            checked={keyTrigger}
            onChange={setKeyTrigger}
            disabled={!enabled}
          />
        </ToggleList>
      </Section>
    </Pane>
  );
}
