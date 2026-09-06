import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AuthoredTextDTO } from "./api/adminGovernanceOverview.api";
import styles from "./AdminGovernancePage.module.css";

/**
 * PRD-265. The EN + PT inputs for one piece of prose an editor is authoring on
 * the governance overview (a decision's lead or body, a principle's title or
 * text, a council role).
 *
 * ONE COMPONENT FOR ALL SEVEN of those fields, across three editors, because
 * the rule they enforce is the same everywhere and must not drift: both
 * languages are asked for at once. The backend requires both, and it requires
 * both because nothing on this platform will go back and translate a
 * governance entry later — the moment it is written is the only moment the
 * Portuguese exists to be had. A single-language field would produce a public
 * accountability page that is half unreadable to the members it is written
 * for.
 *
 * Both inputs are named by their own visible `<label>`, so the pair reads as
 * "Decision, English" / "Decision, Portuguese" rather than two identical
 * "English" boxes in a list of rows (the a11y build gate is at BUDGET=0, and
 * an accessible name that does not say WHICH row is not much better than
 * none).
 */
export function AdminGovernanceAuthoredText({
  idPrefix,
  label,
  value,
  maxLength,
  isMultiline = false,
  onChange,
}: {
  /** Unique per row and per field, e.g. `decision-lead-2`. */
  idPrefix: string;
  /** What this piece of prose is, e.g. "Decision". Prefixes both labels. */
  label: string;
  value: AuthoredTextDTO;
  maxLength: number;
  /** A paragraph field renders a textarea; a one-line field an input. */
  isMultiline?: boolean;
  onChange: (next: AuthoredTextDTO) => void;
}) {
  const { t } = useTranslation();

  const languageFields = [
    {
      code: "en" as const,
      labelText: t("admin:governance.overview.edit.textEn", { label }),
    },
    {
      code: "pt" as const,
      labelText: t("admin:governance.overview.edit.textPt", { label }),
    },
  ];

  return (
    <>
      {languageFields.map((languageField) => {
        const fieldId = `${idPrefix}-${languageField.code}`;
        return (
          <div key={languageField.code} className={styles.ovField}>
            <label className={styles.ovFieldLabel} htmlFor={fieldId}>
              {languageField.labelText}
            </label>
            {isMultiline ? (
              <textarea
                id={fieldId}
                rows={3}
                maxLength={maxLength}
                value={value[languageField.code]}
                onChange={(event) =>
                  onChange({
                    ...value,
                    [languageField.code]: event.target.value,
                  })
                }
              />
            ) : (
              <input
                id={fieldId}
                type="text"
                maxLength={maxLength}
                value={value[languageField.code]}
                onChange={(event) =>
                  onChange({
                    ...value,
                    [languageField.code]: event.target.value,
                  })
                }
              />
            )}
          </div>
        );
      })}
    </>
  );
}
