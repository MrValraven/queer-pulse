import { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { SetNewPasswordForm } from "./SetNewPasswordForm";
import { SetNewPasswordDone } from "./SetNewPasswordDone";
import styles from "./auth.module.css";
import pageStyles from "./SetNewPasswordPage.module.css";

export function SetNewPasswordPage() {
  const [done, setDone] = useState(false);

  if (done) {
    return <SetNewPasswordDone />;
  }

  return (
    <AuthLayout>
      <h1>
        Choose a <em>new</em> password
      </h1>
      <p className={styles.sub}>
        Must be at least 10 characters. We recommend using a passphrase.
      </p>

      <SetNewPasswordForm onDone={() => setDone(true)} />

      <p className={pageStyles.authNote}>
        After saving, all other sessions will be signed out for security.
      </p>
    </AuthLayout>
  );
}
