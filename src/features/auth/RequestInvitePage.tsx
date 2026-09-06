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
  // The applicant's status token, held only for as long as this screen lives —
  // the durable copy is written to storage by the mutation. Null on the 409
  // path, where no new request (and so no token) was created.
  const [statusToken, setStatusToken] = useState<string | null>(null);

  // Pre-emptive closed state, read BEFORE the form is filled in. Fails open by
  // construction: outside demo mode there is no `initialData`, so while the
  // query is loading or if it errors `platformStatus` is `undefined` here,
  // `joinRequestsClosed` stays `false`, and the page renders the form exactly
  // as it does today — a briefly-unreachable status endpoint must never block
  // a legitimate request.
  const { data: platformStatus } = usePlatformStatus();
  const joinRequestsClosed = platformStatus?.joinRequestsOpen === false;

  if (outcome) {
    return (
      <RequestInviteSent
        first={first}
        outcome={outcome}
        statusToken={statusToken}
      />
    );
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
          onSent={(nextOutcome, nextStatusToken) => {
            setStatusToken(nextStatusToken);
            setOutcome(nextOutcome);
          }}
        />
      )}

      {/* DES-170: the type, colour and weight of these links are `.footer a`
          in auth.module.css, so they carry no inline style. */}
      <div className={styles.footer}>
        <Link to={routes.signIn}>{t("auth:requestInvite.alreadyMember")}</Link>
        {/* The only in-app way back to the status page for someone who kept
            their reference code but lost the link that carried it, and whose
            browser storage has since been cleared. Without it that applicant
            would have to know the URL by heart. */}
        <Link to={routes.joinRequestStatus}>
          {t("auth:requestInvite.checkStatusLink")}
        </Link>
        {/* PRD-306. The single most valuable place for this link: someone
            already holding a code is one submit away from spending one of
            their three requests an hour on an invite that already exists. */}
        <Link to={routes.enterInviteCode}>
          {t("auth:common.haveAnInviteCode")}
        </Link>
      </div>
    </AuthLayout>
  );
}
