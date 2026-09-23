import type { ComponentPropsWithRef, RefObject } from "react";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import { MAX_SPACE_HANDLE_LENGTH } from "./spaceHandle";
import styles from "./CreateSpaceForm.module.css";

/** Caps from the backend's create-space DTO. */
const MAX_NAME_LENGTH = 200;
const MAX_TAGLINE_LENGTH = 200;
const MAX_PURPOSE_LENGTH = 5000;
/** The tagline's live count appears once it gets this close to the cap. */
const TAGLINE_COUNT_THRESHOLD = 160;

/** Read off the real route helper so the adornment follows the URL scheme. */
const HANDLE_PREFIX = communityPath("");

export type SpaceBasicsField = "name" | "handle" | "tagline" | "purpose";
export type SpaceBasicsValues = Record<SpaceBasicsField, string>;

/**
 * The web-address input with its fixed `/community/` lead-in drawn inside
 * the box. It opts into FormField's wiring, so the id and aria attributes
 * land on the inner input and the prefix stays out of the label's text.
 * Under React 19 `ref` is an ordinary prop, so the spread hands it to the
 * inner input too.
 */
function SpaceHandleInput(props: ComponentPropsWithRef<"input">) {
  return (
    <div className={styles.affix}>
      <span className={styles.affixPrefix}>{HANDLE_PREFIX}</span>
      <input {...props} className={styles.affixInput} />
    </div>
  );
}
SpaceHandleInput.formFieldControl = true;

interface SpaceBasicsFieldsProps {
  values: SpaceBasicsValues;
  onChange: (field: SpaceBasicsField, value: string) => void;
  /** One ref per control: the form focuses the name on open and the first
   *  empty field when a submit comes in early. */
  nameInputRef: RefObject<HTMLInputElement | null>;
  handleInputRef: RefObject<HTMLInputElement | null>;
  taglineInputRef: RefObject<HTMLInputElement | null>;
  purposeInputRef: RefObject<HTMLTextAreaElement | null>;
}

/**
 * Name, address, tagline and purpose. All four are required: each label
 * carries FormField's `*` marker and its control gets `aria-required`, and
 * while any of them is empty the form's footer says that all four are
 * needed.
 */
export function SpaceBasicsFields({
  values,
  onChange,
  nameInputRef,
  handleInputRef,
  taglineInputRef,
  purposeInputRef,
}: SpaceBasicsFieldsProps) {
  const { t } = useTranslation();
  const isTaglineNearLimit = values.tagline.length >= TAGLINE_COUNT_THRESHOLD;

  return (
    <fieldset className={styles.section}>
      <legend className={styles.sectionLegend}>
        {t("communities:spaces.mod.form.basics")}
      </legend>
      <div className={styles.basicsGrid}>
        <FormField label={t("communities:spaces.mod.form.name")} required>
          <input
            ref={nameInputRef}
            value={values.name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) => onChange("name", event.target.value)}
          />
        </FormField>

        <FormField
          label={t("communities:spaces.mod.form.handle")}
          helper={t("communities:spaces.mod.form.handleHelper")}
          required
        >
          <SpaceHandleInput
            ref={handleInputRef}
            value={values.handle}
            maxLength={MAX_SPACE_HANDLE_LENGTH}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => onChange("handle", event.target.value)}
          />
        </FormField>

        <FormField
          className={styles.fullRow}
          label={t("communities:spaces.mod.form.tagline")}
          helper={t("communities:spaces.mod.form.taglineHelper")}
          labelAside={
            isTaglineNearLimit
              ? t("communities:spaces.mod.form.charCount", {
                  count: values.tagline.length,
                  max: MAX_TAGLINE_LENGTH,
                })
              : undefined
          }
          required
        >
          <input
            ref={taglineInputRef}
            value={values.tagline}
            maxLength={MAX_TAGLINE_LENGTH}
            onChange={(event) => onChange("tagline", event.target.value)}
          />
        </FormField>

        <FormField
          className={styles.fullRow}
          label={t("communities:spaces.mod.form.purpose")}
          helper={t("communities:spaces.mod.form.purposeHelper")}
          required
        >
          <textarea
            ref={purposeInputRef}
            rows={4}
            value={values.purpose}
            maxLength={MAX_PURPOSE_LENGTH}
            onChange={(event) => onChange("purpose", event.target.value)}
          />
        </FormField>
      </div>
    </fieldset>
  );
}
