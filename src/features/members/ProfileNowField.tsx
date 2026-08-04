import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileEdit } from "../../app/providers/useProfile";
import { InlineTextarea } from "./profileEditControls";
import { OpenToEditor } from "./OpenToEditor";
import styles from "./ProfileEdit.module.css";

/**
 * The "Now" card's two editable halves: the free-text status and the "Open to"
 * chips. They're edited together because they read together — the status says
 * what you're in the middle of, the chips say what you'd welcome from it. Left
 * empty, the whole card is hidden on the profile rather than shown blank.
 */
export function ProfileNowField() {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfileEdit();

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {t("members:profileEdit.now.label")}
      </label>
      <p className={styles.fieldHelp}>{t("members:profileEdit.now.help")}</p>
      <InlineTextarea
        value={draft.now}
        ariaLabel={t("members:profileEdit.now.label")}
        placeholder={t("members:profileEdit.now.placeholder")}
        rows={3}
        className={styles.nowInput}
        onChange={(value) => updateDraft({ now: value })}
      />

      <p className={styles.subFieldLabel}>
        {t("members:profileEdit.openTo.label")}
      </p>
      <p className={styles.fieldHelp}>{t("members:profileEdit.openTo.help")}</p>
      <OpenToEditor
        entries={draft.openTo}
        onChange={(openTo) => updateDraft({ openTo })}
      />
    </div>
  );
}
