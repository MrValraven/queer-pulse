import { useState } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import styles from "./SettingsModal.module.css";

export type FrequencyId = "instant" | "daily" | "weekly";
export type LocationId =
  "lisbon" | "remotePt" | "anywhere" | "porto" | "berlin";

export interface AlertDraft {
  id: string;
  title: string;
  keywords: string;
  location: LocationId;
  minSalary: string;
  frequencyId: FrequencyId;
}

const FREQUENCIES: FrequencyId[] = ["instant", "daily", "weekly"];
const LOCATIONS: LocationId[] = [
  "lisbon",
  "remotePt",
  "anywhere",
  "porto",
  "berlin",
];

/**
 * Create / edit a saved-search job alert. Pre-filled when `initial` is given.
 * Saving reports the draft back to the page; success shows a plum panel.
 *
 * `location`/`frequencyId` are stable English ids — never the translated
 * label — so a language switch can't desync the `<select>`'s bound value
 * from its rendered option text (§5.1).
 */
export function AlertBuilderModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: AlertDraft;
  onClose: () => void;
  onSave: (draft: AlertDraft) => void;
}) {
  const { t } = useTranslation();
  const editing = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [keywords, setKeywords] = useState(initial?.keywords ?? "");
  const [location, setLocation] = useState<LocationId>(
    initial?.location ?? LOCATIONS[0]!,
  );
  const [minSalary, setMinSalary] = useState(initial?.minSalary ?? "");
  const [frequencyId, setFrequencyId] = useState<FrequencyId>(
    initial?.frequencyId ?? "weekly",
  );
  const [done, setDone] = useState(false);
  useScrollLock();

  const frequencyLabel = t(
    `settings:subscriptions.alertBuilder.frequency.${frequencyId}`,
  );
  const valid = title.trim().length > 0 && keywords.trim().length > 0;

  function save() {
    if (!valid) return;
    onSave({
      id: initial?.id ?? `alert-${Date.now()}`,
      title: title.trim(),
      keywords: keywords.trim(),
      location,
      minSalary: minSalary.trim(),
      frequencyId,
    });
    setDone(true);
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
        aria-label={t(
          editing
            ? "settings:subscriptions.alertBuilder.ariaLabel.edit"
            : "settings:subscriptions.alertBuilder.ariaLabel.new",
        )}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("settings:modals.common.close")}
        >
          ×
        </button>

        {!done ? (
          <>
            <div className={styles.eye}>
              {t(
                editing
                  ? "settings:subscriptions.alertBuilder.ariaLabel.edit"
                  : "settings:subscriptions.alertBuilder.ariaLabel.new",
              )}
            </div>
            <div className={styles.title}>
              <Translation
                i18nKey={
                  editing
                    ? "settings:subscriptions.alertBuilder.title.edit"
                    : "settings:subscriptions.alertBuilder.title.new"
                }
                components={{ em: <em /> }}
              />
            </div>
            <p className={styles.desc}>
              {t("settings:subscriptions.alertBuilder.desc")}
            </p>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label}>
                  {t(
                    "settings:subscriptions.alertBuilder.field.alertName.label",
                  )}{" "}
                  <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={t(
                    "settings:subscriptions.alertBuilder.field.alertName.placeholder",
                  )}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  {t(
                    "settings:subscriptions.alertBuilder.field.titleKeywords.label",
                  )}{" "}
                  <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={t(
                    "settings:subscriptions.alertBuilder.field.titleKeywords.placeholder",
                  )}
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <span className={styles.hint}>
                  {t(
                    "settings:subscriptions.alertBuilder.field.titleKeywords.hint",
                  )}
                </span>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {t(
                      "settings:subscriptions.alertBuilder.field.location.label",
                    )}
                  </label>
                  <select
                    className={styles.select}
                    value={location}
                    onChange={(e) => setLocation(e.target.value as LocationId)}
                  >
                    {LOCATIONS.map((locationId) => (
                      <option key={locationId} value={locationId}>
                        {t(
                          `settings:subscriptions.alertBuilder.location.${locationId}`,
                        )}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {t(
                      "settings:subscriptions.alertBuilder.field.minSalary.label",
                    )}
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder={t(
                      "settings:subscriptions.alertBuilder.field.minSalary.placeholder",
                    )}
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  {t(
                    "settings:subscriptions.alertBuilder.field.frequency.label",
                  )}
                </label>
                <select
                  className={styles.select}
                  value={frequencyId}
                  onChange={(e) =>
                    setFrequencyId(e.target.value as FrequencyId)
                  }
                >
                  {FREQUENCIES.map((id) => (
                    <option key={id} value={id}>
                      {t(`settings:subscriptions.alertBuilder.frequency.${id}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.actions}>
              <Button variant="primary" onClick={save} disabled={!valid}>
                {t(
                  editing
                    ? "settings:subscriptions.alertBuilder.action.saveChanges"
                    : "settings:subscriptions.alertBuilder.action.createAlert",
                )}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                {t("settings:subscriptions.alertBuilder.action.cancel")}
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              {editing ? <FiCheck size={28} /> : <FiBell size={26} />}
            </div>
            <div className={styles.successTitle}>
              <Translation
                i18nKey={
                  editing
                    ? "settings:subscriptions.alertBuilder.success.updatedTitle"
                    : "settings:subscriptions.alertBuilder.success.createdTitle"
                }
                components={{ em: <em /> }}
              />
            </div>
            <p className={styles.successSub}>
              {t("settings:subscriptions.alertBuilder.success.sub", {
                title: title.trim(),
                frequency: frequencyLabel.toLowerCase(),
              })}
            </p>
            <div className={styles.successActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                {t("settings:subscriptions.alertBuilder.success.done")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
