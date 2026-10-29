import { useEffect, useId, useMemo, useRef } from "react";
import { FiCheck } from "react-icons/fi";
import {
  ChipList,
  Collapse,
  Select,
  type SelectOption,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_GENRE_LABEL_KEY } from "./api/studio.adapters";
import {
  STUDIO_GENRES,
  STUDIO_RELEASE_GENRES_MAX,
  type StudioGenre,
} from "./api/studio.types";
import { StudioGenreMainBadge } from "./StudioGenreMainBadge";
import styles from "./StudioGenrePicker.module.css";

interface StudioGenrePickerProps {
  /** The picked genres in order; the first leads. */
  value: readonly StudioGenre[];
  onChange: (genres: StudioGenre[]) => void;
  /** Placed on the trigger so a label's `htmlFor` and a hash link land on it. */
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}

/** The picked rows of a Select's multi value that are known genres, capped. */
function genresOf(values: readonly string[]): StudioGenre[] {
  return values
    .filter((entry): entry is StudioGenre =>
      (STUDIO_GENRES as readonly string[]).includes(entry),
    )
    .slice(0, STUDIO_RELEASE_GENRES_MAX);
}

/**
 * Picks up to `STUDIO_RELEASE_GENRES_MAX` genres. The shared Select supplies
 * the trigger, the type-to-filter popover and its keyboard handling; a pick
 * toggles a genre and keeps the popover open. At the cap the unpicked rows
 * disable and say why. The picks show as removable chips under the field,
 * the first marked Main, and removing the lead promotes the next. To reorder,
 * remove a genre and add it again.
 */
export function StudioGenrePicker({
  value,
  onChange,
  id,
  ...ariaProps
}: StudioGenrePickerProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const generatedId = useId();
  const triggerId = id ?? `${generatedId}-genres`;
  const triggerRef = useRef<HTMLElement | null>(null);
  // The trigger belongs to Select; chips return focus to it by id once the
  // last chip is gone.
  useEffect(() => {
    triggerRef.current = document.getElementById(triggerId);
  });
  const isAtCap = value.length >= STUDIO_RELEASE_GENRES_MAX;
  const fullReason = t("studio:uploadFlow.release.genresFullReason", {
    max: STUDIO_RELEASE_GENRES_MAX,
  });
  const options = useMemo<SelectOption[]>(
    () =>
      STUDIO_GENRES.map((genre) => ({
        value: genre,
        label: t(STUDIO_GENRE_LABEL_KEY[genre]),
        disabled: isAtCap && !value.includes(genre),
      })),
    [isAtCap, t, value],
  );
  const chips = useMemo(
    () =>
      value.map((genre, index) => ({
        genre,
        label: t(STUDIO_GENRE_LABEL_KEY[genre]),
        isMain: index === 0,
      })),
    [t, value],
  );

  return (
    <div className={styles.picker}>
      <Select
        {...ariaProps}
        id={triggerId}
        multiple
        label={t("studio:upload.metadata.field.genre")}
        placeholder={t("studio:uploadFlow.release.genresNonePicked")}
        options={options}
        searchable
        value={value}
        valueSummary={chips.map((chip) => chip.label).join(", ")}
        onChange={(next) => onChange(genresOf(next))}
        renderOption={(option, state) => (
          <>
            <span className={styles.optionText}>
              <span>{option.label}</span>
              {option.disabled && (
                <span className={styles.reason}>{fullReason}</span>
              )}
            </span>
            {state.selected && <FiCheck className={styles.check} aria-hidden />}
          </>
        )}
      />
      <Collapse isOpen={value.length > 0}>
        <p className={styles.counter}>
          <Translation
            i18nKey="studio:uploadFlow.release.genresCounter"
            values={{ count: value.length, max: STUDIO_RELEASE_GENRES_MAX }}
            slots={{
              count: (
                <RollingNumber
                  value={formatters.number(value.length)}
                  numericValue={value.length}
                />
              ),
            }}
          />
        </p>
      </Collapse>
      <ChipList
        items={chips}
        getKey={(chip) => chip.genre}
        renderLabel={(chip) => (
          <>
            {chip.label}
            <StudioGenreMainBadge isMain={chip.isMain} />
          </>
        )}
        removeLabel={(chip) =>
          t("studio:uploadFlow.release.genresRemove", { genre: chip.label })
        }
        onRemove={(chip) =>
          onChange(value.filter((genre) => genre !== chip.genre))
        }
        emptyFocusRef={triggerRef}
      />
    </div>
  );
}

/** FormField wires its label, hint and error onto a child that opts in, and
 *  this one forwards them onto the Select trigger. */
StudioGenrePicker.formFieldControl = true;
