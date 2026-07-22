import { ChipSelect, Toggle } from "../../shared/components/ui";
import { useProfile } from "../../app/providers/ProfileProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOOKING_FOR } from "../settings/interests.data";
import { Section } from "./ProfileSections";
import styles from "./ProfilePage.module.css";

/**
 * Edit-mode twin of `LookingForSection`. The chips edit `draft.lookingFor`
 * (same field the Settings → Interests pane edits) and the switch edits
 * `draft.lookingForPublic`. Persisted with the rest of the draft on save.
 */
export function LookingForEditor() {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfile();
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
