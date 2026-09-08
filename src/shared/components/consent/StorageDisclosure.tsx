import { useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import {
  kindLabelKey,
  type StorageEntry,
} from "../../consent/storageInventory";
import styles from "./Consent.module.css";

/**
 * The "what this stores" disclosure inside a consent row: a collapsed button
 * that opens the full list of cookies and device storage that row is
 * answerable for, straight from `STORAGE_INVENTORY`.
 *
 * Collapsed by default so the preference center stays a decision, not a
 * document — the names are one click away without leaving the dialog, and
 * `/cookies` carries the same list in long form. The list is rendered as a
 * definition list rather than a table: at modal width a three-column table
 * either scrolls sideways or crushes the name column, and a `<dl>` reflows.
 */
export function StorageDisclosure({ entries }: { entries: StorageEntry[] }) {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const panelId = useId();

  if (entries.length === 0) return null;

  return (
    <div className={styles.disclosure}>
      <button
        type="button"
        className={styles.disclosureButton}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <FiChevronDown
          aria-hidden
          className={`${styles.disclosureChevron} ${
            isOpen ? styles.disclosureChevronOpen : ""
          }`}
        />
        {t("shared:consent.storage.disclose", { count: entries.length })}
      </button>

      {/* `hidden` rather than unmounting: the open/closed state survives a
          re-render from the sibling toggle, and find-in-page still skips it. */}
      <dl className={styles.disclosureList} id={panelId} hidden={!isOpen}>
        {entries.map((entry) => (
          <div key={entry.id} className={styles.disclosureRow}>
            <dt className={styles.disclosureNames}>
              {entry.names.map((name) => (
                <code key={name} className={styles.disclosureName}>
                  {name}
                </code>
              ))}
            </dt>
            <dd className={styles.disclosureMeta}>
              <span className={styles.disclosurePurpose}>
                {t(entry.purposeKey)}
              </span>
              <span className={styles.disclosureFacts}>
                {t(kindLabelKey(entry.kind))} · {t(entry.lifetimeKey)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
