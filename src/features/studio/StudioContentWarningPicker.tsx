import { useId, useMemo } from "react";
import { FiLock } from "react-icons/fi";
import { ChipSelect, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CONTENT_WARNINGS } from "../forum/compose/composeWarnings.data";
import {
  STUDIO_CONTENT_WARNING_IDS,
  type StudioContentWarningId,
} from "./api/studioSafety.types";
import css from "./StudioSafety.module.css";

const LABEL_KEY_BY_ID = new Map(
  CONTENT_WARNINGS.map((warning) => [warning.id, warning.labelKey]),
);
const labelKeyOf = (id: StudioContentWarningId) =>
  LABEL_KEY_BY_ID.get(id) ?? id;

/** "Content warnings" on the track and episode editors (spec 6.1): the D7
 *  themes as the forum composer's chips. Warnings our team added show as
 *  locked chips the artist cannot remove; the chips leave them out. */
export function StudioContentWarningPicker({
  selected,
  lockedWarnings,
  onChange,
}: {
  selected: readonly StudioContentWarningId[];
  lockedWarnings: readonly StudioContentWarningId[];
  onChange: (next: StudioContentWarningId[]) => void;
}) {
  const { t } = useTranslation();
  const legendId = useId();
  const hintId = useId();
  const selectedSet = useMemo(() => new Set<string>(selected), [selected]);
  const lockedSet = new Set<string>(lockedWarnings);
  const options = STUDIO_CONTENT_WARNING_IDS.filter(
    (id) => !lockedSet.has(id),
  ).map((id) => ({ value: id, label: t(labelKeyOf(id)) }));

  function toggle(id: string) {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(STUDIO_CONTENT_WARNING_IDS.filter((warning) => next.has(warning)));
  }

  return (
    <fieldset className={css.picker} aria-describedby={hintId}>
      <legend id={legendId} className={css.pickerLabel}>
        {t("studio:contentWarnings.pickerLabel")}
      </legend>
      <p id={hintId} className={css.pickerHint}>
        {t("studio:contentWarnings.pickerHint")}
      </p>
      <ChipSelect
        options={options}
        selected={selectedSet}
        onToggle={toggle}
        labelledBy={legendId}
        className={css.warningChips}
      />
      <Collapse isOpen={lockedWarnings.length > 0}>
        <ul
          className={css.lockedList}
          aria-label={t("studio:contentWarnings.lockedGroupLabel")}
        >
          {lockedWarnings.map((id) => (
            <li key={id} className={css.lockedChip}>
              <FiLock aria-hidden />
              {t(labelKeyOf(id))}
              <span className={css.lockedNote}>
                {t("studio:contentWarnings.lockedChip")}
              </span>
            </li>
          ))}
        </ul>
      </Collapse>
    </fieldset>
  );
}
