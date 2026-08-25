import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { inviteLink } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { reasonFor } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  claimGenesisAdmin,
  mintGenesisInvite,
} from "../../shared/api/genesis.api";
import styles from "./GenesisPage.module.css";

type Outcome =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "closed" }
  | { kind: "rejected" }
  | { kind: "failed"; reason?: string }
  | { kind: "claimed" }
  | { kind: "demo" };

/**
 * One-time platform bootstrap — see `src/genesis/` in the backend.
 *
 * Deliberately thin. It mints a code and hands straight off to
 * `/auth/invite/:code`, so the founder joins through the SAME landing page,
 * age gate, Google sign-in and onboarding as every other member. Reimplementing
 * any of that here would mean the founder's account was created by a path
 * nobody else ever exercises.
 *
 * Public, and safe to be: the minted invite is pinned to GENESIS_EMAIL, so a
 * stranger who finds this page can only mint an invite they cannot redeem.
 *
 * Its copy routes through `useTranslation()` / `system:genesis.*` keys like
 * its neighbours (see `docs/i18n/extraction-brief.md`), even though it's
 * seen by exactly one person on exactly one occasion — deleting the page
 * later also means deleting the `genesis.*` catalog entries, a small
 * cleanup either way.
 *
 * Delete this file, its styles, its test, the route entry and the backend
 * `src/genesis/` module once the founder account exists.
 *
 * Demo mode: this is a one-shot, security-sensitive bootstrap flow, so a fake
 * "success" here would be actively misleading rather than merely inert. Both
 * handlers short-circuit before touching the network and show a plain "not
 * available in demo mode" notice instead of simulating a mint/claim.
 */
export function GenesisPage() {
  const { t } = useTranslation();
  const { loggedIn, refresh } = useAuth();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  const handleGenerate = async () => {
    if (demoMode) {
      setOutcome({ kind: "demo" });
      return;
    }
    setOutcome({ kind: "working" });
    try {
      const invite = await mintGenesisInvite();
      void navigate(inviteLink(invite.code));
    } catch (error) {
      // A 404 is the designed "already used, or the kill switch is off" answer,
      // not a fault — it must not read as a broken page.
      setOutcome(
        error instanceof ApiError && error.status === 404
          ? { kind: "closed" }
          : { kind: "failed", reason: reasonFor(error) ?? undefined },
      );
    }
  };

  const handleClaim = async () => {
    if (demoMode) {
      setOutcome({ kind: "demo" });
      return;
    }
    setOutcome({ kind: "working" });
    try {
      await claimGenesisAdmin();
      // The access token embeds `role` at mint time, so the token in hand still
      // says `member`. Refresh reloads the user from Postgres and re-mints.
      await refresh();
      setOutcome({ kind: "claimed" });
    } catch (error) {
      setOutcome(
        error instanceof ApiError && error.status === 403
          ? { kind: "rejected" }
          : { kind: "failed", reason: reasonFor(error) ?? undefined },
      );
    }
  };

  const working = outcome.kind === "working";

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.eyebrow}>{t("system:genesis.eyebrow")}</div>
        <h1 className={styles.heading}>{t("system:genesis.heading")}</h1>

        {loggedIn ? (
          <>
            <p className={styles.lead}>{t("system:genesis.loggedIn.lead")}</p>
            <Button onClick={() => void handleClaim()} disabled={working}>
              {t("system:genesis.loggedIn.claimCta")}
            </Button>
          </>
        ) : (
          <>
            <p className={styles.lead}>{t("system:genesis.loggedOut.lead")}</p>
            <Button onClick={() => void handleGenerate()} disabled={working}>
              {t("system:genesis.loggedOut.generateCta")}
            </Button>
          </>
        )}

        {outcome.kind === "closed" && (
          <p className={styles.notice}>{t("system:genesis.notice.closed")}</p>
        )}
        {outcome.kind === "rejected" && (
          <p className={styles.notice}>{t("system:genesis.notice.rejected")}</p>
        )}
        {outcome.kind === "failed" && (
          <p className={styles.notice}>
            {outcome.reason ?? t("system:genesis.notice.failedFallback")}
          </p>
        )}
        {outcome.kind === "claimed" && (
          <p className={styles.notice}>{t("system:genesis.notice.claimed")}</p>
        )}
        {outcome.kind === "demo" && (
          <p className={styles.notice}>{t("system:genesis.notice.demo")}</p>
        )}
      </div>
    </SystemStateShell>
  );
}
