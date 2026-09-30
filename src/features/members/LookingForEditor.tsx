import { ChipSelect, Toggle } from "../../shared/components/ui";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOOKING_FOR, lookingForLabel } from "../settings/interests.data";
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
  // The chip's stored `value` stays the raw English string (see the NOTE in
  // ../settings/interests.data.ts); only the `label` shown on screen is
  // translated.
  const lookingForChipOptions = LOOKING_FOR.options.map((value) => ({
    value,
    label: lookingForLabel(t, value),
  }));
  return (
    <Section title={t("members:profileEdit.lookingFor.heading")}>
      <p className={styles.lookingForHelper}>
        {t("members:profileEdit.lookingFor.helper")}
      </p>
      {/* LOOKING_FOR.options are the literal stored values; the chip's
          stored value stays untranslated, and lookingForChipOptions carries
          the translated label alongside it. */}
      <ChipSelect
        tick={false}
        label={t("members:profileEdit.lookingFor.heading")}
        options={lookingForChipOptions}
        selected={new Set(draft.lookingFor)}
        onToggle={(value) =>
          updateDraft({
            lookingFor: draft.lookingFor.includes(value)
              ? draft.lookingFor.filter((entry) => entry !== value)
              : [...draft.lookingFor, value],
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
