import { FiBell } from "react-icons/fi";
import { NotificationsBellMenu } from "../notifications/NotificationsBellMenu";
import styles from "./StudioNotificationsBell.module.css";

/**
 * The app's notifications bell in the Studio topbar, so playlist-editor
 * invites, followed artists' releases and claim updates reach a member
 * without leaving Studio. It reuses the app's popover and unread count (demo
 * reads the mock, live reads the server), painted on the Studio roles.
 */
export function StudioNotificationsBell() {
  return (
    <NotificationsBellMenu
      icon={<FiBell aria-hidden className={styles.icon} />}
      triggerClassName={styles.bell}
      badgeClassName={styles.badge}
    />
  );
}
