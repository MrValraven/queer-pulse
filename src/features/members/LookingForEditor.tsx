import { ChipSelect, Toggle } from "../../shared/components/ui";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOOKING_FOR } from "../settings/interests.data";
import { Section } from "./ProfileSections";
import styles from "./ProfilePage.module.css";

/**
 * Edit-mode editor for the member's "here for" intent. The chips edit
 * `draft.lookingFor` (same field the Settings → Interests pane edits) and the
 * switch edits `draft.lookingForPublic`. The read view renders this intent as
 * the "Here for" line in the profile hero (see `ProfileHero`). Persisted with
 * the rest of the draft on save.
 */
export function LookingForEditor() {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfileEdit();
  return (
    <Section title={t("members:profileEdit.lookingFor.heading")}>
      <p className={styles.lookingForHelper}>
        {t("members:profileEdit.lookingFor.helper")}
      </p>
      {/* LOOKING_FOR.options are the literal stored values — untranslated. */}
      <ChipSelect
        tick={false}
        label={t("members:profileEdit.lookingFor.heading")}
        options={LOOKING_FOR.options}
        selected={new Set(draft.lookingFor)}
        onToggle={(label) =>
          updateDraft({
            lookingFor: draft.lookingFor.includes(label)
              ? draft.lookingFor.filter((entry) => entry !== label)
              : [...draft.lookingFor, label],
          })
        }
      />
      <div className={styles.lookingForToggleRow}>
        <Toggle
          checked={draft.lookingForPublic}
          onChange={(checked) => updateDraft({ lookingForPublic: checked })}
          label={t("members:profileEdit.lookingFor.toggleLabel")}
        />
        <span className={styles.lookingForToggleLabel}>
          {t("members:profileEdit.lookingFor.toggleLabel")}
        </span>
      </div>
    </Section>
  );
}
