import { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SuggestEditModal } from "./SuggestEditModal";
import styles from "./SuggestEditTrigger.module.css";

interface SuggestEditTriggerProps {
  /** Fixed subject (a page name, a single guide) — see {@link SuggestEditModal}. */
  subject?: string;
  /** Picker options (e.g. guide titles) — see {@link SuggestEditModal}. */
  subjectOptions?: string[];
  /** Triage tag included in the submitted payload, e.g. "legal", "library". */
  context: string;
}

/**
 * Small "suggest an edit" pill that opens {@link SuggestEditModal} scoped to
 * this page or section — the same community-correction flow the Glossary
 * already used (`Queer101Sections.tsx`), extended across the resource pages
 * so a reader can flag anything that's outdated or wrong, not just glossary
 * terms.
 */
export function SuggestEditTrigger({
  subject,
  subjectOptions,
  context,
}: SuggestEditTriggerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
      >
        <FiEdit3 aria-hidden /> {t("resources:suggestEdit.pageTriggerCta")}
      </button>
      {open && (
        <SuggestEditModal
          subject={subject}
          subjectOptions={subjectOptions}
          context={context}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
