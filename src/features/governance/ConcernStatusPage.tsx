import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, Spinner } from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isUnresolvableConcernToken,
  isWellFormedConcernToken,
} from "./api/governance.api";
import { useConcernStatus } from "./api/useConcernStatus";
import {
  ConcernCodeNotFoundState,
  ConcernStatusResult,
  ConcernStatusUnavailableState,
} from "./ConcernStatusStates";
import styles from "./ConcernStatus.module.css";

/** The paste-a-code form, for someone who kept the code and lost the link. */
function ConcernCodeForm({ onSubmit }: { onSubmit: (code: string) => void }) {
  const { t } = useTranslation();
  const [typedCode, setTypedCode] = useState("");
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = typedCode.trim();
        if (trimmed) onSubmit(trimmed);
      }}
    >
      <div className={styles.formField}>
        <label className={styles.formLabel} htmlFor="concern-code">
          {t("governance:concernStatus.form.label")}
        </label>
        <input
          id="concern-code"
          className={styles.formInput}
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={typedCode}
          onChange={(event) => setTypedCode(event.target.value)}
        />
      </div>
      <Button type="submit" variant="primary">
        {t("governance:concernStatus.form.cta")}
      </Button>
    </form>
  );
}

/**
 * PRD-261. Where a concern stands, for the person who raised it
 * (`/about/governance/concern-status`).
 *
 * PUBLIC by construction: a concern can be raised without an account, which is
 * the entire point of an anonymous reporting form, and the reference code is
 * the only credential. `authGate.ts` gates by denylist and nothing under
 * `/about` is on it, so this route needs no gate change to stay reachable
 * logged out.
 *
 * Where the code comes from, in order:
 *   1. `?token=` — the one-click path from the confirmation panel.
 *   2. the paste-a-code form, for someone who saved the code and lost the link.
 *
 * THERE IS NO THIRD, and no browser-storage fallback, which is where this page
 * deliberately differs from the join-request status page. That one remembers
 * its token in `localStorage` because an invite request is not sensitive. A
 * concern is often about someone the submitter shares a home, a scene or a
 * device with, and a stored "you reported something" is exactly the trace that
 * makes reporting unsafe. The code lives wherever the person chose to put it.
 *
 * The code IS stripped from the address bar once a lookup succeeds, for the
 * same reason: left there it persists in history and in any screenshot. It is
 * stripped only after a successful read, so a network error on a freshly opened
 * link never strands someone with the credential gone from the URL.
 */
export function ConcernStatusPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  // Read ONCE at mount: the effect below strips `?token=` after a successful
  // check, and `activeCode` must not collapse to nothing the moment it does.
  const [queryCode] = useState(() => (searchParams.get("token") ?? "").trim());
  // null = nothing typed yet, so the query string decides. "" = the person
  // explicitly asked for the form back after a miss.
  const [typedCode, setTypedCode] = useState<string | null>(null);

  const activeCode = typedCode ?? queryCode;
  const hasUsableCode =
    activeCode.length > 0 && isWellFormedConcernToken(activeCode);
  const statusQuery = useConcernStatus(hasUsableCode ? activeCode : null);

  /** Drop `?token=` from the address bar, rewriting the history entry rather
   *  than stacking a new one. */
  const clearCodeFromUrl = (): void => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("token");
        return next;
      },
      { replace: true },
    );
  };

  // Stripped only once the check has SUCCEEDED. Stripping on mount instead
  // would strand someone who opened the link on a second device and then hit a
  // network error: the credential would be gone from the URL and, because this
  // page stores nothing, from everywhere this app can reach.
  const resolvedStatus = statusQuery.data;
  useEffect(() => {
    if (!queryCode || !resolvedStatus) return;
    clearCodeFromUrl();
    // `clearCodeFromUrl` closes over `setSearchParams`, which react-router keeps
    // stable; re-running on a fresh `resolvedStatus` identity is harmless (the
    // param is already gone).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryCode, resolvedStatus]);

  /** Back to the form, dropping the code that did not work. */
  const askForAnotherCode = (): void => {
    setTypedCode("");
    if (searchParams.has("token")) clearCodeFromUrl();
  };

  return (
    <PageShell>
      <PageMeta
        title={t("governance:concernStatus.meta.title")}
        description={t("governance:concernStatus.meta.description")}
        noIndex
      />
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>
          {t("governance:concernStatus.title")}
        </h1>
        <p className={styles.pageIntro}>
          {t("governance:concernStatus.intro")}
        </p>

        {activeCode.length === 0 ? (
          <ConcernCodeForm onSubmit={setTypedCode} />
        ) : !hasUsableCode ? (
          // Malformed: answered here rather than spent on a request that can
          // only come back 400, since the endpoint allows 20 an hour.
          <ConcernCodeNotFoundState onTryAgain={askForAnotherCode} />
        ) : statusQuery.isPending ? (
          // A live region: this page is often opened days later, and the answer
          // must reach a screen reader without a focus change.
          <div className={styles.loading} role="status">
            <Spinner />
            <p>{t("governance:concernStatus.loading")}</p>
          </div>
        ) : statusQuery.error ? (
          isUnresolvableConcernToken(statusQuery.error) ? (
            <ConcernCodeNotFoundState onTryAgain={askForAnotherCode} />
          ) : (
            <ConcernStatusUnavailableState
              onRetry={() => void statusQuery.refetch()}
            />
          )
        ) : (
          <ConcernStatusResult
            status={statusQuery.data.status}
            submittedAt={statusQuery.data.submittedAt}
            updatedAt={statusQuery.data.updatedAt}
          />
        )}
      </div>
    </PageShell>
  );
}
