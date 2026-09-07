import { FiAlertCircle } from "react-icons/fi";
import { focusControl } from "../../shared/lib/focusFirstError";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MissingFormField } from "./usePostOpportunityValidation";
import styles from "./PostVolunteerOpportunityPage.module.css";

/**
 * The "still missing" list under the submit button on the post/edit
 * opportunity form. The button itself is `aria-disabled` while anything is
 * missing, which answers "why can't I post?" only if something says what is
 * missing — that's this.
 *
 * Every entry is a real button that focuses and scrolls to the field it names,
 * so the list is a way to fix the form rather than only a report on it. Naming
 * the field is `onReveal`'s cue to mark the form submitted, so the inline error
 * on that field is already showing by the time the user arrives at it.
 *
 * Renders nothing when the form is complete — at which point the submit button
 * is enabled and there is nothing left to explain.
 */
export function MissingRequiredFields({
  id,
  fields,
  onReveal,
}: {
  /** Referenced by the submit button's `aria-describedby`. */
  id: string;
  fields: MissingFormField[];
  /** Called before focus moves, so the caller can reveal inline errors. */
  onReveal: () => void;
}) {
  const { t } = useTranslation();

  if (fields.length === 0) return null;

  const jumpTo = (field: MissingFormField) => {
    onReveal();
    // One frame, so the error `onReveal` reveals is in the DOM (and has grown
    // the field) before we measure where to scroll to — same reasoning as
    // `focusFirstErrorAfterRender`.
    requestAnimationFrame(() => {
      focusControl(document.getElementById(field.controlId));
    });
  };

  return (
    <div className={styles.missing} id={id}>
      <p className={styles.missingHead}>
        <FiAlertCircle aria-hidden />
        {t("marketing:postOpportunity.missing.heading", {
          count: fields.length,
        })}
      </p>
      <ul className={styles.missingList}>
        {fields.map((field) => (
          <li key={field.key}>
            <button
              type="button"
              className={styles.missingItem}
              onClick={() => jumpTo(field)}
            >
              {t(field.labelKey, field.labelValues)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
