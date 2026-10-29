import { type RefObject, useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiSearch, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_DISCOVERY_LIMITS } from "../studio/api/studio.types";
import { STUDIO_FADE } from "../studio/studioMotion";
import css from "./StudioAdminPickDialog.module.css";

/** The release search: a tall rounded field with the search icon inset on
 *  the left, a clear button on the right once there is text, and the hint
 *  under it. `describedByExtra` joins the "choose a release first" line. */
export function StudioAdminReleaseSearchField({
  value,
  onChange,
  inputRef,
  isInvalid,
  describedByExtra,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  isInvalid: boolean;
  describedByExtra: string;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const fieldId = useId();
  const hintId = useId();
  const hasText = value.length > 0;
  const fade = reducedMotion ? { duration: 0 } : STUDIO_FADE;
  return (
    <div className={css.field}>
      <label htmlFor={fieldId} className={css.fieldLabel}>
        {t("admin:studioAdmin.pickDialog.searchLabel")}
      </label>
      <div className={css.searchShell}>
        <FiSearch className={css.searchIcon} aria-hidden />
        <input
          id={fieldId}
          ref={inputRef}
          type="search"
          className={css.searchInput}
          value={value}
          maxLength={STUDIO_DISCOVERY_LIMITS.adminSearchQueryMaxLength}
          placeholder={t("admin:studioAdmin.pickDialog.searchPlaceholder")}
          autoComplete="off"
          aria-describedby={
            isInvalid ? `${hintId} ${describedByExtra}` : hintId
          }
          aria-invalid={isInvalid || undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        <AnimatePresence initial={false}>
          {hasText ? (
            <m.span
              key="clear"
              className={css.searchClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={fade}
            >
              <IconButton
                size="sm"
                aria-label={t("admin:studioAdmin.pickDialog.clearSearchCta")}
                onClick={() => {
                  onChange("");
                  inputRef.current?.focus();
                }}
              >
                <FiX aria-hidden />
              </IconButton>
            </m.span>
          ) : null}
        </AnimatePresence>
      </div>
      <p id={hintId} className={`${css.fieldHint} ${css.searchHint}`}>
        {t("admin:studioAdmin.pickDialog.searchHint")}
      </p>
    </div>
  );
}
