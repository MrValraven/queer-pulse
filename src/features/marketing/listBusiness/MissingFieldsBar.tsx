import { useId, type Ref } from "react";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { MissingField } from "./listBusiness.data";
import { jumpToListingField } from "./jumpToListingField";
import styles from "./ListBusinessPage.module.css";

/**
 * The "a few things left" bar: one chip per still-unfilled required field,
 * each jumping to (and flashing) the field it names. Renders nothing when the
 * list is empty.
 *
 * Shared by the create wizard's step footer (`PaneActions`) and the owner
 * editor's save bar, so the single-screen editor keeps the exact same
 * missing-field affordance the stepped flow has.
 *
 * `isFocusTarget` lets a caller move focus onto the bar itself (through
 * `barRef`), as the wizard does after a save lands on a step with gaps. The
 * bar then becomes a named group, labelled by its heading and described by
 * its chips, so a screen reader says what is left. Left out, the bar renders
 * exactly as before.
 */
export function MissingFieldsBar({
  missing,
  className,
  barRef,
  isFocusTarget = false,
}: {
  missing: MissingField[];
  className?: string;
  /** The bar's root element, for a caller that focuses it. */
  barRef?: Ref<HTMLDivElement>;
  /** Whether the bar can take programmatic focus. Defaults to false. */
  isFocusTarget?: boolean;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const chipsId = useId();
  if (missing.length === 0) return null;
  return (
    <div
      ref={barRef}
      className={[styles.neededBar, className].filter(Boolean).join(" ")}
      {...(isFocusTarget && {
        tabIndex: -1,
        role: "group",
        "aria-labelledby": labelId,
        "aria-describedby": chipsId,
      })}
    >
      <FiAlertCircle size={15} className={styles.neededIcon} aria-hidden />
      <span
        id={isFocusTarget ? labelId : undefined}
        className={styles.neededLabel}
      >
        {t("marketing:listBusiness.paneActions.neededLabel")}
      </span>
      <span
        id={isFocusTarget ? chipsId : undefined}
        className={styles.neededChips}
      >
        {missing.map((field) => {
          const label = t(field.labelKey);
          return (
            <button
              key={field.anchor}
              type="button"
              className={styles.neededChip}
              onClick={() => jumpToListingField(field.anchor)}
              aria-label={t("marketing:listBusiness.paneActions.jumpToAria", {
                label,
              })}
            >
              {label}
              <FiArrowRight size={11} aria-hidden />
            </button>
          );
        })}
      </span>
    </div>
  );
}
