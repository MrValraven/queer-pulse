import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import styles from "./auth.module.css";
import pageStyles from "./SetNewPasswordPage.module.css";

export function SetNewPasswordDone() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div style={{ textAlign: "center" }}>
        <div className={pageStyles.doneIcon}>
          <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            <path
              d="M6 14.5L11.5 20L22 9"
              stroke="var(--jade)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={pageStyles.doneHead}>Password updated</div>
        <div className={pageStyles.doneSub}>
          You're good to go. Sign in with your new password.
        </div>
        <Button
          className={styles.authBtn}
          onClick={() => navigate(routes.signIn)}
        >
          Sign in
        </Button>
        <p className={pageStyles.doneNote}>
          All other sessions were signed out.
        </p>
      </div>
    </AuthLayout>
  );
}
