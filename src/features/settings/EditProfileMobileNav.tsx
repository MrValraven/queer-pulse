import { useEffect, useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PROFILE_NAV } from "./editProfileNav.data";
import { useProfileScrollSpy } from "./useProfileScrollSpy";
import styles from "./EditProfilePage.module.css";

/**
 * Phone-only counterpart to EditProfileSidebar: the profile-editor sections as a
 * sticky horizontal scroll-spy strip. Shares the scroll-spy state with the
 * desktop sidebar via {@link useProfileScrollSpy}, so the highlighted chip
 * always agrees with the section in view. The external "pronouns guide" link the
 * sidebar carries is dropped here — it's already linked inline in the Pronouns
 * section, and a navigate-away item doesn't belong in a scroll-spy strip.
 */
export function EditProfileMobileNav() {
  const { t } = useTranslation();
  const { active, goTo } = useProfileScrollSpy();
  const stripRef = useRef<HTMLDivElement>(null);

  // Keep the highlighted chip in view as scrolling moves the active section.
  useEffect(() => {
    const chip = stripRef.current?.querySelector<HTMLElement>(
      '[aria-current="true"]',
    );
    chip?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [active]);

  return (
    <nav
      ref={stripRef}
      className={styles.mobileNav}
      aria-label={t("settings:editProfile.nav.group.profile")}
    >
      {PROFILE_NAV.map((item) => (
        <button
          type="button"
          key={item.id}
          className={[
            styles.mobileNavItem,
            active === item.id && styles.mobileNavItemActive,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-current={active === item.id ? "true" : undefined}
          onClick={() => goTo(item.id)}
        >
          <span className={styles.navIcon}>{item.icon}</span>
          {t(item.labelKey)}
        </button>
      ))}
    </nav>
  );
}
