import type { IconType } from "react-icons";
import styles from "./auth.module.css";

/**
 * Pre-emptive "this is closed right now" notice, rendered from
 * `usePlatformStatus()` BEFORE a visitor submits — so nobody round-trips
 * through Google (sign-in) or fills in the whole request-invite form only to
 * be rejected afterwards. Shared between SignInPage and RequestInvitePage so
 * the two closed states look and behave identically; each caller supplies its
 * own copy since the notices mean different things ("you can still sign in"
 * vs "there's no point submitting").
 *
 * `role="status"`, not `role="alert"`: this reflects a standing platform
 * state, not something that just went wrong.
 */
export function PlatformClosedNotice({
  icon: Icon,
  title,
  body,
}: {
  icon: IconType;
  title: string;
  body: string;
}) {
  return (
    <div className={styles.notice} role="status">
      <Icon size={20} className={styles.noticeIcon} aria-hidden />
      <div className={styles.noticeText}>
        <strong>{title}</strong>
        <span>{body}</span>
      </div>
    </div>
  );
}
