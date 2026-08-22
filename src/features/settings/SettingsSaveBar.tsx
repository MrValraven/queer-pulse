import { useId, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { changeLabelKey } from "./settings.data";
import styles from "./SettingsSaveBar.module.css";

/**
 * The fixed pill save bar shown while a Settings pane is dirty. When the
 * change is backed by real persisted state, `changedKeys` carries one entry
 * per touched field (e.g. `"profile.bio"`) — each resolved via
 * `settings:changes.<key>` — and the bar's message becomes a disclosure
 * listing them, so a member can see exactly what they're about to save.
 */
export function SettingsSaveBar({
  changedKeys,
  saveError,
  isSaving,
  onDiscard,
  onSave,
}: {
  changedKeys: string[];
  saveError: string | null;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const hasChanges = changedKeys.length > 0;

  return (
    <div className={styles.wrap}>
      {expanded && hasChanges && (
        <div id={panelId} className={styles.panel} role="list">
          {changedKeys.map((key) => (
            <div key={key} className={styles.panelRow} role="listitem">
              {t(changeLabelKey(key))}
            </div>
          ))}
        </div>
      )}
      <div className={styles.saveBar}>
        {saveError ? (
          // Announced: a failed save used to be silent for screen-reader users.
          <p role="alert">{saveError}</p>
        ) : hasChanges ? (
          <button
            type="button"
            className={styles.changesToggle}
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((v) => !v)}
          >
            {t("settings:page.saveBar.changesCount", {
              count: changedKeys.length,
            })}
            {expanded ? (
              <FiChevronUp aria-hidden />
            ) : (
              <FiChevronDown aria-hidden />
            )}
          </button>
        ) : (
          <p>{t("settings:page.saveBar.unsaved")}</p>
        )}
        <div className={styles.actions}>
          {/* On a plum panel the house style is ghost-dark + primary coral. */}
          <Button variant="ghost-dark" onClick={onDiscard} disabled={isSaving}>
            {t("settings:page.saveBar.discard")}
          </Button>
          <Button variant="primary" onClick={onSave} disabled={isSaving}>
            {t("settings:page.saveBar.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
