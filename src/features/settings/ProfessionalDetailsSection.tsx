import { useId } from "react";
import { ChipSelect } from "../../shared/components/ui";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LANGUAGES } from "../members/memberDirectoryFilter.data";
import { WorkFieldPicker } from "../members/WorkFieldPicker";
import styles from "./InterestsPane.module.css";

/**
 * Discipline, profession and languages — Settings → Interests. Unlike the
 * identity chips above, these are PUBLIC (shown on the member's profile and
 * searchable in the member directory's "What they do" / "Profession" /
 * "Languages" filters), so this section says so explicitly rather than
 * inheriting the pane's "these are private" framing.
 *
 * The field/profession pair is the shared `WorkFieldPicker`, the same control
 * the profile editor and the onboarding wizard render, so the chip vocabulary
 * and the `profession ⊆ discipline` invariant can't drift between the three
 * places a member can set this. Languages stays here only.
 */
export function ProfessionalDetailsSection({
  onChange,
}: {
  onChange: () => void;
}) {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfileEdit();
  const uid = useId();

  const languageOptions = LANGUAGES.map((language) => language.label);

  const toggleLanguage = (code: string) => {
    const languages = draft.languages.includes(code)
      ? draft.languages.filter((language) => language !== code)
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

      <WorkFieldPicker
        discipline={draft.discipline}
        profession={draft.profession}
        headingClassName={styles.subHead}
        onChange={(next) => {
          updateDraft(next);
          onChange();
        }}
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
