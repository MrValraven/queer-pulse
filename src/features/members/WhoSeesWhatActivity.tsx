import { Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useActivityVisibility } from "../settings/api/useActivityVisibility";
import { ACTIVITY_BAND_LABEL_KEY } from "./activityBand";
import styles from "./WhoSeesWhatSheet.module.css";

/**
 * The opt-out for the coarse "recently active" band, as its own self-contained
 * section of the "Who sees what" sheet.
 *
 * It does NOT go through `useInstantVisibilitySave` like the four switches
 * above it: those are fields of the profile draft and save through
 * `PATCH /profiles/me`, while this preference lives on its own row and its own
 * endpoint. That endpoint is reached through `useActivityVisibility`, shared
 * with the Settings Visibility pane, so the two surfaces sit on one query key
 * and cannot disagree about the switch. The copy stays here: the hook carries
 * no strings, and each call site toasts in its own namespace.
 *
 * The section always states the member's CURRENT band, including while it is
 * hidden. A privacy switch you cannot see the effect of is a switch nobody
 * trusts, and the band the member is hiding is the one fact that makes the
 * choice a real one.
 */
export function WhoSeesWhatActivity() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  // PRD-04. The fetch and the mutation used to be written out here, and the
  // Settings Visibility pane advertised the same opt-out as "coming soon".
  // Both surfaces now go through one hook on one query key, so the switch
  // cannot read one way here and another way in Settings.
  const { band, isHidden, setHidden, isDemoMode } = useActivityVisibility({
    onSaved: () =>
      showToast(t("members:profile.whoSeesWhat.toast.saved"), "success"),
    onError: () =>
      showToast(t("members:profile.whoSeesWhat.activity.error"), "error"),
  });

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("members:profile.whoSeesWhat.activity.heading")}
      </h3>
      <p className={styles.sectionSub}>
        {t("members:profile.whoSeesWhat.activity.sub")}
      </p>
      <div className={styles.rowList}>
        <div className={styles.row}>
          <div>
            <div className={styles.rowTitle}>
              {t("members:profile.whoSeesWhat.activity.hideLabel")}
            </div>
            <div className={styles.rowDesc}>
              {t("members:profile.whoSeesWhat.activity.hideDesc")}
            </div>
            <div className={styles.rowDesc}>
              {band
                ? t("members:profile.whoSeesWhat.activity.current", {
                    band: t(ACTIVITY_BAND_LABEL_KEY[band]),
                  })
                : t("members:profile.whoSeesWhat.activity.none")}
            </div>
          </div>
          <Toggle
            checked={isHidden}
            onChange={(next) => {
              if (isDemoMode) {
                showToast(
                  t("members:profile.whoSeesWhat.activity.demo"),
                  "info",
                );
                return;
              }
              setHidden(next);
            }}
            label={t("members:profile.whoSeesWhat.activity.hideLabel")}
            tone="coral"
          />
        </div>
      </div>
    </section>
  );
}
