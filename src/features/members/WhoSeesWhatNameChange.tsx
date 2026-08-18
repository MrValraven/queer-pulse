import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { routes } from "../../app/routeMap";
import styles from "./WhoSeesWhatSheet.module.css";

/**
 * A single link out to the existing handle-change form — `UsernameSection`,
 * rendered on `EditProfilePage` (`routes.editProfile`, anchored `#username`).
 * It's the one form that already exists in the app for this
 * (`PATCH /profiles/me/username`, live availability check, 409/422 error
 * copy); this section deliberately doesn't duplicate it inline.
 */
export function WhoSeesWhatNameChange() {
  const { t } = useTranslation();
  const { profile } = useProfileData();

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("members:profile.whoSeesWhat.nameChange.heading")}
      </h3>
      <p className={styles.sectionSub}>
        {t("members:profile.whoSeesWhat.nameChange.sub", { handle: profile.slug })}
      </p>
      <Button variant="ghost" to={`${routes.editProfile}#username`}>
        {t("members:profile.whoSeesWhat.nameChange.button")}
      </Button>
    </section>
  );
}
