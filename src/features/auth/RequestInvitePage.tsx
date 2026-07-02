import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { RequestInviteForm } from "./RequestInviteForm";
import { RequestInviteSent } from "./RequestInviteSent";
import styles from "./auth.module.css";

export function RequestInvitePage() {
  const [first, setFirst] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return <RequestInviteSent first={first} />;
  }

  return (
    <AuthLayout wide>
      <div className={styles.eyebrow}>Request an invite</div>
      <h1>
        Ask to come <em>in.</em>
      </h1>
      <p className={styles.sub}>
        QueerPulse grows through trust, not advertising. The surest way in is a
        member who'll vouch for you — if you know someone here, ask them. If you
        don't, tell us a little about you and we'll take it from there.
      </p>

      <RequestInviteForm
        first={first}
        setFirst={setFirst}
        onSent={() => setSent(true)}
      />

      <div className={styles.footer}>
        <Link
          to={routes.signIn}
          style={{ fontSize: 13.5, color: "var(--ink-60)", fontWeight: 500 }}
        >
          Already a member? Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
