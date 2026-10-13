import { useId } from "react";
import { MeasuredHeightFrame } from "../../shared/components/layout/MeasuredHeightFrame";
import {
  ChipSelect,
  Collapse,
  type ChipOption,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ProfessionGroup } from "./workFieldPicker.data";
import {
  ResultChipGlide,
  WorkProfessionResults,
} from "./WorkProfessionResults";
import styles from "./WorkFieldPicker.module.css";

interface WorkPickerSearchResultsProps {
  /** Whether a search is running. The block folds away without one. */
  isSearching: boolean;
  /** The fields whose own name matches, as chips. */
  fieldOptions: ChipOption[];
  /** The matching roles, grouped under their fields. */
  professionGroups: ProfessionGroup[];
  selectedFields: Set<string>;
  selectedProfessions: Set<string>;
  /** Whether the chips glide to their new places (see `WorkFieldPicker`). */
  shouldChipsGlide: boolean;
  onToggleField: (fieldId: string) => void;
  onToggleProfession: (professionId: string) => void;
}

/**
 * What the work picker's search finds: the matching roles grouped under their
 * fields first, since a role is what most members are looking for, then the
 * fields whose own name matches as one chip row. The whole block folds open
 * with a search that finds something and away when the query clears, and
 * each part folds on its own as a keystroke empties or fills it, so a heading
 * never stands alone. `data-keep-in-place` holds a pressed chip under the
 * member's finger when the change moves it (`useKeepInPlace`), such as a
 * tick that widens a chip and wraps it onto the next line.
 */
export function WorkPickerSearchResults({
  isSearching,
  fieldOptions,
  professionGroups,
  selectedFields,
  selectedProfessions,
  shouldChipsGlide,
  onToggleField,
  onToggleProfession,
}: WorkPickerSearchResultsProps) {
  const { t } = useTranslation();
  const uid = useId();
  const hasFields = fieldOptions.length > 0;
  const hasProfessions = professionGroups.length > 0;
  return (
    <Collapse isOpen={isSearching && (hasFields || hasProfessions)}>
      <div className={styles.results} data-keep-in-place="">
        <Collapse isOpen={hasProfessions}>
          <div className={styles.head} id={`${uid}-profession`}>
            {t("members:workPicker.matchingRolesHeading")}
          </div>
          <ResultChipGlide shouldGlide={shouldChipsGlide}>
            <WorkProfessionResults
              groups={professionGroups}
              roleHeadingId={`${uid}-profession`}
              selected={selectedProfessions}
              onToggle={onToggleProfession}
            />
          </ResultChipGlide>
        </Collapse>
        {/* The frame eases the row's height as it gains or loses a line. The
          fold sits outside the frame, where the frame never chases it. */}
        <Collapse isOpen={hasFields}>
          <div className={styles.matchingFields}>
            <div className={styles.head} id={`${uid}-field`}>
              {t("members:workPicker.matchingFieldsHeading")}
            </div>
            <MeasuredHeightFrame>
              <ChipSelect
                isPresenceAnimated
                shouldGlide={shouldChipsGlide}
                labelledBy={`${uid}-field`}
                options={fieldOptions}
                selected={selectedFields}
                onToggle={onToggleField}
              />
            </MeasuredHeightFrame>
          </div>
        </Collapse>
      </div>
    </Collapse>
  );
}
