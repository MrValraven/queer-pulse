import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import {
  getActivityVisibility,
  setActivityVisibility,
  type ActivityVisibilityDTO,
} from "./api/activityVisibility.api";
import { ACTIVITY_BAND_LABEL_KEY, toActivityBand } from "./activityBand";
import { DEMO_ACTIVITY_VISIBILITY } from "./activityBand.data";
import styles from "./WhoSeesWhatSheet.module.css";

/**
 * The opt-out for the coarse "recently active" band, as its own self-contained
 * section of the "Who sees what" sheet.
 *
 * It does NOT go through `useInstantVisibilitySave` like the four switches
 * above it: those are fields of the profile draft and save through
 * `PATCH /profiles/me`, while this preference lives on its own row and its own
 * endpoint. Owning its query and mutation here matches the sheet's stated
 * shape, where every section fetches its own data.
 *
 * The section always states the member's CURRENT band, including while it is
 * hidden. A privacy switch you cannot see the effect of is a switch nobody
 * trusts, and the band the member is hiding is the one fact that makes the
 * choice a real one.
 */
export function WhoSeesWhatActivity() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery<ActivityVisibilityDTO>({
    queryKey: ["activityVisibility", demoMode],
    enabled: !demoMode && loggedIn,
    queryFn: getActivityVisibility,
  });
  const visibility = demoMode ? DEMO_ACTIVITY_VISIBILITY : query.data;

  const mutation = useMutation({
    mutationFn: setActivityVisibility,
    onSuccess: (next) => {
      queryClient.setQueryData(["activityVisibility", demoMode], next);
      showToast(t("members:profile.whoSeesWhat.toast.saved"), "success");
    },
    onError: () => {
      showToast(t("members:profile.whoSeesWhat.activity.error"), "error");
    },
  });

  const band = toActivityBand(visibility?.band ?? null);
  const isHidden = Boolean(visibility?.isHidden);

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
              if (demoMode) {
                showToast(
                  t("members:profile.whoSeesWhat.activity.demo"),
                  "info",
                );
                return;
              }
              mutation.mutate(next);
            }}
            label={t("members:profile.whoSeesWhat.activity.hideLabel")}
            tone="coral"
          />
        </div>
      </div>
    </section>
  );
}
