import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Avatar } from "../../shared/components/ui";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioMenuShouldReplace } from "./studioAccountMenuNavigation";
import { useStudioShowcase } from "./useStudioShowcase";
import { StudioAccountMenuGiving } from "./StudioAccountMenuRows";
import styles from "./StudioAccountMenu.module.css";

/** The top of {@link StudioAccountMenuPanel}: the member's avatar, name and
 *  persona line, all one link to their QueerPulse profile (the main app's
 *  account menu reads the same way). The showcase's giving note sits under
 *  it, outside the link. */
export function StudioAccountMenuHeader({
  persona,
  onNavigate,
}: {
  persona: StudioArtistRefView | null;
  /** Closes the menu at once. */
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const identity = useAccountIdentity();
  const isShowcase = useStudioShowcase();
  const shouldReplace = useStudioMenuShouldReplace();

  return (
    <div className={styles.header}>
      <Link
        to={routes.accountProfile}
        replace={shouldReplace}
        className={styles.headerIdentity}
        onClick={onNavigate}
      >
        <Avatar
          initials={identity.initials}
          src={identity.photo}
          size={36}
          alt=""
        />
        <div className={styles.headerText}>
          <div className={styles.headerName}>{identity.name}</div>
          {persona && (
            <div className={styles.headerMeta}>
              {t("studio:creator.avatarLabel", { name: persona.name })}
            </div>
          )}
        </div>
      </Link>
      {isShowcase && <StudioAccountMenuGiving />}
    </div>
  );
}
