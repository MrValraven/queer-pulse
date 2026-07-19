import { useState } from "react";
import { Link } from "react-router-dom";
import { FiUserPlus } from "react-icons/fi";
import { AuthLayout } from "./AuthLayout";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePlatformStatus } from "../../shared/api/usePlatformStatus";
import { PlatformClosedNotice } from "./PlatformClosedNotice";
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

  // Pre-emptive closed state, read BEFORE the form is filled in. Fails open by
  // construction: outside demo mode there is no `initialData`, so while the
  // query is loading or if it errors `platformStatus` is `undefined` here,
  // `joinRequestsClosed` stays `false`, and the page renders the form exactly
  // as it does today — a briefly-unreachable status endpoint must never block
  // a legitimate request.
  const { data: platformStatus } = usePlatformStatus();
  const joinRequestsClosed = platformStatus?.joinRequestsOpen === false;

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

      {joinRequestsClosed ? (
        // There is no point collecting a submission that will be rejected —
        // show the closed state instead of the form, not alongside it.
        <PlatformClosedNotice
          icon={FiUserPlus}
          title={t("auth:requestInvite.closed.title")}
          body={
            platformStatus?.registrationClosedMessage ||
            t("auth:requestInvite.closed.body")
          }
        />
      ) : (
        <RequestInviteForm
          first={first}
          setFirst={setFirst}
          onSent={setOutcome}
        />
      )}

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
