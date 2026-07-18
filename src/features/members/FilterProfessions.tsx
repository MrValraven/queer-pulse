import { useCallback, useId, useMemo, useState } from "react";
import { ChipSelect, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ALL_PROFESSIONS,
  DISCIPLINES,
  FIELD_BY_PROFESSION,
  PROFESSIONS_BY_FIELD,
  professionsForFields,
  type FilterState,
} from "./memberDirectoryFilter.data";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Toggle a value within a string[] immutably. */
function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

/** The "What they do" (field) + "Profession" filter cards. Owns the free-text
 *  search that widens the profession pool to every matching profession.
 *  Chips carry a stable `id` (compared/stored) alongside a `t()`-resolved
 *  display label — see the i18n sweep note on `memberDirectoryFilter.data.ts`
 *  for why the two were split. The free-text search matches against the
 *  *resolved* label so it works in whichever language is active. */
export function FilterProfessions({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const { t } = useTranslation();
  const uid = useId();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const disciplineOptions = useMemo(
    () =>
      q
        ? DISCIPLINES.filter(
            (d) =>
              t(d.labelKey).toLowerCase().includes(q) ||
              (PROFESSIONS_BY_FIELD[d.id] ?? []).some((p) =>
                t(p.labelKey).toLowerCase().includes(q),
              ),
          )
        : DISCIPLINES,
    [q, t],
  );
  const professionPool = useMemo(
    () =>
      q
        ? ALL_PROFESSIONS.filter((p) => t(p.labelKey).toLowerCase().includes(q))
        : professionsForFields(filters.disciplines),
    [q, filters.disciplines, t],
  );

  // Toggling a profession on also selects its parent field, so the choice
  // survives `reconcileProfessions` and the field chip lights up to match.
  const toggleProfession = useCallback(
    (value: string) => {
      const has = filters.professions.includes(value);
      const professions = has
        ? filters.professions.filter((p) => p !== value)
        : [...filters.professions, value];
      const field = FIELD_BY_PROFESSION[value];
      const disciplines =
        !has && field && !filters.disciplines.includes(field)
          ? [...filters.disciplines, field]
          : filters.disciplines;
      onChange({ ...filters, professions, disciplines });
    },
    [filters, onChange],
  );

  return (
    <>
      <div className={styles.filterCard}>
        <h4 id={`${uid}-fields`}>
          {t("members:directory.filter.whatTheyDoTitle")}
        </h4>
        <SearchInput
          className={styles.searchField}
          placeholder={t("members:directory.filter.searchPlaceholder")}
          value={query}
          onChange={setQuery}
          ariaLabel={t("members:directory.filter.searchAriaLabel")}
        />
        {disciplineOptions.length > 0 ? (
          <ChipSelect
            labelledBy={`${uid}-fields`}
            options={disciplineOptions.map((o) => ({
              value: o.id,
              label: t(o.labelKey),
            }))}
            selected={new Set(filters.disciplines)}
            onToggle={(value) =>
              onChange({
                ...filters,
                disciplines: toggle(filters.disciplines, value),
              })
            }
          />
        ) : (
          <p className={styles.rangeNote}>
            <em>{t("members:directory.filter.noFieldMatch", { query })}</em>
          </p>
        )}
      </div>

      <div className={styles.filterCard}>
        <h4 id={`${uid}-professions`}>
          {t("members:directory.filter.professionTitle")}
        </h4>
        {professionPool.length > 0 ? (
          <ChipSelect
            labelledBy={`${uid}-professions`}
            options={professionPool.map((o) => ({
              value: o.id,
              label: t(o.labelKey),
            }))}
            selected={new Set(filters.professions)}
            onToggle={toggleProfession}
          />
        ) : (
          <p className={styles.rangeNote}>
            <em>
              {t("members:directory.filter.noProfessionMatch", { query })}
            </em>
          </p>
        )}
        <p className={styles.rangeNote}>
          <em>
            {q
              ? t("members:directory.filter.matchingSearch")
              : filters.disciplines.length
                ? t("members:directory.filter.showingWithinField", {
                    count: filters.disciplines.length,
                  })
                : t("members:directory.filter.pickField")}
          </em>
        </p>
      </div>
    </>
  );
}
