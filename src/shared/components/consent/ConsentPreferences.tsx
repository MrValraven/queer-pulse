import { useState } from "react";
import { FiLock } from "react-icons/fi";
import { Button, Modal, Toggle } from "../ui";
import { Translation } from "../../i18n/Translation";
import { useTranslation } from "../../i18n/useTranslation";
import type { ConsentCategories } from "../../api/consent.api";
import styles from "./Consent.module.css";

interface Row {
  key: "monitoring";
  titleKey: string;
  descKey: string;
}

const ROWS: Row[] = [
  {
    key: "monitoring",
    titleKey: "shared:consent.preferences.rows.monitoring.title",
    descKey: "shared:consent.preferences.rows.monitoring.desc",
  },
];

/**
 * The preference center — one toggle per opt-in category plus a locked, always-on
 * "Strictly necessary" row. Reject is exactly as easy as accept: both save the
 * exact toggle state. Reuses the shared focus-managed <Modal>.
 */
export function ConsentPreferences({
  consent,
  onSave,
  onClose,
}: {
  consent: ConsentCategories;
  onSave: (next: { monitoring: boolean }) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState({
    monitoring: consent.monitoring,
  });

  return (
    <Modal
      eyebrow={t("shared:consent.preferences.eyebrow")}
      title={
        <Translation
          i18nKey="shared:consent.preferences.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("shared:consent.preferences.sub")}
      onClose={onClose}
      footer={
        <div className={styles.prefsFoot}>
          <Button
            variant="ghost"
            onClick={() => setState({ monitoring: false })}
          >
            {t("shared:consent.actions.rejectNonEssential")}
          </Button>
          <Button variant="primary" onClick={() => onSave(state)}>
            {t("shared:consent.actions.saveChoices")}
          </Button>
        </div>
      }
    >
      <div className={styles.prefsList}>
        <div className={`${styles.prefRow} ${styles.prefRowLocked}`}>
          <div className={styles.prefText}>
            <div className={styles.prefTitle}>
              {t("shared:consent.preferences.necessary.title")}
            </div>
            <div className={styles.prefDesc}>
              {t("shared:consent.preferences.necessary.desc")}
            </div>
          </div>
          <span
            className={styles.prefLock}
            aria-label={t("shared:consent.preferences.necessary.alwaysOnAria")}
          >
            <FiLock aria-hidden />
          </span>
        </div>

        {ROWS.map((r) => (
          <div key={r.key} className={styles.prefRow}>
            <div className={styles.prefText}>
              <div className={styles.prefTitle}>{t(r.titleKey)}</div>
              <div className={styles.prefDesc}>{t(r.descKey)}</div>
            </div>
            <Toggle
              tone="coral"
              label={t(r.titleKey)}
              checked={state[r.key]}
              onChange={(v) => setState((s) => ({ ...s, [r.key]: v }))}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}
