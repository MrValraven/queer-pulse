import { useState } from "react";
import { FiRadio } from "react-icons/fi";
import { Button, Collapse, Spinner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioGenre,
  StudioMood,
  StudioRadioFilter,
} from "./api/studio.types";
import { radioFilterLabelKey } from "./player/studioQueue";
import { radioFilterKey, useStudioRadio } from "./useStudioRadio";
import css from "./StudioBrowse.module.css";

const radioFilterKeys = (list: StudioRadioFilter[]) =>
  list.map(radioFilterKey).join("|");

/** "Play Fado radio" and "Play Tender radio" in the browse header, one per
 *  chosen filter, with the failure line under them. */
export function StudioPlayRadioButtons({
  genre,
  mood,
}: {
  genre: StudioGenre | null;
  mood: StudioMood | null;
}) {
  const { t } = useTranslation();
  const { startRadio, startingFilterKey, errorKey } = useStudioRadio();
  const filters: StudioRadioFilter[] = [];
  if (genre) filters.push({ kind: "genre", value: genre });
  if (mood) filters.push({ kind: "mood", value: mood });
  // Keep the last non-empty list so the block does not empty before it folds.
  const [lastFilters, setLastFilters] = useState(filters);
  if (
    filters.length > 0 &&
    radioFilterKeys(filters) !== radioFilterKeys(lastFilters)
  )
    setLastFilters(filters);
  const shownFilters = filters.length > 0 ? filters : lastFilters;
  return (
    <Collapse isOpen={filters.length > 0}>
      <div className={css.radioActions}>
        {shownFilters.map((filter) => {
          const filterKey = radioFilterKey(filter);
          const isStarting = startingFilterKey === filterKey;
          return (
            <Button
              key={filterKey}
              variant="primary"
              size="md"
              className={css.radioButton}
              aria-disabled={startingFilterKey !== null || undefined}
              aria-busy={isStarting || undefined}
              onClick={() => void startRadio(filter)}
            >
              {/* The pressed button swaps its radio icon for the spinner
                  while the station loads. */}
              {isStarting ? <Spinner /> : <FiRadio aria-hidden />}
              <span>
                {t("studio:radio.playCta", {
                  name: t(radioFilterLabelKey(filter)),
                })}
              </span>
            </Button>
          );
        })}
      </div>
      <Collapse isOpen={errorKey !== null}>
        <p className={css.radioError} role="alert">
          {errorKey ? t(errorKey) : null}
        </p>
      </Collapse>
    </Collapse>
  );
}
