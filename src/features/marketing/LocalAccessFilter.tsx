import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ACCESSIBILITY_QUESTIONS,
  type AccessibilitySlug,
} from "./listBusiness/listingAccessibility.data";
import s from "./LocalFilterBar.module.css";

/**
 * The accessibility filter: the same six canonical questions the detail page
 * answers, turned into something a member can search on.
 *
 * The vocabulary and the wording are read straight from
 * `ACCESSIBILITY_QUESTIONS`, so a need reads identically here, on the card, and
 * on the listing itself, and the slugs sent to the server can never drift from
 * the six the endpoint accepts.
 *
 * Two honesty rules the note below states out loud, because the whole feature
 * is worthless if a member cannot trust it:
 *
 * - a place appears only when it has answered YES to every ticked need. Several
 *   needs are an AND, because someone who needs a step-free entrance AND an
 *   accessible toilet is not helped by a place with one of them.
 * - a place nobody has asked stays out of the results. "Unknown" is a real
 *   answer, and quietly promoting it to a yes would send a wheelchair user to a
 *   door that may have steps.
 *
 * A real `<fieldset>`/`<legend>` names the group, and each need is a toggle
 * carrying its own pressed state, so the whole thing is keyboard-operable and
 * announces what is on.
 */
export function LocalAccessFilter({
  access,
  onToggleAccess,
}: {
  /** The needs currently filtered on, in canonical question order. */
  access: AccessibilitySlug[];
  onToggleAccess: (slug: AccessibilitySlug) => void;
}) {
  const { t } = useTranslation();

  return (
    <fieldset className={s.accessGroup}>
      <legend className={s.groupLabel}>
        {t("marketing:local.filter.accessLabel")}
      </legend>
      <p className={s.accessNote}>{t("marketing:local.filter.accessNote")}</p>
      <div className={s.accessChips}>
        {ACCESSIBILITY_QUESTIONS.map((question) => {
          const isOn = access.includes(question.slug);
          return (
            <button
              key={question.slug}
              type="button"
              aria-pressed={isOn}
              className={[s.chip, isOn && s.chipOn].filter(Boolean).join(" ")}
              onClick={() => onToggleAccess(question.slug)}
            >
              {isOn && <FiCheck aria-hidden />}
              {t(question.labelKey)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
