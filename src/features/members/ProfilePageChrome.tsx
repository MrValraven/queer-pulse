import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./ProfilePage.module.css";
import editStyles from "./ProfileEdit.module.css";

/** "Back to the room" link above every member profile. */
export function ProfileBackBar() {
  const { t } = useTranslation();
  return (
    <div className={`${styles.backBar} wrap`}>
      <Link to={routes.members} className={styles.backLink}>
        <FiArrowLeft aria-hidden /> {t("members:profile.backToRoom")}
      </Link>
    </div>
  );
}

/**
 * The sticky bar shown while the owner is previewing their own profile as a
 * visitor would see it, with the way back out. Split out of `ProfilePage`
 * alongside {@link ProfileBackBar} to keep that component inside the repo's
 * 200-line rule.
 */
export function ProfilePreviewBanner({ onExit }: { onExit: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={editStyles.previewBar}>
      <span className={editStyles.previewText}>
        <Translation
          i18nKey="members:profile.previewBanner"
          components={{ strong: <strong /> }}
        />
      </span>
      <Button variant="ghost-dark" onClick={onExit}>
        {t("members:profile.exitPreview")}
      </Button>
    </div>
  );
}
