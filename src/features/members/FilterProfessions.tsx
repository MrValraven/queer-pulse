import { useCallback, useId, useMemo, useState } from "react";
import { ChipSelect, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DISCIPLINES,
  FIELD_BY_PROFESSION,
  PROFESSIONS_BY_FIELD,
  professionsForFields,
  type FilterState,
} from "./memberDirectoryFilter.data";
import { FilterSection } from "./FilterSection";
import { type SectionKey } from "./filterSectionKeys";
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
 *  *resolved* label so it works in whichever language is active. Search lives
 *  in the "What they do" card but drives the Profession card below it too. */
export function FilterProfessions({
  filters,
  onChange,
  sectionsOpen,
  onToggleSection,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  sectionsOpen: Record<SectionKey, boolean>;
  onToggleSection: (key: SectionKey) => void;
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

  return (
    <>
      <FilterSection
        title={t("members:directory.filter.whatTheyDoTitle")}
        headingId={`${uid}-fields`}
        open={sectionsOpen.fields}
        onToggle={() => onToggleSection("fields")}
        activeCount={filters.disciplines.length}
      >
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
      </FilterSection>

      <ProfessionFilterCard
        filters={filters}
        onChange={onChange}
        query={query}
        open={sectionsOpen.professions}
        onToggle={() => onToggleSection("professions")}
      />
    </>
  );
}

/** The "Profession" card. Three states, never a wall of ~70 chips:
 *   • searching → matching professions grouped under their parent field, so a
 *     result like "Nurse" is never a floating, contextless chip;
 *   • field(s) chosen, no search → just those fields' professions (already
 *     scoped, so a flat row);
 *   • nothing chosen, no search → a prompt to pick a field or search, not the
 *     entire flattened pool. */
function ProfessionFilterCard({
  filters,
  onChange,
  query,
  open,
  onToggle,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  query: string;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const uid = useId();
  const q = query.trim().toLowerCase();

  // While searching, professions are grouped under their parent field (fields
  // kept in `DISCIPLINES` order) so the pool stays navigable and each match
  // shows which field it belongs to. Empty groups are dropped.
  const professionGroups = useMemo(
    () =>
      q
        ? DISCIPLINES.map((discipline) => ({
            fieldId: discipline.id,
            labelKey: discipline.labelKey,
            professions: (PROFESSIONS_BY_FIELD[discipline.id] ?? []).filter(
              (p) => t(p.labelKey).toLowerCase().includes(q),
            ),
          })).filter((group) => group.professions.length > 0)
        : [],
    [q, t],
  );

  // With no search, professions are scoped to the chosen fields. No field chosen
  // means an intentional empty list (the card shows a prompt) — never the whole
  // flattened pool.
  const scopedProfessions = useMemo(
    () =>
      !q && filters.disciplines.length
        ? professionsForFields(filters.disciplines)
        : [],
    [q, filters.disciplines],
  );

  // Toggling a profession on also selects its parent field, so the choice
  // survives `reconcileProfessions` and the field chip lights up to match —
  // this is what keeps a searched profession coherent once picked.
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

  // The footer note only appears alongside actual chips: searching with matches,
  // or a field scoping the list. The empty states carry their own prompt as the
  // card body, so no note is added there (avoids a doubled message).
  const professionNote = q
    ? professionGroups.length > 0
      ? t("members:directory.filter.matchingSearch")
      : null
    : filters.disciplines.length
      ? t("members:directory.filter.showingWithinField", {
          count: filters.disciplines.length,
        })
      : null;

  const selectedProfessions = new Set(filters.professions);

  return (
    <FilterSection
      title={t("members:directory.filter.professionTitle")}
      headingId={`${uid}-professions`}
      open={open}
      onToggle={onToggle}
      activeCount={filters.professions.length}
    >
      {q ? (
        professionGroups.length > 0 ? (
          <div className={styles.professionGroups}>
            {professionGroups.map((group) => {
              const groupLabelId = `${uid}-pg-${group.fieldId}`;
              return (
                <div key={group.fieldId}>
                  <p id={groupLabelId} className={styles.professionGroupLabel}>
                    {t(group.labelKey)}
                  </p>
                  <ChipSelect
                    labelledBy={groupLabelId}
                    options={group.professions.map((o) => ({
                      value: o.id,
                      label: t(o.labelKey),
                    }))}
                    selected={selectedProfessions}
                    onToggle={toggleProfession}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.rangeNote}>
            <em>
              {t("members:directory.filter.noProfessionMatch", { query })}
            </em>
          </p>
        )
      ) : filters.disciplines.length ? (
        <ChipSelect
          labelledBy={`${uid}-professions`}
          options={scopedProfessions.map((o) => ({
            value: o.id,
            label: t(o.labelKey),
          }))}
          selected={selectedProfessions}
          onToggle={toggleProfession}
        />
      ) : (
        <p className={styles.rangeNote}>
          <em>{t("members:directory.filter.pickField")}</em>
        </p>
      )}

      {professionNote && (
        <p className={styles.rangeNote}>
          <em>{professionNote}</em>
        </p>
      )}
    </FilterSection>
  );
}
