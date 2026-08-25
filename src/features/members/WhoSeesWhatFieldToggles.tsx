import { useEffect, useRef } from "react";
import { Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useProfileEdit,
  type ProfileDraft,
} from "../../app/providers/useProfile";
import { VISIBILITY_FIELDS } from "./whoSeesWhat.data";
import styles from "./WhoSeesWhatSheet.module.css";

/**
 * Apply a patch to the profile draft and persist it immediately, rather than
 * staging it behind the main profile editor's Save button — these are the
 * "takes effect right away" visibility controls the design calls out.
 *
 * `useProfileEdit().save()` is a `useCallback` closed over the CURRENT
 * `draft` state, so calling it in the same tick as `updateDraft()` would ship
 * the PRE-toggle draft (React hasn't re-rendered between the two calls, so
 * `save` here is still the stale closure). Instead, `setField` records the
 * patch as "pending" and an effect keyed on the fresh `save` reference — which
 * only changes identity once the provider has re-rendered with the new draft —
 * fires the actual persist. A failed save reverts the toggle to its prior
 * value, since a visibility control silently drifting from what's actually
 * stored server-side would be a privacy bug, not just a UI glitch.
 *
 * Exported alongside the component so `WhoSeesWhatPresets.tsx` can share the
 * exact same instant-save mechanism rather than duplicating the stale-closure
 * fix above; the task's fixed 11-file list has no room for a dedicated hook file.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useInstantVisibilitySave() {
  const { draft, updateDraft, save } = useProfileEdit();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const pendingPatch = useRef<Partial<ProfileDraft> | null>(null);
  const previousValues = useRef<Partial<ProfileDraft> | null>(null);

  useEffect(() => {
    if (!pendingPatch.current) return;
    const previous = previousValues.current;
    pendingPatch.current = null;
    previousValues.current = null;
    void (async () => {
      const ok = await save();
      if (ok) {
        showToast(t("members:profile.whoSeesWhat.toast.saved"), "success");
      } else {
        if (previous) updateDraft(previous);
        showToast(t("members:profile.whoSeesWhat.toast.error"), "error");
      }
    })();
    // `save` changes identity exactly when the provider has committed the
    // patch this hook just queued — that's the signal this effect waits for.
  }, [save, showToast, t, updateDraft]);

  return function setField(patch: Partial<ProfileDraft>) {
    previousValues.current = Object.fromEntries(
      Object.keys(patch).map((key) => [key, draft[key as keyof ProfileDraft]]),
    );
    pendingPatch.current = patch;
    updateDraft(patch);
  };
}

/**
 * The four instant-save visibility switches (photo / neighbourhood / vouchers
 * / looking-for). Each is a real `role="switch"` control via the shared
 * `<Toggle>`, bound straight to `draft.<field>` — no local mirrored state.
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
