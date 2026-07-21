import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { inviteLink } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
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
  | { kind: "failed" }
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
 * This page hardcodes its copy instead of routing it through `useTranslation()`
 * / `system:*` keys like its neighbours — the strings are seen by exactly one
 * person on exactly one occasion, and locale keys would turn cleanup into a
 * multi-file revert across every translation file instead of deleting a
 * directory.
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
      navigate(inviteLink(invite.code));
    } catch (error) {
      // A 404 is the designed "already used, or the kill switch is off" answer,
      // not a fault — it must not read as a broken page.
      setOutcome(
        error instanceof ApiError && error.status === 404
          ? { kind: "closed" }
          : { kind: "failed" },
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
          : { kind: "failed" },
      );
    }
  };

  const working = outcome.kind === "working";

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.eyebrow}>Platform bootstrap</div>
        <h1 className={styles.heading}>Genesis</h1>

        {loggedIn ? (
          <>
            <p className={styles.lead}>
              You're in. Claim admin to finish bootstrapping the platform.
            </p>
            <Button onClick={handleClaim} disabled={working}>
              Claim admin
            </Button>
          </>
        ) : (
          <>
            <p className={styles.lead}>
              Generate the founding invite. You'll join through the normal
              invite flow, invited by QueerPulse.
            </p>
            <Button onClick={handleGenerate} disabled={working}>
              Generate invite
            </Button>
          </>
        )}

        {outcome.kind === "closed" && (
          <p className={styles.notice}>Genesis is closed.</p>
        )}
        {outcome.kind === "rejected" && (
          <p className={styles.notice}>This account cannot claim genesis.</p>
        )}
        {outcome.kind === "failed" && (
          <p className={styles.notice}>Something went wrong. Try again.</p>
        )}
        {outcome.kind === "claimed" && (
          <p className={styles.notice}>You are now an admin.</p>
        )}
        {outcome.kind === "demo" && (
          <p className={styles.notice}>
            Genesis isn't available in demo mode.
          </p>
        )}
      </div>
    </SystemStateShell>
  );
}
