import { Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useDeferredDraftSave } from "../../app/providers/useDeferredDraftSave";
import { VISIBILITY_FIELDS } from "./whoSeesWhat.data";
import styles from "./WhoSeesWhatSheet.module.css";

/**
 * Apply a patch to the profile draft and persist it immediately, rather than
 * staging it behind the main profile editor's Save button: these are the
 * "takes effect right away" visibility controls the design calls out.
 *
 * The whole patch-then-save lifecycle is `useDeferredDraftSave`, shared with
 * the profile rail's 24h self-hide and the Now card. Read that hook for why
 * the persist has to wait for a later render at all, and why it waits on the
 * draft carrying the patch rather than on `save`'s identity changing (which
 * this hook used to do, and which fires on any of the ~30 lazy i18n namespace
 * loads that rebuild `t`, saving a draft that never got the patch).
 *
 * All this hook adds is the feedback. A failed save reverts the toggle to its
 * prior value before the error toast, since a visibility control silently
 * drifting from what is actually stored server-side would be a privacy bug,
 * not just a UI glitch; a patch the provider swallowed before any save
 * started gets the same toast, because as far as the member is concerned the
 * change they asked for did not happen either way.
 *
 * Exported alongside the component so `WhoSeesWhatPresets.tsx` can apply all
 * four fields at once through the exact same mechanism.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useInstantVisibilitySave() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const showErrorToast = () =>
    showToast(t("members:profile.whoSeesWhat.toast.error"), "error");

  return useDeferredDraftSave({
    onSaved: () =>
      showToast(t("members:profile.whoSeesWhat.toast.saved"), "success"),
    onFailed: showErrorToast,
    onPatchLost: showErrorToast,
  });
}

/**
 * The four instant-save visibility switches (photo / neighbourhood / vouchers
 * / looking-for). Each is a real `role="switch"` control via the shared
 * `<Toggle>`, bound straight to `draft.<field>`, with no local mirrored state.
 */
export function WhoSeesWhatFieldToggles() {
  const { t } = useTranslation();
  const { draft } = useProfileEdit();
  const setField = useInstantVisibilitySave();

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("members:profile.whoSeesWhat.fields.heading")}
      </h3>
      <p className={styles.sectionSub}>
        {t("members:profile.whoSeesWhat.fields.sub")}
      </p>
      <div className={styles.rowList}>
        {VISIBILITY_FIELDS.map((field) => (
          <div className={styles.row} key={field.key}>
            <div>
              <div className={styles.rowTitle}>{t(field.labelKey)}</div>
              <div className={styles.rowDesc}>{t(field.descKey)}</div>
            </div>
            <Toggle
              checked={Boolean(draft[field.key])}
              onChange={(next) => setField({ [field.key]: next })}
              label={t(field.labelKey)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
