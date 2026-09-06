import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Spinner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AuthLayout } from "./AuthLayout";
import {
  isUnresolvableStatusToken,
  isWellFormedStatusToken,
  joinRequestInviteRefreshRefusal,
  type JoinRequestInviteRefreshRefusal,
  type JoinRequestStatusDTO,
} from "./api/joinRequest.api";
import {
  readJoinRequestStatus,
  rememberJoinRequestStatus,
} from "./api/joinRequestStatusToken";
import { useJoinRequestStatus } from "./api/useJoinRequestStatus";
import { useRefreshJoinRequestInvite } from "./api/useRefreshJoinRequestInvite";
import { JoinRequestStatusForm } from "./JoinRequestStatusForm";
import {
  ApprovedInviteSpentState,
  ApprovedState,
} from "./JoinRequestApprovedStates";
import {
  CodeNotFoundState,
  DeclinedState,
  StatusUnavailableState,
  UnderReviewState,
} from "./JoinRequestStatusStates";
import styles from "./JoinRequestStatus.module.css";

/** The decided/undecided display states, from one DTO plus the refresh action
 *  the "your invite lapsed" screen needs. */
function ResolvedStatus({
  status,
  onRefreshInvite,
  isRefreshingInvite,
  refreshRefusal,
}: {
  status: JoinRequestStatusDTO;
  onRefreshInvite: () => void;
  isRefreshingInvite: boolean;
  refreshRefusal: JoinRequestInviteRefreshRefusal | "unknown" | null;
}) {
  if (status.status === "under_review") {
    // PRD-304: `dueAt` is only ever populated here. The backend withholds it
    // the moment a decision lands, so an undecided request is the only place
    // the answer deadline is a live fact.
    return (
      <UnderReviewState submittedAt={status.submittedAt} dueAt={status.dueAt} />
    );
  }
  if (status.status === "approved") {
    // Approved with no code is not an error and not the same screen: the
    // invite was used, revoked or expired since the decision. `inviteStatus`
    // says which, so the spent screen can offer the one recovery that exists
    // (a fresh window on a lapsed invite) and none of the ones that do not.
    return status.inviteCode ? (
      <ApprovedState
        inviteCode={status.inviteCode}
        decidedAt={status.decidedAt}
        expiresAt={status.inviteExpiresAt}
      />
    ) : (
      <ApprovedInviteSpentState
        decidedAt={status.decidedAt}
        inviteStatus={
          status.inviteStatus === "valid" ? null : status.inviteStatus
        }
        onRefresh={onRefreshInvite}
        isRefreshing={isRefreshingInvite}
        refusal={refreshRefusal}
      />
    );
  }
  return (
    <DeclinedState
      declineReason={status.declineReason}
      decidedAt={status.decidedAt}
    />
  );
}

/**
 * Where an applicant's request to join stands (`/auth/request-invite/status`).
 *
 * PUBLIC by construction — an applicant has no account, which is the entire
 * point. `authGate.ts` gates by denylist and nothing under `/auth` is on it, so
 * this route stays reachable logged out exactly as `routes.requestInvite` does.
 *
 * Where the code comes from, in order:
 *   1. `?token=` — the one-click path from the confirmation screen.
 *   2. this browser's stored token, for someone who just opened the page cold.
 *   3. the paste-a-code form, for someone who saved the code and lost the link.
 */
export function JoinRequestStatusPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  // Read ONCE at mount. The effect below strips `?token=` from the address bar
  // after a successful check, and `activeToken` must not collapse to the stored
  // token (or to nothing) the moment it does.
  const [queryToken] = useState(() => (searchParams.get("token") ?? "").trim());
  // Read once at mount: storage is a fallback for the query string, and it must
  // not re-assert itself over a code the applicant has since typed.
  const [storedToken] = useState(() => readJoinRequestStatus()?.token ?? "");
  // null = nothing typed yet, so the query string / storage decide. "" = the
  // applicant explicitly asked for the form back after a miss.
  const [typedToken, setTypedToken] = useState<string | null>(null);

  const activeToken = typedToken ?? (queryToken || storedToken);
  const hasUsableToken =
    activeToken.length > 0 && isWellFormedStatusToken(activeToken);
  const statusQuery = useJoinRequestStatus(hasUsableToken ? activeToken : null);
  // The applicant reviving their own lapsed approval invite. Keyed on the same
  // token the read uses, and it writes the fresh status straight into that
  // query's cache rather than spending one of the read's 20 hourly requests.
  const refreshInvite = useRefreshJoinRequestInvite(activeToken);
  // The backend's typed reason for a refusal, resolved once here so the state
  // component renders a sentence rather than sniffing an error itself.
  // "unknown" covers a network failure or an unrecognised code: still an
  // honest "that did not work", never a raw value on screen.
  const refreshRefusal = refreshInvite.error
    ? (joinRequestInviteRefreshRefusal(refreshInvite.error) ?? "unknown")
    : null;

  /** Drop `?token=` from the address bar, leaving the history entry rewritten
   *  rather than stacked. */
  function clearTokenFromUrl() {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("token");
        return next;
      },
      { replace: true },
    );
  }

  // The status token is a bearer credential: anyone holding it reads this
  // applicant's decision, and there is no email to re-issue it. Left in the
  // query string it persists in the address bar, in browser history, and in
  // any screenshot of this page.
  //
  // It is stripped only once the check has SUCCEEDED, and only after the token
  // has been written to storage in the same pass, so the applicant never loses
  // their one route back. Stripping on mount instead would strand someone who
  // opened the link on a second device and then hit a network error: the
  // credential would be gone from the URL and never stored.
  const resolvedStatus = statusQuery.data;
  useEffect(() => {
    if (!queryToken || !resolvedStatus) return;
    rememberJoinRequestStatus({
      token: queryToken,
      submittedAt: resolvedStatus.submittedAt,
    });
    clearTokenFromUrl();
    // `clearTokenFromUrl` closes over `setSearchParams`, which react-router
    // keeps stable; re-running on a fresh `resolvedStatus` identity is both
    // harmless (the param is already gone) and correct if it ever changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryToken, resolvedStatus]);

  /** Back to the form, dropping the code that did not work. The query param
   *  goes with it, or a reload would silently re-check the same dead code. */
  function askForAnotherCode() {
    setTypedToken("");
    if (queryToken) clearTokenFromUrl();
  }

  return (
    <AuthLayout wide>
      {activeToken.length === 0 ? (
        <JoinRequestStatusForm onSubmit={setTypedToken} />
      ) : !hasUsableToken ? (
        // Malformed: answered here rather than spent on a request that can only
        // come back 400, since the endpoint allows 20 an hour.
        <CodeNotFoundState onTryAgain={askForAnotherCode} />
      ) : statusQuery.isPending ? (
        // A live region: this page is often opened weeks later, and the
        // answer must reach a screen reader without a focus change.
        <div className={styles.loading} role="status">
          <Spinner />
          <p>{t("auth:joinRequestStatus.loading")}</p>
        </div>
      ) : statusQuery.error ? (
        isUnresolvableStatusToken(statusQuery.error) ? (
          <CodeNotFoundState onTryAgain={askForAnotherCode} />
        ) : (
          <StatusUnavailableState onRetry={() => void statusQuery.refetch()} />
        )
      ) : (
        <ResolvedStatus
          status={statusQuery.data}
          onRefreshInvite={() => refreshInvite.mutate()}
          isRefreshingInvite={refreshInvite.isPending}
          refreshRefusal={refreshRefusal}
        />
      )}
    </AuthLayout>
  );
}
