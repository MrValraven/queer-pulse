import { useId, useRef, useState, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus, FiX } from "react-icons/fi";
import { Collapse, CollapseListItem } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LIMITS, type StudioSource } from "./api/studio.types";
import { isIncompleteSource, presentSourceTitles } from "./studioSources";
import css from "./StudioTrackFields.module.css";

let sourceRowSequence = 0;
function createSourceRowKey(): string {
  sourceRowSequence += 1;
  return `source-${sourceRowSequence}`;
}

/** Keys for the rows on screen, so a removed row is the one that folds away.
 *  A list changed from outside (a refetch) gets keys for any new rows. */
function useSourceRowKeys(count: number) {
  const [rowKeys, setRowKeys] = useState<string[]>(() =>
    Array.from({ length: count }, createSourceRowKey),
  );
  if (rowKeys.length !== count) {
    const syncedKeys = Array.from(
      { length: count },
      (_unused, index) => rowKeys[index] ?? createSourceRowKey(),
    );
    setRowKeys(syncedKeys);
    return { rowKeys: syncedKeys, setRowKeys };
  }
  return { rowKeys, setRowKeys };
}

/** Sources on an edit, lip-sync or mix track (spec 6.3): Song title and
 *  Artist rows, Add source and Remove source. Rows fold in and out; a new
 *  row takes focus on its title, and a removed row hands focus to the next
 *  title, else the previous one, else Add source. Every row needs both
 *  fields (or none) to save. `fieldsetRef` lets the panel reach the rows. */
export function StudioTrackSourcesField({
  sources,
  onChange,
  showErrors,
  fieldsetRef: outsideFieldsetRef,
}: {
  sources: StudioSource[];
  onChange: (sources: StudioSource[]) => void;
  showErrors: boolean;
  fieldsetRef?: RefObject<HTMLFieldSetElement | null>;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const errorId = useId();
  const ownFieldsetRef = useRef<HTMLFieldSetElement>(null);
  const fieldsetRef = outsideFieldsetRef ?? ownFieldsetRef;
  const { rowKeys, setRowKeys } = useSourceRowKeys(sources.length);
  const hasIncomplete = showErrors && sources.some(isIncompleteSource);

  function change(index: number, field: keyof StudioSource, value: string) {
    onChange(
      sources.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  }

  function add() {
    setRowKeys([...rowKeys, createSourceRowKey()]);
    onChange([...sources, { title: "", artist: "" }]);
    // Also keeps focus in the list when Add folds away at the last row.
    requestAnimationFrame(() => {
      const fieldset = fieldsetRef.current;
      if (fieldset) presentSourceTitles(fieldset).at(-1)?.focus();
    });
  }

  function remove(index: number) {
    const remaining = sources.length - 1;
    setRowKeys(rowKeys.filter((_key, keyIndex) => keyIndex !== index));
    onChange(sources.filter((_row, rowIndex) => rowIndex !== index));
    requestAnimationFrame(() => {
      const fieldset = fieldsetRef.current;
      if (!fieldset) return;
      const titles = presentSourceTitles(fieldset);
      const target =
        remaining > 0
          ? titles[Math.min(index, remaining - 1)]
          : fieldset.querySelector<HTMLElement>("button[data-add-source]");
      target?.focus();
    });
  }

  return (
    <fieldset
      ref={fieldsetRef}
      className={css.sources}
      aria-describedby={hintId}
    >
      <legend>{t("studio:sources.heading")}</legend>
      <p id={hintId} className={css.hint}>
        {t("studio:sources.editorHint")}
      </p>
      <ul className={css.sourceList}>
        <AnimatePresence initial={false}>
          {sources.map((source, index) => {
            const isRowIncomplete = showErrors && isIncompleteSource(source);
            const number = index + 1;
            return (
              <CollapseListItem key={rowKeys[index]}>
                <div className={css.sourceRow}>
                  <input
                    type="text"
                    data-source-title
                    value={source.title}
                    maxLength={STUDIO_LIMITS.sourceFieldMax}
                    aria-label={t("studio:sources.titleLabel", { number })}
                    aria-invalid={
                      isRowIncomplete && !source.title.trim() ? true : undefined
                    }
                    aria-describedby={isRowIncomplete ? errorId : undefined}
                    onChange={(event) =>
                      change(index, "title", event.target.value)
                    }
                  />
                  <input
                    type="text"
                    value={source.artist}
                    maxLength={STUDIO_LIMITS.sourceFieldMax}
                    aria-label={t("studio:sources.artistLabel", { number })}
                    aria-invalid={
                      isRowIncomplete && !source.artist.trim()
                        ? true
                        : undefined
                    }
                    aria-describedby={isRowIncomplete ? errorId : undefined}
                    onChange={(event) =>
                      change(index, "artist", event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className={css.remove}
                    aria-label={t("studio:sources.removeAria", { number })}
                    onClick={() => remove(index)}
                  >
                    <FiX aria-hidden />
                  </button>
                </div>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={hasIncomplete}>
        <p id={errorId} className={css.error} role="alert">
          {t("studio:sources.incomplete")}
        </p>
      </Collapse>
      <Collapse isOpen={sources.length < STUDIO_LIMITS.sourcesMax}>
        <button type="button" data-add-source className={css.add} onClick={add}>
          <FiPlus aria-hidden /> {t("studio:sources.addCta")}
        </button>
      </Collapse>
    </fieldset>
  );
}
