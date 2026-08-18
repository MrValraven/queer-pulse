import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useInstantVisibilitySave } from "./WhoSeesWhatFieldToggles";
import {
  PRESET_META,
  VISIBILITY_PRESETS,
  type VisibilityPresetKey,
} from "./whoSeesWhat.data";
import styles from "./WhoSeesWhatSheet.module.css";

/** The preset (if any) whose four field values exactly match the current
 *  draft. Fully derived from `draft` rather than tracked as separate
 *  "selected preset" state — so flipping a single switch in
 *  `WhoSeesWhatFieldToggles` (which nothing here needs to know about
 *  directly) naturally clears the active preset the moment the draft no
 *  longer matches any preset's shape, with no cross-component wiring. */
function activePresetKey(draft: {
  photoVisible?: boolean;
  hoodVisible?: boolean;
  vouchersVisible?: boolean;
  lookingForPublic: boolean;
}): VisibilityPresetKey | null {
  const current = {
    photoVisible: Boolean(draft.photoVisible),
    hoodVisible: Boolean(draft.hoodVisible),
    vouchersVisible: Boolean(draft.vouchersVisible),
    lookingForPublic: draft.lookingForPublic,
  };
  const match = (Object.keys(VISIBILITY_PRESETS) as VisibilityPresetKey[]).find(
    (key) => {
      const preset = VISIBILITY_PRESETS[key];
      return (
        preset.photoVisible === current.photoVisible &&
        preset.hoodVisible === current.hoodVisible &&
        preset.vouchersVisible === current.vouchersVisible &&
        preset.lookingForPublic === current.lookingForPublic
      );
    },
  );
  return match ?? null;
}

/**
 * Three one-tap visibility presets. Applying one instant-saves all four
 * fields at once through the same `useInstantVisibilitySave` mechanism the
 * individual switches use, so the two surfaces can never disagree about how a
 * toggle actually gets persisted.
 */
export function WhoSeesWhatPresets() {
  const { t } = useTranslation();
  const { draft } = useProfileEdit();
  const setFields = useInstantVisibilitySave();
  const active = activePresetKey(draft);

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("members:profile.whoSeesWhat.presets.heading")}
      </h3>
      <p className={styles.sectionSub}>
        {t("members:profile.whoSeesWhat.presets.sub")}
      </p>
      <div className={styles.presetGrid}>
        {(Object.keys(VISIBILITY_PRESETS) as VisibilityPresetKey[]).map(
          (key) => {
            const meta = PRESET_META[key];
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isActive}
                className={[styles.presetCard, isActive && styles.presetCardActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFields(VISIBILITY_PRESETS[key])}
              >
                <span className={styles.presetName}>{t(meta.labelKey)}</span>
                <span className={styles.presetDesc}>{t(meta.descKey)}</span>
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}
