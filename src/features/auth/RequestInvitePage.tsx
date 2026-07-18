import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  RequestInviteForm,
  type RequestInviteOutcome,
} from "./RequestInviteForm";
import { RequestInviteSent } from "./RequestInviteSent";
import styles from "./auth.module.css";

export function RequestInvitePage() {
  const { t } = useTranslation();
  const [first, setFirst] = useState("");
  // null until submitted; "already" when the backend told us (409) we have it.
  const [outcome, setOutcome] = useState<RequestInviteOutcome | null>(null);

  if (outcome) {
    return <RequestInviteSent first={first} outcome={outcome} />;
  }

  return (
    <AuthLayout wide>
      <div className={styles.eyebrow}>{t("auth:requestInvite.eyebrow")}</div>
      <h1>
        <Translation
          i18nKey="auth:requestInvite.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.sub}>{t("auth:requestInvite.sub")}</p>

      <RequestInviteForm
        first={first}
        setFirst={setFirst}
        onSent={setOutcome}
      />

      <div className={styles.footer}>
        <Link
          to={routes.signIn}
          style={{ fontSize: 13.5, color: "var(--ink-60)", fontWeight: 500 }}
        >
          {t("auth:requestInvite.alreadyMember")}
        </Link>
      </div>
    </AuthLayout>
  );
}
