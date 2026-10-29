import { Link } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Avatar, Tooltip } from "../../shared/components/ui";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioMenuShouldReplace } from "./studioAccountMenuNavigation";
import { useStudioShowcase } from "./useStudioShowcase";
import {
  StudioAccountMenuGiving,
  StudioThemeIconButton,
} from "./StudioAccountMenuRows";
import styles from "./StudioAccountMenu.module.css";

/** The top of {@link StudioAccountMenuPanel}: the member's avatar, name and
 *  persona line, all one link to their Studio profile (the "You" page). The
 *  visible name and persona line already form the link's accessible name, so
 *  it carries no aria-label. "Back to QueerPulse" stays the way to the main
 *  app. The light/dark icon button and the Settings icon link sit at the far
 *  end of that line on desktop. The showcase's giving note sits under it,
 *  outside the link. */
export function StudioAccountMenuHeader({
  persona,
  onNavigate,
  shouldShowHeaderActions,
}: {
  persona: StudioArtistRefView | null;
  /** Shows the theme icon button and the Settings icon link; the phone sheet
   *  lists both as rows instead. */
  shouldShowHeaderActions: boolean;
  /** Closes the menu at once. */
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const identity = useAccountIdentity();
  const isShowcase = useStudioShowcase();
  const shouldReplace = useStudioMenuShouldReplace();
  const settingsLabel = t("studio:shell.menu.settings");

  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <Link
          to={routes.studioMe}
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
        {shouldShowHeaderActions && (
          <div className={styles.headerActions}>
            <StudioThemeIconButton />
            <Tooltip label={settingsLabel}>
              <Link
                to={routes.studioSettings}
                replace={shouldReplace}
                className={styles.headerIcon}
                aria-label={settingsLabel}
                onClick={onNavigate}
              >
                <FiSettings aria-hidden />
              </Link>
            </Tooltip>
          </div>
        )}
      </div>
      {isShowcase && <StudioAccountMenuGiving />}
    </div>
  );
}
