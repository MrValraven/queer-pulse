import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsGroup, EditDetailsSection } from "./EditDetailsSection";
import { ContentNoteChips } from "./fields/ContentNoteChips";
import { ThemeChips } from "./fields/ThemeChips";
import {
  MAX_GATHERING_THEMES,
  MAX_HOUSE_RULES_LENGTH,
  sanitizeThemes,
  type ContentNoteKey,
  type GatheringThemeKey,
} from "./gatheringExtras";

/**
 * "Taking care" in the edit-details modal: themes, content notes and house
 * rules, the same care a host set in the wizard.
 *
 * The themes read against the draft's family as it stands, so a family
 * changed in this same edit hides the themes its own questions already ask
 * (ruling R6), and only the themes on show count toward the three.
 */
export function EditDetailsCare({
  draft,
  onChange,
}: {
  draft: GatheringDetailsDraft;
  /** Merged into the draft by the modal. */
  onChange: (patch: Partial<GatheringDetailsDraft>) => void;
}) {
  const { t } = useTranslation();
  const selectedThemes = sanitizeThemes(draft.themes, draft.gatheringFamily);

  // The wizard's own rule: a pressed chip releases, and a fourth pin does
  // nothing, since a card has room for three.
  const toggleTheme = (theme: GatheringThemeKey) => {
    if (selectedThemes.includes(theme)) {
      onChange({ themes: selectedThemes.filter((kept) => kept !== theme) });
    } else if (selectedThemes.length < MAX_GATHERING_THEMES) {
      onChange({ themes: [...selectedThemes, theme] });
    }
  };

  const toggleContentNote = (note: ContentNoteKey) =>
    onChange({
      contentNotes: draft.contentNotes.includes(note)
        ? draft.contentNotes.filter((kept) => kept !== note)
        : [...draft.contentNotes, note],
    });

  return (
    <EditDetailsSection title={t("gatherings:manage.editModal.section.care")}>
      <EditDetailsGroup
        label={t("gatherings:create.v2.what.themesLabel")}
        hint={t("gatherings:create.v2.what.themesHint")}
      >
        {({ labelId, hintId }) => (
          <ThemeChips
            family={draft.gatheringFamily}
            selectedThemes={selectedThemes}
            onToggle={toggleTheme}
            labelledBy={labelId}
            describedBy={hintId}
          />
        )}
      </EditDetailsGroup>
      <EditDetailsGroup
        label={t("gatherings:create.v2.care.contentNotesLabel")}
      >
        {({ labelId }) => (
          <ContentNoteChips
            selectedNotes={draft.contentNotes}
            onToggle={toggleContentNote}
            labelledBy={labelId}
          />
        )}
      </EditDetailsGroup>
      <FormField label={t("gatherings:create.v2.care.houseRulesLabel")}>
        <input
          type="text"
          maxLength={MAX_HOUSE_RULES_LENGTH}
          placeholder={t("gatherings:create.v2.care.houseRulesPlaceholder")}
          value={draft.houseRules}
          onChange={(event) => onChange({ houseRules: event.target.value })}
        />
      </FormField>
    </EditDetailsSection>
  );
}
