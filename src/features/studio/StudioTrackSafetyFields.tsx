import { useId } from "react";
import { FiLock } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioContentWarningId } from "./api/studioSafety.types";
import { StudioContentWarningPicker } from "./StudioContentWarningPicker";
import css from "./StudioSafety.module.css";

/** The explicit box and the warning picker, as both editors show them.
 *  Our team's explicit mark keeps the box checked and disabled with
 *  "Marked explicit by our team" (spec 7). */
export function StudioTrackSafetyFields({
  explicitLabel,
  isExplicit,
  isExplicitLocked,
  onExplicitChange,
  contentWarnings,
  staffContentWarnings,
  onContentWarningsChange,
  checkboxClassName,
}: {
  explicitLabel: string;
  isExplicit: boolean;
  isExplicitLocked: boolean;
  onExplicitChange: (isExplicit: boolean) => void;
  contentWarnings: readonly StudioContentWarningId[];
  staffContentWarnings: readonly StudioContentWarningId[];
  onContentWarningsChange: (next: StudioContentWarningId[]) => void;
  checkboxClassName?: string;
}) {
  const { t } = useTranslation();
  const lockNoteId = useId();
  return (
    <>
      <label className={checkboxClassName}>
        <input
          type="checkbox"
          checked={isExplicit || isExplicitLocked}
          disabled={isExplicitLocked}
          aria-describedby={isExplicitLocked ? lockNoteId : undefined}
          onChange={(event) => onExplicitChange(event.target.checked)}
        />{" "}
        {explicitLabel}
      </label>
      <Collapse isOpen={isExplicitLocked}>
        <p id={lockNoteId} className={css.lockNote}>
          <FiLock aria-hidden />
          {t("studio:explicitLocked")}
        </p>
      </Collapse>
      <StudioContentWarningPicker
        selected={contentWarnings}
        lockedWarnings={staffContentWarnings}
        onChange={onContentWarningsChange}
      />
    </>
  );
}
