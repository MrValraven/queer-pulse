import { type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePreviousLocation } from "../../app/providers/NavHistoryProvider";
import { profileBackTarget } from "./profileBackTarget";
import styles from "./ProfilePage.module.css";
import editStyles from "./ProfileEdit.module.css";

/**
 * The way back out of a member profile, above every one of them.
 *
 * Profiles are reached from all over the platform — a community's member list,
 * a forum thread, a gathering, search, a DM header — so this returns to
 * whichever page the visitor actually came from rather than always dumping them
 * in the members directory (which it still does when we can't know: a shared
 * link, a refresh, a notification). See `profileBackTarget`.
 */
export function ProfileBackBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const previous = usePreviousLocation();
  const target = profileBackTarget(previous, pathname);

  // Kept as a real anchor with a real href (so open-in-new-tab and
  // middle-click still reach the origin), but a plain left click walks history
  // back instead of pushing a second copy of the origin: only a POP lets
  // ScrollManager restore the offset the visitor left that page at.
  const goBack = (event: MouseEvent<HTMLAnchorElement>) => {
    if (target.mode !== "history") return;
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    void navigate(-1);
  };

  return (
    <div className={`${styles.backBar} wrap`}>
      <Link to={target.to} onClick={goBack} className={styles.backLink}>
        <FiArrowLeft aria-hidden /> {t(`members:${target.labelKey}`)}
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
