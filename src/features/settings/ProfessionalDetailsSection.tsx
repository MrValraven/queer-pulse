import { useId } from "react";
import { ChipSelect } from "../../shared/components/ui";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DISCIPLINES,
  FIELD_BY_PROFESSION,
  LANGUAGES,
  professionsForFields,
} from "../members/memberDirectoryFilter.data";
import styles from "./InterestsPane.module.css";

/**
 * Discipline, profession and languages — Settings → Interests. Unlike the
 * identity chips above, these are PUBLIC (shown on the profile card and
 * searchable in the member directory's "What they do" / "Profession" /
 * "Languages" filters), so this section says so explicitly rather than
 * inheriting the pane's "these are private" framing.
 *
 * Multi-select on both discipline and profession: real bios already describe
 * more than one role ("Dancer, model & venture builder"), so a single-select
 * would under-fit from day one. Picking a profession auto-adds its parent
 * field (mirrors the directory filter's `toggleProfession` /
 * `reconcileProfessions` invariant — see FilterProfessions.tsx) rather than
 * requiring both to be picked separately.
 */
export function ProfessionalDetailsSection({
  onChange,
}: {
  onChange: () => void;
}) {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfileEdit();
  const uid = useId();

  const disciplineOptions = DISCIPLINES.map((d) => ({
    value: d.id,
    label: t(d.labelKey),
  }));
  const professionOptions = professionsForFields(draft.discipline).map(
    (p) => ({ value: p.id, label: t(p.labelKey) }),
  );
  const languageOptions = LANGUAGES.map((l) => l.label);

  const toggleDiscipline = (id: string) => {
    const has = draft.discipline.includes(id);
    const discipline = has
      ? draft.discipline.filter((d) => d !== id)
      : [...draft.discipline, id];
    // Dropping a field also drops any profession scoped to it — keeps
    // `profession ⊆ discipline` coherent, mirroring reconcileProfessions.
    const profession = has
      ? draft.profession.filter((p) => FIELD_BY_PROFESSION[p] !== id)
      : draft.profession;
    updateDraft({ discipline, profession });
    onChange();
  };

  const toggleProfession = (id: string) => {
    const has = draft.profession.includes(id);
    const profession = has
      ? draft.profession.filter((p) => p !== id)
      : [...draft.profession, id];
    const field = FIELD_BY_PROFESSION[id];
    const discipline =
      !has && field && !draft.discipline.includes(field)
        ? [...draft.discipline, field]
        : draft.discipline;
    updateDraft({ discipline, profession });
    onChange();
  };

  const toggleLanguage = (code: string) => {
    const languages = draft.languages.includes(code)
      ? draft.languages.filter((l) => l !== code)
      : [...draft.languages, code];
    updateDraft({ languages });
    onChange();
  };

  return (
    <div className={styles.prefSection}>
      <div className={styles.psHead} id={`${uid}-professional`}>
        {t("settings:interests.professional.heading")}
      </div>
      <div className={styles.psHelper}>
        {t("settings:interests.professional.helper")}
      </div>

      <div className={styles.subHead} id={`${uid}-discipline`}>
        {t("settings:interests.professional.disciplineHeading")}
      </div>
      <ChipSelect
        labelledBy={`${uid}-discipline`}
        options={disciplineOptions}
        selected={new Set(draft.discipline)}
        onToggle={toggleDiscipline}
      />

      <div className={styles.subHead} id={`${uid}-profession`}>
        {t("settings:interests.professional.professionHeading")}
      </div>
      <ChipSelect
        labelledBy={`${uid}-profession`}
        options={professionOptions}
        selected={new Set(draft.profession)}
        onToggle={toggleProfession}
      />

      <div className={styles.subHead} id={`${uid}-languages`}>
        {t("settings:interests.professional.languagesHeading")}
      </div>
      <ChipSelect
        labelledBy={`${uid}-languages`}
        options={languageOptions}
        selected={new Set(draft.languages)}
        onToggle={toggleLanguage}
      />
    </div>
  );
}
