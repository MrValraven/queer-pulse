import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import type { Notice } from "./signInNotices";
import styles from "./auth.module.css";

/** The sign-in notice (probe failure or `?error=` code), with the optional
 *  "still stuck? contact us" line. */
export function SignInNotice({
  notice,
  showSupportLink,
}: {
  notice: Notice;
  showSupportLink: boolean;
}) {
  return (
    <div className={styles.notice} role="alert">
      <notice.Icon size={20} className={styles.noticeIcon} aria-hidden />
      <div className={styles.noticeText}>
        <strong>{notice.title}</strong>
        <span>{notice.body}</span>
        {showSupportLink && (
          <span className={styles.noticeSupport}>
            <Translation
              i18nKey="auth:signIn.notice.support"
              components={{ a: <Link to={routes.contact} /> }}
            />
          </span>
        )}
      </div>
    </div>
  );
}
